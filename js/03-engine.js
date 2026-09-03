/* ==========================================================================
   2 · ENGINE  —  renderer, scene, lighting
   ========================================================================== */
const el = (id) => document.getElementById(id);
const canvas = el('scene');

const STATE = {
  coarse: window.matchMedia('(pointer:coarse)').matches,
  small: window.innerWidth < 900,
  low: false,              // set true if fps tanks
  ready: false,
  hovered: null,
  selected: null,
  idle: 0,
  coffee: 0,
  webgl: true
};
STATE.mobile = STATE.coarse || STATE.small;

let renderer, scene, camera, sun;
const LIGHTS = { points: [] };
try {
  renderer = new THREE.WebGLRenderer({
    canvas, antialias: !STATE.mobile, powerPreference: 'high-performance', alpha: false
  });
} catch (err) { STATE.webgl = false; }

// Guarded: if THREE never loaded, STATE.webgl is already false and these must
// not throw at parse time — an unguarded throw here kills the entire script,
// including the classic fallback, and leaves a blank page.
const CLOCK = STATE.webgl ? new THREE.Clock()
  : { getDelta: () => 0.016, getElapsedTime: () => 0 };
const RAY = STATE.webgl ? new THREE.Raycaster() : null;
const PICKABLE = [];       // only interactive meshes go here — keeps raycasting cheap
const HOTSPOTS = [];       // billboarded "clickable" markers
const ANIMATED = [];       // { obj, fn } ticked every frame
const INTERACTIVES = [];   // registry of everything you can click

function setupEngine() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, STATE.mobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = !STATE.mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080A0E);
  scene.fog = new THREE.Fog(0x080A0E, 46, 104);

  camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.4, 260);

  // --- lighting: one shadow-casting key light, everything else is cheap fill
  const hemi = new THREE.HemisphereLight(0xDCEBFF, 0x4A4238, 0.62);
  scene.add(hemi);
  LIGHTS.hemi = hemi;

  sun = new THREE.DirectionalLight(0xFFF3E0, 1.15);
  sun.position.set(20, 27, 15);
  if (!STATE.mobile) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera;
    c.left = -27; c.right = 27; c.top = 22; c.bottom = -22; c.near = 6; c.far = 78;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
  }
  scene.add(sun);
  LIGHTS.key = sun;

  // window bounce from the glazed side
  const bounce = new THREE.DirectionalLight(0xBFD8FF, 0.34);
  bounce.position.set(-18, 10, -20);
  scene.add(bounce);
  LIGHTS.fill = bounce;

  // warm pools, no shadows
  // warm pools that come up at night; base intensity is remembered so the
  // day/night switch can scale them
  [[0xFFD9A0, 0.16, 6, 3.1, -5], [0xFFCE93, 0.16, -7, 3.0, 4],
   [0xFFE2BE, 0.14, 0, 3.0, 9], [0xFFD9A0, 0.14, 9, 3.0, -11]].forEach(([c, i, x, y, z]) => {
    const pt = new THREE.PointLight(c, i, 20, 2);
    pt.position.set(x, y, z);
    pt.userData.base = i;
    scene.add(pt);
    LIGHTS.points.push(pt);
  });
}

/* ==========================================================================
   3 · PROCEDURAL TEXTURES  (no external assets — nothing to download)
   ========================================================================== */
function makeTex(w, h, draw, rx, ry) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); }
  t.anisotropy = 4;
  return t;
}

const TEX = {};

function ownerLogoTexture() {
  return makeTex(1024, 256, (x, w, h) => {
    x.fillStyle = '#20242C'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#F5A524'; x.fillRect(0, 0, 14, h);
    x.fillStyle = '#F2F4F8'; x.font = '700 62px ui-sans-serif,sans-serif';
    x.fillText(DATA.owner.name, 60, 108);
    x.fillStyle = '#8A94A6'; x.font = '28px ui-monospace,monospace';
    x.fillText((DATA.owner.role + '  ·  ' + DATA.owner.location).toLowerCase(), 62, 164);
  });
}

function buildTextures() {
  // polished concrete floor with faint seams
  TEX.floor = makeTex(256, 256, (x, w, h) => {
    x.fillStyle = '#CFCAC1'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const g = 190 + Math.random() * 42;
      x.fillStyle = `rgba(${g},${g - 4},${g - 12},${0.05 + Math.random() * 0.16})`;
      x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    x.strokeStyle = 'rgba(120,116,108,.30)'; x.lineWidth = 1.5;
    x.strokeRect(0, 0, w, h);
  }, 14, 11);

  // low-pile carpet for zoned areas
  TEX.carpet = makeTex(128, 128, (x, w, h) => {
    x.fillStyle = '#4E5A68'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 3400; i++) {
      x.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      x.fillRect(Math.random() * w, Math.random() * h, 1, 2);
    }
  }, 5, 5);

  TEX.woodFloor = makeTex(256, 256, (x, w, h) => {
    x.fillStyle = '#A97B4E'; x.fillRect(0, 0, w, h);
    for (let p = 0; p < 6; p++) {
      const y = p * (h / 6);
      x.fillStyle = `rgba(${118 + Math.random() * 38},${82 + Math.random() * 26},${48 + Math.random() * 20},.30)`;
      x.fillRect(0, y, w, h / 6 - 2);
      for (let i = 0; i < 26; i++) {
        x.strokeStyle = 'rgba(90,60,34,.20)'; x.lineWidth = 0.7;
        const ly = y + Math.random() * (h / 6);
        x.beginPath(); x.moveTo(0, ly); x.lineTo(w, ly + (Math.random() - .5) * 4); x.stroke();
      }
      x.strokeStyle = 'rgba(70,46,26,.5)'; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
    }
  }, 9, 7);

  TEX.carpetWarm = makeTex(128, 128, (x, w, h) => {
    x.fillStyle = '#8A6B4F'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 3400; i++) {
      x.fillStyle = `rgba(255,235,210,${Math.random() * 0.07})`;
      x.fillRect(Math.random() * w, Math.random() * h, 1, 2);
    }
  }, 4, 4);

  // oak-ish desk surface
  TEX.wood = makeTex(256, 128, (x, w, h) => {
    x.fillStyle = '#C79A66'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      x.strokeStyle = `rgba(120,84,48,${0.05 + Math.random() * 0.16})`;
      x.lineWidth = 0.6 + Math.random() * 1.8;
      const y = Math.random() * h;
      x.beginPath(); x.moveTo(0, y);
      x.bezierCurveTo(w * 0.3, y + (Math.random() - .5) * 8, w * 0.7, y + (Math.random() - .5) * 8, w, y);
      x.stroke();
    }
  }, 2, 1);

  // ---- monitor screens
  const screenBG = (x, w, h, top) => {
    x.fillStyle = '#10141C'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#171D28'; x.fillRect(0, 0, w, 22);
    x.fillStyle = '#F5A524'; x.fillRect(0, 0, 4, 22);
    x.fillStyle = '#7F8B9E'; x.font = '600 11px ui-monospace,monospace';
    x.fillText(top, 12, 15);
  };
  const R = (n) => Math.random() * n;

  TEX.code = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'index.tsx');
    const cols = ['#7FB2FF', '#F5A524', '#7ED9A7', '#C58AF0', '#8A94A6'];
    for (let i = 0; i < 15; i++) {
      let px = 14 + (i % 4) * 9;
      const y = 38 + i * 13;
      x.fillStyle = '#3A4354'; x.font = '10px ui-monospace,monospace'; x.fillText(String(i + 1).padStart(2, '0'), 4, y);
      for (let j = 0; j < 3 + R(3); j++) {
        const len = 16 + R(58);
        x.fillStyle = cols[(i + j) % cols.length];
        x.globalAlpha = 0.85; x.fillRect(px, y - 7, len, 6); x.globalAlpha = 1;
        px += len + 7;
        if (px > w - 30) break;
      }
    }
  });

  TEX.dashboard = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'hrsc · requests');
    for (let i = 0; i < 3; i++) {
      x.fillStyle = '#1A2130'; x.fillRect(12 + i * 122, 32, 112, 46);
      x.fillStyle = ['#F5A524', '#7FB2FF', '#7ED9A7'][i]; x.fillRect(12 + i * 122, 32, 112, 3);
      x.fillStyle = '#E6EBF3'; x.font = '600 18px ui-monospace,monospace';
      x.fillText(['248', '31', '96%'][i], 22 + i * 122, 62);
    }
    x.fillStyle = '#1A2130'; x.fillRect(12, 88, 360, 138);
    for (let i = 0; i < 9; i++) {
      const bh = 18 + R(96);
      x.fillStyle = i % 3 === 0 ? '#F5A524' : '#33507A';
      x.fillRect(26 + i * 39, 214 - bh, 24, bh);
    }
  });

  TEX.charts = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'analytics');
    x.fillStyle = '#141A25'; x.fillRect(12, 32, 360, 100);
    x.strokeStyle = '#7FB2FF'; x.lineWidth = 2.4; x.beginPath();
    for (let i = 0; i <= 30; i++) {
      const px = 14 + i * 11.8, py = 118 - (Math.sin(i * 0.42) * 26 + 34 + R(10));
      i ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
    x.strokeStyle = '#F5A524'; x.lineWidth = 1.8; x.beginPath();
    for (let i = 0; i <= 30; i++) {
      const px = 14 + i * 11.8, py = 124 - (Math.cos(i * 0.31) * 15 + 20 + R(8));
      i ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
    for (let i = 0; i < 5; i++) {
      x.fillStyle = '#1A2130'; x.fillRect(12, 142 + i * 18, 360, 13);
      x.fillStyle = i % 2 ? '#33507A' : '#3E4A5E'; x.fillRect(16, 145 + i * 18, 60 + R(230), 7);
    }
  });

  TEX.kanban = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'pms · sprint 14');
    const heads = ['#8A94A6', '#7FB2FF', '#7ED9A7'];
    for (let c = 0; c < 3; c++) {
      const cx = 12 + c * 122;
      x.fillStyle = '#141A25'; x.fillRect(cx, 32, 112, 196);
      x.fillStyle = heads[c]; x.fillRect(cx, 32, 112, 3);
      for (let k = 0; k < 3 + (c === 1 ? 1 : 0); k++) {
        const cy = 42 + k * 46;
        x.fillStyle = '#1E2634'; x.fillRect(cx + 7, cy, 98, 38);
        x.fillStyle = heads[c]; x.fillRect(cx + 7, cy, 3, 38);
        x.fillStyle = '#48546A'; x.fillRect(cx + 16, cy + 9, 60 + R(24), 5);
        x.fillRect(cx + 16, cy + 21, 34 + R(30), 5);
      }
    }
  });

  TEX.mobile = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'tasks · android/ios');
    x.fillStyle = '#141A25'; x.fillRect(132, 30, 120, 200);
    x.fillStyle = '#F5A524'; x.fillRect(132, 30, 120, 26);
    x.fillStyle = '#10141C'; x.font = '600 10px ui-monospace,monospace'; x.fillText('My tasks', 142, 47);
    for (let i = 0; i < 5; i++) {
      const y = 64 + i * 32;
      x.fillStyle = '#1E2634'; x.fillRect(140, y, 104, 26);
      x.fillStyle = ['#7ED9A7', '#F5A524', '#7FB2FF'][i % 3]; x.beginPath();
      x.arc(151, y + 13, 5, 0, 6.3); x.fill();
      x.fillStyle = '#48546A'; x.fillRect(162, y + 8, 40 + R(38), 4);
      x.fillRect(162, y + 16, 26 + R(24), 4);
    }
  });

  TEX.shop = makeTex(384, 240, (x, w, h) => {
    screenBG(x, w, h, 'shopify · theme');
    x.fillStyle = '#141A25'; x.fillRect(12, 32, 360, 62);
    x.fillStyle = '#F5A524'; x.font = '700 20px ui-sans-serif,sans-serif'; x.fillText('NEW SEASON', 24, 68);
    for (let i = 0; i < 4; i++) {
      const cx = 12 + i * 92;
      x.fillStyle = '#1E2634'; x.fillRect(cx, 104, 84, 122);
      x.fillStyle = '#2C3646'; x.fillRect(cx + 8, 112, 68, 68);
      x.fillStyle = '#48546A'; x.fillRect(cx + 8, 190, 52, 5);
      x.fillStyle = '#7ED9A7'; x.fillRect(cx + 8, 202, 28, 5);
    }
  });

  // meeting-room wall display
  TEX.present = makeTex(512, 288, (x, w, h) => {
    x.fillStyle = '#0E1219'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#F5A524'; x.fillRect(0, 0, w, 6);
    x.fillStyle = '#E6EBF3'; x.font = '700 30px ui-sans-serif,sans-serif';
    x.fillText('Sprint review', 34, 74);
    x.fillStyle = '#7F8B9E'; x.font = '15px ui-monospace,monospace';
    x.fillText('frontend · delivery · qa', 34, 104);
    const rows = ['HRSC approval flow', 'Mobile push reminders', 'Dashboard filters', 'RBAC guard rollout'];
    rows.forEach((r, i) => {
      const y = 140 + i * 34;
      x.fillStyle = '#7ED9A7'; x.fillRect(34, y - 10, 10, 10);
      x.fillStyle = '#C3CCDA'; x.font = '17px ui-sans-serif,sans-serif'; x.fillText(r, 56, y);
      x.fillStyle = '#1E2634'; x.fillRect(300, y - 9, 170, 8);
      x.fillStyle = '#7FB2FF'; x.fillRect(300, y - 9, 60 + i * 34, 8);
    });
  });

  // whiteboard: hand-drawn architecture sketch
  TEX.board = makeTex(1024, 576, (x, w, h) => {
    x.fillStyle = '#F7F7F4'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#20242C'; x.font = '700 44px ui-sans-serif,sans-serif';
    x.fillText('How I build a screen', 54, 78);
    x.strokeStyle = '#F5A524'; x.lineWidth = 6; x.beginPath();
    x.moveTo(54, 96); x.lineTo(430, 96); x.stroke();

    const box = (bx, by, bw, bh, label, sub, col) => {
      x.strokeStyle = col; x.lineWidth = 4;
      x.strokeRect(bx, by, bw, bh);
      x.fillStyle = col + '1A'; x.fillRect(bx, by, bw, bh);
      x.fillStyle = '#20242C'; x.font = '700 22px ui-sans-serif,sans-serif';
      x.fillText(label, bx + 18, by + 36);
      x.fillStyle = '#6A748A'; x.font = '16px ui-monospace,monospace';
      x.fillText(sub, bx + 18, by + 62);
    };
    const arrow = (x1, y1, x2, y2) => {
      x.strokeStyle = '#3A4354'; x.lineWidth = 3.5;
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1);
      x.beginPath(); x.moveTo(x2, y2);
      x.lineTo(x2 - 14 * Math.cos(a - 0.4), y2 - 14 * Math.sin(a - 0.4));
      x.lineTo(x2 - 14 * Math.cos(a + 0.4), y2 - 14 * Math.sin(a + 0.4));
      x.closePath(); x.fillStyle = '#3A4354'; x.fill();
    };
    box(54, 150, 230, 92, 'REST API', 'Spring Boot', '#7FB2FF');
    arrow(292, 196, 372, 196);
    box(380, 150, 230, 92, 'API layer', 'normalise + types', '#F5A524');
    arrow(618, 196, 698, 196);
    box(706, 150, 250, 92, 'Store', 'Redux / RxJS', '#7ED9A7');
    arrow(830, 250, 830, 320);
    box(660, 328, 296, 92, 'Screens', 'read-only state', '#C58AF0');
    arrow(654, 374, 574, 374);
    box(320, 328, 250, 92, 'Components', 'dumb + reusable', '#3A4354');

    x.fillStyle = '#20242C'; x.font = '700 24px ui-sans-serif,sans-serif';
    x.fillText('States before styling', 54, 358);
    ['loading', 'empty', 'error', 'no-permission'].forEach((s, i) => {
      x.fillStyle = '#6A748A'; x.font = '19px ui-monospace,monospace';
      x.fillText('· ' + s, 54, 394 + i * 30);
    });
  });

  // reception backdrop — regenerated whenever the owner details are edited
  TEX.logo = ownerLogoTexture();

  buildSkyTextures();

  TEX.exit = makeTex(256, 96, (x, w, h) => {
    x.fillStyle = '#0F1319'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#7ED9A7'; x.font = '700 40px ui-sans-serif,sans-serif';
    x.textAlign = 'center'; x.fillText('SAY HELLO', w / 2, 62);
  });
}
