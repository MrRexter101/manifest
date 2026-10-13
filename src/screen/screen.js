/* MANIFEST · projector. Read-only: it shows what the host publishes.
   Keys: F fullscreen · T light/dark */
(function (MF) {
'use strict';
var $ = MF.$, esc = MF.esc, Live = MF.Live;
var responses = [], posts = [], tick = null, lastKey = '';

function joinUrl() {
  var base = MF.PUBLIC_URL || (location.origin + location.pathname.replace(/[^/]*$/, ''));
  if (!/\/$/.test(base) && !/\.html$/.test(base)) base += '/';
  return base.replace(/screen\.html$/, '') + '?room=' + Live.room;
}
function prettyUrl() { return joinUrl().replace(/^https?:\/\//, '').replace(/\?room=.*$/, ''); }
function qr(size) {
  try {
    var q = qrcode(0, 'M'); q.addData(joinUrl()); q.make();
    return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }).replace('<svg', '<svg class="qr" style="width:' + size + ';height:' + size + '"');
  } catch (e) { return ''; }
}
function segment(id) { return (MF.AGENDA || []).filter(function (s) { return s.id === id; })[0] || null; }
function peopleCount() { return Object.keys(Live.people).length; }
function nameOf(pid) { var p = Live.people[pid]; return p ? p.name : 'Player'; }
function teamOf(pid) { var p = Live.people[pid]; return p ? (MF.TEAMS.filter(function (t) { return t.id === p.team; })[0] || null) : null; }

function frame(inner, opts) {
  opts = opts || {};
  return '<header class="sc-top"><div class="brand">' + MF.icon('i-box', 26, 2) + '<span>' + esc(MF.APP.name) + '</span><span class="faint">· ' + esc(MF.APP.course) + '</span></div>' +
    '<div class="spacer"></div><div class="joinline">Join <b>' + esc(prettyUrl()) + '</b> · room <b class="code">' + esc(Live.room) + '</b></div>' +
    '<span class="status ' + Live.status + '"><span class="dot"></span>' + Live.status + '</span></header>' +
    '<main class="sc-main">' + inner + '</main>' +
    (opts.qr === false ? '' : '<div class="sc-qr">' + qr('128px') + '<span>' + esc(Live.room) + '</span></div>');
}

function lobby() {
  var names = Object.keys(Live.people).map(function (k) { return Live.people[k]; }).sort(function (a, b) { return (b.joined_at || b.joined || 0) > (a.joined_at || a.joined || 0) ? 1 : -1; });
  return frame('<div class="lobby"><div class="lobby-qr">' + qr('min(38vh,420px)') + '</div><div class="lobby-copy">' +
    '<h1 class="display">Scan to join.</h1><p class="url">or open ' + esc(prettyUrl()) + '</p>' +
    '<div class="roomcode"><span>Room</span><b>' + esc(Live.room) + '</b></div>' +
    '<div class="count"><b>' + names.length + '</b> on board</div>' +
    '<div class="names">' + names.slice(0, 60).map(function (p) {
      var t = MF.TEAMS.filter(function (x) { return x.id === p.team; })[0];
      return '<span class="nm" style="--team:' + (t ? t.color : 'var(--accent)') + '">' + esc(p.name) + '</span>';
    }).join('') + '</div></div></div>', { qr: false });
}

function stage() {
  var st = Live.state, seg = segment(st.segment);
  var timer = st.timer && st.timer.endsAt ? '<div class="bigtimer" data-ends="' + st.timer.endsAt + '"><span>' + esc(st.timer.label || 'Time left') + '</span><b>–:––</b></div>' : '';
  return frame('<div class="stage">' +
    (seg ? '<h1 class="display">' + esc(seg.title) + '</h1><p class="meta">' + esc(seg.start + ' to ' + seg.end) + (seg.leg ? ' · Leg ' + seg.leg : '') + '</p>' +
      (seg.sub ? '<p class="sub">' + esc(seg.sub) + '</p>' : '') : '<h1 class="display">' + esc(MF.APP.course) + '</h1><p class="sub">' + esc(MF.APP.date + ' · ' + MF.APP.place) + '</p>') +
    (st.note ? '<div class="note">' + esc(st.note) + '</div>' : '') + timer + '</div>' + jobsStrip(st.segment));
}
/* KLD's five jobs along the bottom of the stage: the case coming full circle. */
function jobsStrip(segId) {
  var M = (MF.CASE || {}).monday, A = MF.AGENDA || []; if (!M) return '';
  var cur = -1; A.forEach(function (x, i) { if (x.id === segId) cur = i; });
  var curSeg = cur >= 0 ? A[cur] : null;
  return '<ol class="jobstrip">' + M.jobs.map(function (j) {
    var first = -1; A.forEach(function (x, i) { if (x.job === j.n && first < 0) first = i; });
    var k = curSeg && curSeg.job === j.n ? (cur > first ? 'reopened' : 'now') : (first >= 0 && cur > first ? 'done' : 'next');
    return '<li class="' + k + '"><span class="jn">' + (k === 'done' ? MF.icon('i-check', 18, 3) : j.n) + '</span><span class="jt">' + esc(j.t) + '</span>' + (k === 'reopened' ? '<span class="jr">Reopened</span>' : '') + '</li>';
  }).join('') + '</ol>';
}
function certsView() {
  return frame('<div class="stage certstage">' + MF.icon('i-award', 120, 1.4) + '<h1 class="display">Your certificate is on your phone.</h1>' +
    '<p class="sub">Manifest → Your certificate. Type your full name, save it, and share it if you like.</p></div>');
}

function activityView() {
  var st = Live.state, act = st.act, def = Live.activity(act);
  if (!def) return stage();
  var mine = responses.filter(function (r) { return r.activity === act.id; });
  var t = MF.R.tally(def, mine), reveal = act.phase === 'reveal';
  var head = '<div class="act-head"><span class="pill brand">' + MF.icon(MF.R.kindIcon(def.kind), 16) + MF.R.kindLabel(def.kind) + '</span>' +
    (act.gameTitle ? '<span class="pill">' + esc(act.gameTitle) + (act.qn ? ' · ' + act.qn + ' of ' + act.qt : '') + '</span>' : '') +
    '<span class="spacer"></span><span class="answers"><b>' + (def.kind === 'wall' ? posts.filter(function (p) { return p.board === act.id && !p.hidden; }).length : t.total) + '</b> ' + (def.kind === 'wall' ? 'posts' : 'answers') + '</span>' +
    (act.phase === 'open' && act.secs ? '<span class="ring" data-ends="' + (act.openedAt + act.secs * 1000) + '" data-secs="' + act.secs + '"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="arc" cx="22" cy="22" r="19"/></svg><b></b></span>' : '') +
    (act.phase === 'locked' ? '<span class="pill">Locked</span>' : '') + '</div>';
  var body = '';
  if (def.kind === 'wall') {
    body = MF.R.wall(def, posts.filter(function (p) { return p.board === act.id; }), { byVotes: reveal });
  } else if ((def.kind === 'quiz' || def.kind === 'poll') && !reveal && act.phase !== 'locked') {
    body = '<div class="sc-tiles n' + def.options.length + '">' + def.options.map(function (o, i) {
      return '<div class="sc-tile tile-' + MF.SHAPES[i % 4] + '">' + MF.shape(i, 44) + '<span>' + esc(o) + '</span></div>';
    }).join('') + '</div>';
  } else if (def.kind === 'rank' && !reveal) {
    body = '<ol class="sc-items">' + def.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
    if (t.total) body += '<div class="faint">Ranking hidden until reveal.</div>';
  } else if (def.kind === 'number' && !reveal) {
    body = '<div class="sc-number">' + MF.icon('i-calc', 54, 1.6) + '<p>Type your answer' + (def.unit ? ' in <b>' + esc(def.unit) + '</b>' : '') + ' on your phone.</p></div>';
  } else {
    body = MF.R.results(def, t, { reveal: reveal, big: true, labels: def.kind === 'quiz' || def.kind === 'poll' });
  }
  return frame('<div class="act">' + head + '<h1 class="q">' + esc(def.q) + '</h1>' + (def.sub ? '<p class="sub">' + esc(def.sub) + '</p>' : '') + '<div class="act-body">' + body + '</div></div>', { qr: false });
}

function boardView() {
  var st = Live.state, def = (MF.ACTIVITIES || {})[st.board] || { q: 'Wall', cols: [] };
  return frame('<div class="act"><div class="act-head"><span class="pill brand">' + MF.icon('i-wall', 16) + 'Wall</span><span class="spacer"></span><span class="answers"><b>' +
    posts.filter(function (p) { return p.board === st.board && !p.hidden; }).length + '</b> posts</span></div><h1 class="q">' + esc(def.q) + '</h1>' +
    MF.R.wall(def, posts.filter(function (p) { return p.board === st.board; }), { byVotes: true }) + '</div>');
}

function standings() {
  var tot = Live.state.totals || {};
  return Object.keys(tot).map(function (pid) { return { pid: pid, name: nameOf(pid), team: teamOf(pid), pts: tot[pid] }; })
    .sort(function (a, b) { return b.pts - a.pts; });
}
function leaderboardView() {
  var s = standings().slice(0, 6), max = s.length ? Math.max(1, s[0].pts) : 1;
  var teams = Live.teamTotals(Live.state.totals, Live.people), tmax = teams.length ? Math.max(1, teams[0].avg) : 1;
  return frame('<h1 class="display lb-title">' + esc(Live.state.act && Live.state.act.gameTitle ? Live.state.act.gameTitle + ': leaderboard' : 'Leaderboard') + '</h1><div class="lb"><section><h2>Top players</h2><ol class="lb-list">' + s.map(function (p, i) {
    return '<li style="animation-delay:' + (i * 90) + 'ms"><span class="pos">' + (i + 1) + '</span><span class="nm">' + esc(p.name) +
      (p.team ? ' <i style="background:' + p.team.color + '"></i>' : '') + '</span><div class="track"><div class="fill" style="width:' + (100 * p.pts / max) + '%"></div></div><b>' + p.pts.toLocaleString('en-US') + '</b></li>';
  }).join('') + '</ol></section><section><h2>Tables, average per player</h2><ol class="lb-list teams">' + teams.map(function (t, i) {
    return '<li style="animation-delay:' + (i * 90) + 'ms"><span class="pos" style="background:' + t.color + ';color:#fff">' + (i + 1) + '</span><span class="nm">' + esc(t.name) + ' <span class="faint">(' + t.n + ')</span></span><div class="track"><div class="fill" style="width:' + (100 * t.avg / tmax) + '%;background:' + t.color + '"></div></div><b>' + t.avg.toLocaleString('en-US') + '</b></li>';
  }).join('') + '</ol></section></div>');
}
function podiumView() {
  var s = standings().slice(0, 3);
  var order = [1, 0, 2];
  return frame('<div class="podium">' + order.map(function (i) {
    var p = s[i]; if (!p) return '<div class="step empty"></div>';
    return '<div class="step p' + (i + 1) + '"><div class="who">' + MF.icon(i === 0 ? 'i-trophy' : 'i-star', i === 0 ? 46 : 34, 1.8) + '<b>' + esc(p.name) + '</b><span>' + p.pts.toLocaleString('en-US') + ' pts</span></div><div class="block"><span>' + (i + 1) + '</span></div></div>';
  }).join('') + '</div>', { qr: false });
}

function render() {
  var m = Live.state.mode, html;
  if (m === 'join') html = lobby();
  else if (m === 'activity') html = activityView();
  else if (m === 'board') html = boardView();
  else if (m === 'leaderboard') html = leaderboardView();
  else if (m === 'podium') html = podiumView();
  else if (m === 'certs') html = certsView();
  else html = stage();
  /* Same view as last time (a new answer arrived)? Do not replay the entrance animations. */
  var a = Live.state.act, key = (m || 'stage') + '|' + (a ? a.id + '|' + a.phase : '') + '|' + Live.state.board;
  $('#screen').classList.toggle('settled', key === lastKey);
  lastKey = key;
  $('#screen').innerHTML = html;
  $('#screen').setAttribute('data-mode', m || 'stage');
  document.body.setAttribute('data-mode', m || 'stage');
  clocks();
}

/* Countdown ring + room timer, driven by the host's clock values. */
function clocks() {
  clearInterval(tick);
  function step() {
    var ring = $('.ring'), big = $('.bigtimer');
    if (ring) {
      var ends = +ring.getAttribute('data-ends'), secs = +ring.getAttribute('data-secs');
      var left = Math.max(0, (ends - Date.now()) / 1000);
      ring.querySelector('b').textContent = Math.ceil(left);
      ring.querySelector('.arc').style.strokeDashoffset = String(119.4 * (1 - left / secs));
      ring.classList.toggle('low', left <= 5);
    }
    if (big) {
      var l2 = Math.max(0, (+big.getAttribute('data-ends') - Date.now()) / 1000);
      big.querySelector('b').textContent = MF.fmtClock(l2);
      big.classList.toggle('low', l2 <= 60); big.classList.toggle('done', l2 <= 0);
    }
  }
  step(); tick = setInterval(step, 250);
}

function boot() {
  var sky = document.createElement('div'); sky.className = 'sc-sky scene'; sky.setAttribute('aria-hidden', 'true'); sky.innerHTML = MF.horizon();
  document.body.insertBefore(sky, document.body.firstChild);
  var room = MF.param('room') || MF.get('mf.host.room', MF.DEFAULT_ROOM);
  Live.on('state', render);
  Live.on('people', function () { if (['join', 'leaderboard', 'podium'].indexOf(Live.state.mode) >= 0) render(); });
  Live.on('responses', function (rs) { responses = rs; if (Live.state.mode === 'activity') render(); });
  Live.on('posts', function (ps) { posts = ps; if (Live.state.mode === 'activity' || Live.state.mode === 'board') render(); });
  Live.on('status', render);
  Live.start(room, 'screen');
  render();
  document.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen(); }
    if (e.key === 't' || e.key === 'T') {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur); MF.put('mf.screen.theme', cur);
    }
  });
}
document.documentElement.setAttribute('data-theme', MF.get('mf.screen.theme', 'light'));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.MF = window.MF || {});
