/* ==========================================================================
   5 · ROOM BUILDER
   Every scene — the lobby and all four offices — is built from this.
   Returns a group; pushes wall/furniture blockers into ctx.blockers so the
   character can't walk through anything.
   ========================================================================== */
const WALL_H = 3.9;
const TRANSOM_Y = 2.35;   // one horizontal line shared by the glazing and the glass cabins

function makeRoom(cfg, ctx) {
  const g = new THREE.Group();
  const w = cfg.w, d = cfg.d, hw = w / 2, hd = d / 2;
  const floorMat = floorMaterialFor(cfg);

  ctx.bounds = { x: hw - 0.85, z: hd - 0.85 };

  // floor + plinth
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = !STATE.mobile;
  g.add(floor);
  g.add(box(MAT.wallDark, w + 0.6, 0.5, d + 0.6, 0, -0.26, 0, false));

  // walls
  const addWall = (ww, x, z, ry) => {
    const m = box(TH.wall, ww, WALL_H, 0.3, x, WALL_H / 2, z, false);
    m.rotation.y = ry || 0; g.add(m);
    const b = box(TH.tile ? MAT.blackSoft : MAT.trim, ww, 0.16, 0.36, x, 0.08, z, false);
    b.rotation.y = ry || 0; g.add(b);
  };
  addWall(w, 0, -hd - 0.15, 0);
  // side walls run 0.3 long at each end so they close the corners; without the
  // overrun each corner was left with a 0.3 x 0.3 notch open to the outside
  addWall(d + 0.6, -hw - 0.15, 0, Math.PI / 2);
  addWall(d + 0.6, hw + 0.15, 0, Math.PI / 2);
  if (cfg.frontGap) {
    const gx = cfg.frontGapX || 0, hg = cfg.frontGap / 2;
    const l = (gx - hg) + hw, r = hw - (gx + hg);
    if (l > 0.2) addWall(l, (-hw + gx - hg) / 2, hd + 0.15, 0);
    if (r > 0.2) addWall(r, (gx + hg + hw) / 2, hd + 0.15, 0);
  } else addWall(w, 0, hd + 0.15, 0);

  const span = (len, pitch) => {
    const n = Math.max(1, Math.floor((len - 3) / pitch));
    const start = -((n - 1) * pitch) / 2;
    return Array.from({ length: n }, (_, i) => start + i * pitch);
  };
  const wnd = cfg.windows || {};
  const full = TH && TH.glazing === 'full';

  // ---- glazing. 'strip' = punched windows, 'full' = floor-to-ceiling curtain wall
  const stripBay = (x, y, z, gw, gh, ry) => {
    const q = group(x, y, z, ry);
    q.add(box(TH.pane, gw, gh, 0.06, 0, 0, 0, false));
    q.add(box(MAT.trim, gw + 0.16, 0.1, 0.15, 0, gh / 2, 0.07, false));
    q.add(box(MAT.trim, gw + 0.16, 0.1, 0.15, 0, -gh / 2, 0.07, false));
    q.add(box(MAT.trim, 0.1, gh, 0.15, -gw / 2, 0, 0.07, false));
    q.add(box(MAT.trim, 0.1, gh, 0.15, gw / 2, 0, 0.07, false));
    q.add(box(MAT.trim, 0.07, gh, 0.11, 0, 0, 0.07, false));
    g.add(q);
  };
  const curtainWall = (len, x, z, ry, hard) => {
    // corner to corner, and the head lands on the same line as the cabin and
    // washroom tops so there is no odd white band above the glass
    const sill = 0.14;
    const headY = (typeof WALL_H === 'number' ? WALL_H : 3.9) * 0.95;
    const run = len, H = headY - sill;
    const q = group(x, 0, z, ry);
    q.add(box(TH.pane, run, H, 0.05, 0, 0.14 + H / 2, 0, false));
    q.add(box(TH.frame, run + 0.2, 0.13, 0.16, 0, 0.14 + H, 0.06, false));   // head
    q.add(box(TH.frame, run + 0.2, 0.16, 0.18, 0, 0.1, 0.06, false));        // sill
    // split the run wherever a cabin wall meets this glazing, then subdivide
    // each span evenly, so the mullions line up with the cabin edges
    const stops = [-run / 2]
      .concat((hard || []).filter(p => p > -run / 2 + 0.4 && p < run / 2 - 0.4))
      .concat([run / 2])
      .sort((p, q2) => p - q2);
    const posts = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i], span = stops[i + 1] - from;
      const n = Math.max(1, Math.round(span / 2.3));
      for (let k = 0; k < n; k++) posts.push(from + (span * k) / n);
    }
    posts.push(run / 2);
    posts.forEach(px => q.add(box(TH.frame, 0.09, H, 0.16, px, 0.14 + H / 2, 0.06, false)));
    q.add(box(TH.frame, run, 0.06, 0.13, 0, TRANSOM_Y, 0.06, false));        // transom, on the shared line
    g.add(q);
  };
  const wallRun = (side) => (side === 'back' || side === 'front' ? w : d);
  ['back', 'front', 'right', 'left'].forEach(side => {
    if (!wnd[side]) return;
    // back and front run along x; left and right run along z
    const horiz = side === 'back' || side === 'front';
    const ry = side === 'back' ? 0 : side === 'front' ? Math.PI
      : (side === 'right' ? -Math.PI / 2 : Math.PI / 2);
    const px = horiz ? 0 : (side === 'right' ? hw + 0.02 : -hw - 0.02);
    const pz = side === 'back' ? -hd - 0.02 : side === 'front' ? hd + 0.02 : 0;
    if (full) curtainWall(wallRun(side), px, pz, ry, (cfg.mullionAt || {})[side]);
    else {
      // a layout can name exact window positions instead of an even run
      const spots = Array.isArray(wnd[side]) ? wnd[side] : span(wallRun(side), 5.8);
      const gw = (wnd.size && wnd.size[0]) || 4.3, gh = (wnd.size && wnd.size[1]) || 2.3;
      spots.forEach(o =>
        stripBay(horiz ? o : px, wnd.y || 2.15, horiz ? pz : o, gw, gh, ry));
    }
  });

  // ---- ceiling fittings. They read as switched-off hardware by day and
  //      light up at night, because MAT.light is registered as a lamp.
  // rooms with suspended rigs already have their lighting from the layout, so
  // only the plain ceilings get panels here
  if (cfg.lights !== 'none' && !(TH && TH.ceiling === 'rings')) {
    // a layout can name the spots worth lighting instead of taking a full grid
    const cells = cfg.lights || (() => {
      const out = [];
      span(w, 7.0).forEach(x => span(d, 6.2).forEach(z => out.push([x, z])));
      return out;
    })();
    const dummy = new THREE.Object3D();
    const panels = new THREE.InstancedMesh(GEO.box, MAT.light, cells.length);
    const rails = new THREE.InstancedMesh(GEO.box, MAT.trim, cells.length);
    cells.forEach((c, i) => {
      dummy.position.set(c[0], 3.6, c[1]); dummy.scale.set(2.4, 0.06, 0.55);
      dummy.updateMatrix(); panels.setMatrixAt(i, dummy.matrix);
      dummy.position.y = 3.66; dummy.scale.set(2.6, 0.06, 0.72);
      dummy.updateMatrix(); rails.setMatrixAt(i, dummy.matrix);
    });
    panels.instanceMatrix.needsUpdate = true;
    rails.instanceMatrix.needsUpdate = true;
    g.add(panels); g.add(rails);
  }


  return g;
}

/* rug helper */
function addRug(parent, mat, w, d, x, z) {
  const m = new THREE.Mesh(GEO.plane, mat);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(w, d, 1); m.position.set(x, 0.012, z);
  m.receiveShadow = !STATE.mobile;
  parent.add(m);
  return m;
}

/* collision helper — axis-aligned box the character gets pushed out of */
function blocker(ctx, x, z, hwid, hdep) {
  ctx.blockers.push({ x, z, hw: hwid, hd: hdep });
}

/* ---- plants ------------------------------------------------------------- */
function makePlant(kind, s, potMat) {
  const g = new THREE.Group();
  s = s || 1;
  g.add(cyl(potMat || (TH && TH.tile ? MAT.potWhite : MAT.pot), 0.3, 0.44, 0, 0.22, 0));
  g.add(cyl(MAT.darker, 0.27, 0.05, 0, 0.44, 0, true));
  if (kind === 'tree') {
    g.add(cyl(MAT.wood, 0.05, 1.1, 0, 0.95, 0, true));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.add(mesh(GEO.ico, i % 2 ? MAT.plant : MAT.plant2, 0.9, 0.7, 0.9,
        Math.cos(a) * 0.28, 1.45 + Math.sin(i * 2) * 0.18, Math.sin(a) * 0.28));
    }
    g.add(mesh(GEO.ico, MAT.plant, 1.15, 0.85, 1.15, 0, 1.72, 0));
  } else {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + Math.random();
      const bl = new THREE.Mesh(GEO.cone, i % 2 ? MAT.plant : MAT.plant2);
      bl.scale.set(0.34, 1.0 + Math.random() * 0.5, 0.12);
      bl.position.set(Math.cos(a) * 0.16, 0.95, Math.sin(a) * 0.16);
      bl.rotation.z = Math.cos(a) * 0.42;
      bl.rotation.x = -Math.sin(a) * 0.42;
      bl.castShadow = !STATE.mobile;
      g.add(bl);
    }
  }
  g.scale.setScalar(s);
  return g;
}
