/* ==========================================================================
   11 · INFO PANELS
   ========================================================================== */
const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const tags = (a, hot) => `<div class="tags">${a.map(t => `<span class="tag${hot ? ' hot' : ''}">${esc(t)}</span>`).join('')}</div>`;
const list = (a, amber) => `<ul class="list${amber ? ' amber' : ''}">${a.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
const sec = (h, inner) => `<div class="sec">${h ? `<h3>${h}</h3>` : ''}${inner}</div>`;
const meta = (p) => `<dl class="meta">${p.filter(x => x[1]).map(x => `<dt>${x[0]}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl>`;

function renderDoor(d) {
  const inHub = ACTIVE && ACTIVE.id === 'hub';
  return [
    sec('', `<span class="chip t-${d.tier}">${esc(d.tierLabel)} · ${esc(d.span)}</span>`),
    sec('', meta([['Role', d.role], ['When', d.when]])),
    sec(d.headline, `<p>${esc(d.blurb)}</p>`),
    sec('Stack on this floor', tags(d.stack, true)),
    sec(d.id === 'vacant' ? 'What would fill it' : 'What it taught me', list(d.learned)),
    inHub ? sec('', `<div class="act">
      <button class="btn primary" data-enter="${d.id}">
        <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>
        Step into this office
      </button></div>`) : ''
  ].join('');
}

function renderVacancy(v) {
  return [
    sec('', `<p>${esc(v.intro)}</p>`),
    sec('What I\'m looking for', list(v.looking, true)),
    sec('What I bring', list(v.bring)),
    sec('', `<div class="act"><button class="btn primary" data-open="contact">Get in touch</button></div>`)
  ].join('');
}

function renderProject(p) {
  return [
    sec('', meta([['Company', p.company], ['Role', p.role], ['When', p.duration]])),
    sec('What it is', `<p>${esc(p.description)}</p>`),
    sec('Built with', tags(p.tech, true)),
    sec('What I did', list(p.responsibilities)),
    p.features ? sec('Key features', list(p.features, true)) : '',
    p.apis ? sec('APIs & integrations', tags(p.apis)) : '',
    p.challenge ? sec('Challenge → solution', `<div class="split">
        <div class="card"><h4>The problem</h4><p>${esc(p.challenge)}</p></div>
        <div class="card"><h4>What I changed</h4><p>${esc(p.solution)}</p></div></div>`) : '',
    p.impact ? sec('Result', `<p>${esc(p.impact)}</p>`) : ''
  ].join('');
}

function renderPerson(e) {
  return [
    sec('', meta([['Role', e.designation], ['Team', e.department], ['Overlap', e.duration]])),
    sec('Projects together', tags(e.projects, true)),
    sec('Split of work', `<div class="split">
      <div class="card"><h4>My side</h4>${list(e.mine)}</div>
      <div class="card"><h4>Their side</h4>${list(e.theirs)}</div></div>`),
    sec('How it actually worked', `<p>${esc(e.collab)}</p>`),
    sec('Shared stack', tags(e.tech)),
    sec('', `<p class="note">Colleagues here are stand-ins, not named individuals — the collaboration each one describes is real.</p>`)
  ].join('');
}

function renderSkills(s) {
  return [
    ...s.groups.map(g => sec(g.label, tags(g.items, g.hot))),
    sec('How I work', list(s.workflow, true)),
    sec('The pattern I keep', `<p>${esc(s.architecture)}</p>`)
  ].join('');
}

function renderExperience(x) {
  return [
    sec('Roles', `<div class="tl">${x.roles.map(r => `<div class="item">
      <div class="when">${esc(r.when)}</div>
      <div class="what">${esc(r.what)}</div>
      <div class="who">${esc(r.who)}</div>${list(r.points)}</div>`).join('')}</div>`),
    sec('In the room', list(x.teamwork, true)),
    sec('Who I worked for', `<p>${esc(x.clients)}</p>`)
  ].join('');
}

function renderAbout(o) {
  return [
    sec('', `<p>${esc(o.summary)}</p>`),
    sec('The short version', list(o.pitch, true)),
    sec('', meta([['Based in', o.location], ['Experience', o.years]])),
    sec('The four doors', `<div class="tags">${DOORS.map(d =>
      `<span class="chip t-${d.tier}" style="cursor:pointer" data-enter="${d.id}">${esc(d.tierLabel)}</span>`).join('')}</div>`),
    sec('', `<p class="note">Resume link placeholder: ${esc(o.resumeUrl)} — drop your real file URL into DATA.owner.resumeUrl.</p>`)
  ].join('');
}

function renderEducation(e) {
  return [
    sec('', meta([['Degree', e.degree], ['Institute', e.school], ['Year', e.year], ['Score', e.score]])),
    sec('Since then', list(e.extra, true)),
    sec('', `<div class="stat"><b>${esc(e.score.split(' ')[0])}</b><span>CGPA · ${esc(e.year)}</span></div>`)
  ].join('');
}

function renderContact(c) {
  const line = (label, val) => `<div class="card" style="margin-bottom:8px"><h4>${label}</h4>
    <p style="font-family:var(--mono);font-size:12px;color:${/^\{\{/.test(val) ? 'var(--dim)' : '#DDE3EC'}">${esc(val)}</p></div>`;
  return [
    sec('', `<p>${esc(c.note)}</p>`),
    sec('Reach me', line('Email', c.email) + line('Phone', c.phone) + line('LinkedIn', c.linkedin) + line('GitHub', c.github)),
    // sec('', `<p class="note">These are placeholders. Open DATA.contact at the top of the file and replace the {{ }} values.</p>`)
  ].join('');
}

function renderSide(p) {
  return [
    sec('', meta([['Status', p.company], ['Role', p.role], ['Since', p.duration]])),
    sec('The idea', `<p>${esc(p.description)}</p>`),
    sec('Built with', tags(p.tech, true)),
    sec('What it shows', list(p.features)),
    sec('Decisions', list(p.responsibilities)),
    sec('Where it goes', `<p>${esc(p.impact)}</p>`)
  ].join('');
}

function renderCoffee() {
  STATE.coffee = Math.min(STATE.coffee + 1, DATA.coffee.length);
  return [
    sec('', `<div class="stat"><b>${STATE.coffee}</b><span>cup${STATE.coffee > 1 ? 's' : ''} today</span></div>`),
    sec('', `<p>${esc(DATA.coffee[STATE.coffee - 1])}</p>`),
    STATE.coffee >= DATA.coffee.length
      ? sec('', `<p class="note">That's the end of the coffee jokes. Thanks for exploring this far.</p>`)
      : sec('', `<p class="note">Click it again.</p>`)
  ].join('');
}

/* the laptop on the lounge table opens like a desktop */
function renderDesktop(s) {
  return [
    sec('', `<p class="note" style="border-color:var(--amber)">skills — ${s.groups.length} folders · ${esc(DATA.owner.years)} of experience</p>`),
    s.groups.map(gp => `<details class="egrp" open>
        <summary>${esc(gp.label)}
          <span style="margin-left:auto;font-family:var(--mono);font-size:10px;color:${gp.hot ? 'var(--amber)' : 'var(--dim)'}">${esc(gp.years || '')}</span>
        </summary>
        <div class="inner">${gp.items.map(it => `<div style="display:flex;align-items:center;gap:9px;padding:5px 0;font-size:12.5px;color:#C9D1DE">
            <span style="width:14px;height:11px;border-radius:2px;background:${gp.hot ? 'var(--amber)' : '#4A5568'};flex:none"></span>${esc(it)}
          </div>`).join('')}</div>
      </details>`).join(''),
    sec('How I work', list(s.workflow, true)),
    sec('', `<p class="note">${esc(s.architecture)}</p>`)
  ].join('');
}

const RENDER = {
  project: renderProject, person: renderPerson, skills: renderSkills,
  experience: renderExperience, about: renderAbout, education: renderEducation,
  contact: renderContact, coffee: renderCoffee, side: renderSide, desktop: renderDesktop,
  door: renderDoor, vacancy: renderVacancy
};

function openPanel(rec) {
  if (!rec || !RENDER[rec.type]) return;
  if (!STATE.selected) CAM.prev = camSnapshot();
  if (STATE.selected && STATE.selected !== rec) STATE.selected.target = 0;
  STATE.selected = rec;
  CAM.hold = true;
  el('panelKind').textContent = KIND[rec.type] || 'Info';
  el('panelTitle').textContent = rec.title;
  el('panelSub').textContent = rec.sub || '';
  el('body').innerHTML = RENDER[rec.type](rec.data);
  el('body').scrollTop = 0;
  el('panel').classList.add('open');
  el('legend').classList.add('hide');
  el('prompt').classList.remove('on');
  updateDoorHud();
  camFocus(rec.focus, 900);
  STATE.idle = 0;
}

function closePanel(silent) {
  if (!STATE.selected) return;
  STATE.selected = null;
  el('panel').classList.remove('open');
  if (!STATE.mobile) el('legend').classList.remove('hide');
  if (!silent && CAM.prev) camFocus({
    target: CAM.prev.target, theta: CAM.prev.theta, phi: CAM.prev.phi, radius: CAM.prev.radius
  }, 800);
  CAM.prev = null;
  CAM.hold = false;
  NEAR = null;
}

function openById(id) {
  const rec = ACTIVE && ACTIVE.interactives.find(r => r.id === id);
  if (rec) openPanel(rec);
}

/* ==========================================================================
   12 · CLASSIC VIEW
   ========================================================================== */
function buildClassic() {
  const p = (h, inner) => `<section><h2>${h}</h2>${inner}</section>`;
  const entry = (title, m, body) => `<div class="entry"><h3>${esc(title)}</h3><div class="m">${esc(m)}</div>${body || ''}</div>`;
  const o = DATA.owner;
  el('classicBody').innerHTML = [
    p('About', `<p style="font-size:14px;line-height:1.7;color:#C9D1DE;margin:0 0 14px">${esc(o.summary)}</p>${list(o.pitch, true)}`),
    p('Chapters', DOORS.map(d => entry(d.company + ' — ' + d.tierLabel, `${d.role} · ${d.when}`,
      `<p>${esc(d.blurb)}</p>${tags(d.stack)}`)).join('')),
    p('Projects', DATA.projects.map(pr => entry(pr.name, `${pr.company} · ${pr.duration}`,
      `<p>${esc(pr.description)}</p>${tags(pr.tech)}`)).join('')
      + entry(DATA.sideProject.name, DATA.sideProject.company, `<p>${esc(DATA.sideProject.description)}</p>${tags(DATA.sideProject.tech)}`)),
    p('Skills', DATA.skills.groups.map(g => `<div class="entry"><h3>${esc(g.label)}</h3>${tags(g.items, g.hot)}</div>`).join('')),
    p('Collaboration', DATA.employees.map(e => entry(e.designation, e.projects.join(' · '), `<p>${esc(e.collab)}</p>`)).join('')),
    p('Education', entry(DATA.education.degree, `${DATA.education.school} · ${DATA.education.year} · ${DATA.education.score}`, list(DATA.education.extra))),
    p('Contact', `<p style="font-size:14px;color:#C9D1DE;margin:0 0 12px">${esc(DATA.contact.note)}</p>
      ${tags([DATA.contact.email, DATA.contact.phone, DATA.contact.linkedin, DATA.contact.github])}`)
  ].join('');
}
function showClassic(on) {
  el('classic').classList.toggle('on', on);
  el('btnBack3D').style.display = STATE.webgl ? '' : 'none';
}
