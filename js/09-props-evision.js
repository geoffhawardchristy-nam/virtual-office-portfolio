/* ==========================================================================
   6f · THE EVISION FLOOR
   Its own furniture: long bench runs split by a fabric pinboard, partitioned
   cubicles, and the small solid rooms round the edge.
   ========================================================================== */

/* ---- a bench run: two rows of desks back to back, with a pinboard between
        them that people actually stick notes to ------------------------------ */
/* board:false leaves off the centre panel — for a run with seats on one side
   only, where there is nobody opposite to screen off */
function makeBenchRun(W, D, opts) {
  const g = new THREE.Group();
  const top = 0.75;
  const withBoard = !(opts && opts.board === false);

  g.add(box(MAT.deskTop, W, 0.07, D, 0, top, 0));
  g.add(box(MAT.wood, W + 0.04, 0.03, D + 0.04, 0, top - 0.05, 0, false));   // edge band
  g.add(box(MAT.metal, 0.09, 0.7, D - 0.2, -W / 2 + 0.15, 0.36, 0));         // end legs
  g.add(box(MAT.metal, 0.09, 0.7, D - 0.2, W / 2 - 0.15, 0.36, 0));
  g.add(box(MAT.metal, W - 0.6, 0.07, 0.07, 0, 0.26, 0, true));              // stretcher
  g.add(box(MAT.dark, W - 0.8, 0.09, 0.22, 0, 0.62, 0, false));              // cable tray

  if (!withBoard) return g;

  // a run with seats on one side gets a back panel instead of a pinboard
  const boardH = 0.5;
  g.add(box(MAT.fabric, W - 0.1, boardH, 0.06, 0, top + boardH / 2 + 0.02, 0));
  g.add(box(MAT.metal, W - 0.1, 0.035, 0.09, 0, top + boardH + 0.05, 0, false));

  // sticky notes on both faces
  const noteCols = [0xF5D44A, 0xF08FB0, 0x8FD0F0, 0xA8E08F];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const n = new THREE.Mesh(GEO.plane,
      new THREE.MeshBasicMaterial({ color: noteCols[i % noteCols.length], toneMapped: false }));
    n.scale.set(0.16, 0.16, 1);
    n.position.set(-W / 2 + 0.5 + Math.random() * (W - 1),
      top + 0.14 + Math.random() * (boardH - 0.24), side * 0.035);
    n.rotation.y = side > 0 ? 0 : Math.PI;
    n.rotation.z = (Math.random() - 0.5) * 0.28;
    g.add(n);
    g.add(cyl(MAT.metal, 0.012, 0.02, n.position.x, n.position.y + 0.05, side * 0.05, true));
  }
  return g;
}

/* ---- a partitioned cubicle ------------------------------------------------ */
function makeCubicle(W, D, label, bays) {
  const g = new THREE.Group();
  W = W || 3.1; D = D || 3.1;
  const H = 1.35, T = 0.09;

  // three screens, open toward +z
  g.add(box(MAT.fabric, W, H, T, 0, H / 2, -D / 2));
  g.add(box(MAT.fabric, T, H, D, -W / 2, H / 2, 0));
  g.add(box(MAT.fabric, T, H, D, W / 2, H / 2, 0));
  [[W, 0, -D / 2], [T, -W / 2, 0], [T, W / 2, 0]].forEach(([sw, x, z], i) => {
    g.add(box(MAT.trim, i ? T + 0.03 : sw + 0.03, 0.05, i ? D : T + 0.03, x, H, z, false));
  });

  if (bays > 1) {
    // several side by side, with nothing between them but a screen
    for (let i = 1; i < bays; i++) {
      const sx = -W / 2 + (W / bays) * i;
      g.add(box(MAT.fabric, T, H - 0.18, D - 0.25, sx, (H - 0.18) / 2, 0.12));
      g.add(box(MAT.trim, T + 0.03, 0.05, D - 0.25, sx, H - 0.18, 0.12, false));
    }

    Array.from({ length: bays }, (_, i) => i).forEach(i => {
      const cx = -W / 2 + (W / bays) * (i + 0.5);
      const dw = W / bays - 0.32;
      g.add(box(MAT.deskTop, dw, 0.06, 0.72, cx, 0.75, -D / 2 + 0.44));
      g.add(box(MAT.wood, dw + 0.03, 0.03, 0.75, cx, 0.71, -D / 2 + 0.44, false));
      g.add(box(MAT.metal, 0.07, 0.72, 0.62, cx + dw / 2 - 0.1, 0.37, -D / 2 + 0.44));
      g.add(box(MAT.dark, dw - 0.3, 0.08, 0.2, cx, 0.62, -D / 2 + 0.44, false));

      const mon = makeMonitor('code', 0.85);
      mon.position.set(cx, 0.78, -D / 2 + 0.36);
      g.add(mon);
      g.add(box(MAT.darker, 0.55, 0.02, 0.18, cx, 0.8, -D / 2 + 0.86, false));

      const ch = makeChair(MAT.fabric);
      ch.position.set(cx, 0, -D / 2 + 1.32);
      g.add(ch);
    });
    g.add(cyl(MAT.paper, 0.05, 0.1, -W / 2 + 0.6, 0.83, -D / 2 + 0.75, true));
  } else {
    // an L of worktop inside
    g.add(box(MAT.deskTop, W - 0.3, 0.06, 0.7, 0, 0.75, -D / 2 + 0.42));
    g.add(box(MAT.deskTop, 0.7, 0.06, D - 1.2, -W / 2 + 0.5, 0.75, 0.15));
    g.add(box(MAT.metal, 0.07, 0.72, 0.6, W / 2 - 0.35, 0.37, -D / 2 + 0.42));
    g.add(box(MAT.dark, 0.7, 0.5, 0.5, -W / 2 + 0.5, 0.25, 0.6));              // drawers

    const mon = makeMonitor('code', 0.9);
    mon.position.set(0.1, 0.78, -D / 2 + 0.34);
    g.add(mon);
    g.add(box(MAT.darker, 0.6, 0.02, 0.19, 0.1, 0.8, -D / 2 + 0.86, false));
    g.add(cyl(MAT.paper, 0.05, 0.1, -W / 2 + 0.55, 0.83, -0.2, true));
  }

  if (label) {
    g.add(box(MAT.darker, 0.86, 0.26, 0.05, 0, H - 0.22, -D / 2 + 0.08, false));
    g.add(plane(new THREE.MeshBasicMaterial({
      toneMapped: false,
      map: makeTex(320, 96, (x, w2, h2) => {
        x.fillStyle = '#12151B'; x.fillRect(0, 0, w2, h2);
        x.fillStyle = '#7FB2FF'; x.fillRect(0, h2 - 6, w2, 6);
        x.fillStyle = '#E8ECF3'; x.font = '700 40px ui-sans-serif,Arial,sans-serif';
        x.textAlign = 'center'; x.fillText(String(label).toUpperCase(), w2 / 2, 58);
      })
    }), 0.8, 0.22, 0, H - 0.22, -D / 2 + 0.11));
  }

  if (!(bays > 1)) {
    const ch = makeChair(MAT.fabric);
    ch.position.set(0.1, 0, -D / 2 + 1.35);
    g.add(ch);
  }
  return g;
}

/* ---- the small solid rooms: store and server ------------------------------ */
function makeUtilityRoom(W, D, label, kind, omit) {
  const g = new THREE.Group();
  const H = (typeof WALL_H === 'number' ? WALL_H : 3.9) * 0.95;
  const DH = 2.24, hw = W / 2, hd = D / 2, T = 0.16;

  const wall = (ww, x, z, ry) => {
    const m = box(MAT.wall, ww, H, T, x, H / 2, z, false);
    m.rotation.y = ry || 0; g.add(m);
  };
  omit = omit || {};
  if (!omit.back) wall(W, 0, -hd, 0);      // skipped when the room's own wall is there
  if (!omit.xneg) wall(D, -hw, 0, Math.PI / 2);
  if (!omit.xpos) wall(D, hw, 0, Math.PI / 2);
  const doorW = 1.0, seg = (W - doorW) / 2;
  wall(seg, -(doorW / 2 + seg / 2), hd, 0);
  wall(seg, (doorW / 2 + seg / 2), hd, 0);
  g.add(box(MAT.wall, doorW + 0.1, H - DH - 0.1, T, 0, (DH + H) / 2 + 0.05, hd, false));
  g.add(box(MAT.metal, doorW + 0.12, 0.1, T + 0.04, 0, DH, hd, false));
  g.add(box(MAT.metal, 0.06, DH, T + 0.04, -doorW / 2, DH / 2, hd, false));
  g.add(box(MAT.metal, 0.06, DH, T + 0.04, doorW / 2, DH / 2, hd, false));
  g.add(box(MAT.deskTop, doorW - 0.08, DH - 0.1, 0.05, 0, (DH - 0.1) / 2 + 0.03, hd + 0.02, false));
  g.add(box(MAT.metal, 0.13, 0.03, 0.03, -doorW * 0.28, 1.04, hd + 0.06, false));

  // name over the door
  g.add(box(MAT.darker, 1.0, 0.34, 0.05, 0, DH + 0.3, hd + 0.1, false));
  g.add(plane(new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: makeTex(320, 96, (x, w2, h2) => {
      x.fillStyle = '#12151B'; x.fillRect(0, 0, w2, h2);
      x.fillStyle = '#F5A524'; x.fillRect(0, h2 - 5, w2, 5);
      x.fillStyle = '#E8ECF3'; x.font = '700 34px ui-sans-serif,Arial,sans-serif';
      x.textAlign = 'center'; x.fillText(String(label).toUpperCase(), w2 / 2, 56);
    })
  }), 0.94, 0.3, 0, DH + 0.3, hd + 0.13));

  if (kind === 'server') {
    // racks with a lot of blinking gear
    const racks = Math.max(2, Math.floor((W - 0.5) / 1.05));
    for (let r = 0; r < racks; r++) {
      const rx = -hw + 0.55 + r * 1.05;
      g.add(box(MAT.darker, 0.9, 2.0, 0.75, rx, 1.0, -hd + 0.6));
      for (let u = 0; u < 12; u++) {
        g.add(box(MAT.dark, 0.82, 0.14, 0.05, rx, 0.28 + u * 0.2, -hd + 0.99, false));
        for (let k = 0; k < 4; k++) {
          g.add(box(k % 2 ? MAT.plant : MAT.amber, 0.03, 0.02, 0.01,
            rx - 0.3 + k * 0.09, 0.28 + u * 0.2, -hd + 1.02, false));
        }
      }
    }
    const ac = makeAC();                       // the real unit, badge and all
    ac.position.set(0, H - 0.7, -hd + 0.15);
    g.add(ac);
  } else {
    // open shelving stacked with boxes
    for (let s = 0; s < 4; s++) {
      const y = 0.42 + s * 0.66;
      g.add(box(MAT.metal, W - 0.5, 0.05, 0.55, 0, y, -hd + 0.45, false));
      let bx = -W / 2 + 0.45;
      while (bx < W / 2 - 0.5) {
        const bw = 0.32 + Math.random() * 0.28;
        g.add(box(Math.random() > 0.5 ? MAT.pot : MAT.wood, bw, 0.3, 0.42,
          bx + bw / 2, y + 0.18, -hd + 0.45, false));
        bx += bw + 0.06;
      }
    }
    // more of it stacked on the floor as well
    for (let i = 0; i < 5; i++) {
      const bx = -hw + 0.6 + i * ((W - 1.2) / 5);
      g.add(box(i % 2 ? MAT.pot : MAT.wood, 0.46, 0.38, 0.4, bx, 0.19, hd - 0.75, false));
      if (i % 2) g.add(box(MAT.wood, 0.4, 0.34, 0.34, bx, 0.55, hd - 0.77, false));
    }
  }
  return g;
}

/* ---- a run of lockers with a charging shelf ------------------------------- */
function makeLockerRun(len, bays) {
  const g = new THREE.Group();
  bays = bays || Math.max(3, Math.round(len / 1.1));
  const H = 2.0, D = 0.5, cw = len / bays;
  g.add(box(MAT.deskTop, len, H, D, 0, H / 2, 0));
  g.add(box(MAT.trim, len + 0.06, 0.06, D + 0.06, 0, H + 0.03, 0, false));
  g.add(box(MAT.dark, len, 0.1, D, 0, 0.05, 0, false));
  for (let b = 0; b < bays; b++) {
    const cx = -len / 2 + cw * (b + 0.5);
    if (b) g.add(box(MAT.trim, 0.04, H - 0.2, D, -len / 2 + cw * b, H / 2, 0, false));
    // two doors per bay
    [0.62, 1.42].forEach((cy, i) => {
      g.add(box(MAT.deskTop, cw - 0.09, 0.72, 0.04, cx, cy, D / 2 + 0.03, false));
      g.add(box(MAT.metal, 0.09, 0.03, 0.03, cx + cw / 2 - 0.16, cy, D / 2 + 0.06, false));
      if ((b + i) % 3 === 0) {
        g.add(box(MAT.darker, 0.05, 0.05, 0.02, cx - cw * 0.2, cy + 0.2, D / 2 + 0.06, false));
      }
    });
  }
  // charging shelf on top: a couple of laptops and a phone
  g.add(box(MAT.wood, len - 0.2, 0.05, D - 0.08, 0, H + 0.09, 0, false));
  for (let i = 0; i < 2; i++) {
    const lp = makeLaptop();
    lp.position.set(-len * 0.22 + i * len * 0.38, H + 0.12, 0);
    lp.rotation.y = 0.4 - i * 0.7;
    lp.scale.setScalar(0.85);
    g.add(lp);
  }
  g.add(box(MAT.darker, 0.09, 0.02, 0.17, len * 0.36, H + 0.13, 0.02, false));   // phone
  return g;
}

/* ---- the bench where old kit gets stripped and rebuilt --------------------
   Seats on one side only; the back sits against the wall and the top is
   covered in pulled parts. */
function makeHardwareBench(W, seats) {
  const g = new THREE.Group();
  const D = 0.9, top = 0.75;
  seats = seats || 4;

  g.add(box(MAT.deskTop, W, 0.07, D, 0, top, 0));
  g.add(box(MAT.wood, W + 0.04, 0.03, D + 0.04, 0, top - 0.05, 0, false));
  g.add(box(MAT.metal, 0.09, 0.7, D - 0.2, -W / 2 + 0.15, 0.36, 0));
  g.add(box(MAT.metal, 0.09, 0.7, D - 0.2, W / 2 - 0.15, 0.36, 0));
  g.add(box(MAT.metal, W - 0.5, 0.06, 0.06, 0, 0.24, 0, true));
  g.add(box(MAT.dark, W - 0.4, 0.5, 0.04, 0, 0.5, -D / 2 + 0.04, false));   // back panel
  g.add(box(MAT.metal, W - 0.5, 0.04, D - 0.34, 0, 0.32, 0.02, false));     // under shelf

  for (let i = 0; i < seats; i++) {
    const cx = -W / 2 + (W / seats) * (i + 0.5);
    const ch = makeChair(MAT.fabric);
    ch.position.set(cx, 0, D / 2 + 0.55);
    g.add(ch);
  }

  const at = (frac) => -W / 2 + W * frac;

  // two towers, one with its side panel off and the innards showing
  [0.09, 0.19].forEach((fr, i) => {
    const x = at(fr);
    g.add(box(MAT.darker, 0.21, 0.44, 0.44, x, top + 0.25, -0.05));
    g.add(box(MAT.dark, 0.03, 0.36, 0.36, x + 0.11, top + 0.25, -0.05, false));
    for (let k = 0; k < 3; k++) {
      g.add(box(MAT.metal, 0.16, 0.02, 0.02, x, top + 0.4 - k * 0.06, 0.17, false));
    }
    if (i) {                                        // panel off, board visible
      g.add(box(MAT.plant, 0.02, 0.34, 0.32, x - 0.11, top + 0.24, -0.05, false));
      g.add(box(MAT.metal, 0.02, 0.1, 0.1, x - 0.13, top + 0.3, -0.12, false));
      g.add(box(MAT.deskTop, 0.2, 0.42, 0.02, x + 0.02, top + 0.25, 0.28, false));
    }
  });

  // laptops mid-bench, one open one shut
  const lp = makeLaptop(); lp.position.set(at(0.36), top + 0.04, 0); lp.rotation.y = 0.25; g.add(lp);
  g.add(box(MAT.darker, 0.36, 0.03, 0.26, at(0.47), top + 0.05, 0.02, false));
  g.add(box(MAT.dark, 0.34, 0.02, 0.24, at(0.47), top + 0.07, 0.02, false));

  // an anti-static tray of memory, plus loose sticks
  g.add(box(MAT.dark, 0.44, 0.05, 0.3, at(0.6), top + 0.06, -0.02, false));
  for (let i = 0; i < 5; i++) {
    g.add(box(MAT.plant, 0.135, 0.05, 0.012, at(0.6) - 0.14 + i * 0.07, top + 0.1, -0.02, false));
  }
  for (let i = 0; i < 3; i++) {
    const m = box(MAT.plant, 0.135, 0.012, 0.05, at(0.68) + i * 0.05, top + 0.045, 0.06 + i * 0.03, false);
    m.rotation.y = (Math.random() - 0.5) * 0.8;
    g.add(m);
  }

  // drives stacked, a coil of cable, and a screwdriver
  for (let i = 0; i < 3; i++) {
    g.add(box(MAT.metal, 0.17, 0.03, 0.13, at(0.78), top + 0.055 + i * 0.035, -0.04, false));
  }
  const coil = new THREE.Mesh(GEO.torus, MAT.darker);
  coil.scale.setScalar(0.13); coil.rotation.x = -Math.PI / 2;
  coil.position.set(at(0.86), top + 0.06, 0.05); g.add(coil);
  g.add(cyl(MAT.amber, 0.012, 0.2, at(0.92), top + 0.05, -0.02, true));
  g.add(box(MAT.paper, 0.2, 0.01, 0.14, at(0.95), top + 0.045, 0.12, false));
  return g;
}

/* ---- an open HR desk, facing whoever walks in ---------------------------- */
function makeHRDesk(W) {
  const g = new THREE.Group();
  W = W || 3.4;
  const D = 0.85, top = 0.75;

  g.add(box(MAT.deskTop, W, 0.07, D, 0, top, 0));
  g.add(box(MAT.wood, W + 0.05, 0.04, D + 0.05, 0, top - 0.06, 0, false));
  g.add(box(MAT.metal, 0.08, 0.72, D - 0.2, -W / 2 + 0.18, 0.36, 0));
  g.add(box(MAT.metal, 0.08, 0.72, D - 0.2, W / 2 - 0.18, 0.36, 0));

  // the counter face the visitor sees
  g.add(box(MAT.wallWhite, W, 0.68, 0.07, 0, 0.4, -D / 2 - 0.04));
  g.add(box(MAT.deskTop, W + 0.12, 0.07, 0.26, 0, 1.06, -D / 2 - 0.02, false));
  g.add(box(MAT.trim, W + 0.12, 0.04, 0.28, 0, 1.11, -D / 2 - 0.02, false));
  g.add(box(MAT.metal, 0.05, 0.3, 0.05, -W / 2 + 0.35, 0.9, -D / 2 - 0.06, false));
  g.add(box(MAT.metal, 0.05, 0.3, 0.05, W / 2 - 0.35, 0.9, -D / 2 - 0.06, false));

  g.add(plane(new THREE.MeshBasicMaterial({
    toneMapped: false,
    map: makeTex(384, 128, (x, w, h) => {
      x.fillStyle = '#1B1F27'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#7FB2FF'; x.fillRect(0, h - 7, w, 7);
      x.fillStyle = '#EDF1F7'; x.font = '700 54px ui-sans-serif,Arial,sans-serif';
      x.textAlign = 'center'; x.fillText('HR', w / 2, 78);
    })
  }), 0.7, 0.24, 0, 0.5, -D / 2 - 0.09));

  // the working side — one station on a short counter, two once it runs long
  // enough that a single seat would leave most of it bare.
  const n = W >= 2.4 ? 2 : 1;
  const stations = n === 1 ? [-0.2]
    : Array.from({ length: n }, (_, i) => -W / 2 + (W / n) * (i + 0.5));
  stations.forEach((cx) => {
    const mon = makeMonitor('code', 0.8);
    mon.position.set(cx - 0.2, 0.78, 0.08);
    g.add(mon);
    g.add(box(MAT.darker, 0.42, 0.02, 0.15, cx - 0.2, 0.8, 0.34, false));   // keyboard
    const ch = makeChair(MAT.fabric);
    ch.position.set(cx, 0, D / 2 + 0.62);
    g.add(ch);
  });

  // paperwork, pen pot and drawers share the counter between the stations
  g.add(box(MAT.paper, 0.26, 0.02, 0.19, 0.65, 0.79, 0.1, false));
  g.add(box(MAT.paper, 0.24, 0.03, 0.18, 0.62, 0.81, 0.14, false));
  g.add(cyl(MAT.metal, 0.045, 0.11, 1.05, 0.81, 0.05, true));
  g.add(box(MAT.dark, 0.5, 0.46, 0.5, W / 2 - 0.45, 0.23, 0.62, false));   // drawers
  return g;
}
