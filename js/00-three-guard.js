if (typeof THREE === 'undefined')
  document.write('<scr' + 'ipt src="https://unpkg.com/three@0.128.0/build/three.min.js"><\/scr' + 'ipt>');

if (typeof THREE === 'undefined')
  document.write('<scr' + 'ipt src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\/scr' + 'ipt>');

window.__vo_fail = function (msg) {
  var b = document.getElementById('bootErr');
  if (b) { b.textContent = 'Something broke: ' + msg; b.style.display = 'block'; }
  var p = document.getElementById('preflight');
  if (p) { p.textContent = msg; p.style.color = '#FF9B9B'; }
  var l = document.getElementById('loader');
  if (l) l.classList.add('gone');
};
window.addEventListener('error', function (ev) {
  window.__vo_fail((ev.error && ev.error.message) || ev.message || 'unknown error');
});
if (typeof THREE === 'undefined') {
  window.__vo_fail('three.js did not load from any CDN — showing the text version');
  // Catch-all stand-in. The main script builds several THREE objects at top
  // level (CAM, SCRATCH, ...); without this the first one throws and takes the
  // whole script with it, classic fallback included. Every property returns
  // another harmless proxy — except WebGLRenderer, which throws on purpose so
  // STATE.webgl goes false and boot() drops straight to the text version.
  var mk = function () {
    return new Proxy(function () {}, {
      get: function (t, k) {
        if (k === 'WebGLRenderer') return function () { throw new Error('no webgl'); };
        if (k === Symbol.toPrimitive || k === 'valueOf') return function () { return 0; };
        if (k === Symbol.iterator) return function* () {};
        if (k === 'then' || k === Symbol.toStringTag) return undefined;
        return mk();
      },
      set: function () { return true; },
      apply: function () { return mk(); },
      construct: function () { return mk(); }
    });
  };
  window.THREE = mk();
}
