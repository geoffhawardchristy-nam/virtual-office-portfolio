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
