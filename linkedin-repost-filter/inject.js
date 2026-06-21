/**
 * LinkedIn Reposted Job Filter — page-context interceptor (MAIN world).
 *
 * The job list is rendered from LinkedIn's internal "Voyager" JSON API. That
 * JSON carries the repost status (a repost flag and/or originalListedAt vs
 * listedAt timestamps) even when the rendered list card only shows "Posted".
 *
 * This script patches fetch + XMLHttpRequest, scans the JSON responses for
 * reposted job postings, and posts the matching job IDs to the content script
 * (ISOLATED world) via window.postMessage. The content script then styles the
 * cards whose data-job-id matches.
 */

(function () {
  const DEBUG = true;
  const repostedIds = new Set();

  function log(...args) {
    if (DEBUG) console.debug("[LRF/inject]", ...args);
  }

  function broadcast() {
    window.postMessage(
      { source: "LRF_INJECT", type: "reposted", ids: Array.from(repostedIds) },
      "*"
    );
  }

  // Pull a numeric job-posting id out of an entity URN string.
  function idFromUrn(value) {
    if (typeof value !== "string") return null;
    let m = /jobPosting:(\d+)/.exec(value);
    if (m) return m[1];
    m = /jobPostingCard:\(?(\d+)/.exec(value);
    if (m) return m[1];
    return null;
  }

  // Collect every job id mentioned anywhere inside a value (deep).
  function collectIds(value, out, depth) {
    if (depth > 8 || value == null) return;
    if (typeof value === "string") {
      const id = idFromUrn(value);
      if (id) out.add(id);
      return;
    }
    if (typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const v of value) collectIds(v, out, depth + 1);
      return;
    }
    for (const k in value) {
      // entityUrn / *jobPosting style references often hold the id.
      const id = idFromUrn(value[k]);
      if (id) out.add(id);
      collectIds(value[k], out, depth + 1);
    }
  }

  // Does this object look like a reposted job posting?
  function repostSignal(obj) {
    for (const k in obj) {
      if (/repost/i.test(k)) {
        const v = obj[k];
        if (v === true) return true;
        if (typeof v === "object" && v && /reposted/i.test(JSON.stringify(v))) return true;
      }
    }
    // Reposted listings keep the original date — a meaningful gap means repost.
    if (
      typeof obj.originalListedAt === "number" &&
      typeof obj.listedAt === "number" &&
      obj.listedAt - obj.originalListedAt > 36 * 3600 * 1000
    ) {
      return true;
    }
    // Some payloads spell it out in description/footer text fields.
    for (const k of ["tertiaryDescription", "secondaryDescription", "footerText", "title"]) {
      const v = obj[k];
      const text = v && (typeof v === "string" ? v : v.text);
      if (typeof text === "string" && /\breposted\b/i.test(text)) return true;
    }
    return false;
  }

  function walk(node, depth) {
    if (depth > 10 || node == null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    if (repostSignal(node)) {
      const ids = new Set();
      collectIds(node, ids, 0);
      // Also include this node's own entity urn if it is the posting.
      const self = idFromUrn(node.entityUrn) || idFromUrn(node.preDashEntityUrn);
      if (self) ids.add(self);
      ids.forEach((id) => repostedIds.add(id));
    }
    for (const k in node) walk(node[k], depth + 1);
  }

  function handleJson(json) {
    const before = repostedIds.size;
    try {
      walk(json, 0);
    } catch (e) {
      /* ignore malformed payloads */
    }
    if (repostedIds.size !== before) {
      log("reposted job IDs known:", repostedIds.size);
      broadcast();
    }
  }

  function interesting(url) {
    return typeof url === "string" && /voyager|jobs|jobSearch|jobCards|search\/dash/i.test(url);
  }

  // --- patch fetch ---
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (...args) {
      const url = (args[0] && args[0].url) || args[0];
      const p = origFetch.apply(this, args);
      if (interesting(url)) {
        p.then((res) => {
          res
            .clone()
            .json()
            .then(handleJson)
            .catch(() => {});
        }).catch(() => {});
      }
      return p;
    };
  }

  // --- patch XMLHttpRequest ---
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__lrfUrl = url;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (interesting(this.__lrfUrl)) {
      this.addEventListener("load", function () {
        try {
          const ct = this.getResponseHeader("content-type") || "";
          if (ct.indexOf("json") !== -1 || this.responseType === "" || this.responseType === "text") {
            handleJson(JSON.parse(this.responseText));
          }
        } catch (e) {
          /* not json */
        }
      });
    }
    return origSend.apply(this, arguments);
  };

  // Replay known IDs when the content script asks (it may load after us).
  window.addEventListener("message", (e) => {
    if (e.source === window && e.data && e.data.source === "LRF_CONTENT" && e.data.type === "request") {
      broadcast();
    }
  });

  log("interceptor installed");
})();
