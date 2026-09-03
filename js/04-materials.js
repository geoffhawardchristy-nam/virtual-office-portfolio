/* ==========================================================================
   4 · SHARED MATERIALS + GEOMETRY CACHE
   Reused everywhere so the GPU keeps state changes low.
   ========================================================================== */
const MAT = {};
function buildMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  MAT.floor   = std({ map: TEX.floor, roughness: 0.72, metalness: 0.03 });
  MAT.carpet  = std({ map: TEX.carpet, roughness: 0.96 });
  MAT.carpetW = std({ map: TEX.carpetWarm, roughness: 0.96 });
  MAT.woodFloor = std({ map: TEX.woodFloor, roughness: 0.62, metalness: 0.02 });
  MAT.wall    = std({ color: 0xE9E6DF, roughness: 0.92 });
  MAT.wallDark= std({ color: 0x2C313A, roughness: 0.85 });
  MAT.trim    = std({ color: 0xB9B3A8, roughness: 0.7 });
  MAT.wood    = std({ map: TEX.wood, roughness: 0.55 });
  MAT.deskTop = std({ color: 0xEDEAE3, roughness: 0.42 });
  MAT.metal   = std({ color: 0x8A9099, roughness: 0.34, metalness: 0.62 });
  MAT.dark    = std({ color: 0x23272E, roughness: 0.55 });
  MAT.darker  = std({ color: 0x15181D, roughness: 0.6 });
  MAT.fabric  = std({ color: 0x39404A, roughness: 0.95 });
  MAT.fabricW = std({ color: 0x6E5A48, roughness: 0.95 });
  MAT.plant   = std({ color: 0x4E8C52, roughness: 0.85 });
  MAT.plant2  = std({ color: 0x3E7444, roughness: 0.85 });
  MAT.pot     = std({ color: 0xB9743F, roughness: 0.75 });
  MAT.paper   = std({ color: 0xF6F5F1, roughness: 0.9 });
  MAT.amber   = std({ color: 0xF5A524, roughness: 0.45, emissive: 0x3A2200 });
  MAT.glass   = std({ color: 0xC8E6F2, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
  MAT.window  = new THREE.MeshBasicMaterial({ map: TEX.viewDay, toneMapped: false });
  MAT.light   = lamp(new THREE.MeshBasicMaterial({ color: 0xFFF6E4, toneMapped: false }));
  MAT.board   = new THREE.MeshBasicMaterial({ map: TEX.board, toneMapped: false });
  MAT.contactSign = signage(new THREE.MeshBasicMaterial({ map: contactSignTexture(), toneMapped: false }), contactSignTexture);
  MAT.logo    = signage(new THREE.MeshBasicMaterial({ map: TEX.logo, toneMapped: false }), ownerLogoTexture);
  MAT.present = new THREE.MeshBasicMaterial({ map: TEX.present, toneMapped: false });
  MAT.exitSig = new THREE.MeshBasicMaterial({ map: TEX.exit, toneMapped: false });
  MAT.screen  = {};
  ['code', 'dashboard', 'charts', 'kanban', 'mobile', 'shop'].forEach(k => {
    MAT.screen[k] = new THREE.MeshBasicMaterial({ map: TEX[k], toneMapped: false });
  });
  MAT.ring    = new THREE.MeshBasicMaterial({ color: 0x7FB2FF, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  MAT.hotspot = new THREE.MeshBasicMaterial({ color: 0x7FB2FF, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false });
}

const GEO = {};
function buildGeometry() {
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);
  GEO.cylLow = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  GEO.sphere = new THREE.SphereGeometry(0.5, 14, 10);
  GEO.ico = new THREE.IcosahedronGeometry(0.5, 0);
  GEO.cone = new THREE.ConeGeometry(0.5, 1, 8);
  GEO.plane = new THREE.PlaneGeometry(1, 1);
  GEO.ring = new THREE.RingGeometry(0.72, 0.86, 40);
  GEO.disc = new THREE.CircleGeometry(0.5, 20);
  GEO.torus = new THREE.TorusGeometry(0.5, 0.09, 6, 20);
}

/* ---- tiny builders ------------------------------------------------------ */
function mesh(geo, mat, w, h, d, x, y, z, cast, receive) {
  const m = new THREE.Mesh(geo, mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  m.castShadow = cast !== false && !STATE.mobile;
  m.receiveShadow = receive !== false && !STATE.mobile;
  return m;
}
const box = (mat, w, h, d, x, y, z, cast) => mesh(GEO.box, mat, w, h, d, x, y, z, cast);
const cyl = (mat, r, h, x, y, z, low) => mesh(low ? GEO.cylLow : GEO.cyl, mat, r * 2, h, r * 2, x, y, z);
const sph = (mat, r, x, y, z) => mesh(GEO.sphere, mat, r * 2, r * 2, r * 2, x, y, z);
const plane = (mat, w, h, x, y, z) => {
  const m = new THREE.Mesh(GEO.plane, mat);
  m.scale.set(w, h, 1); m.position.set(x, y, z);
  return m;
};
function group(x, y, z, ry) {
  const g = new THREE.Group();
  g.position.set(x || 0, y || 0, z || 0);
  if (ry) g.rotation.y = ry;
  return g;
}

/* ==========================================================================
   4c · THEMES
   The Evision floor uses the default palette. The Logieagle floor is modelled
   on the real office: charcoal tile, glossy white benching, black mesh chairs,
   black-framed glass, black tube shelving, black ring pendants.
   ========================================================================== */
let TH = null;
const THEMES = {};

function buildThemeAssets() {

  // ---- large-format charcoal floor tile with grout
  TEX.tile = makeTex(256, 256, (x, w, h) => {
    x.fillStyle = '#3C3F44'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) {
      const g = 58 + Math.random() * 26;
      x.fillStyle = `rgba(${g + 4},${g + 5},${g + 9},${0.05 + Math.random() * 0.13})`;
      x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    // soft sheen band — these tiles are polished
    const gr = x.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, 'rgba(255,255,255,.05)');
    gr.addColorStop(0.5, 'rgba(255,255,255,.012)');
    gr.addColorStop(1, 'rgba(255,255,255,.05)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(28,30,34,.85)'; x.lineWidth = 3;
    x.strokeRect(0, 0, w, h);
  }, 1, 1);

  // ---- what you see out of the windows: trees, overcast sky
  TEX.outside = makeTex(256, 256, (x, w, h) => {
    const sky = x.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#DCE6EE'); sky.addColorStop(0.55, '#C9D8E2'); sky.addColorStop(1, '#A9BCA6');
    x.fillStyle = sky; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i++) {                       // canopy
      const cx = Math.random() * w, cy = h * 0.58 + Math.random() * h * 0.45;
      const r = 16 + Math.random() * 46;
      const g = 60 + Math.random() * 60;
      x.fillStyle = `rgba(${28 + g * 0.35},${64 + g},${34 + g * 0.35},${0.5 + Math.random() * 0.4})`;
      x.beginPath(); x.arc(cx, cy, r, 0, 6.3); x.fill();
    }
    x.fillStyle = 'rgba(46,64,44,.55)'; x.fillRect(0, h * 0.92, w, h * 0.08);
  }, 1, 1);

  // ---- backlit LOGIEAGLE feature wall
  TEX.logieLogo = makeTex(1024, 384, (x, w, h) => {
    x.fillStyle = '#34373C'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
      x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    // warm wash from the spotlight above
    const gl = x.createRadialGradient(w * 0.42, -40, 20, w * 0.42, 120, 520);
    gl.addColorStop(0, 'rgba(255,232,196,.30)'); gl.addColorStop(1, 'rgba(255,232,196,0)');
    x.fillStyle = gl; x.fillRect(0, 0, w, h);

    // isometric cube mark
    const cx = 168, cy = 150, s = 62;
    const face = (pts, col) => {
      x.fillStyle = col; x.beginPath();
      pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
      x.closePath(); x.fill();
    };
    face([[cx, cy - s], [cx + s * 0.92, cy - s * 0.45], [cx, cy + s * 0.1], [cx - s * 0.92, cy - s * 0.45]], '#E8B923');
    face([[cx - s * 0.92, cy - s * 0.42], [cx, cy + s * 0.13], [cx, cy + s * 1.05], [cx - s * 0.92, cy + s * 0.5]], '#D63C2E');
    face([[cx + s * 0.92, cy - s * 0.42], [cx, cy + s * 0.13], [cx, cy + s * 1.05], [cx + s * 0.92, cy + s * 0.5]], '#3AA6D6');

    x.fillStyle = '#F0F1F3';
    x.font = '800 96px ui-sans-serif,Arial,sans-serif';
    x.fillText('LOGIEAGLE', 292, 188);
    x.fillStyle = '#B8BCC4';
    x.font = '600 34px ui-sans-serif,Arial,sans-serif';
    x.fillText('LOGICAL  |  FOCUSED  |  SHARP', 296, 246);
  });

  // ---- the same mark, but cut out — no panel behind it
  TEX.logieMark = makeTex(1024, 384, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const cx = 152, cy = 172, s = 66;
    const face = (pts, col) => {
      x.fillStyle = col; x.beginPath();
      pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
      x.closePath(); x.fill();
    };
    face([[cx, cy - s], [cx + s * 0.92, cy - s * 0.45], [cx, cy + s * 0.1], [cx - s * 0.92, cy - s * 0.45]], '#E8B923');
    face([[cx - s * 0.92, cy - s * 0.42], [cx, cy + s * 0.13], [cx, cy + s * 1.05], [cx - s * 0.92, cy + s * 0.5]], '#D63C2E');
    face([[cx + s * 0.92, cy - s * 0.42], [cx, cy + s * 0.13], [cx, cy + s * 1.05], [cx + s * 0.92, cy + s * 0.5]], '#3AA6D6');
    x.fillStyle = '#23262C';
    x.font = '800 104px ui-sans-serif,Arial,sans-serif';
    x.fillText('LOGIEAGLE', 274, 200);
    x.fillStyle = '#6A7078';
    x.font = '600 36px ui-sans-serif,Arial,sans-serif';
    x.fillText('LOGICAL  |  FOCUSED  |  SHARP', 278, 262);
  });

  // ---- antique wall art: aged plaster with a brass art-deco relief
  TEX.wallArt = makeTex(512, 384, (x, w, h) => {
    x.fillStyle = '#2B2620'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      x.fillStyle = 'rgba(255,235,200,' + (Math.random() * 0.035) + ')';
      x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    const cx = w / 2, cy = h / 2;
    x.strokeStyle = '#B08D57'; x.lineWidth = 3;
    for (let r = 40; r < 150; r += 26) {
      x.beginPath(); x.arc(cx, cy + 40, r, Math.PI * 1.06, Math.PI * 1.94); x.stroke();
    }
    x.lineWidth = 2.2;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * 1.06 + (Math.PI * 0.88) * (i / 10);
      x.beginPath();
      x.moveTo(cx + Math.cos(a) * 40, cy + 40 + Math.sin(a) * 40);
      x.lineTo(cx + Math.cos(a) * 150, cy + 40 + Math.sin(a) * 150);
      x.stroke();
    }
    x.fillStyle = '#C9A063';
    x.beginPath();
    x.moveTo(cx, cy - 132); x.lineTo(cx + 30, cy - 96); x.lineTo(cx, cy - 60); x.lineTo(cx - 30, cy - 96);
    x.closePath(); x.fill();
    x.strokeStyle = '#8A6B3E'; x.lineWidth = 5;
    x.strokeRect(22, 22, w - 44, h - 44);
  });

  // ---- wall screen for the open floor
  TEX.wallTv = makeTex(512, 288, (x, w, h) => {
    x.fillStyle = '#0B0E13'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#141A24'; x.fillRect(0, 0, w, 44);
    x.fillStyle = '#3AA6D6'; x.fillRect(0, 0, 6, 44);
    x.fillStyle = '#8A94A6'; x.font = '600 20px ui-monospace,monospace';
    x.fillText('release board', 26, 30);
    for (let i = 0; i < 4; i++) {
      const y = 74 + i * 50;
      x.fillStyle = '#141A24'; x.fillRect(26, y, 460, 38);
      x.fillStyle = ['#E8B923', '#3AA6D6', '#7ED9A7', '#D63C2E'][i]; x.fillRect(26, y, 5, 38);
      x.fillStyle = '#39445A'; x.fillRect(44, y + 10, 150 + Math.random() * 120, 7);
      x.fillStyle = '#252E3E'; x.fillRect(44, y + 24, 90 + Math.random() * 70, 6);
    }
  });

  const std = (o) => new THREE.MeshStandardMaterial(o);
  MAT.gloss      = std({ color: 0xF3F3F1, roughness: 0.16, metalness: 0.04 });
  MAT.glossEdge  = std({ color: 0xE4E5E3, roughness: 0.3 });
  MAT.wallWhite  = std({ color: 0xF5F5F3, roughness: 0.92 });
  MAT.wallFeature= std({ color: 0x34373C, roughness: 0.8 });
  MAT.blackFrame = std({ color: 0x121418, roughness: 0.42, metalness: 0.45 });
  MAT.blackSoft  = std({ color: 0x1C1F25, roughness: 0.8 });
  MAT.mesh       = std({ color: 0x1A1D23, roughness: 0.92 });
  MAT.chrome     = std({ color: 0x9AA0A8, roughness: 0.25, metalness: 0.8 });
  MAT.potWhite   = std({ color: 0xF0EFEC, roughness: 0.55 });
  MAT.brass      = std({ color: 0xB08D57, roughness: 0.32, metalness: 0.72 });
  MAT.cream      = std({ color: 0xEDE6D6, roughness: 0.6 });
  MAT.wallArt    = new THREE.MeshBasicMaterial({ map: TEX.wallArt, toneMapped: false });
  MAT.glassClear = std({ color: 0xD6ECF4, roughness: 0.04, metalness: 0.08, transparent: true, opacity: 0.13, side: THREE.DoubleSide });
  MAT.outside    = new THREE.MeshBasicMaterial({ map: TEX.outside, toneMapped: false });
  MAT.logieLogo  = new THREE.MeshBasicMaterial({ map: TEX.logieLogo, toneMapped: false });
  MAT.logieMark  = new THREE.MeshBasicMaterial({
    map: TEX.logieMark, toneMapped: false, transparent: true, alphaTest: 0.04, depthWrite: false
  });
  MAT.wallTv     = new THREE.MeshBasicMaterial({ map: TEX.wallTv, toneMapped: false });
  MAT.downlight  = lamp(new THREE.MeshBasicMaterial({ color: 0xFFF4E2, toneMapped: false }));

  THEMES.default = {
    id: 'default',
    wall: MAT.wall, glazing: 'strip', pane: MAT.window,
    frame: MAT.trim, ceiling: 'panels', rugs: true, bench: false
  };

  THEMES.logieagle = {
    id: 'logieagle',
    wall: MAT.wallWhite, glazing: 'full', pane: MAT.outside,
    frame: MAT.blackFrame, ceiling: 'rings', rugs: false, bench: true,
    tile: true
  };
}

/* the tile floor needs its own repeat per room size */
function floorMaterialFor(cfg) {
  if (!TH || !TH.tile) return cfg.tone === 'warm' ? MAT.woodFloor : MAT.floor;
  const t = TEX.tile.clone();
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(Math.round(cfg.w / 0.8), Math.round(cfg.d / 0.8));
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.34, metalness: 0.06 });
}
