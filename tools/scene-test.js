// Build the real scene with real Three.js and assert on it — the harness the
// handoff notes describe. WebGL is unavailable in node, so we skip the
// renderer and drive the builders directly.
const vm = require('vm'), fs = require('fs'), path = require('path');
const els = {};
const mkEl = (id) => els[id] || (els[id] = {
  id, textContent:'', style:{}, value:'',
  classList:{ _s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
    contains(c){return this._s.has(c)},
    toggle(c,f){f===undefined?(this._s.has(c)?this._s.delete(c):this._s.add(c)):(f?this._s.add(c):this._s.delete(c));return this._s.has(c)} },
  addEventListener(){}, appendChild(){}, querySelector(){return null}, querySelectorAll(){return []},
  getContext(){ return new Proxy({}, {
    get: (t, k) => {
      if (k === 'canvas') return { width:256, height:256 };
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient')
        return () => ({ addColorStop(){} });
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (k === 'createImageData') return () => ({ data: new Uint8ClampedArray(4) });
      return () => {};
    },
    set: () => true
  }); },
  insertAdjacentHTML(){}, focus(){}, remove(){}, children:[], dataset:{}, innerHTML:'',
  width:256, height:256
});
global.document = { getElementById: mkEl, createElement:(t)=>mkEl('n'+t+Math.random()),
  createElementNS:(n,t)=>mkEl('ns'+t+Math.random()), addEventListener(){},
  body:mkEl('body'), documentElement:mkEl('html'), head:mkEl('head'),
  querySelector(){return null}, querySelectorAll(){return []}, write(){} };
global.window = global;
global.matchMedia = () => ({ matches:false, addEventListener(){}, addListener(){} });
global.innerWidth=1280; global.innerHeight=800; global.devicePixelRatio=1;
global.addEventListener=()=>{}; global.requestAnimationFrame=()=>0;
global.navigator={userAgent:'node',maxTouchPoints:0}; global.performance={now:()=>0};
global.location={href:'',search:''}; global.setTimeout=()=>0; global.setInterval=()=>0;
global.URL={createObjectURL(){return ''},revokeObjectURL(){}};
global.Blob=function(){}; global.FileReader=function(){}; global.ImageData=function(){};


const dir = path.resolve(__dirname, '..');
global.THREE = require(path.join(dir, 'node_modules', 'three'));  // real three.js r128
const files = fs.readdirSync(path.join(dir,'js')).filter(f=>/^\d\d-/.test(f)).sort();
for (const f of files) {
  if (f === '00-three-guard.js') continue;  // needs document.write; THREE is present anyway
  vm.runInThisContext(fs.readFileSync(path.join(dir,'js',f),'utf8'), { filename:f });
}
console.log('✓ all', files.length-1, 'scripts loaded against real three.js r128');

// stand in for setupEngine(), which needs a GPU
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(46, 1.6, 0.4, 260);
LIGHTS.hemi = new THREE.HemisphereLight(); LIGHTS.key = new THREE.DirectionalLight();
LIGHTS.fill = new THREE.DirectionalLight(); LIGHTS.points = [];

buildTextures(); buildMaterials(); buildGeometry(); buildNpcGeo();
buildThemeAssets(); buildTierMaterials(); TH = THEMES.default;
console.log('✓ textures, materials, geometry, themes built');

let total = 0, allOk = true;
const R = 0.42;                       // the hero radius collide() uses

for (const key of ['hub', ...DOORS.map(d => d.id)]) {
  const sc = buildScene(key);
  let meshes = 0; sc.root.traverse(o => { if (o.isMesh) meshes++; });
  total += meshes;

  // Same test collide() applies: is the approach point inside bounds, and
  // clear of every blocker once the hero's radius is taken into account?
  const stuck = [];
  for (const rec of sc.interactives) {
    if (!rec.prox) continue;
    const p = rec.prox;
    if (Math.abs(p.x) > sc.bounds.x || Math.abs(p.z) > sc.bounds.z) {
      stuck.push([rec.title || rec.id, 'out of bounds']); continue;
    }
    for (const o of sc.blockers) {
      if (o.hw + R - Math.abs(p.x - o.x) > 0 && o.hd + R - Math.abs(p.z - o.z) > 0) {
        stuck.push([rec.title || rec.id, 'inside a blocker']); break;
      }
    }
  }
  const withProx = sc.interactives.filter(r => r.prox).length;
  const mark = stuck.length ? '✗' : '✓';
  if (stuck.length) allOk = false;
  console.log(`  ${mark} ${key.padEnd(11)} ${String(meshes).padStart(5)} meshes  ` +
              `${String(sc.interactives.length).padStart(3)} interactives  ` +
              `${String(withProx).padStart(3)} approach points  ` +
              `${stuck.length ? stuck.length + ' UNREACHABLE' : 'all reachable'}`);
  stuck.forEach(([n, why]) => console.log(`        - ${n}: ${why}`));
}
console.log(allOk
  ? `\n✓ ${total} meshes, every approach point reachable`
  : '\n✗ unreachable interactives found');
