/* MANIFEST · local driver: one machine, many tabs.
   For rehearsal and for the day the venue wifi dies: open host.html,
   screen.html and a few index.html tabs in the same browser and they share
   one room through localStorage + BroadcastChannel. No network involved. */
(function (MF) {
'use strict';

var room = '', role = '', bc = null, me = null, hb = null;
function k(x) { return 'mf.L.' + room + '.' + x; }
function read(x, d) { return MF.get(k(x), d); }
/* BroadcastChannel never echoes to the sender, so the writing tab refreshes
   itself too (except room state, which the host already applied). */
function write(x, v) { MF.put(k(x), v); ping(x); if (x !== 'state') setTimeout(function () { refresh(x); }, 0); }
function ping(t) { try { if (bc) bc.postMessage({ t: t }); } catch (e) {} }

function peopleList() {
  var p = read('people', {});
  return Object.keys(p).map(function (id) { return p[id]; });
}
function presence() {
  var now = Date.now(), on = {};
  peopleList().forEach(function (p) { if (now - (p.seen || 0) < 45000) on[p.id] = true; });
  MF.Live.online = on; MF.Live.emit('presence', on);
}
function refresh(t) {
  if (!t || t === 'state') MF.Live.acceptState(read('state', null) || MF.Live.blankState());
  if (!t || t === 'people') { MF.Live.acceptPeople(peopleList()); presence(); }
  if (!t || t === 'posts') MF.Live.emit('posts', read('posts', []));
  if (!t || t === 'responses') MF.Live.emit('responses', read('responses', []));
  if (!t || t === 'messages') MF.Live.emit('messages-changed');
  if (!t || t === 'progress') MF.Live.emit('progress-changed');
}

var Local = {
  start: function (r, ro) {
    room = r; role = ro;
    try { bc = new BroadcastChannel('mf.' + room); bc.onmessage = function (e) { refresh(e.data && e.data.t); }; } catch (e) {}
    window.addEventListener('storage', function (e) {
      if (e.key && e.key.indexOf('mf.L.' + room + '.') === 0) refresh(e.key.split('.').pop());
    });
    setInterval(presence, 10000);
    MF.Live.setStatus('local');
    refresh();
    return Promise.resolve({ ok: true });
  },

  join: function (m) {
    me = m;
    function beat() {
      var p = read('people', {});
      var prev = p[m.id] || {};
      p[m.id] = { id: m.id, name: m.name, team: m.team, room: room, joined: prev.joined || Date.now(), seen: Date.now() };
      write('people', p);
    }
    beat(); clearInterval(hb); hb = setInterval(beat, 15000);
    return Promise.resolve(m);
  },

  respond: function (actId, answer, ms) {
    var rs = read('responses', []);
    if (rs.some(function (r) { return r.activity === actId && r.pid === me.id; })) return Promise.resolve({ dup: true });
    rs.push({ id: MF.uid(10), room: room, activity: actId, pid: me.id, name: me.name, team: me.team, answer: answer, ms: Math.round(ms || 0), at: Date.now() });
    write('responses', rs);
    return Promise.resolve({ ok: true });
  },

  post: function (board, body, col, anon) {
    var ps = read('posts', []);
    var row = { id: MF.uid(10), room: room, board: board, pid: me.id, author: anon ? '' : me.name, team: me.team, body: String(body).slice(0, 280), col: col || '', votes: 0, hidden: false, at: Date.now() };
    ps.push(row); write('posts', ps);
    return Promise.resolve(row);
  },

  vote: function (postId) {
    var vs = read('votes', {});
    var key = postId + ':' + me.id;
    if (vs[key]) return Promise.resolve({ dup: true });
    vs[key] = 1; MF.put(k('votes'), vs);
    var ps = read('posts', []);
    ps.forEach(function (p) { if (p.id === postId) p.votes = (p.votes || 0) + 1; });
    write('posts', ps);
    return Promise.resolve({ ok: true });
  },

  posts: function (board) {
    return Promise.resolve(read('posts', []).filter(function (p) { return !board || p.board === board; }));
  },

  saveProgress: function (data, page, help) {
    if (!me) return Promise.resolve({ skipped: true });
    var g = read('progress', {});
    g[me.id] = { pid: me.id, data: data || {}, page: page || '', help: help || '', updated_at: Date.now() };
    write('progress', g); return Promise.resolve({ ok: true });
  },
  sendMessage: function (body, context) {
    if (!me) return Promise.reject(new Error('Join the room first.'));
    var ms = read('messages', []), id = (ms.length ? ms[ms.length - 1].id : 0) + 1;
    ms.push({ id: id, pid: me.id, from_host: false, body: String(body).slice(0, 500), context: context || '', seen: false, at: Date.now() });
    write('messages', ms); return Promise.resolve(id);
  },
  myMessages: function (after) {
    if (!me) return Promise.resolve([]);
    return Promise.resolve(read('messages', []).filter(function (m) { return m.pid === me.id && m.id > (after || 0); }));
  },
  claimCert: function (name) {
    if (!me) return Promise.reject(new Error('Join the room first.'));
    if (!(read('state', {}) || {}).certs) return Promise.reject(new Error('Certificates are not open yet.'));
    var cs = read('certs', {}), c = cs[me.id];
    if (!c) c = cs[me.id] = { id: 'CTB-' + MF.yymm() + '-' + MF.uid(6).toUpperCase(), pid: me.id, at: Date.now() };
    c.full_name = String(name).trim().replace(/\s+/g, ' ').slice(0, 80);
    write('certs', cs); return Promise.resolve(c.id);
  },
  verifyCert: function (id) {
    var cs = read('certs', {}), want = String(id || '').trim().toUpperCase();
    var c = Object.keys(cs).map(function (k) { return cs[k]; }).filter(function (x) { return x.id === want; })[0];
    return Promise.resolve(c ? { id: c.id, full_name: c.full_name, course: MF.APP.course, issued_at: c.at } : null);
  },

  /* Host. No key check: in local mode the host and the room are one machine. */
  hostInbox: function (after) { return Promise.resolve(read('messages', []).filter(function (m) { return m.id > (after || 0); })); },
  hostReply: function (pid, body) {
    var ms = read('messages', []), id = (ms.length ? ms[ms.length - 1].id : 0) + 1;
    ms.forEach(function (m) { if (m.pid === pid && !m.from_host) m.seen = true; });
    ms.push({ id: id, pid: pid, from_host: true, body: String(body).slice(0, 500), context: '', seen: true, at: Date.now() });
    write('messages', ms);
    var g = read('progress', {}); if (g[pid]) { g[pid].help = ''; write('progress', g); }
    return Promise.resolve(id);
  },
  hostMarkSeen: function (pid) {
    var ms = read('messages', []); ms.forEach(function (m) { if (m.pid === pid && !m.from_host) m.seen = true; });
    write('messages', ms); return Promise.resolve(true);
  },
  hostProgress: function () { var g = read('progress', {}); return Promise.resolve(Object.keys(g).map(function (k) { return g[k]; })); },
  hostClearHelp: function (pid) { var g = read('progress', {}); if (g[pid]) { g[pid].help = ''; write('progress', g); } return Promise.resolve(true); },
  hostOpen: function () {
    if (!read('state', null)) write('state', MF.Live.blankState());
    return Promise.resolve(true);
  },
  setState: function (next) { write('state', next); return Promise.resolve(true); },
  responses: function (actId) {
    return Promise.resolve(read('responses', []).filter(function (r) { return !actId || r.activity === actId; }));
  },
  hidePost: function (id, hidden) {
    var ps = read('posts', []);
    ps.forEach(function (p) { if (p.id === id) p.hidden = !!hidden; });
    write('posts', ps); return Promise.resolve(true);
  },
  resetRoom: function () {
    ['people', 'responses', 'posts', 'votes', 'progress', 'messages', 'certs'].forEach(function (x) { MF.del(k(x)); });
    write('state', MF.Live.blankState());
    ['people', 'responses', 'posts'].forEach(ping);
    return Promise.resolve(true);
  }
};

MF.LocalDriver = Local;
})(window.MF = window.MF || {});
