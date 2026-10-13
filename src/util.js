/* MANIFEST · util: storage, DOM helpers, router, toast, clipboard. */
(function (MF) {
'use strict';

/* ── Storage. Private windows and blocked storage throw; fall back to memory
      and say so, rather than quietly losing someone's progress. ── */
var mem = {}, storageOK = true;
try { var k = '__mf' + Date.now(); localStorage.setItem(k, '1'); localStorage.removeItem(k); }
catch (e) { storageOK = false; }

function put(key, val) {
  var s = JSON.stringify(val);
  if (storageOK) { try { localStorage.setItem(key, s); return; } catch (e) { storageOK = false; } }
  mem[key] = s;
}
function get(key, dflt) {
  var s = null;
  if (storageOK) { try { s = localStorage.getItem(key); } catch (e) { storageOK = false; } }
  if (s === null || s === undefined) s = mem[key];
  if (s === null || s === undefined) return dflt;
  try { return JSON.parse(s); } catch (e) { return dflt; }
}
function del(key) {
  if (storageOK) { try { localStorage.removeItem(key); } catch (e) {} }
  delete mem[key];
}

/* ── DOM ── */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
/* Light markdown for lesson copy we wrote ourselves: **bold**, *em*, `code`.
   Escapes first, so it is safe on participant text too. */
function md(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}
function icon(id, size, stroke) {
  return '<svg class="ic" width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (stroke || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#' + id + '"/></svg>';
}
function uid(n) {
  var a = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
  var buf = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(n || 12)) : null;
  for (var i = 0; i < (n || 12); i++) s += a[(buf ? buf[i] : Math.floor(Math.random() * 1e9)) % a.length];
  return s;
}
function yymm(d) { d = d || new Date(); return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0'); }
function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  var h = '0123456789abcdef', s = '';
  for (var i = 0; i < 36; i++) s += (i === 8 || i === 13 || i === 18 || i === 23) ? '-' : (i === 14 ? '4' : h[Math.floor(Math.random() * 16)]);
  return s;
}

/* ── Toast ── */
var toastT = null;
function toast(msg, kind) {
  var el = $('#toast');
  if (!el) return;
  el.className = 'toast up' + (kind ? ' ' + kind : '');
  el.innerHTML = icon(kind === 'bad' ? 'i-alert' : 'i-check', 16, 2.2) + '<span>' + esc(msg) + '</span>';
  clearTimeout(toastT);
  toastT = setTimeout(function () { el.classList.remove('up'); }, 2800);
}

/* ── Clipboard. execCommand fallback for http:// on a phone. ── */
function copy(text, label) {
  /* A label with a colon is a complete message; a short one gets the usual hint. */
  function done() { toast(label && label.indexOf(':') >= 0 ? label : (label || 'Copied') + '. Paste it into your AI tool.'); }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else fallback();
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy. Select the text and copy it by hand.', 'bad'); }
    document.body.removeChild(ta);
  }
}

/* ── Hash router: #/path/a/b → handler(params) ── */
var routes = [];
function route(pattern, fn) { routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn: fn }); }
function current() { return (location.hash || '#/').slice(1) || '/'; }
function go(path) { if (current() === path) dispatch(); else location.hash = path; }
function dispatch() {
  var p = current();
  for (var i = 0; i < routes.length; i++) {
    var m = p.match(routes[i].re);
    if (m) { routes[i].fn.apply(null, m.slice(1).map(decodeURIComponent)); return; }
  }
  if (routes.length) routes[0].fn();
}
window.addEventListener('hashchange', function () { dispatch(); window.scrollTo(0, 0); });

/* ── Misc ── */
function param(name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function fmtClock(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
function download(name, text, type) {
  var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function normRoom(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); }

MF.put = put; MF.get = get; MF.del = del; MF.storageOK = function () { return storageOK; };
MF.$ = $; MF.$$ = $$; MF.esc = esc; MF.md = md; MF.icon = icon; MF.uid = uid; MF.uuid = uuid; MF.yymm = yymm;
MF.reducedMotion = function () { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); };
MF.toast = toast; MF.copy = copy; MF.route = route; MF.go = go; MF.dispatch = dispatch; MF.currentRoute = current;
MF.param = param; MF.clamp = clamp; MF.fmtClock = fmtClock; MF.vibrate = vibrate; MF.download = download; MF.normRoom = normRoom;

})(window.MF = window.MF || {});
