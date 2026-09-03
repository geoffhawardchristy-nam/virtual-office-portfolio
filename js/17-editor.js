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
