/* ==========================================================================
   6 · FURNITURE COMPONENTS
   Local convention: a workstation "faces" -z. The chair sits at +z.
   ========================================================================== */

function makeChair(fabric) {
  const g = group();
  const f = fabric || MAT.fabric;
  for (let i = 0; i < 5; i++) {
    const spoke = box(MAT.dark, 0.5, 0.06, 0.09, 0, 0.06, 0, true);
    spoke.rotation.y = (i / 5) * Math.PI * 2;
    spoke.position.set(Math.cos(spoke.rotation.y) * 0.22, 0.06, Math.sin(spoke.rotation.y) * 0.22);
    g.add(spoke);
  }
  g.add(cyl(MAT.metal, 0.045, 0.36, 0, 0.26, 0, true));
  g.add(box(f, 0.52, 0.1, 0.5, 0, 0.47, 0));
  const back = box(f, 0.5, 0.56, 0.09, 0, 0.78, 0.24);
  back.rotation.x = -0.14;
  g.add(back);
  g.add(box(MAT.dark, 0.06, 0.05, 0.34, -0.28, 0.63, 0.02, true));
  g.add(box(MAT.dark, 0.06, 0.05, 0.34, 0.28, 0.63, 0.02, true));
  return g;
}

function makeMonitor(screenKey, w) {
  const g = group();
  w = w || 1.12;
  g.add(cyl(MAT.dark, 0.15, 0.03, 0, 0.02, 0, true));
  g.add(box(MAT.dark, 0.07, 0.3, 0.07, 0, 0.17, 0));
  const head = group(0, 0.53, 0);
  head.rotation.x = -0.07;
  head.add(box(MAT.darker, w, w * 0.58, 0.045, 0, 0, 0));
  const sc = plane(MAT.screen[screenKey] || MAT.screen.code, w * 0.93, w * 0.51, 0, 0.005, 0.026);
  head.add(sc);
  g.add(head);
  return g;
}

function makeDesk(screenKey, dual) {
  const g = group();
  g.add(box(MAT.deskTop, 2.5, 0.07, 1.2, 0, 0.74, 0));
  g.add(box(MAT.wood, 2.52, 0.03, 1.22, 0, 0.705, 0, false));
  g.add(box(MAT.metal, 0.08, 0.72, 1.06, -1.17, 0.37, 0));
  g.add(box(MAT.metal, 0.08, 0.72, 1.06, 1.17, 0.37, 0));
  g.add(box(MAT.metal, 2.2, 0.06, 0.06, 0, 0.2, -0.4, true));
  g.add(box(MAT.trim, 2.3, 0.4, 0.04, 0, 0.52, -0.56));

  const mon = makeMonitor(screenKey);
  mon.position.set(dual ? -0.42 : 0, 0.78, -0.34);
  g.add(mon);
  if (dual) {
    const m2 = makeMonitor(screenKey === 'code' ? 'charts' : 'code', 0.86);
    m2.position.set(0.72, 0.78, -0.3);
    m2.rotation.y = -0.42;
    g.add(m2);
  }

  g.add(box(MAT.darker, 0.66, 0.025, 0.22, 0, 0.79, 0.2));           // keyboard
  g.add(box(MAT.darker, 0.62, 0.012, 0.19, 0, 0.805, 0.2, false));
  g.add(box(MAT.dark, 0.09, 0.035, 0.13, 0.46, 0.795, 0.22));        // mouse
  g.add(cyl(MAT.amber, 0.055, 0.11, -0.72, 0.83, 0.24, true));       // mug
  g.add(box(MAT.paper, 0.3, 0.015, 0.23, 0.86, 0.785, -0.08));       // papers
  g.add(box(MAT.darker, 0.24, 0.48, 0.5, -0.86, 0.24, -0.28));       // tower under desk
  g.add(box(MAT.dark, 0.9, 0.35, 0.42, 0.75, 0.18, -0.3));           // drawer unit
  return g;
}

function makeWorkstation(p, x, z, dual) {
  const g = group(x, 0, z);
  g.add(makeDesk(p.screen, dual));
  const ch = makeChair(MAT.fabric);
  ch.position.set(0.08, 0, 1.05);
  ch.rotation.y = 0.12;
  g.add(ch);
  return g;
}

/* ---- meeting room ------------------------------------------------------- */
function makeMeetingRoom() {
  const g = group();
  const glassPanel = (w, x, z, ry) => {
    const p = group(x, 0, z, ry);
    p.add(box(MAT.glass, w, 2.9, 0.05, 0, 1.6, 0, false));
    p.add(box(MAT.metal, w, 0.07, 0.11, 0, 3.06, 0, false));
    p.add(box(MAT.metal, w, 0.07, 0.11, 0, 0.14, 0, false));
    p.add(box(MAT.metal, 0.07, 3, 0.11, -w / 2, 1.6, 0, false));
    p.add(box(MAT.metal, 0.07, 3, 0.11, w / 2, 1.6, 0, false));
    g.add(p);
  };
  glassPanel(10.4, -6, 0, Math.PI / 2);          // west wall
  glassPanel(4.2, -4.1, 5.2, 0);                 // south wall, left of door
  glassPanel(4.2, 4.1, 5.2, 0);                  // south wall, right of door
  g.add(box(MAT.metal, 4.2, 0.12, 0.14, 0, 3.06, 5.2, false));

  // table
  g.add(box(MAT.wood, 4.8, 0.11, 1.9, 0, 0.74, 0));
  g.add(box(MAT.dark, 0.9, 0.68, 0.28, -1.5, 0.36, 0));
  g.add(box(MAT.dark, 0.9, 0.68, 0.28, 1.5, 0.36, 0));
  g.add(box(MAT.darker, 0.5, 0.04, 0.3, 0, 0.81, 0, true));          // conference puck
  g.add(cyl(MAT.metal, 0.11, 0.03, 0, 0.83, 0, true));
  for (let i = 0; i < 4; i++) {
    g.add(box(MAT.paper, 0.28, 0.012, 0.2, -1.5 + i, 0.8, i % 2 ? 0.55 : -0.55, false));
  }

  // chairs around the table
  [[-1.6, 1.5], [0, 1.5], [1.6, 1.5], [-1.6, -1.5], [0, -1.5], [1.6, -1.5]].forEach(([cx, cz]) => {
    const c = makeChair(MAT.fabric);
    c.position.set(cx, 0, cz);
    c.rotation.y = cz > 0 ? 0 : Math.PI;
    g.add(c);
  });

  // wall display on the building wall behind
  const scr = group(0, 1.85, -4.85);
  scr.add(box(MAT.darker, 3.5, 2.0, 0.1, 0, 0, 0, false));
  scr.add(plane(MAT.present, 3.3, 1.85, 0, 0, 0.06));
  g.add(scr);
  g.add(box(MAT.wall, 12.2, 3.9, 0.2, 0, 1.95, -5.05, false));       // room's own back wall

  return g;
}

/* ---- whiteboard --------------------------------------------------------- */
function makeWhiteboard() {
  const g = group();
  g.add(box(MAT.metal, 5.0, 2.9, 0.09, 0, 1.95, 0, false));
  g.add(plane(MAT.board, 4.8, 2.7, 0, 1.95, 0.055));
  g.add(box(MAT.trim, 4.6, 0.07, 0.16, 0, 0.52, 0.1, false));        // pen tray
  [-1.2, -0.9, -0.6].forEach((x, i) => {
    g.add(cyl([MAT.amber, MAT.dark, MAT.plant][i], 0.03, 0.16, x, 0.58, 0.12, true).rotateZ(Math.PI / 2));
  });
  return g;
}

/* ---- reception ---------------------------------------------------------- */
function makeReception(signMat, hideBackdrop) {
  const g = group();
  // curved counter
  const front = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.7, 1.06, 26, 1, true),
    MAT.wood
  );
  front.position.y = 0.53; front.castShadow = !STATE.mobile;
  g.add(front);
  const top = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.88, 26),
    MAT.deskTop
  );
  top.rotation.x = -Math.PI / 2; top.position.y = 1.07;
  g.add(top);
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 1.04, 24, 1, true),
    MAT.trim
  );
  inner.position.y = 0.52; g.add(inner);
  g.add(box(MAT.wood, 3.3, 0.1, 1.0, 0, 1.05, -0.9));               // work surface behind
  // faces the visitor side of the counter — nobody sits behind this desk now,
  // so a screen showing its back read as a mistake
  g.add(makeMonitor('code', 0.8).translateY(1.1).translateZ(-0.85));

  // backdrop with the name on it
  if (hideBackdrop) return g;
  const bd = group(0, 0, -2.2);
  bd.add(box(MAT.wallDark, 6.4, 3.1, 0.16, 0, 1.6, 0, false));
  bd.add(plane(signMat || MAT.logo, 5.6, 1.4, 0, 1.9, 0.09));
  bd.add(box(MAT.amber, 6.4, 0.06, 0.2, 0, 0.16, 0.02, false));
  g.add(bd);

  return g;
}

/* ---- lounge + coffee ---------------------------------------------------- */
function makeSofa(w) {
  const g = group();
  g.add(box(MAT.fabricW, w, 0.34, 0.95, 0, 0.28, 0));
  g.add(box(MAT.fabricW, w, 0.62, 0.24, 0, 0.62, -0.42));
  g.add(box(MAT.fabricW, 0.22, 0.44, 0.95, -w / 2 + 0.11, 0.6, 0));
  g.add(box(MAT.fabricW, 0.22, 0.44, 0.95, w / 2 - 0.11, 0.6, 0));
  for (let i = 0; i < 4; i++) g.add(cyl(MAT.dark, 0.04, 0.16, (-w / 2 + 0.3) + (i % 2) * (w - 0.6), 0.08, i < 2 ? 0.35 : -0.35, true));
  return g;
}

function makeLounge() {
  const g = group();

  const s1 = makeSofa(2.6); s1.position.set(-2.6, 0, 0); s1.rotation.y = Math.PI / 2; g.add(s1);
  const s2 = makeSofa(2.2); s2.position.set(2.6, 0, 0); s2.rotation.y = -Math.PI / 2; g.add(s2);

  // coffee table + the side-project laptop
  g.add(box(MAT.wood, 1.7, 0.09, 0.95, 0, 0.44, 0));
  [[-0.72, -0.36], [0.72, -0.36], [-0.72, 0.36], [0.72, 0.36]].forEach(([x, z]) =>
    g.add(cyl(MAT.metal, 0.035, 0.44, x, 0.22, z, true)));
  g.add(box(MAT.paper, 0.34, 0.03, 0.26, 0.52, 0.5, 0.14, false));

  return g;
}

function makeLaptop() {
  const g = group();
  g.add(box(MAT.metal, 0.62, 0.03, 0.44, 0, 0.015, 0));
  g.add(box(MAT.darker, 0.54, 0.012, 0.3, 0, 0.033, 0.03, false));
  const lid = group(0, 0.02, -0.22);
  lid.rotation.x = -1.24;
  lid.add(box(MAT.metal, 0.62, 0.42, 0.02, 0, 0.21, 0));
  lid.add(plane(MAT.screen.code, 0.56, 0.36, 0, 0.21, 0.014));
  g.add(lid);
  return g;
}

function makeCoffeePoint() {
  const g = group();
  g.add(box(MAT.wallDark, 4.6, 0.9, 0.7, 0, 0.45, 0));               // cabinet
  g.add(box(MAT.deskTop, 4.8, 0.1, 0.78, 0, 0.94, 0));               // counter
  // machine
  const m = group(-1.1, 0.99, 0.02);
  m.add(box(MAT.darker, 0.62, 0.78, 0.5, 0, 0.39, 0));
  m.add(box(MAT.metal, 0.5, 0.1, 0.06, 0, 0.5, 0.26, false));
  m.add(box(MAT.amber, 0.14, 0.06, 0.04, 0.16, 0.66, 0.26, false));
  m.add(box(MAT.metal, 0.44, 0.03, 0.3, 0, 0.03, 0.2, false));
  m.add(cyl(MAT.paper, 0.06, 0.11, 0, 0.09, 0.2, true));
  g.add(m);
  // cups + kettle
  for (let i = 0; i < 4; i++) g.add(cyl(MAT.paper, 0.05, 0.1, 0.3 + i * 0.18, 1.04, 0.12, true));
  g.add(cyl(MAT.metal, 0.13, 0.28, 1.5, 1.13, 0, true));
  g.add(box(MAT.wood, 3.4, 0.08, 0.3, 0, 2.1, -0.2, false));         // shelf
  for (let i = 0; i < 9; i++) {
    g.add(box(i % 3 ? MAT.paper : MAT.amber, 0.09, 0.28, 0.2, -1.3 + i * 0.32, 2.28, -0.2, false));
  }
  return g;
}

/* ---- bookshelf (education) ---------------------------------------------- */
function makeBookshelf() {
  const g = group();
  g.add(box(MAT.wood, 4.6, 2.4, 0.42, 0, 1.2, 0));
  g.add(box(MAT.darker, 4.4, 2.2, 0.06, 0, 1.2, -0.2, false));
  for (let s = 0; s < 3; s++) {
    const y = 0.62 + s * 0.66;
    g.add(box(MAT.wood, 4.4, 0.05, 0.4, 0, y, 0.01, false));
    let x = -2.05;
    while (x < 1.9) {
      const w = 0.07 + Math.random() * 0.09;
      const h = 0.34 + Math.random() * 0.16;
      const cols = [MAT.amber, MAT.fabric, MAT.plant, MAT.pot, MAT.dark, MAT.trim];
      const bk = box(cols[(Math.random() * cols.length) | 0], w, h, 0.26, x + w / 2, y + h / 2 + 0.03, 0.02, false);
      if (Math.random() > 0.86) { bk.rotation.z = 0.22; bk.position.x += 0.06; }
      g.add(bk);
      x += w + 0.012;
    }
  }
  g.add(box(MAT.amber, 0.2, 0.3, 0.2, 1.7, 2.55, 0, false));         // little trophy
  g.add(cyl(MAT.metal, 0.12, 0.06, 1.7, 2.42, 0, true));
  return g;
}

/* ---- misc props --------------------------------------------------------- */
function makeBreakoutTable() {
  const g = group();
  g.add(cyl(MAT.wood, 0.62, 0.08, 0, 1.02, 0, true));
  g.add(cyl(MAT.metal, 0.06, 1.0, 0, 0.5, 0, true));
  g.add(cyl(MAT.dark, 0.42, 0.05, 0, 0.03, 0, true));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const st = group(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15);
    st.add(cyl(MAT.fabric, 0.22, 0.09, 0, 0.72, 0, true));
    st.add(cyl(MAT.metal, 0.05, 0.7, 0, 0.35, 0, true));
    st.add(cyl(MAT.dark, 0.24, 0.04, 0, 0.02, 0, true));
    g.add(st);
  }
  g.add(cyl(MAT.paper, 0.06, 0.12, 0.2, 1.12, 0.1, true));
  return g;
}

function makeExitSign() {
  const g = group();
  g.add(box(MAT.wallDark, 2.4, 0.7, 0.12, 0, 2.6, 0, false));
  g.add(plane(MAT.exitSig, 2.2, 0.6, 0, 2.6, 0.07));
  g.add(box(MAT.amber, 2.4, 0.05, 0.14, 0, 2.22, 0.01, false));
  return g;
}

/* ==========================================================================
   6b · DOORS, PLAQUES AND THE CHARACTER
   ========================================================================== */
const TIERMAT = {};
function buildTierMaterials() {
  Object.keys(TIERS).forEach(k => {
    const t = TIERS[k];
    TIERMAT[k] = {
      metal: new THREE.MeshStandardMaterial({ color: t.base, metalness: t.metal, roughness: t.rough }),
      glow: new THREE.MeshBasicMaterial({ color: t.glow, toneMapped: false }),
      soft: new THREE.MeshBasicMaterial({ color: t.glow, transparent: true, opacity: 0.34, toneMapped: false, depthWrite: false })
    };
  });
  // "your project here" screen for the vacant desk
  MAT.screen.vacant = new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: makeTex(384, 240, (x, w, h) => {
      x.fillStyle = '#10141C'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#171D28'; x.fillRect(0, 0, w, 22);
      x.fillStyle = '#B9A7FF'; x.fillRect(0, 0, 4, 22);
      x.fillStyle = '#7F8B9E'; x.font = '600 11px ui-monospace,monospace';
      x.fillText('untitled — new project', 12, 15);
      x.strokeStyle = '#2A3446'; x.lineWidth = 2; x.setLineDash([7, 7]);
      x.strokeRect(30, 48, 324, 150); x.setLineDash([]);
      x.fillStyle = '#4A5468'; x.font = '600 17px ui-sans-serif,sans-serif';
      x.textAlign = 'center';
      x.fillText('your product goes here', w / 2, 128);
      x.font = '12px ui-monospace,monospace';
      x.fillStyle = '#38415280'; x.fillText('git init', w / 2, 156);
    })
  });
}

function plaqueTexture(door) {
  const t = TIERS[door.tier];
  return makeTex(640, 200, (x, w, h) => {
    x.fillStyle = '#141821'; x.fillRect(0, 0, w, h);
    x.fillStyle = t.css; x.fillRect(0, 0, w, 5);
    x.fillStyle = t.css; x.font = '600 17px ui-monospace,monospace';
    x.fillText(door.tierLabel.toUpperCase() + '  ·  ' + door.span.toUpperCase(), 30, 50);
    x.fillStyle = '#F2F4F8'; x.font = '700 33px ui-sans-serif,sans-serif';
    x.fillText(door.company.replace(' Pvt. Ltd.', '').replace(' Private Limited', ''), 30, 97);
    x.fillStyle = '#98A2B3'; x.font = '20px ui-sans-serif,sans-serif';
    x.fillText(door.role, 30, 132);
    x.fillStyle = '#6A748A'; x.font = '17px ui-monospace,monospace';
    x.fillText(door.when, 30, 166);
  });
}

function makeDoor(door) {
  const T = TIERMAT[door.tier];
  const g = new THREE.Group();
  const OW = 2.9, OH = 3.15;          // opening

  // dark portal behind the leaves
  g.add(box(MAT.darker, OW, OH, 0.3, 0, OH / 2, -0.3, false));

  // frame
  g.add(box(T.metal, 0.26, OH + 0.34, 0.42, -OW / 2 - 0.13, (OH + 0.34) / 2, 0));
  g.add(box(T.metal, 0.26, OH + 0.34, 0.42, OW / 2 + 0.13, (OH + 0.34) / 2, 0));
  g.add(box(T.metal, OW + 0.52, 0.3, 0.42, 0, OH + 0.19, 0));

  // leaves
  const leaves = [];
  [-1, 1].forEach(side => {
    const pivot = group(side * (OW / 2), 0, 0);
    const lw = OW / 2;
    const leaf = new THREE.Group();
    leaf.position.x = -side * lw / 2;
    leaf.add(box(T.metal, lw - 0.03, OH - 0.06, 0.085, 0, OH / 2, 0));
    if (door.tier === 'diamond') {
      for (let i = 0; i < 3; i++) {
        const gem = mesh(GEO.ico, T.glow, 0.16, 0.22, 0.16, 0, 2.35 - i * 0.3, side * 0.07, false);
        gem.rotation.z = 0.5; leaf.add(gem);
      }
    }
    leaf.add(cyl(T.metal, 0.035, 0.44, -side * (lw / 2 - 0.22), 1.12, side * 0.09, true));
    pivot.add(leaf);
    g.add(pivot);
    leaves.push(pivot);
  });

  // plaque above the door
  const pl = group(0, OH + 0.72, 0.06);
  pl.add(box(MAT.darker, 3.3, 1.03, 0.09, 0, 0, 0, false));
  pl.add(plane(signage(new THREE.MeshBasicMaterial({ map: plaqueTexture(door), toneMapped: false }), () => plaqueTexture(door)), 3.2, 1.0, 0, 0, 0.055));
  g.add(pl);

  // floor light spilling out of the door
  const strip = new THREE.Mesh(GEO.plane, T.soft);
  strip.rotation.x = -Math.PI / 2;
  strip.scale.set(OW - 0.2, 2.4, 1);
  strip.position.set(0, 0.02, 1.35);
  g.add(strip);

  const rec = { group: g, leaves, open: 0, want: 0, door };
  ANIMATED.push({
    fn: (t, dt) => {
      if (Math.abs(rec.want - rec.open) < 0.001) return;
      rec.open += (rec.want - rec.open) * Math.min(1, dt * 3.4);
      leaves[0].rotation.y = rec.open * 1.55;
      leaves[1].rotation.y = -rec.open * 1.55;
    }
  });
  return rec;
}

/* ---- portal back to the lobby ------------------------------------------ */
function makeExitPortal() {
  const g = new THREE.Group();
  const top = (typeof WALL_H === 'number' ? WALL_H : 3.9);
  const OW = 3.82, OH = 3.55, T = 0.3, JW = 0.09;   // T is exactly the wall thickness
  // every part lives between z = 0 and z = T, so the frame sits inside the wall
  // line instead of standing proud of it
  g.add(box(MAT.darker, OW, OH, T + 0.01, 0, OH / 2, T / 2, false));
  g.add(box(MAT.metal, JW, OH + 0.14, T, -OW / 2 - JW / 2, (OH + 0.14) / 2, T / 2));
  g.add(box(MAT.metal, JW, OH + 0.14, T, OW / 2 + JW / 2, (OH + 0.14) / 2, T / 2));
  g.add(box(MAT.metal, OW + JW * 2, 0.14, T, 0, OH + 0.07, T / 2));
  g.add(box(MAT.wallWhite, OW + JW * 2, top - OH - 0.14, T, 0, (OH + 0.14 + top) / 2, T / 2, false));
  const sign = plane(new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: makeTex(320, 96, (x, w, h) => {
      x.fillStyle = '#0F1319'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#7ED9A7'; x.font = '700 38px ui-sans-serif,sans-serif';
      x.textAlign = 'center'; x.fillText('LOBBY', w / 2, 62);
    })
  }), 1.9, 0.5, 0, OH + 0.42, -0.02);
  sign.rotation.y = Math.PI;                        // faces back into the office
  g.add(box(MAT.blackSoft, 2.0, 0.58, 0.05, 0, OH + 0.42, 0.012, false));
  g.add(sign);
  const glow = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({
    color: 0x7ED9A7, transparent: true, opacity: 0.26, toneMapped: false, depthWrite: false
  }));
  glow.rotation.x = -Math.PI / 2; glow.scale.set(OW, 2, 1); glow.position.set(0, 0.02, -1.1);
  g.add(glow);
  return g;
}

/* ---- wall plaque describing the role ----------------------------------- */
function rolePlaqueTexture(door) {
  const t = TIERS[door.tier];
  return makeTex(600, 380, (x, w, h) => {
      x.fillStyle = '#151A23'; x.fillRect(0, 0, w, h);
      x.fillStyle = t.css; x.fillRect(0, 0, 8, h);
      x.fillStyle = t.css; x.font = '600 16px ui-monospace,monospace';
      x.fillText(door.tierLabel.toUpperCase(), 34, 48);
      x.fillStyle = '#F2F4F8'; x.font = '700 30px ui-sans-serif,sans-serif';
      x.fillText(door.company.replace(' Pvt. Ltd.', '').replace(' Private Limited', ''), 34, 96);
      x.fillStyle = '#98A2B3'; x.font = '19px ui-sans-serif,sans-serif';
      x.fillText(door.role + '  ·  ' + door.when, 34, 128);
      x.strokeStyle = '#2A3140'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(34, 152); x.lineTo(w - 34, 152); x.stroke();
      x.fillStyle = '#C3CCDA'; x.font = '600 21px ui-sans-serif,sans-serif';
      x.fillText(door.headline, 34, 190);
      x.fillStyle = '#7F8B9E'; x.font = '17px ui-monospace,monospace';
      door.stack.slice(0, 4).forEach((s, i) => x.fillText('· ' + s, 34, 228 + i * 30));
      x.fillStyle = t.css; x.font = '15px ui-monospace,monospace';
      x.fillText('click for the full story', 34, 355);
  });
}

function makeRolePlaque(door) {
  const g = new THREE.Group();
  g.add(box(MAT.darker, 3.0, 1.9, 0.1, 0, 1.9, 0, false));
  g.add(plane(signage(new THREE.MeshBasicMaterial({ map: rolePlaqueTexture(door), toneMapped: false }),
    () => rolePlaqueTexture(door)), 2.9, 1.8, 0, 1.9, 0.06));
  g.add(box(TIERMAT[door.tier].glow, 3.0, 0.04, 0.12, 0, 0.94, 0.02, false));
  return g;
}
