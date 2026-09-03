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
