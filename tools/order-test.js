// Simulate the browser: each file is a separate classic script sharing one
// global lexical scope. This is what catches a split made at a bad boundary —
// function hoisting no longer crosses files, so any top-level call to a
// later-defined function will throw here.
const vm = require('vm'), fs = require('fs'), path = require('path');
const els = {};
const mkEl = (id) => els[id] || (els[id] = {
  id, textContent:'', style:{}, value:'',
  classList:{ _s:new Set(), add(c){this._s.add(c)}, remove(c){this._s.delete(c)},
              contains(c){return this._s.has(c)},
              toggle(c,f){ f===undefined?(this._s.has(c)?this._s.delete(c):this._s.add(c)):(f?this._s.add(c):this._s.delete(c)); return this._s.has(c)} },
  addEventListener(){}, appendChild(){}, querySelector(){return null},
  querySelectorAll(){return []}, getContext(){return null}, insertAdjacentHTML(){},
  focus(){}, remove(){}, children:[], dataset:{}, innerHTML:''
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
global.Blob=function(){}; global.FileReader=function(){};

const dir = path.resolve(__dirname, '..');
const files = ['js/00-three-guard.js',
  ...fs.readdirSync(path.join(dir,'js')).filter(f=>/^\d\d-/.test(f)&&f!=='00-three-guard.js').sort().map(f=>'js/'+f)];
let loaded = 0;
for (const f of files) {
  try {
    vm.runInThisContext(fs.readFileSync(path.join(dir,f),'utf8'), { filename:f });
    loaded++;
  } catch (e) {
    console.log('✗ FAILED at', f, '->', e.message);
    console.log('  ', (e.stack.split('\n')[1]||'').trim());
    process.exit(1);
  }
}
console.log('✓', loaded, 'scripts executed in order, no cross-file breakage');
console.log('  classic fallback engaged:', els['classic'].classList.contains('on'));
console.log('  boot() defined:', typeof boot);
console.log('  DATA/LAYOUTS reachable across files:',
  typeof DATA!=='undefined' && typeof LAYOUTS!=='undefined' && typeof CAM!=='undefined');
