/* ============================================================
   "A New Chapter" — Durham, NC
   Cinematic 3D diorama: life after graduating from Duke.
   Built with Three.js (r128, fully inlined — no network needed).
   ============================================================ */
(function () {
  'use strict';

  // ---------- Renderer / scene / camera ----------
  const container = document.getElementById('scene-root');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe0a165, 62, 210);

  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(11.5, 9.5, 19.5);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.0, 0.5);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 7;
  controls.maxDistance = 60;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  let interacted = false;
  controls.addEventListener('start', () => {
    interacted = true;
    controls.autoRotate = false;
  });

  // ---------- Helpers ----------
  const animated = []; // {update(t, dt)}

  function mat(color, opts) {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.82, metalness: 0.04 }, opts || {}));
    m.color.convertSRGBToLinear(); // keep authored hex colors rich under sRGB output
    if (opts && opts.emissive) m.emissive.convertSRGBToLinear();
    return m;
  }
  function shadowed(mesh, cast, receive) {
    mesh.castShadow = cast !== false;
    mesh.receiveShadow = receive !== false;
    return mesh;
  }
  function box(w, h, d, material) {
    return shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
  }
  function cyl(rt, rb, h, material, seg) {
    return shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), material));
  }
  function sph(r, material, w, hseg) {
    return shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, w || 20, hseg || 16), material));
  }
  function cone(r, h, material, seg) {
    return shadowed(new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 16), material));
  }

  // ---------- Sky, sun, lighting ----------
  (function sky() {
    const geo = new THREE.SphereGeometry(230, 32, 20);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        cTop: { value: new THREE.Color(0x14306e) },   // deep Duke-evening blue
        cMid: { value: new THREE.Color(0x4f74b8) },
        cHor: { value: new THREE.Color(0xf2a24a) },   // gold horizon
        cBot: { value: new THREE.Color(0xc47a3e) }
      },
      vertexShader:
        'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'varying vec3 vP; uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cHor; uniform vec3 cBot;\n' +
        'void main(){ float h = normalize(vP).y;\n' +
        '  vec3 col;\n' +
        '  if (h > 0.16) col = mix(cMid, cTop, smoothstep(0.16, 0.62, h));\n' +
        '  else if (h > 0.0) col = mix(cHor, cMid, smoothstep(0.0, 0.16, h));\n' +
        '  else col = mix(cBot, cHor, smoothstep(-0.4, 0.0, h));\n' +
        '  gl_FragColor = vec4(col, 1.0); }'
    });
    scene.add(new THREE.Mesh(geo, material));
  })();

  function radialSprite(inner, outer, size) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    s.scale.set(size, size, 1);
    return s;
  }

  const sun = radialSprite('rgba(255,236,190,1)', 'rgba(255,180,90,0)', 42);
  sun.material.opacity = 0.85;
  sun.position.set(-110, 20, -160);
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0x8fb8ff, 0xb98a5a, 0.42);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xffd9a6, 1.15);
  sunLight.position.set(-24, 26, -18);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -24;
  sunLight.shadow.camera.right = 24;
  sunLight.shadow.camera.top = 24;
  sunLight.shadow.camera.bottom = -24;
  sunLight.shadow.camera.far = 90;
  sunLight.shadow.bias = -0.0015;
  scene.add(sunLight);

  const fill = new THREE.DirectionalLight(0xbcd4ff, 0.3);
  fill.position.set(18, 14, 26);
  scene.add(fill);

  // ---------- The island ----------
  const island = new THREE.Group();
  scene.add(island);

  const R = 16;
  const grassTop = cyl(R, R, 0.7, mat(0x4b8c39, { roughness: 0.95 }), 56);
  grassTop.position.y = -0.35;
  grassTop.castShadow = false;
  island.add(grassTop);

  const earth = cyl(R, R * 0.72, 4.6, mat(0x64431f, { roughness: 1 }), 56);
  earth.position.y = -3.0;
  earth.castShadow = false;
  island.add(earth);

  const bedrock = cyl(R * 0.72, R * 0.3, 3.4, mat(0x5c4128, { roughness: 1 }), 40);
  bedrock.position.y = -7.0;
  bedrock.castShadow = false;
  island.add(bedrock);

  const rim = shadowed(new THREE.Mesh(
    new THREE.TorusGeometry(R - 0.12, 0.22, 10, 72),
    mat(0x9b9484, { roughness: 0.9 })
  ), false, true);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  island.add(rim);

  // darker grass patches for texture
  const patchMat = mat(0x3f7a2e, { roughness: 1 });
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, rr = 2.5 + Math.random() * (R - 4);
    const p = shadowed(new THREE.Mesh(new THREE.CircleGeometry(0.5 + Math.random() * 1.3, 14), patchMat), false, true);
    p.rotation.x = -Math.PI / 2;
    p.position.set(Math.cos(a) * rr, 0.012, Math.sin(a) * rr);
    island.add(p);
  }

  // stone paths: chapel -> center -> front, plus branches to cafe & office
  const stoneMat = mat(0xb7ac97, { roughness: 0.9 });
  function pathBetween(ax, az, bx, bz, n) {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = ax + (bx - ax) * t + (Math.random() - 0.5) * 0.25;
      const z = az + (bz - az) * t + (Math.random() - 0.5) * 0.25;
      const s = cyl(0.42 + Math.random() * 0.12, 0.46 + Math.random() * 0.12, 0.07, stoneMat, 9);
      s.position.set(x, 0.035, z);
      s.rotation.y = Math.random() * Math.PI;
      s.castShadow = false;
      island.add(s);
    }
  }
  pathBetween(-4.6, -7.6, 0, 3.2, 9);   // chapel -> me
  pathBetween(0, 3.2, 0, 14.8, 8);      // me -> future edge
  pathBetween(-7.2, 2.6, -1.2, 3.0, 5); // cafe -> me
  pathBetween(5.6, -1.8, 1.0, 2.6, 5);  // office -> me

  // central plinth for the main character
  const plinth = cyl(1.45, 1.62, 0.16, mat(0xa89b82, { roughness: 0.85 }), 36);
  plinth.position.set(0, 0.08, 3.2);
  plinth.castShadow = false;
  island.add(plinth);
  const plinthRing = shadowed(new THREE.Mesh(
    new THREE.TorusGeometry(1.52, 0.045, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x66b8ff, transparent: true, opacity: 0.8 })
  ), false, false);
  plinthRing.rotation.x = Math.PI / 2;
  plinthRing.position.set(0, 0.18, 3.2);
  island.add(plinthRing);
  animated.push({ update: (t) => { plinthRing.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.25; } });

  // ---------- People ----------
  const SKIN = { indian: 0x9c6b4a, deep: 0x5f3d28, tan: 0xc98e62, light: 0xe8b48c, olive: 0xb07f52 };

  function makePerson(o) {
    o = o || {};
    const g = new THREE.Group();
    const skin = mat(o.skin || SKIN.indian, { roughness: 0.7 });
    const shirt = mat(o.shirt || 0x9db8cc, { roughness: 0.75 });
    const pants = mat(o.pants || 0x23262e, { roughness: 0.85 });
    const shoe = mat(o.shoe || 0x2b3350, { roughness: 0.6 });
    const hairM = mat(o.hair || 0x3a2a1e, { roughness: 0.95 });

    // legs + shoes
    [-0.11, 0.11].forEach((x) => {
      const leg = cyl(0.085, 0.1, 0.8, pants);
      leg.position.set(x, 0.44, 0);
      g.add(leg);
      const foot = box(0.17, 0.1, 0.32, shoe);
      foot.position.set(x, 0.05, 0.05);
      g.add(foot);
      const sole = box(0.18, 0.035, 0.33, mat(0xf2f2ee, { roughness: 0.5 }));
      sole.position.set(x, 0.017, 0.05);
      g.add(sole);
    });

    // torso
    const torso = cyl(0.235, 0.205, 0.66, shirt);
    torso.position.y = 1.16;
    g.add(torso);
    const shoulders = sph(0.235, shirt, 18, 12);
    shoulders.scale.set(1, 0.55, 0.85);
    shoulders.position.y = 1.48;
    g.add(shoulders);
    const hips = sph(0.21, pants, 16, 10);
    hips.scale.set(1, 0.5, 0.9);
    hips.position.y = 0.85;
    g.add(hips);

    // neck + head
    const neck = cyl(0.07, 0.08, 0.12, skin, 10);
    neck.position.y = 1.56;
    g.add(neck);
    const head = new THREE.Group();
    head.position.y = 1.78;
    g.add(head);
    const HR = 0.235;
    head.add(sph(HR, skin, 24, 18));

    // hair / beard / cap
    if (o.beard) {
      const beard = shadowed(new THREE.Mesh(
        new THREE.SphereGeometry(HR * 1.045, 24, 12, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.44), hairM));
      beard.scale.set(1, 1.04, 1);
      head.add(beard);
      const mo = box(0.11, 0.035, 0.05, hairM); // moustache
      mo.position.set(0, -0.045, HR * 0.93);
      head.add(mo);
      const smile = box(0.085, 0.03, 0.03, mat(0xf5efe6, { roughness: 0.4 }));
      smile.position.set(0, -0.105, HR * 0.99);
      head.add(smile);
    }
    if (o.cap) {
      const capM = mat(o.capColor || 0x00539b, { roughness: 0.7 });
      const capTop = shadowed(new THREE.Mesh(
        new THREE.SphereGeometry(HR * 1.07, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.38), capM), false);
      capTop.scale.set(1, 0.92, 1);
      capTop.position.y = 0.045;
      head.add(capTop);
      const brim = cyl(HR * 0.85, HR * 0.85, 0.028, capM, 20);
      brim.castShadow = false;
      brim.scale.set(1, 1, 1.35);
      brim.position.set(0, HR * 0.56, HR * 0.6);
      brim.rotation.x = 0.18;
      head.add(brim);
      const button = sph(0.03, capM, 8, 6);
      button.position.y = HR * 1.02;
      head.add(button);
    } else {
      const hair = shadowed(new THREE.Mesh(
        new THREE.SphereGeometry(HR * 1.05, 24, 12, 0, Math.PI * 2, 0, Math.PI * (o.longHair ? 0.62 : 0.45)), hairM));
      hair.position.y = 0.01;
      if (o.longHair) hair.position.z = -0.02;
      head.add(hair);
      if (o.ponytail) {
        const tail = sph(0.09, hairM, 10, 8);
        tail.scale.set(1, 1.8, 1);
        tail.position.set(0, -0.1, -HR * 1.05);
        head.add(tail);
      }
    }

    // ears, nose, eyes
    [-1, 1].forEach((s) => {
      const ear = sph(0.045, skin, 8, 6);
      ear.position.set(s * HR * 0.98, -0.01, 0);
      head.add(ear);
    });
    const nose = sph(0.045, skin, 8, 6);
    nose.scale.set(0.85, 1, 1.1);
    nose.position.set(0, -0.015, HR * 0.98);
    head.add(nose);
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x1d1712 });
    [-1, 1].forEach((s) => {
      const w = sph(0.032, mat(0xfdfdf8, { roughness: 0.3 }), 8, 6);
      w.position.set(s * 0.085, 0.055, HR * 0.9);
      head.add(w);
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), eyeM);
      p.position.set(s * 0.085, 0.055, HR * 0.925 + 0.018);
      head.add(p);
      const brow = box(0.075, 0.018, 0.02, hairM);
      brow.position.set(s * 0.085, 0.105, HR * 0.92);
      brow.rotation.z = s * -0.12;
      head.add(brow);
    });

    if (o.glasses) {
      const gm = mat(0x3a3f47, { roughness: 0.3, metalness: 0.6 });
      [-1, 1].forEach((s) => {
        const ring = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 8, 20), gm), false, false);
        ring.position.set(s * 0.085, 0.055, HR * 0.98);
        head.add(ring);
        const arm = cyl(0.006, 0.006, 0.22, gm, 6);
        arm.rotation.x = Math.PI / 2;
        arm.position.set(s * 0.14, 0.06, HR * 0.98 - 0.11);
        head.add(arm);
      });
      const bridge = box(0.06, 0.01, 0.01, gm);
      bridge.position.set(0, 0.06, HR * 0.99);
      head.add(bridge);
    }

    // arms (pivoted at shoulders). rolled sleeves: upper = shirt, forearm = skin
    function arm(side, outAngle, fwdAngle) {
      const a = new THREE.Group();
      a.position.set(side * 0.26, 1.44, 0);
      const upper = cyl(0.062, 0.07, 0.3, shirt, 10);
      upper.position.y = -0.15;
      a.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.3;
      a.add(elbow);
      const fore = cyl(0.05, 0.058, 0.28, skin, 10);
      fore.position.y = -0.14;
      elbow.add(fore);
      const hand = sph(0.062, skin, 10, 8);
      hand.scale.set(0.85, 1.15, 0.9);
      hand.position.y = -0.31;
      elbow.add(hand);
      if (o.watch && side === -1) {
        const w = cyl(0.058, 0.058, 0.035, mat(0x14161c, { roughness: 0.4, metalness: 0.5 }), 12);
        w.position.y = -0.24;
        elbow.add(w);
        const face = cyl(0.04, 0.04, 0.04, new THREE.MeshBasicMaterial({ color: 0x3fa2ff }), 10);
        face.rotation.z = Math.PI / 2;
        face.position.set(side * 0.045, -0.24, 0);
        elbow.add(face);
      }
      a.rotation.z = side * outAngle;
      a.rotation.x = fwdAngle || 0;
      a.userData.elbow = elbow;
      g.add(a);
      return a;
    }
    const pose = o.pose || 'relaxed';
    if (pose === 'relaxed') {
      arm(-1, 0.22, 0.05).userData.elbow.rotation.x = -0.35;
      arm(1, 0.28, 0.1).userData.elbow.rotation.x = -0.5;
    } else if (pose === 'handshakeR') {
      arm(-1, 0.18, 0);
      const r = arm(1, 0.12, -1.15);
      r.userData.elbow.rotation.x = -0.2;
    } else if (pose === 'handshakeL') {
      const l = arm(-1, 0.12, -1.15);
      l.userData.elbow.rotation.x = -0.2;
      arm(1, 0.18, 0);
    } else if (pose === 'cup') { // holding a coffee cup
      const l = arm(-1, 0.15, -0.4);
      l.userData.elbow.rotation.x = -1.15;
      arm(1, 0.24, 0.05);
      const cup = cyl(0.05, 0.04, 0.11, mat(0xf3ede2, { roughness: 0.5 }), 12);
      cup.position.set(-0.32, 1.18, 0.3);
      g.add(cup);
    } else if (pose === 'typing') {
      const l = arm(-1, 0.1, -0.75);
      l.userData.elbow.rotation.x = -0.55;
      const r = arm(1, 0.1, -0.75);
      r.userData.elbow.rotation.x = -0.55;
    } else if (pose === 'wave') {
      arm(-1, 0.2, 0.05);
      const r = arm(1, 2.6, 0);
      r.userData.elbow.rotation.x = -0.3;
    }

    // Duke graduation stole
    if (o.stole) {
      const blue = mat(0x00539b, { roughness: 0.55 });
      const gold = mat(0xd9a521, { roughness: 0.45, metalness: 0.25 });
      [-1, 1].forEach((s) => {
        const band = box(0.11, 0.62, 0.03, blue);
        band.position.set(s * 0.13, 1.2, 0.22);
        band.rotation.x = -0.08;
        band.rotation.z = s * 0.1;
        g.add(band);
        const tip = box(0.11, 0.09, 0.032, gold);
        tip.position.set(s * 0.16, 0.88, 0.25);
        g.add(tip);
      });
      const back = box(0.34, 0.1, 0.03, blue);
      back.position.set(0, 1.5, -0.2);
      g.add(back);
      [-1, 1].forEach((s) => {
        const shoulderBand = box(0.11, 0.22, 0.03, blue);
        shoulderBand.position.set(s * 0.17, 1.47, 0.02);
        shoulderBand.rotation.x = -1.25;
        g.add(shoulderBand);
      });
    }

    g.scale.setScalar(o.scale || 1);
    return g;
  }

  // --- The protagonist: 25, Indian, Duke grad — beard, glasses, Duke-blue cap,
  //     light-blue shirt, dark trousers, sneakers, smartwatch, Duke stole.
  const me = makePerson({
    skin: SKIN.indian, shirt: 0xa8c4d8, pants: 0x20242e, shoe: 0x2b3350,
    beard: true, glasses: true, cap: true, capColor: 0x00539b, hair: 0x342418,
    stole: true, watch: true, pose: 'relaxed', scale: 1.16
  });
  me.position.set(0, 0.16, 3.2);
  me.rotation.y = 0.12;
  island.add(me);
  animated.push({ update: (t) => { me.position.y = 0.16 + Math.sin(t * 1.1) * 0.015; } }); // subtle breathing

  // ---------- Duke Chapel (stylized) ----------
  (function chapel() {
    const g = new THREE.Group();
    const stone = mat(0x8f8878, { roughness: 0.95 });
    const darkStone = mat(0x6f6858, { roughness: 0.95 });

    const tower = box(2.0, 7.6, 2.0, stone);
    tower.position.y = 3.8;
    g.add(tower);
    const towerTop = box(2.25, 0.5, 2.25, darkStone);
    towerTop.position.y = 7.75;
    g.add(towerTop);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      const pin = cone(0.22, 1.5, darkStone, 6);
      pin.position.set(sx * 1.0, 8.6, sz * 1.0);
      g.add(pin);
    }));
    const spire = cone(0.55, 2.6, stone, 8);
    spire.position.y = 9.3;
    g.add(spire);

    // pointed-arch windows on tower
    const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x2b3f66).convertSRGBToLinear() });
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.06), winM);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 4), winM);
      tip.rotation.y = Math.PI / 4;
      tip.scale.set(0.99, 1, 0.14);
      tip.position.y = 0.8;
      w.add(body); w.add(tip);
      w.position.set(0, 2.4 + i * 1.9, 1.02);
      g.add(w);
    }

    // nave with pitched roof
    const nave = box(1.9, 2.6, 5.2, stone);
    nave.position.set(0, 1.3, -3.4);
    g.add(nave);
    const roof = new THREE.Group();
    const rL = box(0.09, 1.3, 5.4, darkStone); rL.rotation.z = 0.75; rL.position.x = -0.62;
    const rR = box(0.09, 1.3, 5.4, darkStone); rR.rotation.z = -0.75; rR.position.x = 0.62;
    roof.add(rL); roof.add(rR);
    roof.position.set(0, 3.05, -3.4);
    g.add(roof);
    for (let i = 0; i < 3; i++) {
      [-1, 1].forEach((s) => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.3), winM);
        w.position.set(s * 0.97, 1.6, -2.0 - i * 1.3);
        g.add(w);
      });
      const b = box(0.28, 1.9, 0.28, stone); // buttresses
      b.position.set(-1.05, 0.95, -1.9 - i * 1.3);
      g.add(b);
      const b2 = b.clone(); b2.position.x = 1.05; g.add(b2);
    }

    // entrance arch
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.08), new THREE.MeshBasicMaterial({ color: 0x3a2a18 }));
    door.position.set(0, 0.65, 1.03);
    g.add(door);

    g.position.set(-5.2, 0, -9.2);
    g.rotation.y = 0.35;
    island.add(g);
  })();

  // Floating graduation cap near the chapel
  (function gradCap() {
    const g = new THREE.Group();
    const black = mat(0x1c1c22, { roughness: 0.6 });
    const crown = cyl(0.42, 0.46, 0.34, black, 18);
    g.add(crown);
    const boardG = box(1.35, 0.07, 1.35, black);
    boardG.position.y = 0.2;
    boardG.rotation.y = Math.PI / 4;
    g.add(boardG);
    const btn = sph(0.06, mat(0xd9a521, { metalness: 0.4, roughness: 0.4 }), 10, 8);
    btn.position.y = 0.26;
    g.add(btn);
    const tassel = new THREE.Group();
    const cord = cyl(0.02, 0.02, 0.65, mat(0xd9a521), 6);
    cord.position.y = -0.32;
    tassel.add(cord);
    const tuft = cyl(0.06, 0.03, 0.18, mat(0xd9a521), 8);
    tuft.position.y = -0.72;
    tassel.add(tuft);
    tassel.position.set(0.62, 0.24, 0.1);
    g.add(tassel);
    g.position.set(-2.6, 6.4, -7.4);
    g.rotation.z = 0.12;
    island.add(g);
    animated.push({
      update: (t) => {
        g.position.y = 6.4 + Math.sin(t * 0.9) * 0.22;
        g.rotation.y = Math.sin(t * 0.35) * 0.35;
        tassel.rotation.x = Math.sin(t * 1.7) * 0.18;
      }
    });
  })();

  // ---------- Café (left) ----------
  (function cafe() {
    const g = new THREE.Group();
    const brick = mat(0x9e5940, { roughness: 0.95 });
    const body = box(3.4, 2.5, 2.6, brick);
    body.position.y = 1.25;
    g.add(body);
    const roofTrim = box(3.6, 0.22, 2.8, mat(0x6b4535));
    roofTrim.position.y = 2.6;
    g.add(roofTrim);
    const winGlow = new THREE.MeshBasicMaterial({ color: 0xffd28a });
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.06), winGlow);
    win.position.set(-0.6, 1.25, 1.32);
    g.add(win);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.5, 0.06), mat(0x3f2b20));
    door.position.set(1.05, 0.75, 1.32);
    g.add(door);
    // striped awning
    for (let i = 0; i < 6; i++) {
      const a = box(0.5, 0.06, 0.8, mat(i % 2 ? 0xf3ead9 : 0x00539b, { roughness: 0.7 }));
      a.position.set(-1.35 + i * 0.52, 2.1, 1.65);
      a.rotation.x = 0.35;
      g.add(a);
    }
    // hanging pendant light over window
    const lampGlow = new THREE.PointLight(0xffc57a, 0.6, 7);
    lampGlow.position.set(0, 2.0, 2.2);
    g.add(lampGlow);

    // steam from a rooftop vent (little coffee soul)
    const steam = [];
    for (let i = 0; i < 3; i++) {
      const s = sph(0.12 + i * 0.04, mat(0xffffff, { transparent: true, opacity: 0.5, roughness: 1 }), 10, 8);
      s.position.set(1.2, 2.9 + i * 0.35, -0.4);
      s.castShadow = false;
      g.add(s);
      steam.push(s);
    }
    animated.push({
      update: (t) => steam.forEach((s, i) => {
        s.position.y = 2.9 + i * 0.35 + ((t * 0.4 + i * 0.3) % 1) * 0.5;
        s.material.opacity = 0.5 - ((t * 0.4 + i * 0.3) % 1) * 0.45;
      })
    });

    g.position.set(-10.2, 0, 1.0);
    g.rotation.y = 0.9;
    island.add(g);
  })();

  // café table + two friends chatting over coffee
  (function coffeeChat() {
    const g = new THREE.Group();
    const table = new THREE.Group();
    const top = cyl(0.55, 0.55, 0.05, mat(0x7a4b32, { roughness: 0.7 }), 20);
    top.position.y = 0.78;
    table.add(top);
    const stand = cyl(0.05, 0.05, 0.76, mat(0x3b3b3f), 10);
    stand.position.y = 0.4;
    table.add(stand);
    const base = cyl(0.22, 0.26, 0.04, mat(0x3b3b3f), 14);
    base.position.y = 0.02;
    table.add(base);
    [0.18, -0.2].forEach((x, i) => {
      const cup = cyl(0.045, 0.036, 0.1, mat(i ? 0xe8e2d4 : 0xd9a521, { roughness: 0.5 }), 10);
      cup.position.set(x, 0.86, i ? -0.1 : 0.12);
      table.add(cup);
    });
    const laptop = new THREE.Group();
    const lbase = box(0.34, 0.02, 0.24, mat(0x8f959e, { metalness: 0.5, roughness: 0.4 }));
    const lscr = box(0.34, 0.22, 0.015, mat(0x8f959e, { metalness: 0.5, roughness: 0.4 }));
    lscr.position.set(0, 0.11, -0.12);
    lscr.rotation.x = -0.35;
    const lglow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), new THREE.MeshBasicMaterial({ color: 0x9fd8ff }));
    lglow.position.set(0, 0.11, -0.11);
    lglow.rotation.x = -0.35;
    laptop.add(lbase); laptop.add(lscr); laptop.add(lglow);
    laptop.position.set(0.05, 0.8, 0.05);
    laptop.rotation.y = 2.6;
    table.add(laptop);
    g.add(table);

    const f1 = makePerson({ skin: SKIN.deep, shirt: 0xc76d3b, pants: 0x35404d, pose: 'cup', scale: 0.97 });
    f1.position.set(-0.95, 0, 0.25);
    f1.rotation.y = 1.2;
    g.add(f1);
    const f2 = makePerson({ skin: SKIN.light, shirt: 0x7f9f6a, pants: 0x2a2d36, longHair: true, ponytail: true, hair: 0x4a3018, pose: 'relaxed', scale: 0.94 });
    f2.position.set(0.95, 0, -0.3);
    f2.rotation.y = -1.7;
    g.add(f2);

    g.position.set(-6.6, 0, 4.6);
    g.rotation.y = -0.25;
    island.add(g);
  })();

  // ---------- Startup workspace (right) ----------
  (function office() {
    const g = new THREE.Group();
    const frameM = mat(0x4c565f, { roughness: 0.5, metalness: 0.3 });
    const glassM = new THREE.MeshStandardMaterial({
      color: 0x9fd3d8, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.5, emissive: 0x1c4b52, emissiveIntensity: 0.35
    });
    const body = box(3.6, 3.2, 3.0, glassM);
    body.position.y = 1.6;
    g.add(body);
    // frame mullions
    for (let i = 0; i < 3; i++) {
      const beam = box(3.7, 0.1, 3.1, frameM);
      beam.position.y = 0.8 + i * 1.2;
      g.add(beam);
    }
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      const post = box(0.14, 3.2, 0.14, frameM);
      post.position.set(sx * 1.78, 1.6, sz * 1.48);
      g.add(post);
    }));
    const roofSlab = box(3.9, 0.18, 3.3, frameM);
    roofSlab.position.y = 3.3;
    g.add(roofSlab);
    // rooftop garden (sustainability)
    for (let i = 0; i < 4; i++) {
      const bush = sph(0.22, mat(0x4f8f45, { roughness: 1 }), 10, 8);
      bush.position.set(-1.3 + i * 0.85, 3.5, -1.1);
      g.add(bush);
    }
    const glow = new THREE.PointLight(0x7fe0d8, 0.7, 9);
    glow.position.set(0, 1.8, 0);
    g.add(glow);
    g.position.set(9.0, 0, -6.0);
    g.rotation.y = -0.5;
    island.add(g);
  })();

  // outdoor desk: me-figure's work world — laptop + floating holo dashboards + friend at work
  (function workDesk() {
    const g = new THREE.Group();
    const desk = box(1.5, 0.06, 0.7, mat(0x8a5a3a, { roughness: 0.7 }));
    desk.position.y = 0.8;
    g.add(desk);
    [-0.65, 0.65].forEach((x) => [-0.25, 0.25].forEach((z) => {
      const leg = cyl(0.035, 0.035, 0.78, mat(0x2f333a), 8);
      leg.position.set(x, 0.4, z);
      g.add(leg);
    }));
    // laptop
    const lap = new THREE.Group();
    const b = box(0.5, 0.03, 0.34, mat(0x9aa0a8, { metalness: 0.5, roughness: 0.4 }));
    lap.add(b);
    const s = box(0.5, 0.32, 0.02, mat(0x9aa0a8, { metalness: 0.5, roughness: 0.4 }));
    s.position.set(0, 0.16, -0.17);
    s.rotation.x = -0.3;
    lap.add(s);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.26), new THREE.MeshBasicMaterial({ color: 0xbfe9ff }));
    scr.position.set(0, 0.16, -0.155);
    scr.rotation.x = -0.3;
    lap.add(scr);
    lap.position.set(-0.2, 0.845, 0.05);
    lap.rotation.y = 0.15;
    g.add(lap);
    // coffee + notebook on desk
    const mug = cyl(0.05, 0.04, 0.1, mat(0x00539b, { roughness: 0.5 }), 10);
    mug.position.set(0.45, 0.88, 0.15);
    g.add(mug);
    const nb = box(0.3, 0.03, 0.22, mat(0xc9a36a, { roughness: 0.8 })); // journal
    nb.position.set(0.4, 0.845, -0.12);
    nb.rotation.y = -0.3;
    g.add(nb);

    // two floating holographic dashboards (product metrics + AI automation flows)
    function dashboard(w, h, bars) {
      const d = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: 0x2fd8ff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      d.add(panel);
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.02, h * 1.02),
        new THREE.MeshBasicMaterial({ color: 0x7fe8ff, wireframe: true, transparent: true, opacity: 0.5, depthWrite: false }));
      d.add(edge);
      const bm = new THREE.MeshBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.85 });
      if (bars) {
        for (let i = 0; i < 4; i++) {
          const bh = 0.1 + i * 0.09;
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, bh, 0.02), bm);
          bar.position.set(-w / 2 + 0.16 + i * 0.16, -h / 2 + bh / 2 + 0.08, 0.02);
          d.add(bar);
        }
        const arrowLine = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, 0.02, 0.015), bm);
        arrowLine.rotation.z = 0.45;
        arrowLine.position.set(0, 0.05, 0.03);
        d.add(arrowLine);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 4), bm);
        tip.rotation.z = -1.1;
        tip.position.set(w * 0.27, 0.19, 0.03);
        d.add(tip);
      } else {
        // node-flow diagram (AI automation)
        const nodes = [[-0.28, 0.12], [0, 0.22], [0.28, 0.1], [-0.12, -0.14], [0.16, -0.16]];
        nodes.forEach((n) => {
          const c = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), bm);
          c.position.set(n[0], n[1], 0.02);
          d.add(c);
        });
        const lineM = new THREE.LineBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.7 });
        const pts = [];
        [[0, 1], [1, 2], [0, 3], [3, 4], [1, 4]].forEach((e) => {
          pts.push(new THREE.Vector3(nodes[e[0]][0], nodes[e[0]][1], 0.02));
          pts.push(new THREE.Vector3(nodes[e[1]][0], nodes[e[1]][1], 0.02));
        });
        d.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineM));
      }
      return d;
    }
    const d1 = dashboard(1.0, 0.7, true);
    d1.position.set(-0.35, 1.9, -0.25);
    d1.rotation.y = 0.25;
    g.add(d1);
    const d2 = dashboard(0.85, 0.62, false);
    d2.position.set(0.75, 1.7, -0.15);
    d2.rotation.y = -0.2;
    g.add(d2);
    animated.push({
      update: (t) => {
        d1.position.y = 1.9 + Math.sin(t * 1.3) * 0.05;
        d2.position.y = 1.7 + Math.sin(t * 1.3 + 1.4) * 0.05;
      }
    });

    // founder friend working across the desk
    const f = makePerson({ skin: SKIN.olive, shirt: 0x5a6f8f, pants: 0x23262e, hair: 0x1a1310, pose: 'typing', scale: 0.95 });
    f.position.set(0, 0, 0.75);
    f.rotation.y = Math.PI;
    g.add(f);

    g.position.set(5.9, 0, -1.6);
    g.rotation.y = 0.35;
    island.add(g);
  })();

  // ---------- Networking: a handshake ----------
  (function handshake() {
    const g = new THREE.Group();
    const a = makePerson({ skin: SKIN.tan, shirt: 0x8b6fae, pants: 0x2c2f38, hair: 0x2c1c10, pose: 'handshakeR', scale: 0.98 });
    a.position.set(-0.52, 0, 0);
    a.rotation.y = Math.PI / 2;
    g.add(a);
    const b2 = makePerson({ skin: SKIN.deep, shirt: 0xc9b458, pants: 0x3a3f4a, hair: 0x120d0a, glasses: true, pose: 'handshakeL', scale: 1.0 });
    b2.position.set(0.52, 0, 0);
    b2.rotation.y = -Math.PI / 2;
    g.add(b2);
    g.position.set(3.9, 0, 5.4);
    g.rotation.y = 0.5;
    island.add(g);
  })();

  // mentor + student waving, near the chapel path (university space)
  (function mentor() {
    const g = new THREE.Group();
    const m = makePerson({ skin: SKIN.light, shirt: 0x9d3b3b, pants: 0x30343e, hair: 0x8a8a88, glasses: true, pose: 'relaxed', scale: 1.0 });
    m.position.set(-0.45, 0, 0);
    m.rotation.y = 0.9;
    g.add(m);
    const s = makePerson({ skin: SKIN.indian, shirt: 0x3f7f8f, pants: 0x23262e, hair: 0x241812, pose: 'wave', scale: 0.92 });
    s.position.set(0.55, 0, 0.25);
    s.rotation.y = -0.7;
    g.add(s);
    g.position.set(-3.0, 0, -4.6);
    island.add(g);
  })();

  // ---------- Durham backdrop: brick warehouses + water tower ----------
  (function durham() {
    const brick1 = box(2.6, 2.0, 2.0, mat(0x8f4a34, { roughness: 0.95 }));
    brick1.position.set(1.6, 1.0, -11.6);
    island.add(brick1);
    const brick2 = box(2.0, 2.8, 1.8, mat(0xa25a40, { roughness: 0.95 }));
    brick2.position.set(4.2, 1.4, -11.0);
    island.add(brick2);
    const winM = new THREE.MeshBasicMaterial({ color: 0xffd28a });
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.05), winM);
      w.position.set(0.9 + i * 0.75, 1.2, -10.57);
      island.add(w);
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.05), winM);
      w2.position.set(3.75 + i * 0.5, 1.9, -10.07);
      island.add(w2);
    }

    // classic Durham water tower
    const wt = new THREE.Group();
    const tankM = mat(0x7d8a84, { roughness: 0.7, metalness: 0.3 });
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
      const leg = cyl(0.05, 0.06, 2.4, tankM, 8);
      leg.position.set(sx * 0.55, 1.2, sz * 0.55);
      leg.rotation.z = sx * 0.12;
      leg.rotation.x = -sz * 0.12;
      wt.add(leg);
    }));
    const tank = cyl(0.85, 0.85, 1.1, tankM, 18);
    tank.position.y = 2.9;
    wt.add(tank);
    const tcone = cone(0.9, 0.5, tankM, 18);
    tcone.position.y = 3.7;
    wt.add(tcone);
    wt.position.set(8.2, 0, -11.2);
    island.add(wt);
  })();

  // ---------- Trees, bushes, lampposts ----------
  const trunkM = mat(0x6b4a30, { roughness: 1 });
  const pineM = mat(0x3f7345, { roughness: 1 });
  const oakM = mat(0x5f9e4e, { roughness: 1 });
  function pine(x, z, s) {
    const g = new THREE.Group();
    const t = cyl(0.09, 0.13, 0.7, trunkM, 8);
    t.position.y = 0.35;
    g.add(t);
    for (let i = 0; i < 3; i++) {
      const c = cone(0.75 - i * 0.2, 0.9, pineM, 10);
      c.position.y = 0.9 + i * 0.55;
      g.add(c);
    }
    g.scale.setScalar(s || 1);
    g.position.set(x, 0, z);
    island.add(g);
  }
  function oak(x, z, s) {
    const g = new THREE.Group();
    const t = cyl(0.1, 0.15, 0.8, trunkM, 8);
    t.position.y = 0.4;
    g.add(t);
    const c1 = sph(0.65, oakM, 12, 10); c1.position.set(0, 1.15, 0); g.add(c1);
    const c2 = sph(0.45, oakM, 10, 8); c2.position.set(0.4, 0.95, 0.15); g.add(c2);
    const c3 = sph(0.4, oakM, 10, 8); c3.position.set(-0.38, 1.0, -0.1); g.add(c3);
    g.scale.setScalar(s || 1);
    g.position.set(x, 0, z);
    island.add(g);
  }
  pine(-8.6, -8.2, 1.4); pine(-11.6, -4.2, 1.1); pine(12.6, -3.2, 1.2); pine(6.6, -9.9, 1.0);
  pine(-12.8, 4.6, 0.9); pine(12.9, 1.4, 0.9);
  oak(-2.2, -8.6, 1.1); oak(11.8, 4.6, 1.0); oak(-11.9, 7.4, 0.85); oak(2.4, 8.9, 0.8);
  oak(-8.0, 8.6, 0.9);
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, rr = 13.2 + Math.random() * 2.2;
    const b = sph(0.24 + Math.random() * 0.18, oakM, 10, 8);
    b.position.set(Math.cos(a) * rr, 0.2, Math.sin(a) * rr);
    island.add(b);
  }

  function lamppost(x, z) {
    const g = new THREE.Group();
    const pole = cyl(0.04, 0.05, 2.4, mat(0x2c2f36, { metalness: 0.4, roughness: 0.5 }), 8);
    pole.position.y = 1.2;
    g.add(pole);
    const bulb = sph(0.09, new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), 10, 8);
    bulb.position.y = 2.45;
    g.add(bulb);
    const light = new THREE.PointLight(0xffc57a, 0.55, 6.5);
    light.position.y = 2.4;
    g.add(light);
    g.position.set(x, 0, z);
    island.add(g);
  }
  lamppost(-2.4, 5.6);
  lamppost(2.6, 1.0);

  // ---------- Symbols of the journey ----------

  // India -> USA: two small flags joined by a dotted arc with a paper plane
  (function journey() {
    const g = new THREE.Group();
    function flagPole(x, z, colors, blueCanton) {
      const p = new THREE.Group();
      const pole = cyl(0.02, 0.025, 1.1, mat(0x8b8f96, { metalness: 0.5 }), 6);
      pole.position.y = 0.55;
      p.add(pole);
      colors.forEach((c, i) => {
        const stripe = box(0.5, 0.28 / colors.length, 0.02, mat(c, { roughness: 0.6 }));
        stripe.position.set(0.27, 1.0 - i * (0.28 / colors.length), 0);
        p.add(stripe);
      });
      if (blueCanton) {
        const canton = box(0.2, 0.14, 0.024, mat(0x2b3f8f, { roughness: 0.6 }));
        canton.position.set(0.12, 1.035, 0);
        p.add(canton);
      }
      p.position.set(x, 0, z);
      return p;
    }
    const india = flagPole(-1.5, 0, [0xe08a3c, 0xf2efe6, 0x3f7f45]);
    const chakra = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 14), mat(0x2b3f8f)), false, false);
    chakra.position.set(0.27, 1.0, 0.02);
    india.add(chakra);
    g.add(india);
    g.add(flagPole(1.5, 0, [0xb03a3a, 0xf2efe6, 0xb03a3a, 0xf2efe6], true));
    // dotted arc
    const dotM = new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.9 });
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), dotM);
      d.position.set(-1.5 + 3 * t, 1.1 + Math.sin(t * Math.PI) * 0.75, 0);
      g.add(d);
    }
    // little paper plane at the arc's crest
    const plane = new THREE.Group();
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 3), mat(0xf5f2ea, { roughness: 0.4 }));
    wing.rotation.z = -Math.PI / 2;
    wing.scale.set(1, 1, 0.35);
    plane.add(wing);
    plane.position.set(0, 1.9, 0);
    plane.rotation.z = -0.15;
    g.add(plane);
    animated.push({
      update: (t) => {
        const tt = (t * 0.12) % 1;
        plane.position.set(-1.5 + 3 * tt, 1.1 + Math.sin(tt * Math.PI) * 0.78, 0);
        plane.rotation.z = -Math.cos(tt * Math.PI) * 0.5;
      }
    });
    g.position.set(-9.2, 0, 6.6);
    g.rotation.y = 0.7;
    island.add(g);
  })();

  // Basketball hoop + ball
  (function bball() {
    const g = new THREE.Group();
    const pole = cyl(0.06, 0.07, 2.6, mat(0x3a3e46, { metalness: 0.4 }), 8);
    pole.position.y = 1.3;
    g.add(pole);
    const board = box(1.0, 0.7, 0.05, mat(0xe8e6df, { roughness: 0.5 }));
    board.position.set(0, 2.5, 0.15);
    g.add(board);
    const frame = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 20), mat(0xd25b2a, { roughness: 0.5 })), true, false);
    frame.rotation.x = Math.PI / 2;
    frame.position.set(0, 2.25, 0.45);
    g.add(frame);
    const ball = sph(0.16, mat(0xd2712e, { roughness: 0.8 }), 14, 12);
    ball.position.set(0.5, 0.16, 0.9);
    g.add(ball);
    [0, Math.PI / 2].forEach((ry) => {
      const line = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 6, 20), mat(0x30201a)), false, false);
      line.rotation.y = ry;
      line.position.copy(ball.position);
      g.add(line);
    });
    animated.push({
      update: (t) => {
        const b = Math.abs(Math.sin(t * 2.2)) * 0.55;
        ball.position.y = 0.16 + b;
        g.children.forEach((c) => {
          if (c.geometry && c.geometry.type === 'TorusGeometry' && c.position.x === 0.5) c.position.y = 0.16 + b;
        });
      }
    });
    g.position.set(10.6, 0, 3.4);
    g.rotation.y = -0.9;
    island.add(g);
  })();

  // Meditation corner: mat, lotus, open journal, tiny sapling
  (function stillness() {
    const g = new THREE.Group();
    const matt = box(1.6, 0.04, 1.0, mat(0x7f9f8a, { roughness: 0.9 }));
    matt.position.y = 0.02;
    g.add(matt);
    // lotus
    const lotus = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const petal = cone(0.09, 0.22, mat(0xe08aa0, { roughness: 0.6 }), 6);
      const a = (i / 7) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.09, 0.1, Math.sin(a) * 0.09);
      petal.rotation.x = Math.sin(a) * 0.55;
      petal.rotation.z = -Math.cos(a) * 0.55;
      lotus.add(petal);
    }
    const heart = sph(0.06, mat(0xe8c34a, { roughness: 0.5 }), 8, 6);
    heart.position.y = 0.12;
    lotus.add(heart);
    lotus.position.set(-0.45, 0.04, 0);
    g.add(lotus);
    // open journal
    const bj = new THREE.Group();
    [-1, 1].forEach((s) => {
      const page = box(0.26, 0.015, 0.36, mat(0xf3eee0, { roughness: 0.7 }));
      page.position.x = s * 0.125;
      page.rotation.z = -s * 0.18;
      bj.add(page);
    });
    const spine = box(0.04, 0.03, 0.36, mat(0x8a5a3a));
    bj.add(spine);
    const pen = cyl(0.012, 0.012, 0.22, mat(0x2b3f8f), 6);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.5;
    pen.position.set(0.1, 0.035, 0.1);
    bj.add(pen);
    bj.position.set(0.35, 0.05, 0.1);
    bj.rotation.y = -0.4;
    g.add(bj);
    // sapling in a pot (sustainability / growth)
    const pot = cyl(0.09, 0.07, 0.14, mat(0xb06a42, { roughness: 0.8 }), 10);
    pot.position.set(0.72, 0.09, -0.32);
    g.add(pot);
    const stem = cyl(0.015, 0.02, 0.22, mat(0x4a6b35), 6);
    stem.position.set(0.72, 0.27, -0.32);
    g.add(stem);
    [[-0.05, 0.36, 0], [0.06, 0.4, 0.03], [0, 0.45, -0.04]].forEach((p) => {
      const leaf = sph(0.05, mat(0x5f9e4e, { roughness: 0.9 }), 8, 6);
      leaf.scale.set(1.4, 0.6, 1);
      leaf.position.set(0.72 + p[0], p[1], -0.32 + p[2]);
      g.add(leaf);
    });
    g.position.set(-4.9, 0, 8.2);
    g.rotation.y = 0.3;
    island.add(g);
  })();

  // Engineering gear + startup rocket, near the office
  (function buildThings() {
    const g = new THREE.Group();
    // gear
    const teeth = 9, r1 = 0.3, r2 = 0.4;
    const shape = new THREE.Shape();
    for (let i = 0; i < teeth * 4; i++) {
      const a = (i / (teeth * 4)) * Math.PI * 2;
      const r = (i % 4 < 2) ? r2 : r1;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.12, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const gear = shadowed(new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }),
      mat(0x8f9aa6, { metalness: 0.6, roughness: 0.35 })));
    gear.position.set(-0.6, 0.42, 0);
    g.add(gear);
    animated.push({ update: (t) => { gear.rotation.z = t * 0.4; } });
    // rocket on a small pad
    const pad = cyl(0.4, 0.46, 0.1, mat(0x6f6a60, { roughness: 0.9 }), 12);
    pad.position.set(0.55, 0.05, 0.1);
    g.add(pad);
    const rocket = new THREE.Group();
    const bodyR = cyl(0.13, 0.15, 0.55, mat(0xeae6dc, { roughness: 0.4 }), 14);
    bodyR.position.y = 0.45;
    rocket.add(bodyR);
    const noseR = cone(0.13, 0.28, mat(0xc0452f, { roughness: 0.5 }), 14);
    noseR.position.y = 0.86;
    rocket.add(noseR);
    const port = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 14), mat(0x2b3f8f)), false, false);
    port.position.set(0, 0.52, 0.135);
    rocket.add(port);
    for (let i = 0; i < 3; i++) {
      const finA = (i / 3) * Math.PI * 2;
      const fin = box(0.05, 0.22, 0.14, mat(0xc0452f, { roughness: 0.5 }));
      fin.position.set(Math.cos(finA) * 0.16, 0.22, Math.sin(finA) * 0.16);
      fin.rotation.y = -finA;
      rocket.add(fin);
    }
    const flame = cone(0.09, 0.22, new THREE.MeshBasicMaterial({ color: 0xffb84d, transparent: true, opacity: 0.85 }), 10);
    flame.rotation.x = Math.PI;
    flame.position.y = 0.08;
    rocket.add(flame);
    rocket.position.set(0.55, 0.1, 0.1);
    rocket.rotation.z = -0.06;
    g.add(rocket);
    animated.push({
      update: (t) => {
        rocket.position.y = 0.1 + Math.max(0, Math.sin(t * 0.7)) * 0.5;
        flame.scale.setScalar(0.8 + Math.sin(t * 9) * 0.25);
      }
    });
    g.position.set(9.4, 0, 0.4);
    island.add(g);
  })();

  // ---------- The pathway to the future ----------
  (function futurePath() {
    const g = new THREE.Group();
    const stones = [];
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const s = shadowed(new THREE.Mesh(
        new THREE.CylinderGeometry(0.55 - t * 0.18, 0.6 - t * 0.18, 0.12, 10),
        new THREE.MeshStandardMaterial({
          color: 0xd9c9a8, roughness: 0.6, metalness: 0.1,
          emissive: 0xd9a521, emissiveIntensity: 0.15 + t * 0.4,
          transparent: true, opacity: 1 - t * 0.55
        })), t < 0.4, false);
      s.position.set(Math.sin(t * 1.9) * 1.4, 0.35 + t * t * 4.2, 16.2 + t * 7.5);
      g.add(s);
      stones.push({ m: s, baseY: s.position.y, ph: i * 0.7 });
    }
    animated.push({
      update: (t) => stones.forEach((s) => { s.m.position.y = s.baseY + Math.sin(t * 0.8 + s.ph) * 0.08; })
    });
    // soft golden beam rising at the end of the path
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.6, 7, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd98c, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.set(Math.sin(1.9) * 1.4, 7.6, 23.7);
    g.add(beam);
    animated.push({ update: (t) => { beam.material.opacity = 0.12 + Math.sin(t * 0.9) * 0.05; } });
    island.add(g);
  })();

  // ---------- Clouds with holographic visions ----------
  function cloud(scaleV) {
    const g = new THREE.Group();
    const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92, emissive: 0xfff0dc, emissiveIntensity: 0.12 });
    const blobs = [[0, 0, 0, 1], [0.9, 0.12, 0.2, 0.7], [-0.85, 0.05, -0.1, 0.75], [0.35, 0.4, -0.2, 0.6], [-0.3, 0.38, 0.25, 0.55], [1.5, -0.05, 0, 0.45]];
    blobs.forEach((b) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.62 * b[3], 14, 10), cm);
      s.position.set(b[0], b[1] * 0.8, b[2]);
      s.scale.y = 0.72;
      g.add(s);
    });
    g.scale.setScalar(scaleV || 1);
    return g;
  }

  const holoM = () => new THREE.MeshBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.85, depthWrite: false });
  const holoLine = () => new THREE.LineBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.65 });

  function hologram(iconGroup, tint) {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.72, 28),
      new THREE.MeshBasicMaterial({ color: tint || 0x2fd8ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.add(disc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.018, 8, 40),
      new THREE.MeshBasicMaterial({ color: tint || 0x7fe8ff, transparent: true, opacity: 0.7, depthWrite: false }));
    g.add(ring);
    iconGroup.position.z = 0.03;
    g.add(iconGroup);
    return g;
  }

  // icons for the six visions
  function iconNetwork() { // strong professional network
    const g = new THREE.Group();
    const nodes = [[0, 0.34], [-0.34, 0.05], [0.34, 0.08], [-0.16, -0.3], [0.2, -0.28], [0, 0.02]];
    const m = holoM();
    nodes.forEach((n) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), m);
      c.position.set(n[0], n[1], 0);
      g.add(c);
    });
    const pts = [];
    [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 2], [1, 3], [3, 4]].forEach((e) => {
      pts.push(new THREE.Vector3(nodes[e[0]][0], nodes[e[0]][1], 0));
      pts.push(new THREE.Vector3(nodes[e[1]][0], nodes[e[1]][1], 0));
    });
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), holoLine()));
    return g;
  }
  function iconProduct() { // building products that help people: rising bars + heart
    const g = new THREE.Group();
    const m = holoM();
    for (let i = 0; i < 4; i++) {
      const h = 0.14 + i * 0.11;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.11, h, 0.03), m);
      bar.position.set(-0.28 + i * 0.18, -0.35 + h / 2, 0);
      g.add(bar);
    }
    const heartS = new THREE.Shape();
    heartS.moveTo(0, -0.06);
    heartS.bezierCurveTo(-0.14, 0.06, -0.07, 0.16, 0, 0.08);
    heartS.bezierCurveTo(0.07, 0.16, 0.14, 0.06, 0, -0.06);
    const heart = new THREE.Mesh(new THREE.ShapeGeometry(heartS), m);
    heart.scale.setScalar(1.6);
    heart.position.set(0.06, 0.33, 0);
    g.add(heart);
    return g;
  }
  function iconSpeak() { // speaking confidently: mic
    const g = new THREE.Group();
    const m = holoM();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), m);
    head.scale.set(1, 1.35, 1);
    head.position.y = 0.16;
    g.add(head);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16, Math.PI), m);
    arc.rotation.z = Math.PI;
    arc.position.y = 0.06;
    g.add(arc);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 6), m);
    stem.position.y = -0.24;
    g.add(stem);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 10), m);
    base.position.y = -0.37;
    g.add(base);
    // sound waves
    [0.32, 0.42].forEach((r) => {
      const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 14, Math.PI * 0.5), m);
      w.rotation.z = -Math.PI * 0.25;
      w.position.set(0.05, 0.16, 0);
      g.add(w);
    });
    return g;
  }
  function iconCompany() { // joining an innovative tech company: skyline + spark
    const g = new THREE.Group();
    const m = holoM();
    [[-0.24, 0.5, 0.18], [0, 0.72, 0.2], [0.26, 0.4, 0.16]].forEach((b) => {
      const t = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[1], 0.05), m);
      t.position.set(b[0], -0.35 + b[1] / 2, 0);
      g.add(t);
    });
    // spark: two crossed elongated diamonds
    [0, Math.PI / 2].forEach((rz) => {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.3, 4), m);
      s.rotation.z = rz;
      s.position.set(0.02, 0.5, 0.02);
      g.add(s);
      const s2 = s.clone();
      s2.rotation.z = rz + Math.PI;
      g.add(s2);
    });
    return g;
  }
  function iconGlobe() { // thoughtful global leader
    const g = new THREE.Group();
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 9),
      new THREE.MeshBasicMaterial({ color: 0x9ff2ff, wireframe: true, transparent: true, opacity: 0.7 }));
    g.add(globe);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.015, 6, 24), holoM());
    ring.rotation.x = Math.PI / 2.4;
    g.add(ring);
    return g;
  }
  function iconCommunity() { // supporting communities: three figures + heart above
    const g = new THREE.Group();
    const m = holoM();
    [[-0.22, 0], [0, 0.06], [0.22, 0]].forEach((p) => {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), m);
      head.position.set(p[0], p[1] - 0.02, 0);
      g.add(head);
      const bod = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), m);
      bod.position.set(p[0], p[1] - 0.22, 0);
      g.add(bod);
    });
    const heartS = new THREE.Shape();
    heartS.moveTo(0, -0.05);
    heartS.bezierCurveTo(-0.12, 0.05, -0.06, 0.14, 0, 0.07);
    heartS.bezierCurveTo(0.06, 0.14, 0.12, 0.05, 0, -0.05);
    const heart = new THREE.Mesh(new THREE.ShapeGeometry(heartS), m);
    heart.position.set(0, 0.3, 0);
    heart.scale.setScalar(1.4);
    g.add(heart);
    return g;
  }

  const cloudDefs = [
    { pos: [-8.5, 8.6, 1.5], s: 1.5, icon: iconNetwork, tint: 0x7fe8ff },
    { pos: [8.6, 9.4, 3.6], s: 1.3, icon: iconCompany, tint: 0x7fe8ff },
    { pos: [0.4, 10.6, -6.5], s: 1.7, icon: iconGlobe, tint: 0x9fd8ff },
    { pos: [12.2, 7.6, -4.5], s: 1.1, icon: iconSpeak, tint: 0xa5ecff },
    { pos: [-12.4, 7.2, -4.0], s: 1.2, icon: iconCommunity, tint: 0xffd9a0 },
    { pos: [-3.5, 8.2, 9.5], s: 1.0, icon: iconProduct, tint: 0x7fe8ff }
  ];
  const holos = [];
  cloudDefs.forEach((cd, i) => {
    const c = cloud(cd.s);
    c.position.set(cd.pos[0], cd.pos[1], cd.pos[2]);
    scene.add(c);
    const h = hologram(cd.icon(), cd.tint);
    h.position.set(cd.pos[0], cd.pos[1] - cd.s * 1.15, cd.pos[2]);
    scene.add(h);
    holos.push(h);
    animated.push({
      update: (t) => {
        c.position.y = cd.pos[1] + Math.sin(t * 0.4 + i * 1.3) * 0.35;
        c.position.x = cd.pos[0] + Math.sin(t * 0.13 + i) * 0.5;
        h.position.y = cd.pos[1] - cd.s * 1.15 + Math.sin(t * 0.4 + i * 1.3) * 0.35;
        h.position.x = c.position.x;
        const pulse = 1 + Math.sin(t * 1.8 + i) * 0.04;
        h.scale.setScalar(pulse);
      }
    });
  });
  // holograms always face the camera (billboard around Y)
  animated.push({
    update: () => holos.forEach((h) => {
      const v = new THREE.Vector3().subVectors(camera.position, h.position);
      h.rotation.y = Math.atan2(v.x, v.z);
    })
  });

  // a couple of plain distant clouds for depth
  [[-22, 12, -18, 2.2], [20, 13, -14, 1.9], [4, 15, 18, 2.4]].forEach((p) => {
    const c = cloud(p[3]);
    c.position.set(p[0], p[1], p[2]);
    c.children.forEach((ch) => { ch.material = ch.material.clone(); ch.material.opacity = 0.75; });
    scene.add(c);
  });

  // ---------- Golden sparkles along the future path ----------
  (function sparkles() {
    const N = 90;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = Math.random();
      if (i < 55) { // along the path
        pos[i * 3] = Math.sin(t * 1.9) * 1.4 + (Math.random() - 0.5) * 2.2;
        pos[i * 3 + 1] = 0.5 + t * 6 + Math.random() * 1.5;
        pos[i * 3 + 2] = 15 + t * 9 + (Math.random() - 0.5) * 2;
      } else { // ambient fireflies
        const a = Math.random() * Math.PI * 2, rr = 4 + Math.random() * 12;
        pos[i * 3] = Math.cos(a) * rr;
        pos[i * 3 + 1] = 0.8 + Math.random() * 4;
        pos[i * 3 + 2] = Math.sin(a) * rr;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g2 = c.getContext('2d');
    const grad = g2.createRadialGradient(16, 16, 1, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,240,200,1)');
    grad.addColorStop(1, 'rgba(255,200,90,0)');
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 32, 32);
    const pmat = new THREE.PointsMaterial({
      size: 0.32, map: new THREE.CanvasTexture(c), transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const points = new THREE.Points(geo, pmat);
    scene.add(points);
    animated.push({ update: (t) => { pmat.opacity = 0.75 + Math.sin(t * 1.1) * 0.2; points.rotation.y = Math.sin(t * 0.05) * 0.04; } });
  })();

  // ---------- Render loop ----------
  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    animated.forEach((a) => a.update(t));
    controls.update();
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // debug/deep-link camera hook: #cam=x,y,z,tx,ty,tz
  if (location.hash.indexOf('#cam=') === 0) {
    const v = location.hash.slice(5).split(',').map(Number);
    if (v.length === 6 && v.every((n) => !isNaN(n))) {
      camera.position.set(v[0], v[1], v[2]);
      controls.target.set(v[3], v[4], v[5]);
      controls.autoRotate = false;
      controls.update();
    }
  }

  // fade the hint after first interaction
  const hint = document.getElementById('hint');
  setTimeout(() => { if (!interacted && hint) hint.classList.add('pulse'); }, 4000);
  controls.addEventListener('start', () => { if (hint) hint.classList.add('gone'); });
})();
