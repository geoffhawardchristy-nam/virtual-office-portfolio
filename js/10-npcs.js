/* ==========================================================================
   7 · NPC CHARACTERS
   Stylised, low-poly, generic. Built from primitives — no external models.
   ========================================================================== */
const NPCGEO = {};
function buildNpcGeo() {
  NPCGEO.torso = new THREE.CylinderGeometry(0.205, 0.27, 0.6, 12);
  NPCGEO.hips = new THREE.CylinderGeometry(0.26, 0.24, 0.2, 12);
  NPCGEO.limb = new THREE.CylinderGeometry(0.072, 0.06, 1, 8);
  NPCGEO.head = new THREE.SphereGeometry(0.145, 16, 12);
  NPCGEO.hair = new THREE.SphereGeometry(0.152, 16, 10, 0, 6.3, 0, 1.5);
  NPCGEO.hand = new THREE.SphereGeometry(0.056, 8, 6);
}
const SKIN = [0xD8AE86, 0xB98862, 0xE7C4A0, 0x9C6B45];
const HAIR = [0x1E1A18, 0x2E2622, 0x3D2A1E];

function npcMat(color, rough) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.82 : rough });
}

function makeNPC(opts) {
  const o = opts || {};
  const g = group();
  const skin = npcMat(SKIN[(o.skin || 0) % SKIN.length]);
  const shirt = npcMat(o.shirt || 0x4A6FA5);
  const pants = npcMat(o.pants || 0x2F3540);
  const hairM = npcMat(HAIR[(o.hair || 0) % HAIR.length], 0.9);
  const M = (geo, mat, sx, sy, sz, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(sx, sy, sz); m.position.set(x, y, z);
    m.castShadow = !STATE.mobile;
    return m;
  };

  const body = group();
  const seated = !!o.seated;
  const hipY = seated ? 0.52 : 0.9;

  if (seated) {
    // thighs forward (-z), shins down
    [-0.13, 0.13].forEach(x => {
      body.add(M(GEO.box, pants, 0.19, 0.19, 0.46, x, hipY - 0.04, 0.23));
      body.add(M(NPCGEO.limb, pants, 1, 0.42, 1, x, hipY - 0.25, 0.44));
      body.add(M(GEO.box, npcMat(0x24282F), 0.16, 0.09, 0.26, x, hipY - 0.44, 0.52));
    });
  } else {
    [-0.11, 0.11].forEach(x => {
      body.add(M(NPCGEO.limb, pants, 1, 0.82, 1, x, hipY - 0.42, 0));
      body.add(M(GEO.box, npcMat(0x24282F), 0.16, 0.09, 0.27, x, 0.045, 0.03));
    });
  }

  body.add(M(NPCGEO.hips, pants, 1, 1, 1, 0, hipY + 0.06, 0));
  body.add(M(NPCGEO.torso, shirt, 1, 1, 1, 0, hipY + 0.44, 0));
  if (o.suit) {
    const jacket = npcMat(o.shirt || 0x2B3242, 0.85);
    body.add(M(GEO.box, jacket, 0.17, 0.56, 0.06, -0.12, hipY + 0.44, 0.2));       // lapel
    body.add(M(GEO.box, jacket, 0.17, 0.56, 0.06, 0.12, hipY + 0.44, 0.2));
    body.add(M(GEO.box, npcMat(0xF2F2F0, 0.85), 0.13, 0.44, 0.03, 0, hipY + 0.46, 0.205)); // shirt
    body.add(M(GEO.box, npcMat(o.tie || 0xB03A3A, 0.7), 0.05, 0.32, 0.02, 0, hipY + 0.42, 0.222)); // tie
  } else {
    body.add(M(GEO.box, npcMat(0xE9E6DF, 0.9), 0.1, 0.3, 0.03, 0, hipY + 0.5, 0.2));   // collar strip
  }
  body.add(M(GEO.box, npcMat(o.badge || 0xF5A524, 0.6), 0.075, 0.11, 0.02, 0.07, hipY + 0.3, 0.21)); // badge

  // arms
  const arms = [];
  [-1, 1].forEach(side => {
    const sh = group(side * 0.26, hipY + 0.6, 0);
    const upper = M(NPCGEO.limb, shirt, 0.92, 0.34, 0.92, 0, -0.17, 0);
    sh.add(upper);
    const fore = group(0, -0.34, 0);
    fore.add(M(NPCGEO.limb, skin, 0.86, 0.3, 0.86, 0, -0.15, 0));
    fore.add(M(NPCGEO.hand, skin, 1, 1, 1, 0, -0.31, 0));
    sh.add(fore);
    if (seated) { sh.rotation.x = -0.62; fore.rotation.x = -0.72; }
    else { sh.rotation.x = 0.12; sh.rotation.z = side * -0.1; fore.rotation.x = -0.28; }
    body.add(sh);
    arms.push({ sh, fore, side });
  });

  // head
  const neck = group(0, hipY + 0.74, 0);
  neck.add(M(NPCGEO.limb, skin, 0.8, 0.1, 0.8, 0, 0.03, 0));
  const head = group(0, 0.18, 0);
  head.add(M(NPCGEO.head, skin, 1, 1.1, 0.96, 0, 0, 0));
  if (o.curly) {
    const CURL = new THREE.SphereGeometry(0.055, 7, 5);
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const p = 0.25 + Math.random() * 0.95;
      const rr = 0.148 + Math.random() * 0.028;
      const cx = Math.sin(p) * Math.cos(a) * rr;
      const cz = Math.sin(p) * Math.sin(a) * rr;
      const cy = Math.cos(p) * rr + 0.026;
      if (cz > 0.085 && cy < 0.025) continue;                 // keep the face clear
      head.add(M(CURL, hairM, 0.85 + Math.random() * 0.5, 0.85 + Math.random() * 0.5,
        0.85 + Math.random() * 0.5, cx, cy, cz));
    }
  } else {
    head.add(M(NPCGEO.hair, hairM, 1, 1.02, 1, 0, 0.005, -0.008));
  }
  head.add(M(GEO.sphere, npcMat(0x1A1D22, 0.4), 0.038, 0.038, 0.02, -0.055, 0.01, 0.135));
  head.add(M(GEO.sphere, npcMat(0x1A1D22, 0.4), 0.038, 0.038, 0.02, 0.055, 0.01, 0.135));
  neck.add(head);
  body.add(neck);

  g.add(body);

  // idle motion — subtle, never distracting
  const phase = Math.random() * 6.3;
  ANIMATED.push({
    fn: (t) => {
      const s = Math.sin(t * 1.5 + phase);
      body.position.y = s * 0.012;
      head.rotation.y = Math.sin(t * 0.42 + phase) * 0.34;
      head.rotation.x = Math.sin(t * 0.7 + phase) * 0.05;
      if (seated) {
        arms.forEach((a, i) => {
          a.fore.rotation.x = -0.72 + Math.sin(t * 6.5 + phase + i * 1.7) * 0.055;
        });
        body.rotation.y = s * 0.02;
      } else {
        arms.forEach((a, i) => { a.sh.rotation.x = 0.12 + Math.sin(t * 1.2 + phase + i * 3) * 0.07; });
        body.rotation.y = Math.sin(t * 0.5 + phase) * 0.05;
      }
    }
  });

  return g;
}
