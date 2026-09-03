/* ==========================================================================
   7 · THE CHARACTER  (that's you — curly hair, walk cycle, no GLB needed)
   To swap in a real GLTF model later, replace the body of makeHero() and keep
   the same returned API: { group, tick(dt, speed) }.
   ========================================================================== */
function makeHero() {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xC08A5E, roughness: 0.8 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0xB65E33, roughness: 0.82 });
  const jeans = new THREE.MeshStandardMaterial({ color: 0x2E3646, roughness: 0.9 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x1A1E26, roughness: 0.7 });
  const curl = new THREE.MeshStandardMaterial({ color: 0x241C17, roughness: 0.95 });

  const LIMB = new THREE.CylinderGeometry(0.075, 0.062, 1, 8);
  const M = (geo, mat, sx, sy, sz, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(sx, sy, sz); m.position.set(x, y, z);
    m.castShadow = !STATE.mobile;
    return m;
  };

  const root = new THREE.Group();
  g.add(root);
  const HIP = 0.94;

  // legs with knees
  const legs = [];
  [-1, 1].forEach(side => {
    const hip = group(side * 0.13, HIP, 0);
    hip.add(M(LIMB, jeans, 1.15, 0.48, 1.15, 0, -0.24, 0));
    const knee = group(0, -0.47, 0);
    knee.add(M(LIMB, jeans, 1.0, 0.44, 1.0, 0, -0.22, 0));
    knee.add(M(GEO.box, shoe, 0.17, 0.1, 0.3, 0, -0.46, 0.06));
    hip.add(knee);
    root.add(hip);
    legs.push({ hip, knee, side });
  });

  // body
  root.add(M(new THREE.CylinderGeometry(0.245, 0.225, 0.22, 12), jeans, 1, 1, 1, 0, HIP + 0.06, 0));
  root.add(M(new THREE.CylinderGeometry(0.215, 0.26, 0.62, 12), shirt, 1, 1, 1, 0, HIP + 0.46, 0));
  root.add(M(GEO.box, new THREE.MeshStandardMaterial({ color: 0x1F242C, roughness: 0.9 }), 0.05, 0.34, 0.03, 0, HIP + 0.5, 0.21));
  root.add(M(GEO.box, MAT.amber, 0.08, 0.12, 0.02, 0.08, HIP + 0.3, 0.22));   // badge

  // arms with elbows
  const arms = [];
  [-1, 1].forEach(side => {
    const sh = group(side * 0.28, HIP + 0.66, 0);
    sh.add(M(LIMB, shirt, 0.95, 0.36, 0.95, 0, -0.18, 0));
    const el = group(0, -0.36, 0);
    el.add(M(LIMB, skin, 0.88, 0.32, 0.88, 0, -0.16, 0));
    el.add(M(new THREE.SphereGeometry(0.06, 8, 6), skin, 1, 1, 1, 0, -0.33, 0));
    sh.add(el);
    root.add(sh);
    arms.push({ sh, el, side });
  });

  // head + curly hair
  const neck = group(0, HIP + 0.8, 0);
  neck.add(M(LIMB, skin, 0.8, 0.1, 0.8, 0, 0.02, 0));
  const head = group(0, 0.2, 0);
  head.add(M(new THREE.SphereGeometry(0.15, 16, 12), skin, 1, 1.1, 0.97, 0, 0, 0));
  head.add(M(new THREE.SphereGeometry(0.032, 8, 6), new THREE.MeshStandardMaterial({ color: 0x191C22, roughness: 0.35 }), 1, 1, 0.5, -0.056, 0.015, 0.138));
  head.add(M(new THREE.SphereGeometry(0.032, 8, 6), new THREE.MeshStandardMaterial({ color: 0x191C22, roughness: 0.35 }), 1, 1, 0.5, 0.056, 0.015, 0.138));
  // curls: a cluster of small spheres over the skull
  const CURL = new THREE.SphereGeometry(0.062, 7, 5);
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const p = 0.24 + Math.random() * 0.95;             // polar, top-weighted
    const r = 0.152 + Math.random() * 0.03;
    const cx = Math.sin(p) * Math.cos(a) * r;
    const cz = Math.sin(p) * Math.sin(a) * r;
    const cy = Math.cos(p) * r + 0.028;
    if (cz > 0.09 && cy < 0.03) continue;              // keep the face clear
    const c = M(CURL, curl, 0.85 + Math.random() * 0.5, 0.85 + Math.random() * 0.5, 0.85 + Math.random() * 0.5, cx, cy, cz);
    head.add(c);
  }
  neck.add(head);
  root.add(neck);

  // grounding shadow for when real shadows are off
  const blob = new THREE.Mesh(GEO.disc, new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0.2, depthWrite: false
  }));
  blob.rotation.x = -Math.PI / 2; blob.scale.setScalar(0.86); blob.position.y = 0.02;
  g.add(blob);

  let phase = 0, amt = 0;
  return {
    group: g,
    head,
    tick(dt, speed) {
      const want = Math.min(1, speed / 4.2);
      amt += (want - amt) * Math.min(1, dt * 10);
      phase += dt * (4.2 + speed * 1.5) * (0.25 + amt);
      const sw = Math.sin(phase);
      legs.forEach(l => {
        const s = l.side > 0 ? sw : -sw;
        l.hip.rotation.x = s * 0.62 * amt;
        l.knee.rotation.x = Math.max(0, -(l.side > 0 ? Math.sin(phase - 0.7) : Math.sin(phase - 0.7 + Math.PI))) * 1.05 * amt;
      });
      arms.forEach(a => {
        const s = a.side > 0 ? -sw : sw;
        a.sh.rotation.x = s * 0.52 * amt + Math.sin(phase * 0.4) * 0.04 * (1 - amt);
        a.sh.rotation.z = a.side * (-0.08 - 0.04 * amt);
        a.el.rotation.x = -0.25 * amt - 0.1;
      });
      root.position.y = Math.abs(Math.sin(phase)) * 0.045 * amt;
      root.rotation.x = 0.07 * amt;
      head.rotation.y = Math.sin(phase * 0.28) * 0.18 * (1 - amt);
      head.rotation.z = -sw * 0.03 * amt;
    }
  };
}
