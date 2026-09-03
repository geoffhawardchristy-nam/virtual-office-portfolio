/* ==========================================================================
   6c · LOGIEAGLE-STYLE PROPS
   Modelled from the reference photos of the real office.
   ========================================================================== */

/* every fan in the building is the same size and hangs at the same height */
const FAN_SPAN = 0.54;
const FAN_TOP = 3.70;

/* suspended rectangular rig: chunky black frame, light strip running round the
   inside of it, and a ceiling fan hanging in the middle of the opening */
function makeCeilingRig(W, D) {
  const g = new THREE.Group();
  const y = 3.1, T = 0.34, H = 0.16;
  const bar = (bw, bd, x, z) => {
    g.add(box(MAT.blackFrame, bw, H, bd, x, y, z, false));
    g.add(box(MAT.blackSoft, bw + 0.02, 0.035, bd + 0.02, x, y + H / 2, z, false));
  };
  bar(W, T, 0, -D / 2 + T / 2);
  bar(W, T, 0, D / 2 - T / 2);
  bar(T, D - T * 2, -W / 2 + T / 2, 0);
  bar(T, D - T * 2, W / 2 - T / 2, 0);
  // light strip around the inner face
  const iw = W - T * 2, id = D - T * 2;
  const strip = (sw, sd, x, z) => g.add(box(MAT.light, sw, 0.055, sd, x, y - H / 2 + 0.03, z, false));
  strip(iw, 0.05, 0, -id / 2);
  strip(iw, 0.05, 0, id / 2);
  strip(0.05, id, -iw / 2, 0);
  strip(0.05, id, iw / 2, 0);
  // and a soft downward glow line under each frame member
  const under = (uw, ud, x, z) => g.add(box(MAT.light, uw, 0.03, ud, x, y - H / 2 - 0.01, z, false));
  under(W - 0.12, 0.09, 0, -D / 2 + T / 2);
  under(W - 0.12, 0.09, 0, D / 2 - T / 2);
  under(0.09, D - T * 2, -W / 2 + T / 2, 0);
  under(0.09, D - T * 2, W / 2 - T / 2, 0);
  // suspension
  [[-W / 2 + T, -D / 2 + T], [W / 2 - T, -D / 2 + T], [-W / 2 + T, D / 2 - T], [W / 2 - T, D / 2 - T]]
    .forEach(([x, z]) => g.add(cyl(MAT.blackSoft, 0.013, 0.66, x, y + 0.41, z, true)));
  // fan hangs inside the opening — span shrinks to fit, height does not
  g.add(makeCeilingFan(Math.min(FAN_SPAN, (D - T * 2 - 0.4) / 3.4), FAN_TOP));
  return g;
}

/* black rectangular ring pendant, recessed white tray above it */
function makeRingLight(w, d) {
  const g = new THREE.Group();
  const y = 3.05, t = 0.085;
  const bar = (bw, bd, x, z) => {
    g.add(box(MAT.blackFrame, bw, 0.075, bd, x, y, z, false));
    g.add(box(MAT.light, bw - 0.04, 0.028, bd - 0.04, x, y - 0.05, z, false));   // emissive underside
  };
  bar(w, t, 0, -d / 2); bar(w, t, 0, d / 2);
  bar(t, d, -w / 2, 0); bar(t, d, w / 2, 0);
  // suspension
  [[-w / 2 + 0.3, -d / 2 + 0.05], [w / 2 - 0.3, -d / 2 + 0.05],
   [-w / 2 + 0.3, d / 2 - 0.05], [w / 2 - 0.3, d / 2 - 0.05]].forEach(([x, z]) =>
    g.add(cyl(MAT.blackSoft, 0.012, 0.62, x, y + 0.33, z, true)));
  // recessed ceiling tray
  g.add(box(MAT.wallWhite, w + 1.5, 0.09, d + 1.5, 0, 3.72, 0, false));
  g.add(box(MAT.blackSoft, w + 1.5, 0.14, d + 1.5, 0, 3.63, 0, false));
  return g;
}

/* white ceiling fan */
function makeCeilingFan(span, topY) {
  const s = span || 1, top = topY === undefined ? 3.72 : topY;
  const g = new THREE.Group();
  g.add(cyl(MAT.wallWhite, 0.035, 0.5, 0, top - 0.25, 0, true));        // downrod
  g.add(cyl(MAT.wallWhite, 0.13 * s, 0.16, 0, top - 0.56, 0, true));    // motor
  const hub = new THREE.Group();
  hub.position.y = top - 0.62;
  for (let i = 0; i < 4; i++) {
    const b = box(MAT.wallWhite, 1.5 * s, 0.025, 0.19 * s, 0.85 * s, 0, 0, false);
    const arm = new THREE.Group();
    arm.rotation.y = (i / 4) * Math.PI * 2;
    arm.add(b);
    hub.add(arm);
  }
  g.add(hub);
  ANIMATED.push({ fn: (t) => { hub.rotation.y = t * 0.55; } });
  return g;
}

/* black square-tube open shelving with white pots — the room divider */
function makeShelfUnit(len, bays, levels) {
  const g = new THREE.Group();
  const H = 2.45, D = 0.42, T = 0.05;
  const cols = bays + 1;
  for (let i = 0; i < cols; i++) {
    const x = -len / 2 + (len / bays) * i;
    g.add(box(MAT.blackFrame, T, H, T, x, H / 2, -D / 2, false));
    g.add(box(MAT.blackFrame, T, H, T, x, H / 2, D / 2, false));
    g.add(box(MAT.blackFrame, T, T, D, x, H, 0, false));
    g.add(box(MAT.blackFrame, T, T, D, x, 0.02, 0, false));
  }
  for (let l = 0; l < levels; l++) {
    const y = 0.42 + l * ((H - 0.55) / (levels - 1));
    g.add(box(MAT.blackFrame, len, T * 0.7, T, 0, y, -D / 2, false));
    g.add(box(MAT.blackFrame, len, T * 0.7, T, 0, y, D / 2, false));
    g.add(box(MAT.blackSoft, len - 0.06, 0.022, D - 0.06, 0, y + 0.02, 0, false));
    // a plant on roughly half the cells
    for (let b = 0; b < bays; b++) {
      if ((l + b) % 2) continue;
      const px = -len / 2 + (len / bays) * (b + 0.5);
      const pot = new THREE.Group();
      pot.add(cyl(MAT.potWhite, 0.15, 0.24, 0, 0.12, 0, true));
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + Math.random();
        const lf = new THREE.Mesh(GEO.ico, k % 2 ? MAT.plant : MAT.plant2);
        lf.scale.set(0.2, 0.13, 0.2);
        lf.position.set(Math.cos(a) * 0.14, 0.3 + Math.random() * 0.14, Math.sin(a) * 0.14);
        lf.castShadow = !STATE.mobile;
        pot.add(lf);
      }
      pot.position.set(px, y + 0.03, 0);
      g.add(pot);
    }
  }
  return g;
}

/* black mesh task chair on castors */
function makeTaskChair() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = box(MAT.blackSoft, 0.56, 0.06, 0.09, Math.cos(a) * 0.24, 0.07, Math.sin(a) * 0.24, false);
    spoke.rotation.y = -a;
    g.add(spoke);
  }
  g.add(cyl(MAT.chrome, 0.042, 0.34, 0, 0.27, 0, true));
  g.add(box(MAT.mesh, 0.5, 0.09, 0.48, 0, 0.46, 0));
  const back = box(MAT.mesh, 0.46, 0.62, 0.06, 0, 0.83, 0.25);
  back.rotation.x = -0.16; g.add(back);
  g.add(box(MAT.blackFrame, 0.5, 0.66, 0.03, 0, 0.83, 0.29, false));
  g.add(box(MAT.blackSoft, 0.05, 0.05, 0.32, -0.27, 0.63, 0.04, false));
  g.add(box(MAT.blackSoft, 0.05, 0.05, 0.32, 0.27, 0.63, 0.04, false));
  return g;
}

/* glossy white bench desk — the islands from the photos */
function makeBenchDesk(screenKey, dual) {
  const g = new THREE.Group();
  const W = 2.7, D = 1.5;
  g.add(box(MAT.gloss, W, 0.09, D, 0, 0.76, 0));                       // top
  g.add(box(MAT.glossEdge, W - 0.06, 0.03, D - 0.06, 0, 0.705, 0, false));
  g.add(box(MAT.gloss, 0.1, 0.6, D - 0.12, -W / 2 + 0.05, 0.41, 0));   // side panels
  g.add(box(MAT.gloss, 0.1, 0.6, D - 0.12, W / 2 - 0.05, 0.41, 0));
  g.add(box(MAT.gloss, W - 0.2, 0.34, 0.08, 0, 0.55, -D / 2 + 0.14));  // back panel
  g.add(box(MAT.blackSoft, W - 0.24, 0.14, D - 0.5, 0, 0.34, 0, false)); // shadow gap / under-shelf
  g.add(box(MAT.gloss, W - 0.2, 0.05, D - 0.4, 0, 0.24, 0, false));

  const mon = makeMonitor(screenKey);
  mon.position.set(dual ? -0.44 : 0, 0.805, -0.42);
  g.add(mon);
  if (dual) {
    const m2 = makeMonitor(screenKey === 'code' ? 'charts' : 'code', 0.86);
    m2.position.set(0.76, 0.805, -0.36); m2.rotation.y = -0.4;
    g.add(m2);
  }
  g.add(box(MAT.blackSoft, 0.64, 0.022, 0.21, 0, 0.815, 0.24, false));  // keyboard
  g.add(box(MAT.blackSoft, 0.09, 0.032, 0.13, 0.46, 0.82, 0.26, false));// mouse
  g.add(cyl(MAT.potWhite, 0.052, 0.1, -0.78, 0.855, 0.26, true));       // cup
  g.add(box(MAT.paper, 0.28, 0.014, 0.21, 0.85, 0.81, -0.1, false));
  return g;
}

/* black-framed glass cabin.
   sides: which faces get glazing — {n,s,e,w}. door: which side the gap is in.
   style: 'meeting' (conference table) or 'director' (desk + visitor chairs)   */
function makeGlassCabin(w, d, opts) {
  const o = opts || {};
  const sides = o.sides || { w: 1, s: 1 };
  const FRAME = o.frameMat || MAT.blackFrame;   // slim light frame when asked for
  const doorSide = o.door || 's';
  const g = new THREE.Group();
  const H = (typeof WALL_H === 'number' ? WALL_H : 3.9) * 0.95;   // 5% below the wall line
  const DH = (typeof TRANSOM_Y === 'number' ? TRANSOM_Y : 2.35);  // door head, on the shared line
  const hw = w / 2, hd = d / 2;

  // One post per corner, not two. Each pane can drop an end post when the
  // neighbouring pane (or the door jamb) already puts one there.
  const pane = (pw, x, z, ry, skip, solid) => {
    if (pw < 0.3) return;
    const s = skip || {};
    const p = group(x, 0, z, ry);
    if (solid) {                       // plain wall rather than glazing
      p.add(box(MAT.wall, pw, H, 0.12, 0, H / 2, 0, false));
      p.add(box(MAT.trim, pw, 0.07, 0.15, 0, H, 0, false));
      g.add(p);
      return;
    }
    p.add(box(MAT.glassClear, pw, H - 0.16, 0.03, 0, H / 2, 0, false));
    p.add(box(o.whiteTop ? MAT.wallWhite : FRAME, pw, 0.09, o.whiteTop ? 0.1 : 0.09, 0, H, 0, false));
    p.add(box(FRAME, pw, 0.09, 0.09, 0, 0.06, 0, false));
    p.add(box(FRAME, pw, 0.05, 0.07, 0, DH, 0, false));         // transom, shared line
    if (!s.start) p.add(box(FRAME, 0.07, H, 0.09, -pw / 2, H / 2, 0, false));
    if (!s.end) p.add(box(FRAME, 0.07, H, 0.09, pw / 2, H / 2, 0, false));
    const mull = Math.max(0, Math.round(pw / 1.7) - 1);
    for (let i = 1; i <= mull; i++)
      p.add(box(FRAME, 0.05, H - 0.2, 0.06, -pw / 2 + (pw / (mull + 1)) * i, H / 2, 0, false));
    g.add(p);
  };

  // a pane's -pw/2 end is west on n/s walls and south on e/w walls
  const ORDER = ['n', 's', 'e', 'w'];
  const ENDS = { n: ['w', 'e'], s: ['w', 'e'], e: ['s', 'n'], w: ['s', 'n'] };
  const atWall = o.atWall || {};
  const dropPost = (self, corner) =>
    // the neighbouring pane already carries the corner post...
    (!!sides[corner] && ORDER.indexOf(corner) < ORDER.indexOf(self)) ||
    // ...or the pane dies into a building wall, which draws the line itself
    !!atWall[corner];

  const SIDE = {
    n: { len: w, x: 0, z: -hd, ry: 0, ax: 'x' },
    s: { len: w, x: 0, z: hd, ry: 0, ax: 'x' },
    w: { len: d, x: -hw, z: 0, ry: Math.PI / 2, ax: 'z' },
    e: { len: d, x: hw, z: 0, ry: Math.PI / 2, ax: 'z' }
  };
  Object.keys(SIDE).forEach(k => {
    if (!sides[k]) return;
    const isSolid = !!(o.solid && o.solid[k]) && k !== doorSide;
    const S = SIDE[k];
    const [cStart, cEnd] = ENDS[k];
    if (k === doorSide) {
      const doorW = 1.15, seg = (S.len - doorW) / 2;
      const off = doorW / 2 + seg / 2;
      // the jamb supplies the post on each segment's inner end
      const segA = S.ax === 'x' ? { start: dropPost(k, cStart), end: true }
                                : { start: true, end: dropPost(k, cEnd) };
      const segB = S.ax === 'x' ? { start: true, end: dropPost(k, cEnd) }
                                : { start: dropPost(k, cStart), end: true };
      pane(seg, S.ax === 'x' ? -off : S.x, S.ax === 'x' ? S.z : -off, S.ry, segA, isSolid);
      pane(seg, S.ax === 'x' ? off : S.x, S.ax === 'x' ? S.z : off, S.ry, segB, isSolid);
      const dj = group(S.x, 0, S.z, S.ry);
      dj.add(box(o.whiteTop ? MAT.wallWhite : FRAME, doorW + 0.1, 0.09, o.whiteTop ? 0.11 : 0.1, 0, H, 0, false));
      dj.add(box(FRAME, 0.06, H, 0.07, -doorW / 2, H / 2, 0, false));
      dj.add(box(FRAME, 0.06, H, 0.07, doorW / 2, H / 2, 0, false));
      dj.add(box(FRAME, doorW + 0.1, 0.08, 0.09, 0, DH, 0, false));            // door head
      dj.add(box(MAT.glassClear, doorW, H - DH - 0.13, 0.03, 0, (DH + H) / 2 + 0.04, 0, false)); // glass over the door
      if (o.label) {
        // 'n' and 'w' jambs have their local +z pointing into the room, so the
        // sign has to be pushed the other way and turned to face outward.
        const so = (doorSide === 'n' || doorSide === 'w') ? -1 : 1;
        dj.add(box(MAT.blackSoft, 1.15, 0.3, 0.06, 0, DH + 0.28, 0.02 * so, false));
        const sgnMesh = plane(new THREE.MeshBasicMaterial({
          toneMapped: false,
          map: makeTex(320, 84, (x, ww, hh) => {
            x.fillStyle = '#12151B'; x.fillRect(0, 0, ww, hh);
            x.fillStyle = '#E8B923'; x.fillRect(0, hh - 5, ww, 5);
            x.fillStyle = '#F0F1F3'; x.font = '700 34px ui-sans-serif,Arial,sans-serif';
            x.textAlign = 'center'; x.fillText(o.label.toUpperCase(), ww / 2, 50);
          })
        }), 1.05, 0.26, 0, DH + 0.28, 0.055 * so);
        if (so < 0) sgnMesh.rotation.y = Math.PI;
        dj.add(sgnMesh);
      }
      g.add(dj);
    } else {
      pane(S.len, S.x, S.z, S.ry, { start: dropPost(k, cStart), end: dropPost(k, cEnd) }, isSolid);
    }
  });

  if (o.style === 'briefing') {
    // no table at all — rows of chairs facing the board wall
    const n = Math.max(3, Math.min(7, Math.floor((w - 1.8) / 1.3)));
    const rows = d > 6 ? 3 : (d > 4 ? 2 : 1);
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < n; i++) {
        const ch = makeTaskChair();
        ch.position.set(-((n - 1) * 1.3) / 2 + i * 1.3 + (r % 2 ? 0.65 : 0), 0, hd - 1.9 - r * 1.25);
        ch.rotation.y = Math.PI;                       // facing the board wall (+z)
        g.add(ch);
      }
    }
    if (o.ac) { const u = makeAC(); u.position.set(-hw + 0.4, 2.85, 0); u.rotation.y = Math.PI / 2; g.add(u); }
  } else if (o.style === 'director') {
    // the desk runs along z and the director looks east through the glass,
    // out across the open floor to the right-hand tables
    // how far the desk sits off the west wall, as a fraction of the width.
    // Push it out to open a gap between the credenza and the chair behind it.
    const deskX = -hw + Math.min(2.9, w * (o.deskFrac || 0.42));
    g.add(box(MAT.gloss, 1.35, 0.1, 2.9, deskX, 0.76, 0));
    g.add(box(MAT.glossEdge, 1.29, 0.03, 2.84, deskX, 0.705, 0, false));
    g.add(box(MAT.gloss, 0.16, 0.62, 2.6, deskX + 0.6, 0.43, 0));        // modesty panel, visitor side
    g.add(box(MAT.gloss, 1.2, 0.62, 0.12, deskX, 0.43, -1.32));
    g.add(box(MAT.gloss, 1.2, 0.62, 0.12, deskX, 0.43, 1.32));
    const mon = makeMonitor('charts');
    mon.position.set(deskX + 0.36, 0.81, -0.3);
    mon.rotation.y = -Math.PI / 2;                                        // faces the director
    g.add(mon);
    g.add(box(MAT.blackSoft, 0.2, 0.022, 0.6, deskX - 0.2, 0.815, -0.3, false));
    g.add(box(FRAME, 0.1, 0.09, 0.34, deskX + 0.3, 0.83, 0.95, false));   // name block
    const ch = makeTaskChair();
    ch.position.set(deskX - 0.9, 0, -0.3);
    ch.rotation.y = -Math.PI / 2;                                         // director looks east
    g.add(ch);
    [-0.85, 0.85].forEach(z => {
      const v = makeTaskChair();
      v.position.set(deskX + 1.15, 0, z);
      v.rotation.y = Math.PI / 2;                                         // visitors look back west
      g.add(v);
    });
    const cw = Math.min(2.4, d - 1.2);
    if (cw > 0.9) {
      const cr = makeCredenza(cw);
      cr.position.set(-hw + 0.36, 0, 0);                                   // back on the side wall
      cr.rotation.y = Math.PI / 2;
      g.add(cr);
    }
    if (o.ac) { const u = makeAC(); u.position.set(-hw + 0.4, 2.85, 0); u.rotation.y = Math.PI / 2; g.add(u); }
  } else {
    // the board wall stays clear of furniture: the table sits away from it
    const off = o.board === 'w' ? 1.9 : 0;
    const TW = Math.min(w - 3.6 - Math.abs(off), 6.0);
    const tg = new THREE.Group(); tg.position.x = off;
    tg.add(box(MAT.gloss, TW, 0.1, 1.7, 0, 0.75, 0));
    tg.add(box(MAT.glossEdge, TW - 0.06, 0.03, 1.64, 0, 0.695, 0, false));
    tg.add(box(MAT.gloss, TW - 1.6, 0.56, 0.5, 0, 0.42, 0));
    tg.add(box(MAT.blackSoft, TW - 1.7, 0.1, 0.56, 0, 0.28, 0, false));
    tg.add(box(MAT.blackSoft, 0.46, 0.035, 0.28, 0, 0.81, 0, false));
    for (let i = 0; i < 3; i++) tg.add(box(MAT.paper, 0.26, 0.012, 0.19, -1.4 + i * 1.4, 0.81, 0.62, false));
    const seats = Math.max(2, Math.min(3, Math.floor(TW / 1.8)));
    for (let i = 0; i < seats; i++) {
      const x = -((seats - 1) * 1.5) / 2 + i * 1.5;
      [-1, 1].forEach(s => {
        const ch = makeTaskChair();
        ch.position.set(x, 0, s * 1.35);
        ch.rotation.y = s > 0 ? 0 : Math.PI;
        tg.add(ch);
      });
    }
    g.add(tg);
    if (off) {
      // a row of chairs facing the board, nothing else on that side
      const n = Math.max(3, Math.min(5, Math.floor(d / 1.5)));
      for (let i = 0; i < n; i++) {
        const ch = makeTaskChair();
        ch.position.set(-hw + 1.85, 0, -((n - 1) * 1.35) / 2 + i * 1.35);
        ch.rotation.y = Math.PI / 2;
        g.add(ch);
      }
    }
    if (o.tv) {
      const tv = makeWallTV(2.4, 1.38);
      if (o.tv === 'e') {                 // east wall, clear of the glazing
        tv.position.set(hw - 0.12, 2.0, 0);
        tv.rotation.y = -Math.PI / 2;
      } else {
        tv.position.set(0, 1.55, -hd + 0.12);
      }
      g.add(tv);
    }
    if (o.ac) {
      const u = makeAC();
      if (o.ac === 'n') {                      // north wall — for a cabin whose
        u.position.set(0, 2.85, -hd + 0.18);   // door is on the west, where the
      } else {                                 // gap in that wall is
        u.position.set(-hw + 0.4, 2.85, 0);
        u.rotation.y = Math.PI / 2;
      }
      g.add(u);
    }
  }
  g.add(makeCeilingFan(FAN_SPAN, FAN_TOP));
  return g;
}

/* two joined desks = one 4-seat bench cluster */
function makeBenchCluster(W, D, opts) {
  const o = opts || {};
  const g = new THREE.Group();
  const s = o.endStore === 'left' ? -1 : 1;
  const CW = 1.3;                                    // storage bay, inside the run
  const has = !!o.endStore;

  g.add(box(MAT.gloss, W, 0.09, D, 0, 0.76, 0));
  g.add(box(MAT.glossEdge, W - 0.07, 0.03, D - 0.07, 0, 0.705, 0, false));
  if (!has || s < 0) g.add(box(MAT.gloss, 0.12, 0.62, D - 0.16, W / 2 - 0.07, 0.42, 0));
  if (!has || s > 0) g.add(box(MAT.gloss, 0.12, 0.62, D - 0.16, -W / 2 + 0.07, 0.42, 0));

  // central spine, shortened where the storage bay sits
  const sw = has ? W - 0.5 - CW : W - 0.5;
  const sx = has ? -s * CW / 2 : 0;
  g.add(box(MAT.gloss, sw, 0.5, 0.55, sx, 0.4, 0));
  g.add(box(MAT.blackSoft, sw - 0.1, 0.12, 0.62, sx, 0.28, 0, false));
  g.add(box(MAT.gloss, W - 0.24, 0.4, 0.06, 0, 1.0, 0));                // desktop divider
  g.add(box(MAT.blackFrame, W - 0.24, 0.045, 0.09, 0, 1.21, 0, false));
  g.add(box(MAT.blackSoft, sw - 0.7, 0.06, 0.16, sx, 0.68, 0, false));  // cable tray

  // ---- storage built into the end of the run: entirely under the worktop,
  //      and entirely inside the table's footprint. Nothing protrudes.
  if (has) {
    const cd = D - 0.12, H = 0.66, y0 = 0.05;
    const x0 = s * (W / 2 - CW / 2);
    g.add(box(MAT.gloss, CW, H, cd, x0, y0 + H / 2, 0));
    g.add(box(MAT.blackSoft, CW, 0.05, cd, x0, y0, 0, false));           // plinth shadow
    [-1, 1].forEach(d2 => {                                              // two doors, facing the room
      const dx = x0 + d2 * CW * 0.245;
      g.add(box(MAT.glossEdge, CW * 0.46, H - 0.12, 0.025, dx, y0 + H / 2, cd / 2 + 0.008, false));
      g.add(box(MAT.blackFrame, 0.1, 0.026, 0.026, dx + d2 * CW * 0.16, y0 + H / 2, cd / 2 + 0.026, false));
    });
    // open cubbies on the end face, flush with the table edge
    const ex = s * (W / 2 - 0.03);
    [y0 + H * 0.72, y0 + H * 0.26].forEach((cy, ci) => {
      g.add(box(MAT.darker, 0.05, H * 0.36, cd - 0.24, ex, cy, 0, false));
      for (let k = 0; k < 4; k++) {
        g.add(box([MAT.pot, MAT.fabric, MAT.paper, MAT.plant2][(k + ci) % 4],
          0.04, H * 0.28, 0.05, ex - s * 0.02, cy, -cd * 0.2 + k * 0.07, false));
      }
    });
  }
  return g;
}

/* entrance cupboard: one long horizontal cabinet on top (network gear and
   ethernet), and two wide, shorter cabinets under it for bags.
/* entrance cupboard: two columns of doors, three rows deep.
   The top row is the tall one; the two below it are half-height. */
function makeCaboodh(W, H) {
  const g = new THREE.Group();
  W = W || 2.8; H = H || 2.9;
  const D = 0.62, rev = 0.028, margin = 0.055;
  const rows = [0.5, 0.25, 0.25];                    // top row is twice the others

  g.add(box(MAT.gloss, W, H, D, 0, H / 2, 0));                              // carcass
  g.add(box(MAT.blackSoft, W - 0.09, H - 0.16, 0.02, 0, H / 2 + 0.01, D / 2 + 0.006, false)); // shadow behind the reveals
  g.add(box(MAT.blackSoft, W, 0.1, D, 0, 0.05, 0, false));                  // plinth
  g.add(box(MAT.gloss, W, 0.07, D, 0, H - 0.035, 0, false));               // flush top, no overhang

  const yTop = H - margin, yBot = 0.1 + margin * 0.5;
  const availH = (yTop - yBot) - rev * (rows.length - 1);
  const x0 = -W / 2 + margin, x1 = W / 2 - margin;
  const cw = ((x1 - x0) - rev) / 2;

  let cursor = yTop;
  rows.forEach((fr, ri) => {
    const rh = availH * fr;
    const cy = cursor - rh / 2;
    for (let ci = 0; ci < 2; ci++) {
      const cx = x0 + cw / 2 + ci * (cw + rev);
      g.add(box(MAT.gloss, cw, rh, 0.05, cx, cy, D / 2 + 0.032));           // door
      g.add(box(MAT.glossEdge, cw - 0.05, rh - 0.05, 0.012, cx, cy, D / 2 + 0.062, false));
      const hx = cx + (ci === 0 ? cw / 2 - 0.085 : -cw / 2 + 0.085);        // handle by the meeting edge
      g.add(box(MAT.chrome, 0.022, Math.min(rh * 0.42, 0.32), 0.026, hx, cy, D / 2 + 0.072, false));
    }
    cursor -= rh + rev;
  });
  return g;
}


/* WC pan, cistern and seat. Cistern sits on -z, so rotate to face a wall. */
function makeToilet() {
  const g = new THREE.Group();
  g.add(box(MAT.gloss, 0.44, 0.44, 0.18, 0, 0.56, -0.28));                 // cistern
  g.add(box(MAT.glossEdge, 0.47, 0.05, 0.21, 0, 0.8, -0.28, false));
  g.add(box(MAT.chrome, 0.1, 0.07, 0.02, 0.09, 0.7, -0.18, false));        // flush plate
  g.add(box(MAT.gloss, 0.21, 0.34, 0.32, 0, 0.17, -0.08, false));          // pedestal
  g.add(cyl(MAT.gloss, 0.19, 0.24, 0, 0.4, 0.1, false));                   // bowl
  g.add(cyl(MAT.glossEdge, 0.2, 0.05, 0, 0.54, 0.1, false));               // seat
  g.add(box(MAT.gloss, 0.35, 0.035, 0.33, 0, 0.58, 0.1, false));           // lid
  return g;
}

/* washroom — solid walls, door gap, signed */
function makeBathroom(w, d, label, opts) {
  const o = opts || {};
  const g = new THREE.Group();
  const H = (typeof WALL_H === 'number' ? WALL_H : 3.9) * 0.95;
  const DH = 2.24;
  const hw = w / 2, hd = d / 2, T = 0.16;
  const wall = (ww, x, z, ry) => {
    const m = box(MAT.wallWhite, ww, H, T, x, H / 2, z, false);
    m.rotation.y = ry || 0; g.add(m);
  };
  wall(w, 0, -hd, 0);
  // a side wall can be omitted when the neighbouring room already builds it;
  // two coplanar walls z-fight badly
  const omit = o.omit || [];
  if (omit.indexOf('left') < 0) wall(d, -hw, 0, Math.PI / 2);
  if (omit.indexOf('right') < 0) wall(d, hw, 0, Math.PI / 2);
  const doorW = 0.95, seg = (w - doorW) / 2;
  wall(seg, -(doorW / 2 + seg / 2), hd, 0);
  wall(seg, (doorW / 2 + seg / 2), hd, 0);
  g.add(box(MAT.wallWhite, doorW + 0.1, H - DH - 0.1, T, 0, (DH + H) / 2 + 0.05, hd, false)); // over-door panel
  g.add(box(MAT.blackFrame, doorW + 0.12, 0.1, T + 0.04, 0, DH, hd, false));
  g.add(box(MAT.blackFrame, 0.06, DH, T + 0.04, -doorW / 2, DH / 2, hd, false));
  g.add(box(MAT.blackFrame, 0.06, DH, T + 0.04, doorW / 2, DH / 2, hd, false));
  // door leaf, set into the opening: white to match the wall, black frame round it
  const lw = doorW - 0.07, lh = DH - 0.1, lx = doorW * 0.02;
  g.add(box(MAT.gloss, lw, lh, 0.05, lx, lh / 2 + 0.04, hd + 0.02, false));
  g.add(box(MAT.glossEdge, lw - 0.11, lh - 0.16, 0.014, lx, lh / 2 + 0.04, hd + 0.05, false));  // recessed panel
  g.add(box(MAT.chrome, 0.15, 0.032, 0.032, lx - lw * 0.32, 1.04, hd + 0.07, false));           // lever
  g.add(box(MAT.chrome, 0.05, 0.075, 0.02, lx - lw * 0.32 + 0.06, 1.04, hd + 0.055, false));    // rose
  [0.4, lh - 0.28].forEach(hy =>
    g.add(box(MAT.chrome, 0.028, 0.1, 0.045, lx + lw * 0.47, hy, hd + 0.03, false)));           // hinges

  // sign
  const ladies = /lad|wom/i.test(label);
  g.add(box(MAT.blackSoft, 0.86, 0.4, 0.05, 0, DH + 0.32, hd + 0.11, false));
  g.add(plane(new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: makeTex(344, 160, (x, ww, hh) => {
      x.fillStyle = '#12151B'; x.fillRect(0, 0, ww, hh);
      x.fillStyle = ladies ? '#E39BC0' : '#7FB2FF';
      x.beginPath(); x.arc(64, 44, 15, 0, 6.3); x.fill();
      if (ladies) { x.beginPath(); x.moveTo(64, 64); x.lineTo(92, 126); x.lineTo(36, 126); x.closePath(); x.fill(); }
      else { x.fillRect(52, 64, 24, 38); x.fillRect(52, 100, 9, 28); x.fillRect(67, 100, 9, 28); }
      x.fillStyle = '#F0F1F3'; x.font = '700 40px ui-sans-serif,Arial,sans-serif';
      x.fillText(label.toUpperCase(), 120, 98);
    })
  }), 0.8, 0.36, 0, DH + 0.32, hd + 0.14));

  // ---- lighter floor finish so it reads as a separate room
  const fl = new THREE.Mesh(GEO.plane, MAT.glossEdge);
  fl.rotation.x = -Math.PI / 2;
  fl.scale.set(w - 0.22, d - 0.22, 1);
  fl.position.y = 0.016;
  fl.receiveShadow = !STATE.mobile;
  g.add(fl);

  // ---- basin hangs on the SIDE wall immediately beside the door, so you meet
  //      it the moment the door opens. Built facing +z then turned to the wall,
  //      which leaves it running lengthwise toward the far (entrance-gate) wall.
  const sgn = o.basinSign || -1;
  const bs = new THREE.Group();
  bs.add(box(MAT.cream, 0.52, 0.14, 0.36, 0, 0.85, 0, false));               // basin
  bs.add(box(MAT.glossEdge, 0.44, 0.05, 0.28, 0, 0.895, 0, false));
  bs.add(cyl(MAT.chrome, 0.017, 0.2, 0, 0.95, -0.14, true));                 // tap
  bs.add(box(MAT.chrome, 0.03, 0.02, 0.1, 0, 1.04, -0.07, false));           // spout
  bs.add(cyl(MAT.chrome, 0.033, 0.3, 0, 0.63, 0, true));                     // trap
  // nudged 5% of the room width in off the corner: for the Ladies basin that
  // reads as a shift left, for the Men's one a shift right
  bs.position.set(sgn * (hw - 0.28 - w * 0.05), 0, hd - 0.62);
  bs.rotation.y = -sgn * Math.PI / 2;
  bs.scale.set(1.3, 1.1, 1.3);                       // a size up
  g.add(bs);

  const wc = makeToilet();
  wc.position.set(0, 0, -hd + 0.55);                                         // centred on the same wall
  wc.scale.set(1.3, 1.15, 1.3);                                              // a size up
  g.add(wc);

  return g;
}

/* framed antique relief panel */
function makeWallArt(W, H) {
  const g = new THREE.Group();
  W = W || 2.1; H = H || 1.55;
  g.add(box(MAT.brass, W + 0.12, H + 0.12, 0.07, 0, 0, 0, false));
  g.add(box(MAT.darker, W + 0.02, H + 0.02, 0.05, 0, 0, 0.02, false));
  g.add(plane(MAT.wallArt, W, H, 0, 0, 0.05));
  g.add(box(MAT.brass, W + 0.2, 0.05, 0.11, 0, H / 2 + 0.09, 0.01, false));
  g.add(box(MAT.brass, W + 0.2, 0.05, 0.11, 0, -H / 2 - 0.09, 0.01, false));
  return g;
}

/* antique brass wall clock — the hands read the real time */
function makeWallClock(R) {
  const g = new THREE.Group();
  R = R || 0.4;
  const face = new THREE.Group();
  face.rotation.x = Math.PI / 2;
  face.add(cyl(MAT.brass, R, 0.08, 0, 0, 0, false));
  face.add(cyl(MAT.cream, R - 0.045, 0.03, 0, 0.045, 0, false));
  face.add(cyl(MAT.brass, R - 0.012, 0.02, 0, 0.062, 0, false));
  face.add(cyl(MAT.cream, R - 0.055, 0.02, 0, 0.07, 0, false));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    const t = box(MAT.brass, big ? 0.035 : 0.018, 0.012, big ? 0.1 : 0.06,
      Math.sin(a) * (R - 0.11), 0.078, Math.cos(a) * (R - 0.11), false);
    t.rotation.y = -a;
    face.add(t);
  }
  const hand = (len, wid, mat) => {
    const p = new THREE.Group();
    p.add(box(mat, wid, 0.014, len, 0, 0, len / 2 - 0.03, false));
    p.position.y = 0.085;
    face.add(p);
    return p;
  };
  const hr = hand(R * 0.52, 0.032, MAT.blackSoft);
  const mn = hand(R * 0.78, 0.022, MAT.blackSoft);
  face.add(cyl(MAT.brass, 0.028, 0.03, 0, 0.1, 0, false));
  g.add(face);
  ANIMATED.push({
    fn: () => {
      const now = new Date();
      const m = now.getMinutes() + now.getSeconds() / 60;
      const h = (now.getHours() % 12) + m / 60;
      mn.rotation.y = -(m / 60) * Math.PI * 2;
      hr.rotation.y = -(h / 12) * Math.PI * 2;
    }
  });
  return g;
}

/* a small stand suspended right over the table: one plant, one book */
function makeOverheadStand(W) {
  const g = new THREE.Group();
  W = W || 0.8;
  const top = 3.74, shelf = 1.98, D = 0.3;
  [-W / 2 + 0.07, W / 2 - 0.07].forEach(x => {
    g.add(cyl(MAT.blackSoft, 0.011, top - shelf, x, (top + shelf) / 2, 0, true));
    g.add(box(MAT.blackSoft, 0.07, 0.04, 0.07, x, top, 0, false));
  });
  g.add(box(MAT.blackFrame, W, 0.04, D, 0, shelf, 0, false));
  g.add(box(MAT.brass, W, 0.035, 0.025, 0, shelf + 0.03, D / 2, false));
  g.add(box(MAT.blackFrame, W, 0.14, 0.025, 0, shelf + 0.09, -D / 2, false));
  const px = -W * 0.26;
  g.add(cyl(MAT.potWhite, 0.085, 0.14, px, shelf + 0.09, 0, true));
  for (let k = 0; k < 5; k++) {
    const a2 = (k / 5) * Math.PI * 2;
    const lf = new THREE.Mesh(GEO.ico, k % 2 ? MAT.plant : MAT.plant2);
    lf.scale.set(0.16, 0.1, 0.16);
    lf.position.set(px + Math.cos(a2) * 0.08, shelf + 0.2 + (k % 2) * 0.05, Math.sin(a2) * 0.07);
    lf.castShadow = !STATE.mobile;
    g.add(lf);
  }
  const bk = new THREE.Group();
  bk.add(box(MAT.pot, 0.045, 0.24, 0.17, 0, 0.12, 0, false));
  bk.add(box(MAT.paper, 0.022, 0.22, 0.155, 0.014, 0.12, 0, false));
  bk.add(box(MAT.brass, 0.048, 0.02, 0.03, 0, 0.19, 0.07, false));
  bk.position.set(W * 0.24, shelf + 0.02, 0);
  bk.rotation.z = -0.12;
  g.add(bk);
  return g;
}

/* large wall-mounted flatscreen */
function makeBigTV(w, h) {
  const g = new THREE.Group();
  g.add(box(MAT.blackFrame, w, h, 0.06, 0, 0, 0, false));
  g.add(box(MAT.darker, w - 0.05, h - 0.05, 0.02, 0, 0, 0.032, false));
  g.add(plane(MAT.wallTv, w - 0.1, h - 0.1, 0, 0, 0.045));
  g.add(box(MAT.blackSoft, w * 0.34, 0.16, 0.09, 0, -h / 2 - 0.02, -0.03, false));
  g.add(box(MAT.chrome, 0.16, 0.03, 0.02, 0, -h / 2 + 0.06, 0.05, false));
  g.add(box(MAT.light, 0.05, 0.02, 0.01, w * 0.4, -h / 2 + 0.05, 0.05, false));
  return g;
}

/* light switch plate */
function makeSwitches(gangs) {
  const g = new THREE.Group();
  gangs = gangs || 6;
  const W = 0.09 + gangs * 0.085, H = 0.17;
  g.add(box(MAT.gloss, W, H, 0.035, 0, 0, 0, false));
  g.add(box(MAT.glossEdge, W - 0.03, H - 0.03, 0.045, 0, 0, 0.006, false));
  for (let i = 0; i < gangs; i++) {
    const x = -W / 2 + 0.045 + i * 0.085;
    g.add(box(MAT.glossEdge, 0.062, 0.1, 0.02, x, 0, 0.028, false));
    g.add(box(MAT.blackSoft, 0.05, 0.012, 0.012, x, -0.028, 0.038, false));
  }
  return g;
}

/* wall-mounted screen */
function makeWallTV(w, h) {
  const g = new THREE.Group();
  g.add(box(MAT.blackFrame, w, h, 0.07, 0, 0, 0, false));
  g.add(plane(MAT.wallTv, w - 0.09, h - 0.09, 0, 0, 0.042));
  g.add(box(MAT.blackSoft, 0.3, 0.24, 0.08, 0, -h / 2 + 0.1, -0.06, false));
  return g;
}

/* wall split AC */
function makeAC() {
  const g = new THREE.Group();
  g.add(box(MAT.wallWhite, 1.15, 0.32, 0.24, 0, 0, 0, false));
  g.add(box(MAT.glossEdge, 1.1, 0.06, 0.26, 0, -0.12, 0.01, false));
  g.add(box(MAT.blackSoft, 0.16, 0.05, 0.02, 0.42, 0.02, 0.13, false));
  return g;
}

/* the logo fixed directly onto an existing wall — letters only.
   No backing board, no fixture above or below it. */
function makeLogoPanel(W) {
  const g = new THREE.Group();
  W = W || 4.4;
  const H = W * 0.375;
  const m = plane(MAT.logieMark, W, H, 0, 0, 0.03);
  m.renderOrder = 1;
  g.add(m);
  // little track spot washing it from above
  const armY = H / 2 + 0.5;
  g.add(box(MAT.blackSoft, 0.05, 0.05, 0.34, W * 0.3, armY, 0.18, false));      // arm off the wall
  const sp = group(W * 0.3, armY - 0.06, 0.33);
  sp.add(cyl(MAT.blackSoft, 0.055, 0.22, 0, 0, 0, true));
  sp.add(cyl(MAT.light, 0.05, 0.03, 0, -0.12, 0, true));
  sp.rotation.x = 0.62;
  g.add(sp);
  return g;
}

/* the charcoal feature wall with the backlit logo */
function makeLogoWall(w) {
  const g = new THREE.Group();
  const H = 3.5;
  g.add(box(MAT.wallFeature, w, H, 0.26, 0, H / 2, 0));
  const lw = Math.min(w * 0.46, 3.5);
  g.add(plane(MAT.logieLogo, lw, lw * 0.375, 0, H * 0.58, 0.14));
  g.add(box(MAT.blackSoft, w, 0.1, 0.34, 0, H, 0.05, false));
  // little track spot
  const sp = group(w * 0.1, H - 0.28, 0.42);
  sp.add(cyl(MAT.blackSoft, 0.05, 0.22, 0, 0, 0, true));
  sp.add(cyl(MAT.light, 0.045, 0.03, 0, -0.12, 0, true));
  sp.rotation.x = 0.5;
  g.add(sp);
  return g;
}

/* low white credenza, like the counters in the photos */
function makeCredenza(w) {
  const g = new THREE.Group();
  g.add(box(MAT.gloss, w, 0.86, 0.6, 0, 0.43, 0));
  g.add(box(MAT.glossEdge, w + 0.06, 0.05, 0.66, 0, 0.89, 0, false));
  g.add(box(MAT.blackSoft, w - 0.2, 0.1, 0.02, 0, 0.34, 0.31, false));
  return g;
}

/* recessed downlight */
function makeDownlights(pts) {
  const g = new THREE.Group();
  const inst = new THREE.InstancedMesh(GEO.cylLow, MAT.downlight, pts.length);
  const dummy = new THREE.Object3D();
  pts.forEach((p, i) => {
    dummy.position.set(p[0], 3.6, p[1]);
    dummy.scale.set(0.26, 0.05, 0.26);
    dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
  });
  inst.instanceMatrix.needsUpdate = true;
  g.add(inst);
  return g;
}
