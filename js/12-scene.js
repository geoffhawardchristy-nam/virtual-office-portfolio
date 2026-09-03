/* ==========================================================================
   8 · SCENE MANAGER
   One lobby + four offices. Each scene owns its own pick list, blockers and
   animated objects; only the active one is visible or ticked.
   ========================================================================== */
const SCENES = {};
let ACTIVE = null;
let HERO = null;
let SWITCHING = false;

function newScene(id) {
  const sc = {
    id, root: new THREE.Group(), pickable: [], interactives: [],
    blockers: [], bounds: { x: 10, z: 10 }, animated: [], doors: [],
    spawn: new THREE.Vector3(), label: '', sub: ''
  };
  sc.root.visible = false;
  scene.add(sc.root);
  SCENES[id] = sc;
  return sc;
}

function buildScene(id) {
  if (SCENES[id]) return SCENES[id];
  const sc = newScene(id);
  const before = ANIMATED.length;
  ACTIVE_BUILD = sc;
  TH = THEMES[(LAYOUTS[id] && LAYOUTS[id].theme) || 'default'];
  if (id === 'hub') buildHub(sc); else buildOffice(sc, LAYOUTS[id]);
  TH = THEMES.default;
  sc.animated = ANIMATED.splice(before);
  attachSky(sc);
  return sc;
}
let ACTIVE_BUILD = null;

/* evenly spaced door positions — works for 1 door or 6 */
function doorXs() {
  const n = DOORS.length;
  const pitch = n >= 4 ? 6.4 : 8.6;
  const start = -((n - 1) * pitch) / 2;
  return DOORS.map((_, i) => start + i * pitch);
}

/* ---------- the lobby ---------------------------------------------------- */
function buildHub(sc) {
  const L = LAYOUTS.hub;
  sc.label = L.name; sc.sub = L.sub;
  const R = L.room;
  sc.root.add(makeRoom(R, sc));
  sc.spawn.set(L.spawn[0], 0, L.spawn[1]);

  addRug(sc.root, MAT.carpetW, 9, 7.5, 9, 5.5);
  addRug(sc.root, MAT.carpet, 8, 6.5, -9.2, 5);

  // doors along the back wall — spacing derived from however many are active
  const xs = doorXs();
  DOORS.forEach((d, i) => {
    const dr = makeDoor(d);
    dr.group.position.set(xs[i], 0, -R.d / 2 + 0.2);
    sc.root.add(dr.group);
    sc.doors.push(dr);
    blocker(sc, xs[i], -R.d / 2 + 0.1, 1.7, 0.4);

    dr.rec = registerInteractive(dr.group, {
      type: 'door', id: 'door-' + d.id, title: d.company.replace(' Pvt. Ltd.', '').replace(' Private Limited', ''),
      sub: d.tierLabel + ' · ' + d.when,
      ring: { r: 1.9, z: 1.2 }, hotspot: { y: 4.1, z: 0.3 }, marker: 'arrow',
      label: d.company.split(' ')[0],
      color: d.tier === 'gold' ? '#F5A524' : '#9FC0E0',
      focus: focusPose(xs[i], 1.7, -R.d / 2 + 2.6, 8.4, 0.0, 1.06),
      prox: new THREE.Vector3(xs[i], 0, -R.d / 2 + 1.9),
      proxLabel: 'Open the ' + d.tierLabel + ' door',
      data: d
    }, sc);
    dr.rec.tier = d.tier;
    dr.rec.doorRef = dr;

    // carpet laid outside the door — plain, no coloured trim lines
    addRug(sc.root, MAT.carpet, 3.6, 2.8, xs[i], -R.d / 2 + 2.3);
  });

  // one signpost over the pair of doors, with each door's own marker below it
  const expSign = makeSignpost('Experience', 6.4, '#FFC46B');
  expSign.position.set(0, 6.4, -R.d / 2 + 1.4);
  sc.root.add(expSign);

  // reception -> about me
  const rec = makeReception(MAT.contactSign, true);
  rec.position.set(9, 0, 5.5);
  sc.root.add(rec);
  blocker(sc, 9, 5.5, 1.9, 1.9);
  blocker(sc, 9, 3.3, 3.2, 0.3);
  registerInteractive(rec, {
    type: 'contact', id: 'contact', title: 'Contact me',
    sub: 'Reception · open to work',
    ring: { r: 2.5, z: 0.2 }, hotspot: { y: 2.35, z: 0.5 }, marker: 'arrow', label: 'Contact me', color: '#7ED9A7',
    focus: focusPose(9, 1.3, 5.3, 8, 0.22, 1.0),
    prox: new THREE.Vector3(9, 0, 8.3), proxLabel: 'Get in touch',
    data: DATA.contact
  }, sc);

  // 6. me, standing on the floor — click for About
  const self = makeNPC({ shirt: 0x2B3242, skin: 0, hair: 0, curly: true, suit: true, tie: 0xB03A3A });
  self.position.set(-3.6, 0, 3.4);
  self.rotation.y = 0.55;
  sc.root.add(self);
  blocker(sc, -3.6, 3.4, 0.45, 0.45);
  registerInteractive(self, {
    type: 'about', id: 'about', title: DATA.owner.name,
    sub: DATA.owner.role + ' · ' + DATA.owner.years,
    ring: { r: 0.75 }, hotspot: { y: 2.25 }, marker: 'arrow', label: 'About me', color: '#7FB2FF',
    focus: focusPose(-3.6, 1.15, 3.4, 4.4, 0.55 + Math.PI, 1.16),
    prox: new THREE.Vector3(-3.6 + Math.sin(0.55) * 1.6, 0, 3.4 + Math.cos(0.55) * 1.6),
    proxLabel: 'Read about me',
    data: DATA.owner
  }, sc);

  // waiting area
  const s1 = makeSofa(2.8); s1.position.set(-11.4, 0, 5); s1.rotation.y = Math.PI / 2; sc.root.add(s1);
  const s2 = makeSofa(2.2); s2.position.set(-7, 0, 5); s2.rotation.y = -Math.PI / 2; sc.root.add(s2);
  const ct = new THREE.Group();
  ct.add(box(MAT.wood, 1.7, 0.09, 0.95, 0, 0.44, 0));
  [[-0.72, -0.36], [0.72, -0.36], [-0.72, 0.36], [0.72, 0.36]].forEach(([x, z]) =>
    ct.add(cyl(MAT.metal, 0.035, 0.44, x, 0.22, z, true)));
  ct.position.set(-9.2, 0, 5); sc.root.add(ct);
  const lap = makeLaptop();
  lap.position.set(-9.2, 0.49, 5);
  lap.rotation.y = 0.85;
  sc.root.add(lap);
  registerInteractive(lap, {
    type: 'desktop', id: 'desktop', title: 'Skills', sub: 'Open the laptop',
    ring: { r: 0.95, y: -0.47 }, hotspot: { y: 1.15 }, marker: 'arrow', label: 'Skills', color: '#C58AF0',
    focus: focusPose(-9.2, 0.85, 5, 3.8, 0.85, 1.12),
    prox: new THREE.Vector3(-9.2, 0, 6.8), proxLabel: 'Open the laptop',
    data: DATA.skills
  }, sc);
  blocker(sc, -11.4, 5, 0.6, 1.5); blocker(sc, -7, 5, 0.6, 1.2); blocker(sc, -9.2, 5, 0.9, 0.6);

}

/* ---------- an office ---------------------------------------------------- */
function buildOffice(sc, L) {
  const door = DOORS.find(d => d.id === sc.id);
  sc.label = L.name; sc.sub = L.sub;
  sc.door = door;
  // where a cabin wall lands on a glazed elevation, force a mullion there so
  // the vertical lines read continuous
  const rhw0 = L.room.w / 2, rhd0 = L.room.d / 2, mTol = 0.35;
  const mullionAt = { back: [], right: [], left: [] };
  (L.cabins || []).forEach(C => {
    const chw = C.w / 2, chd = C.d / 2;
    if (Math.abs((C.z - chd) + rhd0) < mTol) mullionAt.back.push(C.x - chw, C.x + chw);
    if (Math.abs((C.x + chw) - rhw0) < mTol) mullionAt.right.push(C.z - chd, C.z + chd);
    if (Math.abs((C.x - chw) + rhw0) < mTol) mullionAt.left.push(-(C.z - chd), -(C.z + chd));
  });
  const R = Object.assign({}, L.room, { frontGap: 4.0, frontGapX: L.exit ? L.exit[0] : 0, mullionAt });
  sc.root.add(makeRoom(R, sc));
  sc.spawn.set(L.spawn[0], 0, L.spawn[1]);
  const hd = L.room.d / 2, hw = L.room.w / 2;

  // exit portal back to the lobby
  const portal = makeExitPortal();
  portal.position.set(L.exit[0], 0, hd);
  sc.root.add(portal);
  registerInteractive(portal, {
    type: 'exit', id: 'exit', title: 'Back to the lobby', sub: 'Leave this office',
    ring: { r: 1.5, z: -1.2 }, hotspot: { y: 3.4, z: -0.1 },
    focus: focusPose(L.exit[0], 1.5, hd - 3.4, 7, Math.PI, 1.08),
    prox: new THREE.Vector3(L.exit[0], 0, hd - 1.5), proxLabel: 'Go back to the lobby',
    data: null
  }, sc);

  // desk pod rug
  const DESKS = L.desks || [];
  if (DESKS.length > 1 && TH.rugs) {
    const xs = DESKS.map(d => d.x), zs = DESKS.map(d => d.z);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    addRug(sc.root, MAT.carpet, Math.max(...xs) - Math.min(...xs) + 6, Math.max(...zs) - Math.min(...zs) + 7, cx, cz + 0.4);
  }

  // ---- desks
  DESKS.forEach(cfg => {
    const proj = cfg.p === 'side' ? DATA.sideProject : (cfg.p === 'vacancy' ? null : DATA.projects.find(p => p.id === cfg.p));
    const screen = cfg.vacant ? 'vacant' : (cfg.screen || (proj && proj.screen) || 'code');
    const ws = new THREE.Group();
    ws.position.set(cfg.x, 0, cfg.z);
    ws.add(TH.bench ? makeBenchDesk(screen, cfg.dual) : makeDesk(screen, cfg.dual));
    const ch = TH.bench ? makeTaskChair() : makeChair(MAT.fabric);
    ch.position.set(0.08, 0, TH.bench ? 1.25 : 1.05); ch.rotation.y = 0.12;
    ws.add(ch);
    sc.root.add(ws);
    blocker(sc, cfg.x, cfg.z, 1.35, 0.75);
    blocker(sc, cfg.x, cfg.z + 1.05, 0.45, 0.45);

    const type = cfg.vacant ? 'vacancy' : (cfg.side ? 'side' : 'project');
    const data = cfg.vacant ? VACANCY : (cfg.side ? DATA.sideProject : proj);
    registerInteractive(ws, {
      type, id: cfg.p, title: data.name || data.title, sub: cfg.vacant ? 'Unoccupied' : (proj ? proj.station : 'Side project'),
      ring: { r: 1.75, z: 0.1 }, hotspot: { y: 1.95, z: -0.34 },
      focus: focusPose(cfg.x, 1.05, cfg.z - 0.2, 5.6, 0.34, 1.02),
      prox: new THREE.Vector3(cfg.x, 0, cfg.z + 2.5),
      proxLabel: cfg.vacant ? 'Look at the empty desk' : 'Open ' + (data.name || data.title),
      data
    }, sc);

    if (cfg.npc) placeNPC(sc, cfg.npc, cfg.x + 0.08, cfg.z + 1.0, Math.PI, true);
  });

  // ---- joined bench tables: one interactive per occupied seat
  const seatOffsets = (W, perSide, oneSided) => {
    const n = perSide || 4;
    const pitch = (W - 1.3) / n;
    const xs = Array.from({ length: n }, (_, i) => -((n - 1) * pitch) / 2 + i * pitch);
    const out = [];
    xs.forEach(x => out.push([x, 1]));
    if (!oneSided) xs.forEach(x => out.push([x, -1]));
    return out;
  };
  (L.tables || []).forEach((T, ti) => {
    const tw = T.w || 5.8, td = T.d || 2.3;
    const g = group(T.x, 0, T.z, T.ry || 0);
    g.add(T.pinboard ? makeBenchRun(tw, td) : makeBenchCluster(tw, td, { endStore: T.endStore }));
    sc.root.add(g);
    const ry = T.ry || 0, ca = Math.cos(ry), sa = Math.sin(ry);
    const toWorld = (lx, lz) => ({ x: T.x + lx * ca + lz * sa, z: T.z - lx * sa + lz * ca });
    blocker(sc, T.x, T.z, Math.abs(ca) > 0.5 ? tw / 2 : td / 2 + 0.15,
      Math.abs(ca) > 0.5 ? td / 2 + 0.15 : tw / 2);

    const SEAT = seatOffsets(tw, T.perSide, T.oneSided);
    // chairs sit just off the desk edge, so a shallower run pulls them in
    const seatOff = T.seatOff || 1.55, proxOff = T.proxOff || 2.6;
    (T.seats || []).forEach((seat, i) => {
      if (!SEAT[i]) return;
      const [sx, side] = SEAT[i];
      const proj = seat.p ? DATA.projects.find(p => p.id === seat.p) : null;
      const scr = proj ? proj.screen : 'code';

      const seatG = group(sx, 0, 0);
      const mon = makeMonitor(scr, seat.dual ? 1.12 : 1.02);
      mon.position.set(0, 0.805, side * 0.5);
      if (side < 0) mon.rotation.y = Math.PI;
      seatG.add(mon);
      seatG.add(box(MAT.blackSoft, 0.62, 0.022, 0.2, 0, 0.815, side * 1.02, false));
      seatG.add(box(MAT.blackSoft, 0.085, 0.03, 0.12, 0.42, 0.82, side * 1.05, false));
      if (i % 2 === 0) seatG.add(cyl(MAT.potWhite, 0.05, 0.1, -0.62, 0.855, side * 0.95, true));
      const ch = makeTaskChair();
      ch.position.set(0.06, 0, side * seatOff);
      ch.rotation.y = side > 0 ? 0.1 : Math.PI + 0.1;
      seatG.add(ch);
      g.add(seatG);
      const seatW = toWorld(sx, side * seatOff);
      blocker(sc, seatW.x, seatW.z, 0.38, 0.38);

      const wx = seatW.x, wz = seatW.z;
      if (seat.npc) placeNPC(sc, seat.npc, wx, wz, (side > 0 ? Math.PI : 0) + ry, true);
      if (!proj) return;
      registerInteractive(seatG, {
        type: 'project', id: proj.id, title: proj.name, sub: proj.station,
        ring: { r: 1.15, z: side * 1.0 },
        hotspot: { y: 1.95, z: side * 0.5 },
        focus: (() => { const p = toWorld(sx, side * 0.7);
          return focusPose(p.x, 1.05, p.z, 5.2, (side > 0 ? 0.34 : Math.PI + 0.34) + ry, 1.02); })(),
        prox: (() => { const p = toWorld(sx, side * proxOff); return new THREE.Vector3(p.x, 0, p.z); })(),
        proxLabel: 'Open ' + proj.name,
        data: proj
      }, sc);
    });
  });

  // ---- glass cabins (meeting room, director's cabin)
  (L.cabins || []).forEach(C => {
    const rhw = L.room.w / 2, rhd = L.room.d / 2, tol = 0.25;
    // a pane needs no end post where a building wall OR a neighbouring room
    // already provides the line
    const nbrs = (L.bathrooms || []).concat(L.cabins || []).filter(n => n !== C);
    const overlaps = (a1, a2, b1, b2) => Math.min(a2, b2) - Math.max(a1, b1) > 0.3;
    const meets = (side) => nbrs.some(n => {
      const nhw = n.w / 2, nhd = n.d / 2, chw = C.w / 2, chd = C.d / 2;
      if (side === 'e') return Math.abs((n.x - nhw) - (C.x + chw)) < tol &&
        overlaps(n.z - nhd, n.z + nhd, C.z - chd, C.z + chd);
      if (side === 'w') return Math.abs((n.x + nhw) - (C.x - chw)) < tol &&
        overlaps(n.z - nhd, n.z + nhd, C.z - chd, C.z + chd);
      if (side === 's') return Math.abs((n.z - nhd) - (C.z + chd)) < tol &&
        overlaps(n.x - nhw, n.x + nhw, C.x - chw, C.x + chw);
      return Math.abs((n.z + nhd) - (C.z - chd)) < tol &&
        overlaps(n.x - nhw, n.x + nhw, C.x - chw, C.x + chw);
    });
    const atWall = {
      w: Math.abs((C.x - C.w / 2) + rhw) < tol || meets('w'),
      e: Math.abs((C.x + C.w / 2) - rhw) < tol || meets('e'),
      n: Math.abs((C.z - C.d / 2) + rhd) < tol || meets('n'),
      s: Math.abs((C.z + C.d / 2) - rhd) < tol || meets('s')
    };
    const cab = makeGlassCabin(C.w, C.d, { style: C.style, sides: C.sides, door: C.door, label: C.label, ac: C.ac, tv: C.tv, board: C.board, atWall,
      frameMat: C.frame === 'light' ? MAT.trim : null, solid: C.solid });
    cab.position.set(C.x, 0, C.z);
    sc.root.add(cab);
    const hcw = C.w / 2, hcd = C.d / 2, GAP = 1.5;
    ['n', 's', 'e', 'w'].forEach(k => {
      if (!C.sides[k]) return;
      const horiz = (k === 'n' || k === 's');
      const len = horiz ? C.w : C.d;
      const bx = C.x + (k === 'e' ? hcw : k === 'w' ? -hcw : 0);
      const bz = C.z + (k === 's' ? hcd : k === 'n' ? -hcd : 0);
      if (C.door !== k) {
        blocker(sc, bx, bz, horiz ? hcw : 0.18, horiz ? 0.18 : hcd);
      } else {
        const seg = (len - GAP) / 4, off = GAP / 2 + seg;
        blocker(sc, bx - (horiz ? off : 0), bz - (horiz ? 0 : off), horiz ? seg : 0.18, horiz ? 0.18 : seg);
        blocker(sc, bx + (horiz ? off : 0), bz + (horiz ? 0 : off), horiz ? seg : 0.18, horiz ? 0.18 : seg);
      }
    });
    if (C.style === 'director') {
      const dx = -hcw + Math.min(2.9, C.w * 0.42);
      blocker(sc, C.x + dx, C.z, 0.9, 1.6);
    } else if (C.style !== 'briefing') {
      blocker(sc, C.x, C.z, 1.6, 0.9);
    }
    if (C.id !== 'meeting') return;
    const DIR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[C.door] || [0, 1];
    const px = C.x + DIR[0] * (hcw + 1.2);
    const pz = C.z + DIR[1] * (hcd + 1.2);
    registerInteractive(cab, {
      type: 'experience', id: 'meeting', title: 'Meeting room', sub: 'Experience & how I work in a team',
      ring: { r: Math.min(hcw, hcd) * 0.9 }, hotspot: { y: 3.5 },
      focus: focusPose(C.x, 1.2, C.z, Math.max(C.w, C.d) + 3, 0.62, 0.94),
      prox: new THREE.Vector3(px, 0, pz), proxLabel: 'Step into the meeting room',
      data: DATA.experience
    }, sc);
  });

  // ---- the entrance cupboard: ethernet bay + two bag bays
  (L.caboodh || []).forEach(lk => {
    const u = makeCaboodh(lk.w || 3.6, lk.h || 2.45);
    u.position.set(lk.x, 0, lk.z); u.rotation.y = lk.ry || 0;
    sc.root.add(u);
    const along = Math.abs(Math.cos(lk.ry || 0)) > 0.5;
    const half = (lk.w || 2.6) / 2;
    blocker(sc, lk.x, lk.z, along ? half : 0.4, along ? 0.4 : half);
  });

  // ---- standalone NPCs
  (L.npcs || []).forEach(n => placeNPC(sc, n.id, n.x, n.z, n.ry || 0, !!n.seated));

  // ---- meeting room
  if (L.meeting) {
    const mw = L.meeting.w || 12, md = L.meeting.d || 10.4;
    const room = TH.bench ? makeGlassCabin(mw, md, {}) : makeMeetingRoom();
    room.position.set(L.meeting.x, 0, L.meeting.z);
    sc.root.add(room);
    if (TH.rugs) addRug(sc.root, MAT.carpet, 11.5, 9.6, L.meeting.x, L.meeting.z);
    blocker(sc, L.meeting.x, L.meeting.z, 3.1, 1.1);
    blocker(sc, L.meeting.x - mw / 2, L.meeting.z, 0.2, md / 2);
    blocker(sc, L.meeting.x - (mw / 4 + 0.3), L.meeting.z + md / 2, mw / 4, 0.2);
    blocker(sc, L.meeting.x + (mw / 4 + 0.3), L.meeting.z + md / 2, mw / 4, 0.2);
    registerInteractive(room, {
      type: 'experience', id: 'meeting', title: 'Meeting room', sub: 'Experience & how I work in a team',
      ring: { r: 3.6 }, hotspot: { y: 2.5 },
      focus: focusPose(L.meeting.x, 1.2, L.meeting.z, 12.5, 0.62, 0.94),
      prox: new THREE.Vector3(L.meeting.x, 0, L.meeting.z + (L.meeting.d || 10.4) / 2 + 1.2),
      proxLabel: 'Step into the meeting room',
      data: DATA.experience
    }, sc);
  }

  // ---- whiteboard
  if (L.whiteboard) {
    const wb = makeWhiteboard();
    wb.position.set(L.whiteboard.x, 0, L.whiteboard.z);
    wb.rotation.y = L.whiteboard.ry;
    if (L.whiteboard.s) wb.scale.setScalar(L.whiteboard.s);
    sc.root.add(wb);
    const f = facing(L.whiteboard, 1.6);
    registerInteractive(wb, {
      type: 'skills', id: 'board', title: 'The whiteboard', sub: 'Stack, workflow, architecture',
      ring: { r: 1.5, z: 1.3 }, hotspot: { y: 3.35, z: 0.35 },
      focus: focusPose(f.x, 1.9, f.z, 7.4, L.whiteboard.ry, 1.12),
      prox: new THREE.Vector3(f.x, 0, f.z), proxLabel: 'Read the whiteboard',
      data: DATA.skills
    }, sc);
  }

  // ---- bookshelf / education
  if (L.shelf) {
    const sh = makeBookshelf();
    sh.position.set(L.shelf.x, 0, L.shelf.z);
    sh.rotation.y = L.shelf.ry;
    sc.root.add(sh);
    const f = facing(L.shelf, 1.5);
    blocker(sc, L.shelf.x, L.shelf.z, 0.6, 2.3);
    registerInteractive(sh, {
      type: 'education', id: 'edu', title: 'The shelf', sub: 'Education & how I keep learning',
      ring: { r: 1.5, z: 1.2 }, hotspot: { y: 3.0, z: 0.4 },
      focus: focusPose(f.x, 1.5, f.z, 6.8, L.shelf.ry, 1.1),
      prox: new THREE.Vector3(f.x, 0, f.z), proxLabel: 'Look at the shelf',
      data: DATA.education
    }, sc);
  }

  // ---- lounge (+ optional side-project laptop)
  if (L.lounge) {
    const lg = makeLounge();
    lg.position.set(L.lounge.x, 0, L.lounge.z);
    sc.root.add(lg);
    addRug(sc.root, MAT.carpetW, 9.5, 7.5, L.lounge.x, L.lounge.z);
    blocker(sc, L.lounge.x - 2.6, L.lounge.z, 0.6, 1.5);
    blocker(sc, L.lounge.x + 2.6, L.lounge.z, 0.6, 1.3);
    blocker(sc, L.lounge.x, L.lounge.z, 0.9, 0.6);
    if (L.lounge.laptop) {
      const lap = makeLaptop();
      lap.position.set(L.lounge.x - 0.15, 0.49, L.lounge.z - 0.1);
      lap.rotation.y = 2.5;
      sc.root.add(lap);
    }
  }

  // ---- coffee point
  if (L.coffee) {
    const cf = makeCoffeePoint();
    cf.position.set(L.coffee.x, 0, L.coffee.z);
    sc.root.add(cf);
    blocker(sc, L.coffee.x, L.coffee.z, 2.4, 0.5);
    registerInteractive(cf, {
      type: 'coffee', id: 'coffee', title: 'Coffee machine', sub: 'Purely operational equipment',
      ring: { r: 1.15, x: -1.1, z: 1.2 }, hotspot: { y: 2.7, x: -1.1, z: 0.2 },
      focus: focusPose(L.coffee.x - 1.1, 1.4, L.coffee.z + 1.4, 6, 0.2, 1.08),
      prox: new THREE.Vector3(L.coffee.x - 1.1, 0, L.coffee.z + 1.6), proxLabel: 'Make a coffee',
      data: DATA.coffee
    }, sc);
  }

  // ---- contact sign
  if (L.contact) {
    const sg = makeExitSign();
    sg.position.set(L.contact.x, 0, L.contact.z);
    sc.root.add(sg);
    registerInteractive(sg, {
      type: 'contact', id: 'contact', title: 'Say hello', sub: 'Contact & resume',
      ring: { r: 1.6, z: 1.4 }, hotspot: { y: 1.9 },
      focus: focusPose(L.contact.x, 2.0, L.contact.z + 1.4, 7.4, 0.1, 1.14),
      prox: new THREE.Vector3(L.contact.x, 0, L.contact.z + 2), proxLabel: 'Get in touch',
      data: DATA.contact
    }, sc);
  }

  // ---- the wall plaque for this chapter
  if (L.plaque && door) {
    const pq = makeRolePlaque(door);
    pq.position.set(L.plaque.x, 0, L.plaque.z);
    pq.rotation.y = L.plaque.ry;
    sc.root.add(pq);
    const f = facing(L.plaque, 2.2);
    registerInteractive(pq, {
      type: 'door', id: 'chapter', title: door.company.replace(' Pvt. Ltd.', '').replace(' Private Limited', ''),
      sub: door.tierLabel + ' · ' + door.when,
      ring: { r: 1.4, z: 1.9 }, hotspot: { y: 3.2, z: 0.3 },
      focus: focusPose(f.x, 1.9, f.z, 6.2, L.plaque.ry, 1.08),
      prox: new THREE.Vector3(f.x, 0, f.z), proxLabel: 'Read this chapter',
      data: door, inside: true
    }, sc);
  }

  if (L.breakout) {
    const bt = makeBreakoutTable();
    bt.position.set(L.breakout.x, 0, L.breakout.z);
    sc.root.add(bt);
    blocker(sc, L.breakout.x, L.breakout.z, 0.9, 0.9);
  }

  (L.storage || []).forEach(([x, z]) => {
    sc.root.add(box(MAT.wallDark, 3.2, 1.1, 0.55, x, 0.55, z));
    sc.root.add(box(MAT.deskTop, 3.3, 0.08, 0.6, x, 1.14, z, false));
    blocker(sc, x, z, 1.6, 0.35);
  });

  // ---- logo feature wall
  if (L.logo) {
    const lw = makeLogoWall(L.logo.w || 6.5);
    lw.position.set(L.logo.x, 0, L.logo.z);
    lw.rotation.y = L.logo.ry || 0;
    sc.root.add(lw);
    const lAlong = Math.abs(Math.cos(L.logo.ry || 0)) > 0.5;
    const lHalf = (L.logo.w || 6.5) / 2;
    blocker(sc, L.logo.x, L.logo.z, lAlong ? lHalf : 0.35, lAlong ? 0.35 : lHalf);
  }

  // ---- logo panel fixed to an existing wall
  if (L.logoPanel) {
    const lp = makeLogoPanel(L.logoPanel.w || 3.9);
    lp.position.set(L.logoPanel.x, L.logoPanel.y || 1.95, L.logoPanel.z);
    lp.rotation.y = L.logoPanel.ry || 0;
    sc.root.add(lp);
  }

  // ---- black tube shelving
  (L.shelves || []).forEach(sh => {
    const u = makeShelfUnit(sh.len || 5, sh.bays || 3, sh.levels || 4);
    u.position.set(sh.x, 0, sh.z);
    u.rotation.y = sh.ry || 0;
    sc.root.add(u);
    const along = Math.abs(Math.cos(sh.ry || 0)) > 0.5;
    blocker(sc, sh.x, sh.z, along ? (sh.len || 5) / 2 : 0.3, along ? 0.3 : (sh.len || 5) / 2);
  });

  // ---- cubicles
  (L.cubicles || []).forEach(c => {
    const u = makeCubicle(c.w || 3.1, c.d || 3.1, c.label, c.bays);
    u.position.set(c.x, 0, c.z);
    u.rotation.y = c.ry || 0;
    sc.root.add(u);
    blocker(sc, c.x, c.z, (c.w || 3.1) / 2, (c.d || 3.1) / 2);
  });

  // ---- store and server rooms
  (L.rooms || []).forEach(rm => {
    const u = makeUtilityRoom(rm.w, rm.d, rm.label, rm.kind, rm.omit);
    u.position.set(rm.x, 0, rm.z);
    u.rotation.y = rm.ry === undefined ? Math.PI : rm.ry;
    sc.root.add(u);
    blocker(sc, rm.x, rm.z, rm.w / 2, rm.d / 2);
  });

  // ---- the HR desk
  if (L.hrdesk) {
    const u = makeHRDesk(L.hrdesk.w);
    u.position.set(L.hrdesk.x, 0, L.hrdesk.z);
    u.rotation.y = L.hrdesk.ry || 0;
    sc.root.add(u);
    // the footprint turns with the desk, so the blocker has to as well
    const dw = (L.hrdesk.w || 3.4) / 2, dd = 1.2;
    const along = Math.abs(Math.cos(L.hrdesk.ry || 0)) > 0.5;
    blocker(sc, L.hrdesk.x, L.hrdesk.z, along ? dw : dd, along ? dd : dw);
  }

  // ---- the hardware bench
  (L.hwbench || []).forEach(b => {
    const W = b.len || 6;
    const u = makeHardwareBench(W, b.seats || 4);
    u.position.set(b.x, 0, b.z);
    u.rotation.y = b.ry || 0;
    sc.root.add(u);
    const along = Math.abs(Math.cos(b.ry || 0)) > 0.5;
    blocker(sc, b.x, b.z, along ? W / 2 : 0.55, along ? 0.55 : W / 2);
  });

  // ---- locker banks
  (L.lockers || []).forEach(lk => {
    const u = makeLockerRun(lk.len || 5, lk.bays);
    u.position.set(lk.x, 0, lk.z);
    u.rotation.y = lk.ry || 0;
    sc.root.add(u);
    const along = Math.abs(Math.cos(lk.ry || 0)) > 0.5;
    blocker(sc, lk.x, lk.z, along ? (lk.len || 5) / 2 : 0.35, along ? 0.35 : (lk.len || 5) / 2);
  });

  // ---- washrooms
  (L.bathrooms || []).forEach(b => {
    // 'left' / 'right' are as you see them standing at the door looking in.
    // A room's local +x always maps onto that viewer's right, whatever its
    // rotation, so no flip is needed here.
    const basinSign = b.basin === 'right' ? 1 : -1;
    const r = makeBathroom(b.w, b.d, b.label, { basinSign, omit: b.omit });
    r.position.set(b.x, 0, b.z);
    r.rotation.y = b.ry || 0;
    sc.root.add(r);
    blocker(sc, b.x, b.z, b.w / 2, b.d / 2);
  });

  // ---- suspended light rigs (fan lives inside each frame)
  (L.rigs || []).forEach(([x, z, rw, rd]) => {
    const r = makeCeilingRig(rw, rd); r.position.set(x, 0, z); sc.root.add(r);
  });
  (L.fans || []).forEach(([x, z]) => {
    const f = makeCeilingFan(); f.position.set(x, 0, z); sc.root.add(f);
  });

  // ---- wall decoration
  (L.wallDecor || []).forEach(w => {
    const u = w.kind === 'clock' ? makeWallClock(w.r) : makeWallArt(w.w, w.h);
    u.position.set(w.x, w.y || 1.95, w.z);
    u.rotation.y = w.ry || 0;
    sc.root.add(u);
  });

  // ---- small stands suspended over a table
  (L.overhead || []).forEach(od => {
    const u = makeOverheadStand(od.w);
    u.position.set(od.x, 0, od.z);
    u.rotation.y = od.ry || 0;
    sc.root.add(u);
  });

  // ---- light switches
  (L.switches || []).forEach(sw => {
    const u = makeSwitches(sw.gangs || 6);
    u.position.set(sw.x, sw.y || 1.25, sw.z);
    u.rotation.y = sw.ry || 0;
    sc.root.add(u);
  });

  // ---- wall screen
  if (L.tv) {
    const tv = (L.tv.big ? makeBigTV : makeWallTV)(L.tv.w || 2.4, L.tv.h || 1.4);
    tv.position.set(L.tv.x, L.tv.y || 1.7, L.tv.z);
    tv.rotation.y = L.tv.ry || 0;
    sc.root.add(tv);
  }

  // ---- split ACs
  (L.acs || []).forEach(a => {
    const u = makeAC(); u.position.set(a.x, a.y || 3.05, a.z); u.rotation.y = a.ry || 0;
    sc.root.add(u);
  });

  // ---- white credenzas
  (L.credenzas || []).forEach(c => {
    const u = makeCredenza(c.w || 2.6);
    u.position.set(c.x, 0, c.z); u.rotation.y = c.ry || 0;
    sc.root.add(u);
    const along = Math.abs(Math.cos(c.ry || 0)) > 0.5;
    blocker(sc, c.x, c.z, along ? (c.w || 2.6) / 2 : 0.35, along ? 0.35 : (c.w || 2.6) / 2);
  });

  (L.plants || []).forEach(([x, z, k, s]) => {
    const p = makePlant(k, s); p.position.set(x, 0, z); sc.root.add(p);
    blocker(sc, x, z, 0.4, 0.4);
  });
}

/* the point in front of a wall-mounted object */
function facing(cfg, dist) {
  return { x: cfg.x + Math.sin(cfg.ry) * dist, z: cfg.z + Math.cos(cfg.ry) * dist };
}

function placeNPC(sc, id, x, z, ry, seated) {
  const e = DATA.employees.find(n => n.id === id);
  if (!e) return;
  const npc = makeNPC({ seated, shirt: e.shirt, skin: DATA.employees.indexOf(e), hair: DATA.employees.indexOf(e) % 3 });
  npc.position.set(x, 0, z);
  npc.rotation.y = ry;
  sc.root.add(npc);
  if (!seated) blocker(sc, x, z, 0.4, 0.4);
  registerInteractive(npc, {
    type: 'person', id: e.id, title: e.name, sub: e.designation,
    ring: { r: 0.62, z: seated ? 0.15 : 0 },
    hotspot: { y: seated ? 1.62 : 2.0 },
    focus: focusPose(x, 1.15, z, 3.9, ry + Math.PI, 1.16),
    prox: new THREE.Vector3(x - Math.sin(ry) * (seated ? 1.0 : -1.4), 0,
                            z - Math.cos(ry) * (seated ? 1.0 : -1.4)),
    proxLabel: 'Talk to ' + e.name.split(' ')[0],
    data: e
  }, sc);
}

/* ---------- switching ---------------------------------------------------- */
function gotoScene(id, opts) {
  opts = opts || {};
  if (SWITCHING) return;
  const sc = buildScene(id);
  SWITCHING = true;
  el('fade').classList.add('on');
  setTimeout(() => {
    if (ACTIVE) ACTIVE.root.visible = false;
    ACTIVE = sc;
    sc.root.visible = true;
    STATE.hovered = null; STATE.selected = null;
    el('panel').classList.remove('open');
    el('tip').classList.remove('on');

    const sp = opts.at || sc.spawn;
    HERO.group.position.set(sp.x, 0, sp.z);
    HERO.group.rotation.y = opts.face === undefined ? Math.PI : opts.face;
    CAM.target.set(sp.x, 1.15, sp.z);
    CAM.goalTarget.copy(CAM.target);
    CAM.goalTheta = CAM.theta = opts.face === undefined ? 0 : opts.face + Math.PI;
    CAM.goalPhi = CAM.phi = 1.02;
    CAM.goalRadius = CAM.radius = CAM.mode === 'follow' ? 8.5 : 20;
    CAM.tween = null; CAM.hold = false;
    camApply();

    el('roomlbl').querySelector('.rn').textContent = sc.label;
    el('roomlbl').querySelector('.rs').textContent = sc.sub;
    el('exitBtn').classList.toggle('on', id !== 'hub');
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.scene === id));

    setTimeout(() => { el('fade').classList.remove('on'); SWITCHING = false; }, 60);
  }, 430);
}

function enterDoor(id) {
  const dr = SCENES.hub && SCENES.hub.doors.find(d => d.door.id === id);
  if (dr) dr.want = 1;
  closePanel(true);
  setTimeout(() => gotoScene(id), dr ? 520 : 0);
}

function leaveOffice() {
  const from = ACTIVE.id;
  const i = DOORS.findIndex(d => d.id === from);
  const x = i >= 0 ? doorXs()[i] : 0;
  // step out well clear of the doorway — landing inside the door's own reach
  // meant the prompt was already up and E sent you straight back in
  gotoScene('hub', { at: new THREE.Vector3(x, 0, -LAYOUTS.hub.room.d / 2 + 7), face: 0 });
  const dr = SCENES.hub.doors[i];
  if (dr) { dr.want = 1; setTimeout(() => { dr.want = 0; }, 2600); }
}
