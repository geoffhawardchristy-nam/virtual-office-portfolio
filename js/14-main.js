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
  coordReadout();
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
      r.obj.scale.setScalar((r.baseScale || 1) * (1 + r.hl * 0.01));
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

/* Where the character is standing. World figures are what you see; layout
   figures are what you type into LAYOUTS, which is 0.9x smaller for Evision. */
function coordReadout() {
  const el = document.getElementById('coords');
  if (!el || !HERO) return;
  const p = HERO.group.position;
  const k = (ACTIVE && ACTIVE.id === 'evision') ? 0.9 : 1;
  el.textContent = 'world  x ' + p.x.toFixed(2) + '   z ' + p.z.toFixed(2) +
    '\nlayout  x ' + (p.x / k).toFixed(2) + '   z ' + (p.z / k).toFixed(2);
  el.style.whiteSpace = 'pre';
}

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

/* ==========================================================================
   15 · CONTENT EDITOR
   Everything readable in this portfolio is a string in DATA or DOORS.
   This walks those objects and builds a form for them, so you never have to
   open the code. Export writes a JSON file; Import reads it back.
   ========================================================================== */

/* baked-into-3D text (door plaques, wall plaques, the reception logo)
   registers itself here so an edit can regenerate the texture */
const SIGNAGE = [];
function signage(mat, make) { SIGNAGE.push({ mat, make }); return mat; }
function refreshSignage() {
  SIGNAGE.forEach(s => {
    try {
      const t = s.make();
      if (s.mat.map && s.mat.map.dispose) s.mat.map.dispose();
      s.mat.map = t;
      s.mat.needsUpdate = true;
    } catch (e) { /* a plaque for a parked door — ignore */ }
  });
}

const ROOTS = () => ({ DATA, DOORS });
let PRISTINE = null;

/* ---- path helpers ------------------------------------------------------- */
function getPath(p) {
  return p.split('.').reduce((o, k) => (o == null ? o : o[/^\d+$/.test(k) ? +k : k]), ROOTS());
}
function setPath(p, v) {
  const keys = p.split('.');
  const last = keys.pop();
  const host = keys.reduce((o, k) => o[/^\d+$/.test(k) ? +k : k], ROOTS());
  host[/^\d+$/.test(last) ? +last : last] = v;
}

/* keys the reader never sees, or that would break the scene if edited as text */
const EDIT_SKIP = new Set(['id', 'screen', 'shirt', 'seatKey', 'tier', 'hot', 'station']);
const LONG_KEYS = new Set(['summary', 'description', 'collab', 'blurb', 'challenge',
  'solution', 'impact', 'architecture', 'note', 'intro', 'clients', 'headline']);

const titleOf = (o, i) => o.name || o.title || o.company || o.label || o.what || o.designation || ('Item ' + (i + 1));
const labelOf = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

function fieldHTML(key, path, val) {
  const id = 'f_' + path.replace(/[^\w]/g, '_');
  const long = LONG_KEYS.has(key) || String(val).length > 78;
  const input = long
    ? `<textarea id="${id}" data-path="${path}" rows="${Math.min(8, Math.ceil(String(val).length / 46) + 1)}">${esc(val)}</textarea>`
    : `<input id="${id}" data-path="${path}" value="${esc(val).replace(/"/g, '&quot;')}">`;
  return `<div class="efield"><label for="${id}">${esc(labelOf(key))}</label>${input}</div>`;
}

function listHTML(key, path, arr) {
  const id = 'f_' + path.replace(/[^\w]/g, '_');
  return `<div class="efield">
    <label for="${id}">${esc(labelOf(key))}</label>
    <textarea id="${id}" data-path="${path}" data-list="1" rows="${Math.min(10, arr.length + 1)}">${esc(arr.join('\n'))}</textarea>
    <div class="hint">one per line</div>
  </div>`;
}

function nodeHTML(key, path, val, depth) {
  if (EDIT_SKIP.has(key)) return '';
  if (typeof val === 'string') return fieldHTML(key, path, val);
  if (typeof val === 'number' || typeof val === 'boolean') return '';
  if (Array.isArray(val)) {
    if (!val.length) return '';
    if (typeof val[0] === 'string') return listHTML(key, path, val);
    return `<details class="egrp"${depth < 1 ? '' : ''}>
      <summary>${esc(labelOf(key))} <span style="color:var(--dim);font-family:var(--mono);font-size:10px">${val.length}</span></summary>
      <div class="inner">${val.map((item, i) => `
        <details class="egrp"><summary>${esc(titleOf(item, i))}</summary>
          <div class="inner">${Object.keys(item).map(k => nodeHTML(k, path + '.' + i + '.' + k, item[k], depth + 1)).join('')}</div>
        </details>`).join('')}</div></details>`;
  }
  if (val && typeof val === 'object') {
    return `<details class="egrp"><summary>${esc(labelOf(key))}</summary>
      <div class="inner">${Object.keys(val).map(k => nodeHTML(k, path + '.' + k, val[k], depth + 1)).join('')}</div>
    </details>`;
  }
  return '';
}

function buildEditor() {
  const html = [
    `<div class="esec">Who you are</div>`,
    nodeHTML('owner', 'DATA.owner', DATA.owner, 0),
    nodeHTML('contact', 'DATA.contact', DATA.contact, 0),
    `<div class="esec">The doors</div>`,
    nodeHTML('doors', 'DOORS', DOORS, 0),
    `<div class="esec">Work</div>`,
    nodeHTML('projects', 'DATA.projects', DATA.projects, 0),
    nodeHTML('sideProject', 'DATA.sideProject', DATA.sideProject, 0),
    nodeHTML('experience', 'DATA.experience', DATA.experience, 0),
    `<div class="esec">People & skills</div>`,
    nodeHTML('employees', 'DATA.employees', DATA.employees, 0),
    nodeHTML('skills', 'DATA.skills', DATA.skills, 0),
    `<div class="esec">Everything else</div>`,
    nodeHTML('education', 'DATA.education', DATA.education, 0),
    nodeHTML('coffee', 'DATA.coffee', DATA.coffee, 0)
  ].join('');
  el('ebody').innerHTML = html;
}

let refreshTimer = null;
function contentChanged() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshSignage();
    buildClassic();
    el('brand').querySelector('.n').textContent = DATA.owner.name;
    el('brand').querySelector('.r').textContent = DATA.owner.role + ' · ' + DATA.owner.location;
    el('mark').textContent = DATA.owner.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    if (STATE.selected && RENDER[STATE.selected.type]) {
      const r = STATE.selected;
      el('panelTitle').textContent = r.title = (r.data && (r.data.name || r.data.title || r.data.company)) || r.title;
      el('body').innerHTML = RENDER[r.type](r.data);
    }
  }, 350);
}

function toast(msg) {
  const t = el('etoast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 2200);
}

function wireEditor() {
  buildEditor();
  PRISTINE = JSON.stringify({ DATA, DOORS });

  el('ebody').addEventListener('input', (e) => {
    const f = e.target.closest('[data-path]');
    if (!f) return;
    const v = f.dataset.list ? f.value.split('\n').map(s => s.trim()).filter(Boolean) : f.value;
    setPath(f.dataset.path, v);
    contentChanged();
  });

  el('btnEdit').onclick = () => {
    const on = el('editor').classList.toggle('on');
    el('btnEdit').classList.toggle('active', on);
    if (on) { closePanel(); el('legend').classList.add('hide'); }
    else if (!STATE.mobile) el('legend').classList.remove('hide');
  };
  el('eclose').onclick = () => { el('btnEdit').onclick(); };

  el('btnExport').onclick = () => {
    const blob = new Blob([JSON.stringify({ DATA, DOORS }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'portfolio-content.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Saved portfolio-content.json');
  };

  el('btnImport').onclick = () => el('fileIn').click();
  el('fileIn').onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        if (j.DATA) Object.keys(j.DATA).forEach(k => { if (k in DATA) DATA[k] = j.DATA[k]; });
        if (Array.isArray(j.DOORS)) j.DOORS.forEach((d, i) => { if (DOORS[i]) Object.assign(DOORS[i], d); });
        buildEditor(); contentChanged();
        toast('Content loaded');
      } catch (err) { toast('That file could not be read'); }
    };
    rd.readAsText(f);
    e.target.value = '';
  };

  el('btnReset').onclick = () => {
    const j = JSON.parse(PRISTINE);
    Object.keys(j.DATA).forEach(k => { DATA[k] = j.DATA[k]; });
    j.DOORS.forEach((d, i) => { if (DOORS[i]) Object.assign(DOORS[i], d); });
    buildEditor(); contentChanged();
    toast('Reset to the original text');
  };
}

boot();
wireEditor();
