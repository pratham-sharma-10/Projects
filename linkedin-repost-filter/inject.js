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
  // The interceptor can arrive twice (world:MAIN content script + script-tag
  // fallback); only the first instance may patch fetch/XHR.
  if (window.__LRF_INSTALLED) return;
  window.__LRF_INSTALLED = true;

  const DEBUG = true;
  const repostedIds = new Set();

  function log(...args) {
    if (DEBUG) console.log("[LRF/inject]", ...args);
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

  // The job id belonging to THIS object only: its own urn-bearing string
  // fields, nothing nested. A deep sweep here once flagged every job on the
  // page when a repost signal appeared on a shared wrapper object.
  function ownId(obj) {
    for (const k of ["entityUrn", "preDashEntityUrn", "jobPosting", "jobPostingUrn", "trackingUrn", "urn"]) {
      const id = idFromUrn(obj[k]);
      if (id) return id;
    }
    return null;
  }

  // Does this object look like a reposted job posting?
  function repostSignal(obj) {
    for (const k in obj) {
      if (/repost/i.test(k) && obj[k] === true) return true;
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
      // Flag only THIS object's job id — never neighbouring ids.
      const self = ownId(node);
      if (self) repostedIds.add(self);
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
