/* ==========================================================================
   6e · DAY AND NIGHT
   One body hangs in the sky above the building, in the same spot in every
   room. Click it and it turns from sun to moon, and the building follows:
   sky colour, the view through the glass, ambient light, and every fitting
   registered as a lamp.
   ========================================================================== */

/* any emissive fitting registers here so it can be switched */
const LAMPS = [];
function lamp(mat) { LAMPS.push(mat); return mat; }

/* things that keep ticking whatever room you are in */
const GLOBAL_ANIM = [];

let DAYLIGHT = true;

const MODE = {
  day:   { bg: 0xBCD6EE, hemi: 0.66, key: 1.2,  fill: 0.36, point: 0.12,
           fog: [64, 150], lampsOn: false },
  night: { bg: 0x05070E, hemi: 0.20, key: 0.22, fill: 0.07, point: 1.3,
           fog: [34, 92],  lampsOn: true }
};

/* ---- textures ------------------------------------------------------------ */
function buildSkyTextures() {
  // soft radial falloff, used for every glow
  TEX.glow = makeTex(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.16)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });

  // a clean moon: pale, with soft maria instead of lumpy craters
  TEX.moonFace = makeTex(256, 256, (x, w, h) => {
    x.fillStyle = '#E4E7EC'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const cx = Math.random() * w, cy = Math.random() * h;
      const r = 16 + Math.random() * 42;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(176,184,198,0.5)');
      g.addColorStop(1, 'rgba(176,184,198,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.3); x.fill();
    }
    for (let i = 0; i < 900; i++) {
      x.fillStyle = `rgba(200,206,216,${Math.random() * 0.16})`;
      x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });

  // daylight through the glass
  TEX.viewDay = makeTex(128, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#9FC2E4'); g.addColorStop(0.55, '#CFE3F5'); g.addColorStop(1, '#E9F2FA');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });

  const nightSky = (x, w, h, ground) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05080F'); g.addColorStop(0.6, '#0A1020'); g.addColorStop(1, ground);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 320; i++) {
      x.fillStyle = `rgba(228,238,255,${0.2 + Math.random() * 0.7})`;
      x.beginPath();
      x.arc(Math.random() * w, Math.random() * h * 0.8, Math.random() < 0.14 ? 1.5 : 0.8, 0, 6.3);
      x.fill();
    }
    for (let i = 0; i < 6; i++) {
      const bx = Math.random() * w, by = Math.random() * h * 0.62;
      const gr = x.createRadialGradient(bx, by, 0, bx, by, 10);
      gr.addColorStop(0, 'rgba(235,244,255,.95)'); gr.addColorStop(1, 'rgba(235,244,255,0)');
      x.fillStyle = gr; x.beginPath(); x.arc(bx, by, 10, 0, 6.3); x.fill();
    }
  };
  TEX.viewNight = makeTex(256, 256, (x, w, h) => nightSky(x, w, h, '#0B1120'));
  TEX.outsideNight = makeTex(256, 256, (x, w, h) => {
    nightSky(x, w, h, '#0A1710');
    for (let i = 0; i < 38; i++) {
      const cx = Math.random() * w, cy = h * 0.74 + Math.random() * h * 0.3;
      x.fillStyle = `rgba(12,${26 + Math.random() * 20},18,${0.6 + Math.random() * 0.35})`;
      x.beginPath(); x.arc(cx, cy, 14 + Math.random() * 38, 0, 6.3); x.fill();
    }
    x.fillStyle = 'rgba(6,14,10,.9)'; x.fillRect(0, h * 0.93, w, h * 0.07);
  });
}

/* the reception backdrop reads as a contact desk */
function contactSignTexture() {
  return makeTex(1024, 256, (x, w, h) => {
    x.fillStyle = '#20242C'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#F5A524'; x.fillRect(0, 0, 14, h);
    x.fillStyle = '#F2F4F8'; x.font = '700 78px ui-sans-serif,sans-serif';
    x.fillText('CONTACT ME', 60, 120);
    x.fillStyle = '#8A94A6'; x.font = '30px ui-monospace,monospace';
    x.fillText('reception  ·  open to work  ·  say hello', 62, 176);
  });
}

/* ---- the text that floats under each arrow ------------------------------- */
const MARKER_LABELS = [];
const SCRATCH = STATE.webgl ? new THREE.Vector3() : { set: () => {}, copy: () => {} };

function roundRectPath(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

/* letters drawn one at a time so they can be tracked out wide — canvas has no
   letter-spacing in older browsers, and the wide setting is what gives these
   signs their character */
function trackedText(x, text, cx, cy, tracking) {
  const chars = String(text).split('');
  const widths = chars.map(ch => x.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let px = cx - total / 2;
  x.textAlign = 'left';
  chars.forEach((ch, i) => { x.fillText(ch, px, cy); px += widths[i] + tracking; });
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v =>
    Math.max(0, Math.min(255, Math.round(v + amt))));
  return 'rgb(' + ch.join(',') + ')';
}

function labelTexture(text, dark, col) {
  const c = col || '#F5A524';
  return makeTex(640, 168, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    // a panel tinted with the label's own colour, not a plain black or white box
    roundRectPath(x, 12, 26, w - 24, h - 60, 32);
    x.fillStyle = dark ? 'rgba(9,13,20,.74)' : 'rgba(252,253,255,.80)';
    x.fill();
    x.globalAlpha = dark ? 0.22 : 0.26;
    x.fillStyle = c; x.fill();
    x.globalAlpha = 1;
    x.strokeStyle = c; x.lineWidth = 4.5; x.stroke();

    x.font = '800 52px "Trebuchet MS","Segoe UI",ui-sans-serif,sans-serif';
    x.textBaseline = 'middle';
    const grad = x.createLinearGradient(0, 44, 0, h - 44);
    grad.addColorStop(0, dark ? shade(c, 58) : shade(c, -18));
    grad.addColorStop(1, dark ? c : shade(c, -96));
    x.shadowColor = dark ? c : 'rgba(0,0,0,0)';
    x.shadowBlur = dark ? 16 : 0;
    x.fillStyle = grad;
    trackedText(x, String(text).toUpperCase(), w / 2, h / 2 - 2, 6);
    x.shadowBlur = 0;

    // a short accent rule under the word
    x.fillStyle = c;
    x.globalAlpha = 0.9;
    x.fillRect(w / 2 - 26, h - 44, 52, 4);
    x.globalAlpha = 1;
  });
}

function makeMarkerLabel(text, col) {
  const day = labelTexture(text, false, col), night = labelTexture(text, true, col);
  const mat = new THREE.MeshBasicMaterial({
    map: DAYLIGHT ? day : night, transparent: true, toneMapped: false, depthWrite: false
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.63), mat);
  m.renderOrder = 4;
  MARKER_LABELS.push({ mat, day, night });
  return m;
}

/* keeps a sign about the same size on screen however far away you are */
function sizeLabel(lab, base) {
  lab.getWorldPosition(SCRATCH);
  const d = camera.position.distanceTo(SCRATCH);
  lab.scale.setScalar((base || 1) * Math.max(0.72, Math.min(3.0, d * 0.055)));
}

/* a marker that names a whole area rather than one object — no click, it is
   just a signpost. Sits above the individual markers underneath it. */
function makeSignpost(text, baseY, col) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(col || '#F5A524'), transparent: true, opacity: 0.85,
    depthWrite: false, toneMapped: false
  });
  const spin = new THREE.Group();
  const shaft = new THREE.Mesh(GEO.cyl, mat);
  shaft.scale.set(0.2, 0.7, 0.2); shaft.position.y = 0.72;
  const head = new THREE.Mesh(GEO.cone, mat);
  head.scale.set(0.78, 0.6, 0.78); head.rotation.x = Math.PI; head.position.y = 0.2;
  const cap = new THREE.Mesh(GEO.sphere, mat);
  cap.scale.setScalar(0.22); cap.position.y = 1.07;
  spin.add(shaft); spin.add(head); spin.add(cap);
  g.add(spin);

  const lab = makeMarkerLabel(text, col);
  lab.position.y = 1.6;
  g.add(lab);

  const phase = Math.random() * 6.3;
  ANIMATED.push({ fn: (t) => {
    g.position.y = baseY + Math.sin(t * 1.6 + phase) * 0.24;
    spin.rotation.y = t * 0.8;
    lab.lookAt(camera.position);
    sizeLabel(lab, 1.2);
  } });
  return g;
}

/* ---- one body, two faces ------------------------------------------------- */
function makeSkyBody() {
  const g = new THREE.Group();
  const R = 3.0;

  const billboard = (size, color, opacity) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        map: TEX.glow, color, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
      }));
    GLOBAL_ANIM.push({ fn: () => m.lookAt(camera.position) });
    return m;
  };

  const sun = new THREE.Group();
  sun.add(new THREE.Mesh(new THREE.SphereGeometry(R, 36, 26),
    new THREE.MeshBasicMaterial({ color: 0xFFEFC2, toneMapped: false })));
  sun.add(billboard(R * 7.5, 0xFFC46B, 0.55));
  sun.add(billboard(R * 3.4, 0xFFF0C8, 0.45));
  g.add(sun);

  const moon = new THREE.Group();
  moon.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.78, 36, 26),
    new THREE.MeshBasicMaterial({ map: TEX.moonFace, toneMapped: false })));
  moon.add(billboard(R * 4.6, 0xAFC6EA, 0.32));
  moon.visible = false;
  g.add(moon);

  g.userData.setMode = (day) => { sun.visible = day; moon.visible = !day; };
  return g;
}

/* ---- night sky ----------------------------------------------------------- */
function makeNightStars() {
  const g = new THREE.Group();
  const layer = (n, radius, size, op, col) => {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 0.98);          // a dome, not a full ball
      const r = radius * (0.82 + Math.random() * 0.18);
      pos[i * 3] = Math.sin(p) * Math.cos(a) * r;
      pos[i * 3 + 1] = Math.cos(p) * r * 0.9 + 10;
      pos[i * 3 + 2] = Math.sin(p) * Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: col, size, sizeAttenuation: true, map: TEX.glow,
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData = { mat, base: op };
    g.add(pts);
    return pts;
  };
  layer(1100, 150, 1.1, 0.55, 0xCBD9F5);
  const mid = layer(320, 130, 2.0, 0.8, 0xEAF1FF);
  const near = layer(60, 115, 3.4, 1.0, 0xFFFFFF);
  GLOBAL_ANIM.push({ fn: (t) => {
    if (DAYLIGHT) return;
    mid.userData.mat.opacity = mid.userData.base * (0.78 + Math.sin(t * 0.8) * 0.12);
    near.userData.mat.opacity = near.userData.base * (0.75 + Math.sin(t * 1.3 + 1) * 0.18);
  } });
  g.userData.setLit = (on) => {
    g.children.forEach(p => { p.userData.mat.opacity = on ? p.userData.base : 0; });
  };
  return g;
}

const SKY = { body: null, stars: null, rec: null };

function setDaylight(on) {
  DAYLIGHT = !!on;
  const s = DAYLIGHT ? MODE.day : MODE.night;

  scene.background = new THREE.Color(s.bg);
  if (scene.fog) { scene.fog.color.setHex(s.bg); scene.fog.near = s.fog[0]; scene.fog.far = s.fog[1]; }
  if (LIGHTS.hemi) LIGHTS.hemi.intensity = s.hemi;
  if (LIGHTS.key) LIGHTS.key.intensity = s.key;
  if (LIGHTS.fill) LIGHTS.fill.intensity = s.fill;
  (LIGHTS.points || []).forEach(p => { p.intensity = p.userData.base * (s.point / 0.12); });

  LAMPS.forEach(m => { if (m.color) m.color.setHex(s.lampsOn ? 0xFFF6E4 : 0x9AA0A8); });
  MARKER_LABELS.forEach(l => { l.mat.map = DAYLIGHT ? l.day : l.night; l.mat.needsUpdate = true; });

  if (MAT.window && TEX.viewDay) {
    MAT.window.map = DAYLIGHT ? TEX.viewDay : TEX.viewNight;
    MAT.window.needsUpdate = true;
  }
  if (MAT.outside && TEX.outsideNight) {
    MAT.outside.map = DAYLIGHT ? TEX.outside : TEX.outsideNight;
    MAT.outside.needsUpdate = true;
  }

  if (SKY.body) SKY.body.userData.setMode(DAYLIGHT);
  if (SKY.stars) SKY.stars.userData.setLit(!DAYLIGHT);
  if (SKY.rec) {
    SKY.rec.title = DAYLIGHT ? 'Sun' : 'Moon';
    SKY.rec.sub = DAYLIGHT ? 'Click for night' : 'Click for daytime';
  }

  const b = el('btnSky');
  if (b) {
    b.classList.toggle('active', !DAYLIGHT);
    b.title = DAYLIGHT ? 'Daytime — switch to night' : 'Night — switch to daytime';
  }
}

/* the sky body lives outside any one room, so every scene shares it */
function attachSky(sc) {
  if (!SKY.body || !sc) return;
  if (SKY.rec && sc.interactives.indexOf(SKY.rec) >= 0) return;   // already on this scene
  if (!SKY.rec) {
    SKY.rec = registerInteractive(SKY.body, {
      type: 'sky', id: 'sky', title: 'Sun', sub: 'Click for night',
      noRing: true, hotspot: { y: 4.4 },
      focus: () => focusPose(SKY.body.position.x, SKY.body.position.y - 2,
        SKY.body.position.z, 18, CAM.theta, Math.min(CAM.phi, 0.72)),
      data: null
    }, sc);
  } else {
    sc.interactives.push(SKY.rec);
    SKY.body.traverse(m => { if (m.isMesh && m.userData.ix === SKY.rec) sc.pickable.push(m); });
  }
}
