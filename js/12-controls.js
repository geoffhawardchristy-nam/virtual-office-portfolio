/* ==========================================================================
   9 · CHARACTER + CAMERA CONTROLLER
   follow mode : WASD walks the character, camera orbits around them
   free mode   : WASD pans the camera target, character stays put
   ========================================================================== */
const CAM = {
  mode: 'follow',
  target: new THREE.Vector3(0, 1.15, 8.5),
  goalTarget: new THREE.Vector3(0, 1.15, 8.5),
  theta: 0, goalTheta: 0,
  phi: 1.02, goalPhi: 1.02,
  radius: 46, goalRadius: 46,
  tween: null, prev: null, hold: false,
  keys: {}, drag: null, pointers: new Map(), pinch: 0
};
const POINTER = { x: 0, y: 0, sx: 0, sy: 0, dirty: false };
const HERO_SPEED = 4.4;

function camApply() {
  const sp = new THREE.Spherical(CAM.radius, CAM.phi, CAM.theta);
  camera.position.setFromSpherical(sp).add(CAM.target);
  camera.lookAt(CAM.target);
}
function shortAngle(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
}
function camFocus(pose, ms) {
  CAM.tween = {
    t: 0, dur: (ms || 1000) / 1000,
    from: { t: CAM.target.clone(), theta: CAM.theta, phi: CAM.phi, radius: CAM.radius },
    to: { t: pose.target.clone(), theta: shortAngle(CAM.theta, pose.theta), phi: pose.phi, radius: pose.radius }
  };
}
function camSnapshot() {
  return { target: CAM.goalTarget.clone(), theta: CAM.goalTheta, phi: CAM.goalPhi, radius: CAM.goalRadius };
}

/* keep the character out of the furniture */
function collide(p, r) {
  const b = ACTIVE.bounds;
  p.x = THREE.MathUtils.clamp(p.x, -b.x, b.x);
  p.z = THREE.MathUtils.clamp(p.z, -b.z, b.z);
  const list = ACTIVE.blockers;
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    const dx = p.x - o.x, dz = p.z - o.z;
    const ox = o.hw + r - Math.abs(dx), oz = o.hd + r - Math.abs(dz);
    if (ox > 0 && oz > 0) {
      if (ox < oz) p.x += dx > 0 ? ox : -ox;
      else p.z += dz > 0 ? oz : -oz;
    }
  }
}

let heroSpeed = 0;
function updateHero(dt) {
  const k = CAM.keys;
  const f = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0);
  const r = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
  const walking = (f || r) && CAM.mode === 'follow' && !STATE.selected && STATE.ready;

  if (walking) {
    STATE.idle = 0;
    CAM.tween = null;
    const sp = (k.shift ? HERO_SPEED * 1.9 : HERO_SPEED);
    const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const dir = new THREE.Vector3().addScaledVector(fwd, f).addScaledVector(right, r).normalize();
    const p = HERO.group.position;
    p.addScaledVector(dir, sp * dt);
    collide(p, 0.42);
    const want = Math.atan2(dir.x, dir.z);
    const cur = shortAngle(HERO.group.rotation.y, want);
    HERO.group.rotation.y = cur + (want - cur) * Math.min(1, dt * 14);
    heroSpeed = sp;
  } else {
    heroSpeed += (0 - heroSpeed) * Math.min(1, dt * 8);
  }
  HERO.tick(dt, walking ? heroSpeed : 0);
}

function camUpdate(dt) {
  if (CAM.tween) {
    const tw = CAM.tween;
    tw.t += dt;
    let k = Math.min(1, tw.t / tw.dur);
    k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    CAM.target.lerpVectors(tw.from.t, tw.to.t, k);
    CAM.theta = tw.from.theta + (tw.to.theta - tw.from.theta) * k;
    CAM.phi = tw.from.phi + (tw.to.phi - tw.from.phi) * k;
    CAM.radius = tw.from.radius + (tw.to.radius - tw.from.radius) * k;
    if (tw.t >= tw.dur) {
      CAM.tween = null;
      CAM.goalTarget.copy(CAM.target);
      CAM.goalTheta = CAM.theta; CAM.goalPhi = CAM.phi; CAM.goalRadius = CAM.radius;
    }
    camApply();
    return;
  }

  if (CAM.mode === 'follow' && !CAM.hold) {
    CAM.goalTarget.set(HERO.group.position.x, 1.15, HERO.group.position.z);
  } else if (CAM.mode === 'free') {
    const k = CAM.keys;
    const f = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0);
    const r = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
    if (f || r) {
      STATE.idle = 0;
      const speed = (k.shift ? 20 : 10) * dt;
      const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta));
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
      CAM.goalTarget.addScaledVector(fwd, f * speed).addScaledVector(right, r * speed);
      const b = ACTIVE.bounds;
      CAM.goalTarget.x = THREE.MathUtils.clamp(CAM.goalTarget.x, -b.x, b.x);
      CAM.goalTarget.z = THREE.MathUtils.clamp(CAM.goalTarget.z, -b.z, b.z);
    }
  }

  if (STATE.ready && STATE.idle > 18 && !STATE.selected && CAM.mode === 'free') CAM.goalTheta += dt * 0.03;

  const s = 1 - Math.exp(-dt * 8);
  CAM.target.lerp(CAM.goalTarget, s);
  CAM.theta += (CAM.goalTheta - CAM.theta) * s;
  CAM.phi += (CAM.goalPhi - CAM.phi) * s;
  CAM.radius += (CAM.goalRadius - CAM.radius) * s;
  camApply();
}

function setCamMode(mode) {
  CAM.mode = mode;
  CAM.hold = false;
  el('btnMode').classList.toggle('active', mode === 'follow');
  el('btnMode').title = mode === 'follow' ? 'Camera: following you' : 'Camera: free look';
  CAM.tween = null;
  if (mode === 'follow') {
    CAM.goalTarget.set(HERO.group.position.x, 1.15, HERO.group.position.z);
    CAM.goalRadius = 8.5; CAM.goalPhi = 1.02;
  } else {
    CAM.goalRadius = Math.max(16, ACTIVE ? ACTIVE.bounds.x * 1.3 : 20);
    CAM.goalPhi = 0.92;
  }
}

/* ---- input -------------------------------------------------------------- */
function bindInput() {
  const cv = canvas;

  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId);
    CAM.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (CAM.pointers.size === 1) {
      CAM.drag = { x: e.clientX, y: e.clientY, moved: 0, pan: (e.button === 2 || e.shiftKey) && CAM.mode === 'free' };
      cv.classList.add('grabbing');
    }
    STATE.idle = 0;
  });

  cv.addEventListener('pointermove', (e) => {
    const p = CAM.pointers.get(e.pointerId);
    if (p) { p.x = e.clientX; p.y = e.clientY; }
    POINTER.x = (e.clientX / window.innerWidth) * 2 - 1;
    POINTER.y = -(e.clientY / window.innerHeight) * 2 + 1;
    POINTER.sx = e.clientX; POINTER.sy = e.clientY;
    POINTER.dirty = true;
    if (CAM.pointers.size === 2) { pinch(); return; }
    if (!CAM.drag) return;
    const dx = e.clientX - CAM.drag.x, dy = e.clientY - CAM.drag.y;
    CAM.drag.x = e.clientX; CAM.drag.y = e.clientY;
    CAM.drag.moved += Math.abs(dx) + Math.abs(dy);
    STATE.idle = 0; CAM.tween = null;
    if (CAM.drag.pan) {
      const k = CAM.radius * 0.0016;
      const fwd = new THREE.Vector3(-Math.sin(CAM.theta), 0, -Math.cos(CAM.theta));
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
      CAM.goalTarget.addScaledVector(right, dx * k).addScaledVector(fwd, -dy * k);
    } else {
      CAM.goalTheta -= dx * 0.0052;
      CAM.goalPhi = THREE.MathUtils.clamp(CAM.goalPhi - dy * 0.0042, 0.22, 1.34);
    }
  });

  const release = (e) => {
    CAM.pointers.delete(e.pointerId);
    if (CAM.pointers.size < 2) CAM.pinch = 0;
    if (CAM.pointers.size === 0) {
      cv.classList.remove('grabbing');
      if (CAM.drag && CAM.drag.moved < 8) handleClick();
      CAM.drag = null;
    }
  };
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', release);
  cv.addEventListener('contextmenu', e => e.preventDefault());

  cv.addEventListener('wheel', (e) => {
    e.preventDefault(); CAM.tween = null; STATE.idle = 0;
    const lo = CAM.mode === 'follow' ? 3.4 : 2.8;
    CAM.goalRadius = THREE.MathUtils.clamp(CAM.goalRadius * Math.exp(e.deltaY * 0.0011), lo, 60);
  }, { passive: false });

  function pinch() {
    const pts = [...CAM.pointers.values()];
    const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    if (CAM.pinch) {
      CAM.tween = null;
      CAM.goalRadius = THREE.MathUtils.clamp(CAM.goalRadius * (CAM.pinch / d), 3.4, 60);
    }
    CAM.pinch = d;
  }

  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
      CAM.keys[k] = true;
      if (k !== 'shift') { CAM.tween = null; e.preventDefault(); }
    }
    if (k === 'e') activateNearest();
    if (k === 'escape') closePanel();
  });
  addEventListener('keyup', (e) => { CAM.keys[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { CAM.keys = {}; });
}

/* ==========================================================================
   10 · PICKING, PROXIMITY, TOOLTIP
   ========================================================================== */
const KIND = {
  project: 'Workstation', person: 'Colleague', skills: 'Whiteboard',
  experience: 'Meeting room', about: 'About me', education: 'Shelf',
  contact: 'Contact', coffee: 'Break area', side: 'Side project',
  desktop: 'Laptop', sky: 'Mode',
  door: 'Chapter', exit: 'Exit', vacancy: 'Empty desk'
};

function pick() {
  if (!ACTIVE) return null;
  RAY.setFromCamera(POINTER, camera);
  const hits = RAY.intersectObjects(ACTIVE.pickable, false);
  return hits.length ? hits[0].object.userData.ix : null;
}

function setHover(rec) {
  if (STATE.hovered === rec) return;
  STATE.hovered = rec;
  const tip = el('tip');
  canvas.classList.toggle('pointing', !!rec);
  if (rec) {
    tip.querySelector('.s').textContent = KIND[rec.type] || '';
    tip.querySelector('.t').textContent = rec.title;
    tip.classList.add('on');
  } else tip.classList.remove('on');
  updateDoorHud();
}

function moveTip() {
  if (!STATE.hovered) return;
  const t = el('tip');
  t.style.left = POINTER.sx + 'px';
  t.style.top = POINTER.sy + 'px';
}

function nearest() {
  if (!ACTIVE || !HERO) return null;
  const p = HERO.group.position;
  let best = null, bd = 2.9;
  for (let i = 0; i < ACTIVE.interactives.length; i++) {
    const r = ACTIVE.interactives[i];
    if (!r.prox) continue;
    const d = Math.hypot(p.x - r.prox.x, p.z - r.prox.z);
    if (d < bd) { bd = d; best = r; }
  }
  return best;
}

let NEAR = null;
function updateProximity() {
  const n = (CAM.mode === 'follow' && STATE.ready && !STATE.selected) ? nearest() : null;
  if (n === NEAR) return;
  NEAR = n;
  const pr = el('prompt');
  if (n) {
    pr.querySelector('.txt').innerHTML = n.proxLabel.replace(/^(\w+)/, '<b>$1</b>');
    pr.classList.add('on');
  } else pr.classList.remove('on');
  updateDoorHud();
}

function updateDoorHud() {
  const d = (STATE.hovered && STATE.hovered.type === 'door' && !STATE.hovered.inside && STATE.hovered.data)
    || (NEAR && NEAR.type === 'door' && !NEAR.inside && NEAR.data);
  const hud = el('doorhud');
  if (d && !STATE.selected) {
    hud.querySelector('.tier').textContent = d.tierLabel;
    hud.querySelector('.tier').style.color = TIERS[d.tier].css;
    hud.querySelector('.co').textContent = d.company;
    hud.querySelector('.dt').textContent = d.when + '  ·  ' + d.span;
    hud.classList.add('on');
  } else hud.classList.remove('on');
}

function activateNearest() {
  if (!NEAR || SWITCHING) return;
  if (NEAR.type === 'sky') { setDaylight(!DAYLIGHT); return; }
  if (NEAR.type === 'door' && !NEAR.inside) enterDoor(NEAR.data.id);
  else if (NEAR.type === 'exit') leaveOffice();
  else openPanel(NEAR);
}

function handleClick() {
  const rec = pick();
  if (!rec) { if (STATE.selected) closePanel(); return; }
  if (rec.type === 'exit') { leaveOffice(); return; }
  if (rec.type === 'sky') { setDaylight(!DAYLIGHT); return; }        // one body, so just flip
  openPanel(rec);
}
