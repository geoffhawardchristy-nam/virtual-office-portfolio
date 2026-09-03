/* ==========================================================================
   13 · RENDER LOOP
   ========================================================================== */
let frames = 0, fpsAcc = 0, checked = false;

let animErr = 0;
function animate() {
  requestAnimationFrame(animate);
  try { frame(); } catch (e) {
    if (!animErr++) { console.error(e); reportError(e); }
  }
}

function frame() {
  const dt = Math.min(CLOCK.getDelta(), 0.05);
  const t = CLOCK.elapsedTime;
  STATE.idle += dt;

  if (HERO) updateHero(dt);
  camUpdate(dt);
  updateProximity();

  if (POINTER.dirty && !CAM.drag && frames % 2 === 0) { setHover(pick()); moveTip(); }
  else if (POINTER.dirty) moveTip();

  if (ACTIVE) {
    const list = ACTIVE.interactives;
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      const want = (r === STATE.selected) ? 1 : (r === STATE.hovered ? 0.8 : (r === NEAR ? 0.55 : 0));
      r.hl += (want - r.hl) * Math.min(1, dt * 9);
      const sel = r === STATE.selected;
      r.ringMat.opacity = r.hl * 0.85;
      if (r.tier) r.ringMat.color.setHex(sel ? 0xF5A524 : TIERS[r.tier].glow);
      else r.ringMat.color.setHex(sel ? 0xF5A524 : 0x7FB2FF);
      r.ring.scale.setScalar(r.ringR * (1 + Math.sin(t * 3.4) * 0.03 * r.hl));
      r.obj.scale.setScalar(1 + r.hl * 0.01);
      r.hotMat.opacity = (STATE.selected ? 0.12 : 0.72) + r.hl * 0.28;
      if (r.arrow) {
        // arrows bob and turn; billboarding them would tip them over
        r.hotspot.position.y = r.hotBaseY + Math.sin(t * 1.9 + i) * 0.22;
        r.hotspot.rotation.y = t * 0.9;
        r.hotspot.scale.setScalar(1 + r.hl * 0.14);
        if (r.label) {
          r.label.position.y = r.hotBaseY + 1.55 + Math.sin(t * 1.9 + i) * 0.22;
          r.label.lookAt(camera.position);
          sizeLabel(r.label, 1);
          r.label.material.opacity = STATE.selected ? 0.25 : 1;
        }
      } else {
        r.hotspot.scale.setScalar((0.85 + Math.sin(t * 2.2 + i) * 0.07) * (1 + r.hl * 0.35));
        r.hotspot.lookAt(camera.position);
      }
    }
    const an = ACTIVE.animated;
    for (let i = 0; i < an.length; i++) an[i].fn(t, dt);
  }
  for (let i = 0; i < GLOBAL_ANIM.length; i++) GLOBAL_ANIM[i].fn(t, dt);
  if (ACTIVE) {
  }

  renderer.render(scene, camera);

  frames++;
  if (!checked && STATE.ready) {
    fpsAcc += dt;
    if (frames > 150) { checked = true; if (150 / fpsAcc < 38) downgrade(); }
  }
}

function downgrade() {
  STATE.low = true;
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = false;
  scene.traverse(o => { if (o.isMesh && o.material) o.material.needsUpdate = true; });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, STATE.low ? 1 : (STATE.mobile ? 1.5 : 2)));
}

function step(pct, label) {
  el('bar').firstElementChild.style.width = pct + '%';
  if (label) el('loadLbl').textContent = label;
}

/* ==========================================================================
   14 · BOOT
   ========================================================================== */
function reportError(e) {
  const b = el('bootErr');
  if (!b) return;
  b.textContent = 'Something broke: ' + (e && e.message ? e.message : e);
  b.style.display = 'block';
}

addEventListener('error', (ev) => reportError(ev.error || ev.message));

function boot() {
  try { bootInner(); } catch (e) {
    console.error(e); reportError(e);
    el('loader').classList.add('gone');
    el('intro').classList.add('gone');
    showClassic(true);
  }
}

function bootInner() {
  const pf = el('preflight');
  if (pf) pf.textContent = typeof THREE === 'undefined' ? 'three.js did not load' : 'starting…';
  buildClassic();

  if (!STATE.webgl) {
    el('loader').classList.add('gone');
    el('intro').classList.add('gone');
    showClassic(true);
    return;
  }

  setupEngine();
  step(15, 'Mixing the paint');

  requestAnimationFrame(() => {
    buildTextures(); buildMaterials(); buildGeometry(); buildNpcGeo();
    buildThemeAssets(); buildTierMaterials(); TH = THEMES.default;
    step(48, 'Hanging the doors');

    requestAnimationFrame(() => {
      const hub = buildScene('hub');
      HERO = makeHero();
      scene.add(HERO.group);
      ACTIVE = hub;
      hub.root.visible = true;
      HERO.group.position.set(hub.spawn.x, 0, hub.spawn.z);
      HERO.group.rotation.y = Math.PI;
      bindInput();
      addEventListener('resize', onResize);
      step(94, 'Handing you the badge');

      requestAnimationFrame(() => {
        CAM.target.set(hub.spawn.x, 1.15, hub.spawn.z);
        CAM.goalTarget.copy(CAM.target);
        CAM.radius = CAM.goalRadius = 46;
        CAM.phi = CAM.goalPhi = 0.72;
        CAM.theta = CAM.goalTheta = 0.35;
        SKY.body = makeSkyBody();
        SKY.body.position.set(17, 19, -11);
        scene.add(SKY.body);
        SKY.stars = makeNightStars();
        scene.add(SKY.stars);
        attachSky(hub);
        setDaylight(true);
        camApply();
        renderer.compile(scene, camera);
        step(100, 'Ready');
        const pf2 = el('preflight');
        if (pf2) pf2.style.display = 'none';
        setTimeout(() => el('loader').classList.add('gone'), 240);
        animate();
      });
    });
  });

  // ---- UI wiring
  el('btnExplore').onclick = () => {
    el('intro').classList.add('gone');
    STATE.ready = true;
    setCamMode('follow');
    CAM.goalTheta = 0;
    camFocus({ target: new THREE.Vector3(HERO.group.position.x, 1.15, HERO.group.position.z), theta: 0, phi: 1.02, radius: 8.5 }, 2400);
    if (!STATE.mobile) setTimeout(() => el('legend').classList.remove('hide'), 1200);
  };
  el('btnSkip').onclick = () => { el('intro').classList.add('gone'); STATE.ready = true; showClassic(true); };
  el('btnClassic').onclick = () => showClassic(true);
  el('btnBack3D').onclick = () => showClassic(false);
  el('btnHelp').onclick = () => el('legend').classList.toggle('hide');
  el('btnSky').onclick = () => setDaylight(!DAYLIGHT);
  el('btnMode').onclick = () => setCamMode(CAM.mode === 'follow' ? 'free' : 'follow');
  el('exitBtn').onclick = () => leaveOffice();
  el('close').onclick = () => closePanel();
  document.querySelectorAll('#nav button').forEach(b => {
    b.onclick = () => { if (b.dataset.scene !== (ACTIVE && ACTIVE.id)) gotoScene(b.dataset.scene); };
  });
  el('body').addEventListener('click', (e) => {
    const en = e.target.closest('[data-enter]');
    if (en) { enterDoor(en.dataset.enter); return; }
    const op = e.target.closest('[data-open]');
    if (op) openById(op.dataset.open);
  });

  if (STATE.mobile) el('legend').classList.add('hide');
}
