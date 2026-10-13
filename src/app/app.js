/* MANIFEST · participant app (phone-first).
   Four tabs: Live (follows the projector), Route (the seven legs of the day),
   Toolkit (builder, library, checkers), Manifest (what you take home).
   Plus: Help (FAQ + private chat with the trainer), the first-run tour,
   and the certificate. Progress is synced quietly so the trainer can help. */
(function (MF) {
'use strict';
var $ = MF.$, $$ = MF.$$, esc = MF.esc, md = MF.md, icon = MF.icon, Live = MF.Live;

/* ───────── state ───────── */
var me = MF.get('mf.me', null);          // {id, name, team, room, solo}
var P = null;                            // progress for this person
var firstSeen = {};                      // actId → ms when this phone first showed it
var lastAct = '';
var posts = [];
var wallDraft = {};
var thread = [], unread = false, certsWere = false, lastMsgPoll = 0;

function blankP() { return { cards: {}, labs: {}, checks: {}, saved: [], plan: { d7: '', d30: '', d90: '', buddy: '' }, answered: {}, voted: {}, notes: {} }; }
function loadP() { P = Object.assign(blankP(), MF.get('mf.p.' + (me ? me.id : 'guest'), {})); }
function saveP() { MF.put('mf.p.' + (me ? me.id : 'guest'), P); syncSoon(); }

/* Cargo = the participant's own progress: idea cards read, labs done,
   checks passed, prompts saved. Points = the live game. Two numbers, two jobs. */
function cargo() {
  var total = 0, got = 0;
  (MF.LEGS || []).forEach(function (L) {
    if (L.bonus) return;
    total += (L.cards || []).length + (L.labs || []).length + 1;
    got += (L.cards || []).filter(function (c, i) { return P.cards[L.id + ':' + i]; }).length;
    got += (L.labs || []).filter(function (id) { return P.labs[id]; }).length;
    if (P.checks[L.id] != null) got++;
  });
  return { got: got, total: total };
}
function legProgress(L) {
  var t = (L.cards || []).length + (L.labs || []).length + 1, g = 0;
  (L.cards || []).forEach(function (c, i) { if (P.cards[L.id + ':' + i]) g++; });
  (L.labs || []).forEach(function (id) { if (P.labs[id]) g++; });
  if (P.checks[L.id] != null) g++;
  return { g: g, t: t, pct: t ? Math.round(100 * g / t) : 0 };
}
function myPoints() { return me ? ((Live.state.totals || {})[me.id] || 0) : 0; }
function myRank() {
  if (!me) return 0;
  var tot = Live.state.totals || {}, mine = tot[me.id];
  if (mine == null) return 0;
  return 1 + Object.keys(tot).filter(function (k) { return tot[k] > mine; }).length;
}
/* Rank: earned, never lost, shown only on your own phone. XP is the live
   points plus 100 for each piece of cargo loaded, so people studying at their
   desk climb too. Six steps, from the quay to the control room. */
var RANKS = [
  { at: 0, t: 'Deckhand' }, { at: 2500, t: 'Tally Clerk' }, { at: 6000, t: 'Shipping Clerk' },
  { at: 11000, t: 'Planner' }, { at: 17000, t: 'Dispatcher' }, { at: 24000, t: 'Logistics Lead' }
];
function xp() { return myPoints() + 100 * cargo().got; }
function rankIdx(x) { var i = 0; RANKS.forEach(function (r, k) { if (x >= r.at) i = k; }); return i; }
function rankCard() {
  var x = xp(), i = rankIdx(x), r = RANKS[i], n = RANKS[i + 1];
  var pct = n ? Math.min(100, Math.round(100 * (x - r.at) / (n.at - r.at))) : 100;
  if (P.notes.rank !== r.t) { if (P.notes.rank) { MF.toast('New rank: ' + r.t); MF.vibrate(40); } P.notes.rank = r.t; MF.put('mf.p.' + (me ? me.id : 'guest'), P); }
  return '<section class="card rank-card"><div class="boxstack" aria-hidden="true">' + RANKS.map(function (q, k) {
      return '<i class="' + (k <= i ? 'steel' : 'steel locked') + '"></i>';
    }).join('') + '</div>' +
    '<div class="rank-txt"><span class="rank-name">' + esc(r.t) + '</span><span class="meta num">' + x.toLocaleString('en-US') + ' XP' +
    (n ? ' · ' + (n.at - x).toLocaleString('en-US') + ' to ' + esc(n.t) : ' · the top rank') + '</span>' +
    '<span class="xpbar" role="progressbar" aria-label="Progress to the next rank" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></span>' +
    '<span class="tiny faint">Live points, plus 100 for every idea, lab and check you load.</span></div></section>';
}
function team(id) { return (MF.TEAMS || []).filter(function (t) { return t.id === id; })[0] || null; }
function leg(id) { return (MF.LEGS || []).filter(function (L) { return L.id === id; })[0] || null; }
function lab(id) { return (MF.LABS || {})[id] || null; }
function segment(id) { return (MF.AGENDA || []).filter(function (s) { return s.id === id; })[0] || null; }

/* ───────── shell ───────── */
var TABS = [
  { r: '/live', l: 'Live', i: 'i-live' },
  { r: '/route', l: 'Route', i: 'i-route' },
  { r: '/tools', l: 'Toolkit', i: 'i-tools' },
  { r: '/manifest', l: 'Manifest', i: 'i-manifest' }
];
function shell(active, body, opts) {
  opts = opts || {};
  var t = me ? team(me.team) : null;
  var live = Live.state.act && Live.state.act.phase === 'open' && active !== '/live';
  $('#app').innerHTML =
    '<header class="topbar lip">' +
      (opts.back ? '<a class="icon-btn" href="#' + opts.back + '" aria-label="Back">' + icon('i-left', 22) + '</a>' : '<span class="logo">' + icon('i-box', 22, 2) + '<b>Manifest</b></span>') +
      (opts.title ? '<h1 class="tb-title">' + esc(opts.title) + '</h1>' : '<span class="spacer"></span>') +
      (me && !me.solo ? '<span class="status ' + Live.status + '" title="Connection"><span class="dot"></span></span>' : '') +
      '<a class="icon-btn helpbtn" href="#/help" aria-label="Help' + (unread ? ', new reply from the trainer' : '') + '">' + icon('i-help', 22) + (unread ? '<i class="pip"></i>' : '') + '</a>' +
      '<a class="pts" href="#/manifest" aria-label="Your points">' + icon('i-star', 15, 2) + '<b>' + myPoints().toLocaleString('en-US') + '</b></a>' +
      (t ? '<span class="teamdot" style="background:' + t.color + '" title="' + esc(t.name) + '"></span>' : '') +
    '</header>' +
    (live ? '<a class="livebanner" href="#/live">' + icon('i-live', 18) + '<span>Live question on the screen. Tap to answer.</span>' + icon('i-right', 18) + '</a>' : '') +
    '<main class="page" id="page">' + body + '</main>' +
    '<nav class="tabbar lip">' + TABS.map(function (x) {
      return '<a href="#' + x.r + '" class="' + (active === x.r ? 'on' : '') + '"' + (active === x.r ? ' aria-current="page"' : '') + '>' + icon(x.i, 22) + '<span>' + x.l + '</span>' +
        (x.r === '/live' && Live.state.act && Live.state.act.phase === 'open' && active !== '/live' ? '<i class="pip"></i>' : '') + '</a>';
    }).join('') + '</nav>';
}

/* ───────── join ───────── */
function viewJoin() {
  var room = MF.normRoom(MF.param('room') || (me && me.room) || '');
  var chosen = me ? me.team : '';
  $('#app').innerHTML = '<div class="join">' +
    '<header class="join-head scene">' + MF.horizon() + '<h1 class="display">Manifest<i>.</i></h1><p>' + esc(MF.APP.course) + '</p><p class="meta">' + esc(MF.APP.date + ' · ' + MF.APP.place) + '</p>' +
    '<div class="route-art" aria-hidden="true">' + routeArt() + '</div></header>' +
    '<form class="join-form glass" id="joinForm" autocomplete="off">' +
      '<label class="field"><span>Your name (first name is fine)</span><input class="input" name="name" maxlength="24" required value="' + esc(me ? me.name : '') + '" placeholder="e.g. Nok"></label>' +
      '<div class="field"><span>Your table</span><div class="chips" id="teamPick">' + MF.TEAMS.map(function (t) {
        return '<button type="button" class="chip" data-team="' + t.id + '" aria-pressed="' + (chosen === t.id) + '"><span class="sw" style="background:' + t.color + '"></span>' + esc(t.name) + '</button>';
      }).join('') + '</div><p class="hint">The name is on the card on your table.</p></div>' +
      '<label class="field"><span>Room code</span><input class="input code" name="room" maxlength="8" value="' + esc(room || MF.DEFAULT_ROOM) + '" required></label>' +
      '<button class="btn primary block" type="submit">' + icon('i-right', 18) + 'Come aboard</button>' +
      '<p class="hint center" id="joinMsg"></p>' +
      '<button class="btn ghost block small" type="button" id="soloBtn">Study on my own, without joining a room</button>' +
    '</form>' +
    '<p class="fineprint">Your name and answers are visible to the trainer and the room. Do not type customer names, prices or anything confidential here.</p>' +
  '</div>';
  var picked = chosen;
  $('#teamPick').addEventListener('click', function (e) {
    var b = e.target.closest('[data-team]'); if (!b) return;
    picked = b.getAttribute('data-team');
    $$('#teamPick .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
  });
  $('#soloBtn').addEventListener('click', function () {
    me = { id: (me && me.id) || MF.uuid(), name: 'Guest', team: '', room: '', solo: true };
    MF.put('mf.me', me); loadP(); MF.go(P.notes.toured ? '/route' : '/welcome');
  });
  $('#joinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = this.name.value.trim().replace(/\s+/g, ' ').slice(0, 24), r = MF.normRoom(this.room.value);
    if (!name) return;
    if (!picked) { $('#joinMsg').textContent = 'Pick your table first.'; return; }
    $('#joinMsg').textContent = 'Joining…';
    me = { id: (me && me.id) || MF.uuid(), name: name, team: picked, room: r, solo: false };
    MF.put('mf.me', me); loadP();
    connect().then(function () { MF.vibrate(30); syncNow(); MF.go(P.notes.toured ? '/live' : '/welcome'); })
      .catch(function (err) { $('#joinMsg').textContent = err.message || 'Could not join. Check the room code.'; });
  });
}
/* Laem Chabang to Pattaya: the port up the road from the room, and the room. */
function routeArt() {
  return '<svg viewBox="0 0 360 96" role="presentation">' +
    '<path d="M14 66 C 70 66, 92 30, 150 34 S 250 70, 300 46 S 336 28, 346 28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 5" stroke-linecap="round"/>' +
    '<circle class="stop" cx="14" cy="66" r="5"/><text x="4" y="88">Laem Chabang</text>' +
    '<circle class="stop" cx="150" cy="34" r="5"/><text x="128" y="20">Si Racha</text>' +
    '<circle class="ring" cx="346" cy="28" r="6"/><circle class="here" cx="346" cy="28" r="6"/><text class="on" x="352" y="12" text-anchor="end">Pattaya, today</text>' +
    '</svg>';
}

function connect() {
  if (!me || me.solo) return Promise.resolve();
  return Live.start(me.room, 'player').then(function (res) {
    if (res && res.missing) throw new Error('Room ' + me.room + ' is not open yet. Check the code on the screen.');
    return Live.join(me);
  });
}

/* ───────── live ───────── */
function viewLive() {
  if (!me || me.solo) {
    shell('/live', '<section class="empty-live card"><h2>You are studying solo</h2><p class="muted">Live questions appear here when you join the room from the projector.</p><button class="btn primary" data-act="rejoin">Join the room</button></section>');
    return;
  }
  var st = Live.state, act = st.act, def = Live.activity(act);
  var body = '';
  if (act && def && st.mode === 'activity') body = playerActivity(act, def);
  else body = lobby(st);
  shell('/live', body);
  wireActivity(act, def);
}

function lobby(st) {
  var s = segment(st.segment), L = s && s.leg ? leg('leg' + s.leg) : null;
  var t = team(me.team);
  var h = '<section class="aboard hello scene">' + MF.horizon() + '<h2>Good to see you, ' + esc(me.name.split(' ')[0]) + '.</h2>' +
    '<div class="headmeta">' + (t ? '<span class="tbl"><i class="sw" style="background-color:' + t.color + '"></i>' + esc(t.name) + '</span>' : '') + '<span>Room ' + esc(me.room) + '</span>' +
    '<span class="num">' + (myRank() ? 'No. ' + myRank() + ' · ' : '') + myPoints().toLocaleString('en-US') + ' points</span>' +
    '<span class="status ' + Live.status + '"><span class="dot"></span>' + (Live.status === 'local' ? 'Local mode' : Live.status === 'online' ? 'Live' : Live.status === 'offline' ? 'Reconnecting' : 'Connecting') + '</span></div></section>';
  if (st.timer && st.timer.endsAt > Date.now()) h += '<section class="card timer-card"><span class="eyebrow">' + esc(st.timer.label || 'Time left') + '</span><b class="mono" data-ends="' + st.timer.endsAt + '">–:––</b></section>';
  if (st.note) h += '<div class="note">' + esc(st.note) + '</div>';
  if (st.mode === 'leaderboard' || st.mode === 'podium') {
    h += '<section class="card"><h3>' + (myRank() ? 'You are number ' + myRank() + ' in the room' : 'Scores are up') + '</h3><p class="muted" style="margin:6px 0 0">' + myPoints().toLocaleString('en-US') + ' points so far. The full board is on the screen.</p></section>';
  }
  if (!P.notes.toured) h += '<a class="card tourlink" href="#/welcome">' + icon('i-help', 22) + '<div><b>New here? Take the 60-second tour</b><span class="muted small">What each tab does, and how to get help.</span></div>' + icon('i-right', 18) + '</a>';
  if (s) {
    h += '<section class="now-card glass"><div><h3>' + esc(s.title) + '</h3><span class="now-when">Now · ' + esc(s.start + ' to ' + s.end) + '</span></div>' + (s.sub ? '<p class="muted">' + esc(s.sub) + '</p>' : '') +
      (s.labs ? s.labs.map(function (id) { var x = lab(id); return x ? '<a class="btn primary block" href="#/lab/' + id + '">' + (s.labs.length === 1 ? 'Start the hands-on' : esc(x.title)) + icon('i-right', 18) + '</a>' : ''; }).join('') : '') +
      (L ? '<a class="btn ghost block small" href="#/leg/' + L.id + '">' + icon('i-route', 16) + 'Read ' + esc(L.name) + '</a>' : '') + '</section>';
  } else {
    h += '<section class="now-card glass"><h3>Waiting for the trainer</h3><p class="muted">Questions and games will appear here. Keep this page open.</p></section>';
  }
  h += jobsCard(st.segment);
  h += rankCard();
  h += '<section><h3 class="sect">Today</h3><ol class="today">' + (MF.AGENDA || []).filter(function (x) { return !x.hideInApp; }).map(function (x) {
    var on = s && x.id === s.id;
    return '<li class="' + (on ? 'on' : '') + (x.kind === 'break' ? ' brk' : '') + '"><span class="mono">' + esc(x.start) + '</span><span>' + esc(x.title) + '</span></li>';
  }).join('') + '</ol></section>';
  return h;
}

function playerActivity(act, def) {
  var answered = P.answered[act.id];
  var has = answered !== undefined;
  var phase = act.phase;
  if (phase === 'open' && !firstSeen[act.id]) firstSeen[act.id] = Date.now();
  var head = '<h2 class="q">' + esc(def.q) + '</h2>' + (def.sub ? '<p class="muted small">' + esc(def.sub) + '</p>' : '') +
    '<div class="act-top"><span class="pill brand">' + icon(MF.R.kindIcon(def.kind), 14) + MF.R.kindLabel(def.kind) + '</span>' +
    (act.gameTitle ? '<span class="pill">' + act.qn + ' / ' + act.qt + '</span>' : '') + '<span class="spacer"></span>' +
    (phase === 'locked' ? '<span class="pill">Closed</span>' : '') + '</div>';
  var timer = '';
  if (phase === 'open' && act.secs && !has) {
    var left = Math.max(0, act.secs * 1000 - (Date.now() - firstSeen[act.id]));
    timer = '<div class="countbar"><i style="animation-duration:' + left + 'ms"></i></div>';
  }

  /* walls stay interactive while open, and readable after */
  if (def.kind === 'wall') return head + wallPlayer(act, def);

  if (phase === 'reveal') return head + revealView(act, def);
  if (has || phase === 'locked') {
    return head + '<div class="verdict ' + (has ? 'wait' : 'neutral') + '">' + icon(has ? 'i-check' : 'i-lock', 36, 2.2) +
      '<h2>' + (has ? 'Locked in' : 'Time is up') + '</h2><p>' + (has ? esc(describe(def, answered)) : 'This one closed before you answered.') + '</p>' +
      (has ? '<p class="small">Watch the screen for the answer.</p>' : '') + '</div>';
  }
  return head + timer + inputFor(act, def);
}

function describe(def, a) {
  if (a == null) return '';
  if ((def.kind === 'quiz' || def.kind === 'poll') && def.options) return 'You chose: ' + def.options[a];
  if (def.kind === 'rank' && Array.isArray(a)) return 'Your order: ' + a.map(function (i) { return def.items[i]; }).join(' → ');
  if (def.kind === 'scale') return 'You chose ' + a;
  if (def.kind === 'number') return 'You answered ' + a + (def.unit ? ' ' + def.unit : '');
  return 'You said: ' + a;
}

function inputFor(act, def) {
  if (def.kind === 'quiz' || def.kind === 'poll') {
    var n = def.options.length;
    var long = def.options.some(function (o) { return o.length > 42; });
    return '<div class="tiles ' + (long ? 'list' : n === 2 ? 'two' : '') + '">' + def.options.map(function (o, i) {
      return '<button class="tile tile-' + MF.SHAPES[i % 4] + '" data-ans="' + i + '" aria-label="' + esc(MF.shapeName(i) + ': ' + o) + '">' + MF.shape(i, 26) + '<span>' + esc(o) + '</span></button>';
    }).join('') + '</div>';
  }
  if (def.kind === 'scale') {
    var lo = def.min || 1, hi = def.max || 5, b = '';
    for (var v = lo; v <= hi; v++) b += '<button data-scale="' + v + '">' + v + '</button>';
    return '<div class="scale-row" style="--n:' + (hi - lo + 1) + '">' + b + '</div><div class="row small faint" style="margin-top:8px"><span>' + esc((def.labels || [])[0] || '') + '</span><span class="spacer"></span><span>' + esc((def.labels || [])[1] || '') + '</span></div>';
  }
  if (def.kind === 'cloud') {
    return '<form class="stack" data-form="cloud"><input class="input" name="w" maxlength="' + (def.max || 30) + '" placeholder="One or two words" required autocomplete="off"><button class="btn primary block">Send</button></form>';
  }
  if (def.kind === 'number') {
    return '<form class="stack" data-form="number"><div class="numwrap"><input class="input code" name="n" inputmode="decimal" placeholder="0" required autocomplete="off">' + (def.unit ? '<span>' + esc(def.unit) + '</span>' : '') + '</div>' +
      (def.hint ? '<p class="hint">' + md(def.hint) + '</p>' : '') + '<button class="btn primary block">Lock in</button></form>';
  }
  if (def.kind === 'rank') {
    return '<p class="small muted">Tap in order, most important first. Tap again to undo.</p><div class="rank-list" data-rank>' + def.items.map(function (x, i) {
      return '<button class="rank-item" data-ri="' + i + '"><span class="badge"></span><span>' + esc(x) + '</span></button>';
    }).join('') + '</div><button class="btn primary block" data-ranksend disabled style="margin-top:12px">Lock in my order</button>';
  }
  return '';
}

function revealView(act, def) {
  var st = Live.state, a = P.answered[act.id], has = a !== undefined;
  var h = '';
  var gradable = def.kind === 'quiz' || def.kind === 'number' || (def.kind === 'rank' && def.correct);
  if (gradable) {
    var ok = has && Live.Score.isCorrect(def, a);
    var pts = st.reveal && st.reveal.points ? (st.reveal.points[me.id] || 0) : 0;
    var streak = (st.streaks || {})[me.id] || 0;
    h += '<div class="verdict ' + (ok ? 'ok' : has ? 'bad' : 'neutral') + '">' + icon(ok ? 'i-check' : has ? 'i-x' : 'i-lock', 38, 2.4) +
      '<h2>' + (ok ? 'Correct' : has ? 'Not this time' : 'No answer') + '</h2>' +
      (ok ? '<span class="pts">+' + pts.toLocaleString('en-US') + '</span>' : '') +
      (ok && streak > 1 ? '<p>Streak ' + streak + ' 🔥</p>'.replace(' 🔥', '') : '') +
      '<p>' + (myRank() ? 'You are number ' + myRank() + ' with ' + myPoints().toLocaleString('en-US') + ' points' : '') + '</p></div>';
  }
  /* everyone sees the room's answer: the point of a poll is the conversation after it */
  var counts = st.reveal && st.reveal.counts ? st.reveal.counts : [];
  var t = { total: 0, counts: counts, avg: st.reveal ? st.reveal.avg || 0 : 0, words: [], borda: [], numbers: [], correctN: 0 };
  if (def.kind === 'quiz' || def.kind === 'poll' || def.kind === 'scale') {
    h += '<div class="card" style="margin-top:14px">' + MF.R.results(def, t, { reveal: true, labels: true }) + '</div>';
  } else if (def.why) {
    h += '<div class="why">' + icon('i-spark', 18) + '<div>' + md(def.why) + '</div></div>';
  }
  if (has && !gradable) h += '<p class="muted small" style="margin-top:12px">' + esc(describe(def, a)) + '</p>';
  return h;
}

function wallPlayer(act, def) {
  var mine = posts.filter(function (p) { return p.board === act.id; });
  var open = act.phase === 'open';
  var h = '';
  if (open) {
    h += '<form class="card stack wallform" data-form="wall">' +
      (def.cols && def.cols.length ? '<div class="chips" data-cols>' + def.cols.map(function (c, i) {
        return '<button type="button" class="chip" data-col="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + '</button>';
      }).join('') + '</div>' : '') +
      '<textarea class="textarea" name="body" maxlength="280" placeholder="' + esc(def.placeholder || 'Write your post') + '" required>' + esc(wallDraft[act.id] || '') + '</textarea>' +
      '<div class="row"><label class="row small"><input type="checkbox" name="anon"' + (def.anon === false ? '' : ' checked') + '> Post anonymously</label><span class="spacer"></span><button class="btn primary">Post</button></div></form>';
  } else {
    h += '<p class="muted small">This wall is closed. The top posts are on the screen.</p>';
  }
  h += '<div class="wall-wrap">' + MF.R.wall(def, mine, { canVote: true, voted: P.voted, byVotes: !open }) + '</div>';
  return h;
}

function wireActivity(act, def) {
  if (!act || !def) return;
  var page = $('#page');
  function send(answer) {
    if (P.answered[act.id] !== undefined) return;
    var ms = Date.now() - (firstSeen[act.id] || Date.now());
    P.answered[act.id] = answer; saveP(); MF.vibrate(20);
    viewLive();
    Live.respond(act.id, answer, ms).then(function (res) {
      if (res && res.late) { delete P.answered[act.id]; saveP(); MF.toast('Too late: that question had already closed', 'bad'); viewLive(); }
      else if (res && res.error) { delete P.answered[act.id]; saveP(); MF.toast('Not sent. Check your connection and try again.', 'bad'); viewLive(); }
    });
  }
  page.querySelectorAll('[data-ans]').forEach(function (b) {
    b.addEventListener('click', function () { b.classList.add('picked'); b.parentNode.classList.add('done'); send(+b.getAttribute('data-ans')); });
  });
  page.querySelectorAll('[data-scale]').forEach(function (b) {
    b.addEventListener('click', function () { send(+b.getAttribute('data-scale')); });
  });
  var f = page.querySelector('[data-form="cloud"]');
  if (f) f.addEventListener('submit', function (e) { e.preventDefault(); var w = f.w.value.trim(); if (w) send(w.slice(0, def.max || 30)); });
  var fn = page.querySelector('[data-form="number"]');
  if (fn) fn.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = fn.n.value.trim(), n = parseFloat(raw.replace(/[, ]/g, ''));
    if (isNaN(n)) { MF.toast('Type a number', 'bad'); return; }
    send(n);
  });
  var rl = page.querySelector('[data-rank]');
  if (rl) {
    var order = [];
    rl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ri]'); if (!b) return;
      var i = +b.getAttribute('data-ri'), at = order.indexOf(i);
      if (at >= 0) order.splice(at, 1); else order.push(i);
      rl.querySelectorAll('[data-ri]').forEach(function (x) {
        var k = order.indexOf(+x.getAttribute('data-ri'));
        x.classList.toggle('set', k >= 0); x.querySelector('.badge').textContent = k >= 0 ? k + 1 : '';
      });
      page.querySelector('[data-ranksend]').disabled = order.length !== def.items.length;
    });
    page.querySelector('[data-ranksend]').addEventListener('click', function () { send(order.slice()); });
  }
  var wf = page.querySelector('[data-form="wall"]');
  if (wf) {
    var col = def.cols && def.cols.length ? def.cols[0] : '';
    var cols = wf.querySelector('[data-cols]');
    if (cols) cols.addEventListener('click', function (e) {
      var b = e.target.closest('[data-col]'); if (!b) return;
      col = b.getAttribute('data-col');
      cols.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    });
    wf.body.addEventListener('input', function () { wallDraft[act.id] = wf.body.value; });
    wf.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = wf.body.value.trim(); if (!body) return;
      Live.post(act.id, body, col, wf.anon.checked).then(function (res) {
        wallDraft[act.id] = ''; MF.toast(res && res.queued ? 'Saved. It will post when you are back online.' : 'Posted');
        wf.body.value = '';
      }).catch(function (err) { MF.toast(err.message || 'Could not post', 'bad'); });
    });
  }
  page.querySelectorAll('[data-vote]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-vote');
      if (P.voted[id]) return;
      P.voted[id] = 1; saveP(); b.classList.add('on');
      Live.vote(isNaN(+id) ? id : +id);
    });
  });
}

/* ───────── route ───────── */
function viewRoute() {
  var c = cargo();
  var h = '<section class="route-head scene">' + MF.horizon() + '<h2>Seven legs, one shipment</h2>' +
    '<p class="lead">Everything we do in the room, with the prompts and files to do it again at your desk.</p>' +
    '<div class="cargo"><div class="cargo-bar"><i class="steel" style="width:' + (c.total ? 100 * c.got / c.total : 0) + '%"></i></div><span class="mono small">' + c.got + ' / ' + c.total + ' loaded</span></div></section>';
  var main = (MF.LEGS || []).filter(function (L) { return !L.bonus; }), extra = (MF.LEGS || []).filter(function (L) { return L.bonus; });
  var reach = -1; main.forEach(function (L, i) { if (legProgress(L).g > 0) reach = i; });
  h += '<ol class="legs">' + main.map(function (L, i) {
    var p = legProgress(L);
    return '<li class="legrow' + (p.pct === 100 ? ' done' : p.g ? ' part' : '') + (i > 0 && i <= reach ? ' in' : '') + (i < reach ? ' out' : '') + '" style="--i:' + i + '"><a href="#/leg/' + L.id + '">' +
      '<span class="legnum ' + (p.g ? 'steel' : 'steel locked') + '">' + (i + 1) + '</span><div class="legtxt"><b>' + esc(L.name) + '</b><span class="muted small">' + esc(L.tagline) + '</span>' +
      '<span class="meta">' + esc(L.time) + ' · ' + modLabel(L.mods) + '</span>' +
      '<span class="legbar"><i style="width:' + p.pct + '%"></i></span></div>' + icon('i-right', 18) + '</a></li>';
  }).join('') + '</ol>';
  if (extra.length) h += '<h3 class="sect">Take-home practice</h3>' + extra.map(function (L) {
    return '<a class="card casefile" href="#/leg/' + L.id + '">' + icon('i-book', 24, 1.8) + '<div><b>' + esc(L.name) + '</b><span class="muted small">' + esc(L.tagline) + '</span><span class="meta">' + esc(L.labs.length) + ' hands-on tasks · ' + modLabel(L.mods) + '</span></div>' + icon('i-right', 18) + '</a>';
  }).join('');
  h += '<a class="card casefile" href="#/case">' + icon('i-box', 26, 1.8) + '<div><b>' + esc((MF.CASE || {}).name || 'The case') + '</b><span class="muted small">' + esc((MF.CASE || {}).line || '') + '</span><span class="meta">The case you work on all day</span></div>' + icon('i-right', 18) + '</a>';
  shell('/route', h);
}

function viewLeg(id) {
  var L = leg(id); if (!L) return MF.go('/route');
  var main = MF.LEGS.filter(function (x) { return !x.bonus; });
  var idx = main.indexOf(L), next = idx >= 0 ? main[idx + 1] : null;
  var h = '<section class="leg-hero"><h2>' + esc(L.name) + '</h2><div class="headmeta">' + (L.bonus ? 'Take-home' : 'Leg ' + (idx + 1)) + ' · ' + esc(L.time) + ' · ' + modLabel(L.mods) + '</div><p class="lead">' + md(L.intro) + '</p></section>';
  h += '<section><h3 class="sect">The ideas</h3>' + (L.cards || []).map(function (c, i) {
    var k = L.id + ':' + i, seen = P.cards[k];
    return '<details class="idea' + (seen ? ' seen' : '') + '" data-card="' + k + '"><summary><span class="ck">' + icon('i-check', 14, 3) + '</span><span>' + esc(c.t) + '</span></summary>' +
      '<div class="idea-body">' + c.b.map(function (p) { return '<p>' + md(p) + '</p>'; }).join('') +
      (c.ex ? '<div class="example"><span class="eyebrow">Example</span><p>' + md(c.ex) + '</p></div>' : '') + '</div></details>';
  }).join('') + '</section>';
  if (L.labs && L.labs.length) {
    h += '<section><h3 class="sect">Hands-on</h3>' + L.labs.map(function (lid) {
      var x = lab(lid); if (!x) return '';
      return '<a class="labrow card' + (P.labs[lid] ? ' done' : '') + '" href="#/lab/' + lid + '"><span class="arch arch-' + (x.arch || 'read').toLowerCase() + '">' + esc(x.arch || '') + '</span><div><b>' + esc(x.title) + '</b><span class="muted small">' + esc(x.time || '') + ' · ' + esc(x.blurb || '') + '</span></div>' + icon(P.labs[lid] ? 'i-check' : 'i-right', 18) + '</a>';
    }).join('') + '</section>';
  }
  if (L.trap) h += '<section class="trap">' + icon('i-alert', 22) + '<div><b class="t">The accuracy trap</b><p>' + md(L.trap) + '</p></div></section>';
  if (L.check && L.check.length) h += '<section><h3 class="sect">Quick check</h3><div id="check">' + checkHtml(L) + '</div></section>';
  if (L.files && L.files.length) h += '<section><h3 class="sect">Files for this leg</h3>' + L.files.map(fileRow).join('') + '</section>';
 h += stuckRow('Leg: ' + L.name);
  h += '<nav class="legnav">' + (next ? '<a class="btn primary block" href="#/leg/' + next.id + '">Next leg: ' + esc(next.name) + icon('i-right', 18) + '</a>' : '<a class="btn primary block" href="#/manifest">Finish: write your plan' + icon('i-right', 18) + '</a>') + '</nav>';
  shell('/route', h, { back: '/route', title: L.bonus ? 'Take-home' : 'Leg ' + (idx + 1) });
  $$('details.idea').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) { var k = d.getAttribute('data-card'); if (!P.cards[k]) { P.cards[k] = 1; saveP(); d.classList.add('seen'); } } });
  });
  wireCheck(L);
}
function fileRow(f) {
  var ic = /\.xlsx?$|\.csv$/.test(f.href) ? 'i-sheet' : /\.pptx?$/.test(f.href) ? 'i-slides' : 'i-file';
  return '<a class="filerow" href="' + esc(f.href) + '" download>' + icon(ic, 22) + '<div><b>' + esc(f.name) + '</b><span class="muted small">' + esc(f.note || '') + '</span></div>' + icon('i-download', 18) + '</a>';
}

/* quick check: self-marked, local only, omission costs nothing here */
function checkHtml(L) {
  var done = P.checks[L.id];
  return L.check.map(function (q, qi) {
    var picked = P.notes['chk:' + L.id + ':' + qi];
    return '<div class="chk card"><p><b>' + (qi + 1) + '.</b> ' + md(q.q) + '</p><div class="chk-opts">' + q.o.map(function (o, oi) {
      var cls = picked == null ? '' : (oi === q.a ? ' right' : (oi === picked ? ' wrong' : ''));
      return '<button class="chk-opt' + cls + '" data-q="' + qi + '" data-o="' + oi + '"' + (picked != null ? ' disabled' : '') + '>' + esc(o) + '</button>';
    }).join('') + '</div>' + (picked != null && q.why ? '<p class="small muted chk-why">' + md(q.why) + '</p>' : '') + '</div>';
  }).join('') + (done != null ? '<p class="small"><b>' + done + ' / ' + L.check.length + '</b> on the first try.</p>' : '');
}
function wireCheck(L) {
  var box = $('#check'); if (!box) return;
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.chk-opt'); if (!b) return;
    var qi = +b.getAttribute('data-q'), oi = +b.getAttribute('data-o');
    P.notes['chk:' + L.id + ':' + qi] = oi;
    var all = L.check.every(function (q, i) { return P.notes['chk:' + L.id + ':' + i] != null; });
    if (all && P.checks[L.id] == null) P.checks[L.id] = L.check.filter(function (q, i) { return P.notes['chk:' + L.id + ':' + i] === q.a; }).length;
    saveP(); box.innerHTML = checkHtml(L);
  });
}

/* ───────── lab ───────── */
var BLANK = /\[([A-Z][A-Z0-9 _\-\/,.]*)\]/g;
function isPaste(k) { return /^PASTE/.test(k); }
function fillPrompt(tpl, vals) {
  return tpl.replace(BLANK, function (m, k) { var v = vals[k]; return v && v.trim() ? v.trim() : m; });
}
function fieldsOf(tpl) {
  var seen = {}, out = [];
  tpl.replace(BLANK, function (m, k) { if (!seen[k] && !isPaste(k)) { seen[k] = 1; out.push(k); } });
  return out;
}
/* Lab data lives in files/ once; fetched on demand and cached. */
var dataCache = {};
function labData(x) {
  if (!x.data) return Promise.resolve(null);
  if (x.data.text) return Promise.resolve(x.data.text);
  var src = x.data.src;
  if (dataCache[src]) return Promise.resolve(dataCache[src]);
  return fetch(src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (t) { dataCache[src] = t.replace(/\r\n/g, '\n').trim(); return dataCache[src]; })
    .catch(function () { return null; });
}
/* On a phone, one tap should copy the prompt WITH the data in it. */
function promptFor(tpl, vals, data, forCopy) {
  return tpl.replace(BLANK, function (m, k) {
    if (isPaste(k)) return data ? (forCopy ? data : '⟨ the data above goes here when you tap Copy ⟩') : m;
    var v = vals[k]; return v && v.trim() ? v.trim() : m;
  });
}
function viewLab(id) {
  var x = lab(id); if (!x) return MF.go('/route');
  var tierKey = 'tier:' + id, tier = P.notes[tierKey] || (x.tiers ? 'bronze' : '');
  var tpl = x.tiers ? x.tiers[tier].prompt : x.prompt;
  var vals = P.notes['vals:' + id] || {};
  var h = '<section class="lab-hero"><h2>' + esc(x.title) + '</h2><div class="headmeta"><span class="arch arch-' + (x.arch || 'read').toLowerCase() + '">' + esc(x.arch || '') + '</span><span>' + esc(x.time || '') + '</span>' +
    (x.tools ? '<span>' + esc(x.tools) + '</span>' : '') + '</div>' + (x.goal ? '<p class="lead">' + md(x.goal) + '</p>' : '') + '</section>';
  if (x.steps) h += '<ol class="steps">' + x.steps.map(function (s) { return '<li>' + md(s) + '</li>'; }).join('') + '</ol>';
  if (x.data) {
    h += '<section class="card databox"><div class="row"><span class="eyebrow">' + esc(x.data.label || 'Data to paste') + '</span><span class="spacer"></span><button class="btn small" data-copy="data">' + icon('i-copy', 15) + 'Copy data</button></div>' +
      '<pre class="data" id="labData">' + (x.data.text ? esc(x.data.text) : 'Loading…') + '</pre></section>';
  }
  if (x.files) h += x.files.map(fileRow).join('');
  if (x.tiers) {
    h += '<div class="tiers" role="tablist">' + ['bronze', 'silver', 'gold'].filter(function (k) { return x.tiers[k]; }).map(function (k) {
      return '<button class="tierbtn ' + k + (tier === k ? ' on' : '') + '" data-tier="' + k + '">' + k[0].toUpperCase() + k.slice(1) + '<i>' + esc(x.tiers[k].label) + '</i></button>';
    }).join('') + '</div>';
    if (x.tiers[tier].note) h += '<p class="small muted">' + md(x.tiers[tier].note) + '</p>';
  }
  var fields = fieldsOf(tpl);
  if (fields.length) {
    h += '<section class="card fills"><span class="eyebrow">Fill the blanks (or leave them and edit in the AI)</span>' + fields.map(function (k) {
      var lbl = (k.charAt(0) + k.slice(1).toLowerCase()).replace(/\b(po|otif|rop|sku|z)\b/g, function (w) { return w.toUpperCase(); });
      return '<label class="field"><span>' + esc(lbl) + '</span><input class="input" data-field="' + esc(k) + '" value="' + esc(vals[k] || '') + '"></label>';
    }).join('') + '</section>';
  }
  h += '<section class="card promptbox"><div class="row"><span class="eyebrow">Your prompt</span><span class="spacer"></span><button class="btn small primary" data-copy="prompt">' + icon('i-copy', 15) + 'Copy</button></div>' +
    '<pre class="prompt" id="promptOut">' + esc(promptFor(tpl, vals, x.data && x.data.text, false)) + '</pre>' +
    (/\[PASTE/.test(tpl) && x.data ? '<p class="hint">Copy includes the data. One paste and you are done.</p>' : '') +
    '<div class="row wrap openers"><span class="small faint">Open:</span>' + openers() + '</div></section>';
  if (x.check) h += '<section class="card checkbox"><span class="eyebrow">' + icon('i-shield', 14) + ' Before you trust it, check</span><ul class="ticks">' + x.check.map(function (c, i) {
    var k = 'tick:' + id + ':' + i;
    return '<li><label><input type="checkbox" data-tick="' + k + '"' + (P.notes[k] ? ' checked' : '') + '> <span>' + md(c) + '</span></label></li>';
  }).join('') + '</ul></section>';
  if (x.stretch) h += '<section class="stretch">' + icon('i-star', 18) + '<div><b class="t">Stretch, if you finish early</b><p>' + md(x.stretch) + '</p></div></section>';
  h += '<section class="card"><span class="eyebrow">Keep it</span><p class="small muted">Paste the version that worked best. It goes into your Manifest to take home.</p>' +
    '<textarea class="textarea paperish" id="keepTxt" placeholder="Paste your best prompt here">' + esc((P.notes['keep:' + id]) || '') + '</textarea>' +
    '<button class="btn dark block" data-keep>' + icon('i-manifest', 18) + (P.labs[id] ? 'Update in my Manifest' : 'Save to my Manifest and mark done') + '</button></section>';
  h += stuckRow('Task: ' + x.title);
  var L = (MF.LEGS || []).filter(function (l) { return (l.labs || []).indexOf(id) >= 0; })[0];
  shell('/route', h, { back: L ? '/leg/' + L.id : '/route', title: 'Hands-on' });

  var page = $('#page'), data = x.data && x.data.text ? x.data.text : null;
  function showPrompt() { $('#promptOut').textContent = promptFor(tpl, vals, data, false); }
  function fullPrompt() { return promptFor(tpl, vals, data, true); }
  if (x.data && !x.data.text) labData(x).then(function (t) {
    var el = $('#labData'); if (!el) return;
    if (t) { data = t; el.textContent = t; showPrompt(); }
    else { el.innerHTML = 'Could not load the data here. ' + (x.files && x.files[0] ? 'Download <a href="' + esc(x.files[0].href) + '" download>' + esc(x.files[0].name) + '</a> instead.' : 'Ask the trainer for the file.'); }
  });
  page.addEventListener('input', function (e) {
    var f = e.target.getAttribute('data-field');
    if (f) { vals[f] = e.target.value; P.notes['vals:' + id] = vals; saveP(); showPrompt(); }
    if (e.target.id === 'keepTxt') { P.notes['keep:' + id] = e.target.value; saveP(); }
  });
  page.addEventListener('change', function (e) {
    var k = e.target.getAttribute('data-tick'); if (k) { P.notes[k] = e.target.checked; saveP(); }
  });
  page.addEventListener('click', function (e) {
    var b = e.target.closest('button,a'); if (!b) return;
    if (b.getAttribute('data-copy') === 'data') { if (data) MF.copy(data, 'Data copied'); else MF.toast('Data still loading', 'bad'); }
    if (b.getAttribute('data-copy') === 'prompt') MF.copy(fullPrompt(), 'Prompt copied');
    if (b.getAttribute('data-tier')) { P.notes[tierKey] = b.getAttribute('data-tier'); saveP(); viewLab(id); }
    if (b.hasAttribute('data-keep')) {
      var txt = $('#keepTxt').value.trim() || promptFor(tpl, vals, null, false);
      var item = P.saved.filter(function (s) { return s.lab === id; })[0];
      if (item) { item.text = txt; item.at = Date.now(); }
      else P.saved.push({ id: MF.uid(8), lab: id, title: x.title, arch: x.arch, text: txt, at: Date.now() });
      P.labs[id] = 1; saveP(); MF.vibrate(25); MF.toast('Saved to your Manifest');
      viewLab(id);
    }
    if (b.hasAttribute('data-open')) {
      /* Copy first, so the prompt is on the clipboard whichever tool opens. */
      MF.copy(fullPrompt(), 'Prompt copied');
    }
  });
}
function openers() {
  return [
    ['ChatGPT', 'https://chatgpt.com/'],
    ['Gemini', 'https://gemini.google.com/app'],
    ['Copilot', 'https://copilot.microsoft.com/'],
    ['Claude', 'https://claude.ai/new']
  ].map(function (o) { return '<a class="opener" data-open href="' + o[1] + '" target="_blank" rel="noopener">' + o[0] + icon('i-external', 13) + '</a>'; }).join('');
}

function modLabel(m) { return (/[–,-]/.test(m) ? 'Modules ' : 'Module ') + esc(m); }

/* ───────── case file ───────── */
function viewCase() {
  var C = MF.CASE || {};
  var h = '<section class="leg-hero"><h2>' + esc(C.name || '') + '</h2><div class="headmeta">Fictional company, used all day</div><p class="lead">' + md(C.line || '') + '</p></section>';
  if (C.monday) h += mondayHtml(C.monday);
  (C.facts || []).forEach(function (f) { h += '<div class="factrow"><b class="t">' + esc(f[0]) + '</b><p>' + md(f[1]) + '</p></div>'; });
  if (C.files) h += '<h3 class="sect" style="margin-top:24px">Case files</h3>' + C.files.map(fileRow).join('');
  shell('/route', h, { back: '/route', title: 'The case' });
}

/* ───────── manifest ───────── */
function viewManifest() {
  var c = cargo(), t = me ? team(me.team) : null;
  var h = '<section class="mf-head label-stock"><div class="row"><span>MANIFEST · ' + esc(MF.APP.date.toUpperCase()) + '</span><span class="spacer"></span><span>NO. ' + esc((me && me.id || '').slice(0, 8).toUpperCase()) + '</span></div>' +
    '<h2>' + esc(me && !me.solo ? me.name : 'Your manifest') + '</h2><p class="mf-rank">' + esc(RANKS[rankIdx(xp())].t.toUpperCase()) + ' · ' + xp().toLocaleString('en-US') + ' XP</p><div class="mf-stats"><div><b>' + myPoints().toLocaleString('en-US') + '</b><span>points</span></div><div><b>' + (myRank() || '–') + '</b><span>place</span></div><div><b>' + c.got + '/' + c.total + '</b><span>cargo</span></div><div><b>' + P.saved.length + '</b><span>prompts</span></div></div>' +
    '<div class="barcode" aria-hidden="true"></div>' + (t ? '<p class="small">Table ' + esc(t.name) + ' · ' + esc(MF.APP.place) + '</p>' : '') + '</section>';

  h += certCard();
  h += '<section><h3 class="sect">My prompts</h3>' + (P.saved.length ? P.saved.map(function (s) {
    return '<article class="saved label-stock"><div class="row"><span class="arch arch-' + (s.arch || 'read').toLowerCase() + '">' + esc(s.arch || '') + '</span><b>' + esc(s.title) + '</b><span class="spacer"></span>' +
      '<button class="icon-btn" data-copysaved="' + s.id + '" aria-label="Copy">' + icon('i-copy', 18) + '</button><button class="icon-btn" data-delsaved="' + s.id + '" aria-label="Delete">' + icon('i-trash', 18) + '</button></div><pre>' + esc(s.text) + '</pre></article>';
  }).join('') : '<p class="muted small">Nothing yet. Every hands-on task ends with "Save to my Manifest".</p>') + '</section>';

  var plan = P.plan;
  h += '<section class="card plan"><h3>My plan</h3>' +
    '<p class="small muted">If this happens, I will do this, and I will check that. Name a real moment from your week. "When the Monday stock report lands, I will paste it into ChatGPT with my reorder prompt, and check every reorder quantity against the sheet before I send it."</p>' +
    planField('d7', 'In the next 7 days (a READ or DRAFT task)', 'When … I will … and I will check …', plan.d7) +
    planField('d30', 'By day 30 (a task you do every week)', 'When … I will … and I will check …', plan.d30) +
    planField('d90', 'By day 90 (something bigger, with a named person who checks it)', 'When … I will … and … checks it', plan.d90) +
    '<label class="field"><span>My buddy (who will ask me about this on day 7)</span><input class="input" data-plan="buddy" value="' + esc(plan.buddy || '') + '" maxlength="40"></label></section>';

  h += '<section class="row wrap mf-actions"><button class="btn primary" data-export>' + icon('i-download', 18) + 'Download my Manifest</button><button class="btn" data-print>' + icon('i-file', 18) + 'Print / PDF</button></section>';
  h += '<section class="card settings"><h3 style="font-size:19px;margin-bottom:6px">This device</h3><p class="small muted">' + (MF.storageOK() ? 'Your work is saved on this phone only. Download it before you change phones.' : '<b>This browser is not saving.</b> Private mode? Download your Manifest before you close the tab.') + '</p>' +
    '<div class="row wrap"><button class="btn small" data-theme>' + icon('i-moon', 16) + 'Light / dark</button>' + (me && !me.solo ? '<button class="btn small" data-rename>Change name or table</button>' : '<button class="btn small" data-act="rejoin">Join a room</button>') + '</div></section>';
  shell('/manifest', h);

  var page = $('#page');
  page.addEventListener('input', function (e) { var k = e.target.getAttribute('data-plan'); if (k) { P.plan[k] = e.target.value; saveP(); } });
  page.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var cid = b.getAttribute('data-copysaved'), did = b.getAttribute('data-delsaved');
    if (cid) MF.copy(P.saved.filter(function (s) { return s.id === cid; })[0].text, 'Prompt copied');
    if (did && confirm('Delete this prompt from your Manifest?')) { P.saved = P.saved.filter(function (s) { return s.id !== did; }); saveP(); viewManifest(); }
    if (b.hasAttribute('data-export')) MF.download('my-manifest.txt', manifestText());
    if (b.hasAttribute('data-print')) window.print();
    if (b.hasAttribute('data-theme')) { var cur = document.documentElement.getAttribute('data-theme'); var nx = cur === 'dark' ? 'light' : cur === 'light' ? '' : 'dark'; if (nx) document.documentElement.setAttribute('data-theme', nx); else document.documentElement.removeAttribute('data-theme'); MF.put('mf.theme', nx); }
    if (b.hasAttribute('data-rename')) MF.go('/join');
  });
}
function planField(k, label, ph, v) {
  return '<label class="field"><span>' + esc(label) + '</span><textarea class="textarea paperish" data-plan="' + k + '" placeholder="' + esc(ph) + '" rows="3">' + esc(v || '') + '</textarea></label>';
}
function manifestText() {
  var L = [];
  L.push('MANIFEST: ' + MF.APP.course);
  L.push(MF.APP.date + ' · ' + MF.APP.place);
  L.push((me && me.name ? me.name : '') + '  ·  ' + myPoints() + ' points');
  L.push('');
  L.push('MY PLAN');
  L.push('7 days:  ' + (P.plan.d7 || '(not written yet)'));
  L.push('30 days: ' + (P.plan.d30 || '(not written yet)'));
  L.push('90 days: ' + (P.plan.d90 || '(not written yet)'));
  L.push('Buddy:   ' + (P.plan.buddy || '(not written yet)'));
  L.push('');
  L.push('MY PROMPTS');
  P.saved.forEach(function (s, i) { L.push(''); L.push((i + 1) + '. ' + s.title + ' [' + (s.arch || '') + ']'); L.push(s.text); });
  L.push('');
  L.push('THE CHECKS (before you send anything an AI wrote)');
  (MF.CHECKS || []).forEach(function (c) { L.push('- ' + c.t + ': ' + c.d); });
  return L.join('\n');
}

/* ───────── toolkit (views live in tools.js) ───────── */
function viewTools(sub) {
  if (MF.Tools && MF.Tools.render) MF.Tools.render(sub, shell);
}

/* ───────── the five jobs: the case that comes full circle ───────── */
function jobStatus(segId) {
  var A = MF.AGENDA || [], cur = -1, out = {};
  A.forEach(function (x, i) { if (x.id === segId) cur = i; });
  var curSeg = cur >= 0 ? A[cur] : null;
  ((MF.CASE || {}).monday || { jobs: [] }).jobs.forEach(function (j) {
    var first = -1;
    A.forEach(function (x, i) { if (x.job === j.n && first < 0) first = i; });
    if (curSeg && curSeg.job === j.n) out[j.n] = cur > first ? 'reopened' : 'now';
    else if (first >= 0 && cur > first) out[j.n] = 'done';
    else out[j.n] = 'next';
  });
  return out;
}
function jobsCard(segId) {
  var M = (MF.CASE || {}).monday; if (!M) return '';
  var stt = jobStatus(segId), done = Object.keys(stt).filter(function (k) { return stt[k] === 'done'; }).length;
  return '<section class="card jobs"><div class="jobs-head"><h3>KLD\'s five jobs</h3><span class="headmeta">' + done + ' of ' + M.jobs.length + ' done</span></div><ol>' + M.jobs.map(function (j) {
    var k = stt[j.n];
    return '<li class="job ' + k + '"><span class="jn">' + (k === 'done' ? icon('i-check', 14, 3) : j.n) + '</span><a href="#/lab/' + j.lab + '">' + esc(j.t) + '</a>' +
      (k === 'now' ? '<span class="pill brand">Now</span>' : k === 'reopened' ? '<span class="pill brand">Reopened</span>' : '') + '</li>';
  }).join('') + '</ol><a class="small" href="#/case">Read Khun Wichai\'s message</a></section>';
}
function mondayHtml(M) {
  return '<section class="monday"><div class="bubble"><div class="from"><b>' + esc(M.from) + '</b><span>' + esc(M.at) + '</span></div><p>' + esc(M.hello) + '</p><ol>' +
    M.jobs.map(function (j) { return '<li><b>' + esc(j.t) + '.</b> ' + esc(j.d) + '</li>'; }).join('') + '</ol><p>' + esc(M.bye) + '</p></div>' +
    '<div class="joblinks">' + M.jobs.map(function (j) { return '<a class="btn small" href="#/lab/' + j.lab + '">Job ' + j.n + icon('i-right', 14) + '</a>'; }).join('') + '</div></section>';
}

/* ───────── "I'm stuck": one tap tells the trainer where you are ───────── */
function stuckRow(ctx) {
  if (!me || me.solo) return '';
  var on = P.notes.help && P.notes.help.ctx === ctx;
  return '<section class="stuck">' + (on
    ? '<p class="small">' + icon('i-hand', 16) + ' The trainer can see you asked for help here.</p><div class="row wrap"><a class="btn small" href="#/help">Open chat</a><button class="btn small ghost" data-unstuck>I\'m OK now</button></div>'
    : '<button class="btn block" data-stuck="' + esc(ctx) + '">' + icon('i-hand', 18) + 'I\'m stuck</button><p class="hint center">The trainer sees your name and this task, and comes over or replies in Help.</p>') + '</section>';
}
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-stuck],[data-unstuck]'); if (!b || !P) return;
  if (b.hasAttribute('data-stuck')) {
    P.notes.help = { ctx: b.getAttribute('data-stuck'), at: Date.now() }; saveP(); syncNow();
    MF.vibrate(20); MF.put('mf.helpdraft', 'I\'m stuck on "' + P.notes.help.ctx.replace(/^(Task|Leg): /, '') + '". ');
    MF.go('/help');
  } else { delete P.notes.help; saveP(); syncNow(); MF.toast('Glad it worked'); MF.dispatch(); }
});

/* ───────── progress sync (trainer's view) ───────── */
var syncT = null;
function syncSoon() { clearTimeout(syncT); syncT = setTimeout(syncNow, 2500); }
function progressData() {
  var c = cargo(), legs = {}, labs = [];
  (MF.LEGS || []).forEach(function (L) { if (!L.bonus) legs[L.id] = legProgress(L).pct; });
  Object.keys(P.labs || {}).forEach(function (k) { if (P.labs[k]) labs.push(k); });
  return { cargo: c.got, of: c.total, legs: legs, labs: labs, checks: P.checks, saved: P.saved.length, plan: !!(P.plan.d7 || '').trim(), toured: !!P.notes.toured, cert: P.notes.certId || '' };
}
function syncNow() {
  clearTimeout(syncT);
  if (!me || me.solo || !Live.driver || !Live.saveProgress) return;
  Live.saveProgress(progressData(), MF.currentRoute().slice(0, 80), P.notes.help ? P.notes.help.ctx : '');
}

/* ───────── help chat ───────── */
function lastSeenMsg() { return P.notes.readMsg || 0; }
function pollMessages(force) {
  if (!me || me.solo || !Live.driver || !Live.myMessages) return;
  var onHelp = MF.currentRoute() === '/help';
  var gap = onHelp ? 4000 : 25000;
  if (!force && (document.hidden || Date.now() - lastMsgPoll < gap)) return;
  lastMsgPoll = Date.now();
  Live.myMessages(0).then(function (list) {
    var changed = list.length !== thread.length;
    thread = list;
    var newest = list.filter(function (m) { return m.from_host; }).reduce(function (a, m) { return Math.max(a, m.id); }, 0);
    if (onHelp) { if (newest > lastSeenMsg()) { P.notes.readMsg = newest; MF.put('mf.p.' + me.id, P); } unread = false; }
    else {
      var was = unread; unread = newest > lastSeenMsg();
      if (unread && !was) { MF.vibrate([20, 40, 20]); MF.toast('New reply from the trainer. Tap ? at the top.'); }
      var hb = $('.helpbtn'); if (hb && unread && !hb.querySelector('.pip')) hb.insertAdjacentHTML('beforeend', '<i class="pip"></i>');
    }
    if (onHelp && changed) renderThread();
  });
}
function threadHtml() {
  if (!thread.length) return '<p class="muted small">No messages yet. Ask anything: a step you are stuck on, a tool that will not load, or a question you did not want to ask out loud.</p>';
  return thread.map(function (m) {
    return '<div class="msg ' + (m.from_host ? 'them' : 'me') + '">' + (m.context && !m.from_host ? '<span class="ctx">' + esc(m.context) + '</span>' : '') + '<p>' + esc(m.body) + '</p><time>' + new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + (m.from_host ? ' · ' + esc(MF.APP.trainer || 'Trainer') : '') + '</time></div>';
  }).join('');
}
function renderThread() { var el = $('#thread'); if (el) { el.innerHTML = threadHtml(); el.scrollTop = el.scrollHeight; } }
function viewHelp() {
  var solo = !me || me.solo;
  var h = '<section class="route-head"><h2>Help</h2><p class="lead">Ask the trainer privately, or find a quick answer below.</p></section>';
  if (P.notes.help) h += '<section class="stuck on">' + icon('i-hand', 18) + '<p class="small">You asked for help with <b>' + esc(P.notes.help.ctx.replace(/^(Task|Leg): /, '')) + '</b>. The trainer can see it.</p><button class="btn small ghost" data-unstuck>I\'m OK now</button></section>';
  h += '<section class="card chat"><div class="chat-head"><h3>Ask the trainer</h3><span class="headmeta">Only you and the trainer see this</span></div>' +
    (solo ? '<p class="muted small">Join the room to message the trainer.</p><button class="btn primary" data-act="rejoin">Join the room</button>'
      : '<div class="thread" id="thread">' + threadHtml() + '</div><form class="composer" id="composer"><textarea class="textarea" name="body" rows="2" maxlength="500" placeholder="Type your question" required>' + esc(MF.get('mf.helpdraft', '')) + '</textarea><button class="btn primary" aria-label="Send">' + icon('i-send', 18) + '</button></form>') + '</section>';
  h += '<section><h3 class="sect">Quick answers</h3>' + (MF.FAQ || []).map(function (f) {
    return '<details class="idea faq"><summary><span>' + esc(f[0]) + '</span></summary><div class="idea-body"><p>' + md(f[1]) + '</p></div></details>';
  }).join('') + '</section>';
  h += '<a class="card tourlink" href="#/welcome">' + icon('i-route', 22) + '<div><b>Take the tour again</b><span class="muted small">What each tab does, in five cards.</span></div>' + icon('i-right', 18) + '</a>';
  shell('', h, { back: '/live', title: 'Help' });
  unread = false;
  var hb = $('.helpbtn .pip'); if (hb) hb.remove();
  renderThread(); pollMessages(true);
  var f = $('#composer');
  if (f) {
    var ta = f.body;
    if (ta.value) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    ta.addEventListener('input', function () { MF.put('mf.helpdraft', ta.value); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = ta.value.trim(); if (!body) return;
      var ctx = P.notes.help ? P.notes.help.ctx : MF.currentRoute();
      f.querySelector('button').disabled = true;
      Live.sendMessage(body, ctx).then(function () {
        ta.value = ''; MF.put('mf.helpdraft', ''); MF.vibrate(15);
        thread.push({ id: 1e12, from_host: false, body: body, context: ctx, at: Date.now() }); renderThread();
        pollMessages(true);
      }).catch(function (err) { MF.toast(err.message || 'Not sent', 'bad'); })
        .then(function () { f.querySelector('button').disabled = false; });
    });
  }
}

/* ───────── first-run tour ───────── */
function viewTour() {
  var T = MF.TOUR || [], n = T.length;
  var h = '<section class="tour" id="tour"><div class="tour-track" id="track">' + T.map(function (c, i) {
    return '<article class="tour-card"><span class="tour-ic">' + icon(c.i, 34, 1.8) + '</span><h2>' + esc(c.t) + '</h2><p>' + esc(c.d) + '</p><span class="headmeta">' + (i + 1) + ' of ' + n + '</span></article>';
  }).join('') + '</div><div class="tour-dots">' + T.map(function (c, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' +
    '<div class="tour-actions"><button class="btn ghost" data-tour="skip">Skip</button><span class="spacer"></span><button class="btn primary" data-tour="next">Next' + icon('i-right', 18) + '</button></div></section>';
  shell('', h);
  var track = $('#track'), dots = $$('.tour-dots i'), btn = $('[data-tour="next"]'), cur = 0;
  function at() { return cur; }
  function paint() {
    var i = cur; dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    btn.innerHTML = i >= n - 1 ? 'Let\'s go' + icon('i-check', 18) : 'Next' + icon('i-right', 18);
  }
  function finish() { P.notes.toured = 1; saveP(); MF.go(me && !me.solo ? '/live' : '/route'); }
  track.addEventListener('scroll', function () { window.requestAnimationFrame(function () { cur = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); paint(); }); }, { passive: true });
  $('#tour').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tour]'); if (!b) return;
    if (b.getAttribute('data-tour') === 'skip' || at() >= n - 1) finish();
    else { cur = Math.min(n - 1, cur + 1); paint(); track.scrollTo({ left: cur * track.clientWidth, behavior: MF.reducedMotion() ? 'auto' : 'smooth' }); }
  });
}

/* ───────── certificate ───────── */
function certOpen() { return !!(Live.state && Live.state.certs); }
function certCard() {
  if (!me || me.solo) return '';
  var C = MF.CERT || {};
  if (P.notes.certId) return '<a class="card certcard ready" href="#/certificate">' + icon('i-award', 30, 1.8) + '<div><b>Your certificate</b><span class="muted small">' + esc(C.title || 'Certificate') + ' · ' + esc(P.notes.certId) + '</span></div>' + icon('i-right', 18) + '</a>';
  if (certOpen()) return '<a class="card certcard ready" href="#/certificate">' + icon('i-award', 30, 1.8) + '<div><b>Your certificate is ready</b><span class="muted small">Type your full name and save it to your phone.</span></div>' + icon('i-right', 18) + '</a>';
  return '<section class="card certcard locked">' + icon('i-award', 30, 1.8) + '<div><b>Your certificate</b><span class="muted small">Unlocks at the end of the day, when the trainer issues certificates.</span></div></section>';
}
function verifyUrl(id) {
  var base = MF.PUBLIC_URL || (location.origin + location.pathname);
  return base.replace(/#.*$/, '') + '#/verify/' + encodeURIComponent(id);
}
function viewCert() {
  var C = MF.CERT || {}, id = P.notes.certId, nm = P.notes.certName || (me && me.name) || '';
  var h = '<section class="route-head"><h2>Your certificate</h2><p class="lead">' + esc(C.course || MF.APP.course) + '</p></section>';
  if (!id && !certOpen()) {
    h += '<section class="card certcard locked">' + icon('i-lock', 26) + '<div><b>Not open yet</b><span class="muted small">The trainer issues certificates in the last minutes of the day. This page updates by itself.</span></div></section>';
    shell('/manifest', h, { back: '/manifest', title: 'Certificate' }); return;
  }
  h += '<form class="card stack" id="certForm"><label class="field"><span>Your name, as it should appear</span><input class="input" name="nm" maxlength="60" required value="' + esc(nm) + '" placeholder="e.g. Nok Suwannarat" autocomplete="name"></label>' +
    '<button class="btn primary block" type="submit">' + icon('i-award', 18) + (id ? 'Update my certificate' : 'Create my certificate') + '</button><p class="hint" id="certMsg"></p></form>';
  if (id) {
    h += '<figure class="certfig"><img id="certImg" alt="Your certificate"><figcaption class="small faint">Certificate ' + esc(id) + '</figcaption></figure>' +
      '<section class="row wrap certactions"><button class="btn primary" data-cert="save">' + icon('i-download', 18) + 'Save certificate</button>' +
      '<button class="btn" data-cert="share">' + icon('i-share', 18) + 'Share on LinkedIn</button>' +
      '<a class="btn" target="_blank" rel="noopener" href="' + esc(linkedinAddUrl(id)) + '">' + icon('i-plus', 18) + 'Add to my LinkedIn profile</a></section>' +
      '<section class="card"><h3>The post for LinkedIn</h3><p class="small muted">Edit it so it sounds like you. Share copies it for you.</p><img id="socialImg" class="socialimg" alt="LinkedIn post image"><textarea class="textarea" id="caption" rows="6">' + esc(P.notes.caption || defaultCaption()) + '</textarea></section>' +
      '<p class="small faint">Anyone can check your certificate at <a href="' + esc(verifyUrl(id)) + '">' + esc(verifyUrl(id).replace(/^https?:\/\//, '')) + '</a></p>';
  }
  shell('/manifest', h, { back: '/manifest', title: 'Certificate' });
  $('#certForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = this.nm.value.trim().replace(/\s+/g, ' ');
    if (name.length < 2) { $('#certMsg').textContent = 'Type your full name.'; return; }
    $('#certMsg').textContent = 'Creating…';
    Live.claimCert(name).then(function (cid) {
      P.notes.certId = cid; P.notes.certName = name; saveP(); syncNow(); MF.vibrate([30, 60, 30]); viewCert();
    }).catch(function (err) { $('#certMsg').textContent = err.message || 'Could not create it. Try again in a moment.'; });
  });
  if (!id) return;
  var cap = $('#caption'); cap.addEventListener('input', function () { P.notes.caption = cap.value; saveP(); });
  drawCert(nm, id).then(function (cv) { $('#certImg').src = cv.toDataURL('image/png'); });
  drawSocial(nm, id).then(function (cv) { $('#socialImg').src = cv.toDataURL('image/png'); });
  $('.certactions').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cert]'); if (!b) return;
    var k = b.getAttribute('data-cert');
    if (k === 'save') drawCert(nm, id).then(function (cv) { saveCanvas(cv, 'certificate-' + id + '.png'); });
    if (k === 'share') drawSocial(nm, id).then(function (cv) { shareSocial(cv, cap.value, id); });
  });
}
function defaultCaption() {
  var C = MF.CERT || {};
  return 'Today I completed "' + (C.course || MF.APP.course) + '" with ' + (C.issuer || 'Corporate Training Bangkok') + ' in Pattaya.\n\n' +
    'Three things I am taking back to my desk:\n1. A prompt is a brief: situation, complication, what I want back, and the rules.\n2. Pick the AI tool by the data I am about to paste.\n3. Nothing an AI wrote leaves my desk unchecked.\n\n#GenerativeAI #Logistics #SupplyChain #Thailand';
}
function linkedinAddUrl(id) {
  var C = MF.CERT || {}, q = ['startTask=CERTIFICATION_NAME', 'name=' + encodeURIComponent(C.course || MF.APP.course)];
  q.push(C.linkedinOrgId ? 'organizationId=' + encodeURIComponent(C.linkedinOrgId) : 'organizationName=' + encodeURIComponent(C.issuer || 'Corporate Training Bangkok'));
  q.push('issueYear=' + (C.issueYear || new Date().getFullYear()), 'issueMonth=' + (C.issueMonth || new Date().getMonth() + 1));
  q.push('certUrl=' + encodeURIComponent(verifyUrl(id)), 'certId=' + encodeURIComponent(id));
  return 'https://www.linkedin.com/profile/add?' + q.join('&');
}
function saveCanvas(cv, file) {
  cv.toBlob(function (blob) {
    var f = new File([blob], file, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
      navigator.share({ files: [f], title: file }).catch(function () {});
    } else {
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      MF.toast('Saved');
    }
  }, 'image/png');
}
function shareSocial(cv, caption, id) {
  MF.copy(caption, 'Caption copied: paste it in LinkedIn');
  cv.toBlob(function (blob) {
    var f = new File([blob], 'certificate-' + id + '-linkedin.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f], text: caption, title: 'My certificate' }).catch(function () {});
    } else {
      saveCanvas(cv, f.name);
      window.open('https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(caption), '_blank', 'noopener');
    }
  }, 'image/png');
}

/* Canvas drawing. Text is drawn only after the web fonts load, or the
   certificate would ship in the fallback face. */
var logoImg = null;
function certAssets() {
  var fonts = document.fonts ? Promise.all(['800 80px Inter', '700 40px Inter', '500 30px Inter', '500 20px "JetBrains Mono"'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve();
  var logo = logoImg ? Promise.resolve(logoImg) : new Promise(function (ok) {
    var im = new Image(); im.onload = function () { logoImg = im; ok(im); }; im.onerror = function () { ok(null); }; im.src = (MF.CERT || {}).logo || 'assets/brand/ctb-logo.png';
  });
  return Promise.all([fonts, logo]).then(function (r) { return r[1]; });
}
function fitText(ctx, text, maxW, size, weight, family, min) {
  var s = size;
  do { ctx.font = weight + ' ' + s + 'px ' + family; if (ctx.measureText(text).width <= maxW) break; s -= 2; } while (s > (min || 20));
  return s;
}
function wrapText(ctx, text, maxW) {
  var words = String(text).split(' '), lines = [], line = '';
  words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line); return lines;
}
function routeMotif(ctx, x1, x2, y, color) {
  ctx.save(); ctx.strokeStyle = color || '#86868B'; ctx.lineWidth = 3; ctx.setLineDash([2, 14]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.bezierCurveTo(x1 + (x2 - x1) * 0.35, y - 18, x1 + (x2 - x1) * 0.65, y + 18, x2, y); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle = '#FF6A00'; ctx.beginPath(); ctx.arc(x2, y, 11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FF6A00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x2, y, 24, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
var UIF = 'Inter, -apple-system, "Helvetica Neue", Arial, sans-serif', MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
function drawCert(name, id) {
  return certAssets().then(function (logo) {
    var C = MF.CERT || {}, W = 2000, H = 1414, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), L = 140;
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#D2D2D7'; x.lineWidth = 2; x.strokeRect(48, 48, W - 96, H - 96);
    if (logo) { var lw = 380, lh = lw * logo.height / logo.width; x.drawImage(logo, L, 120, lw, lh); }
    x.textBaseline = 'alphabetic'; x.textAlign = 'right'; x.fillStyle = '#86868B'; x.font = '500 22px ' + MONO;
    x.fillText('No. ' + id, W - L, 160);
    x.textAlign = 'left';
    x.fillStyle = '#B84A00'; x.font = '700 40px ' + UIF; x.fillText(C.title || 'Certificate of Completion', L, 470);
    x.fillStyle = '#6E6E73'; x.font = '500 32px ' + UIF; x.fillText('This certifies that', L, 540);
    var ns = fitText(x, name, W - 2 * L, 112, 800, UIF, 56); x.fillStyle = '#1D1D1F'; x.fillText(name, L, 540 + ns + 30);
    var ny = 540 + ns + 30;
    routeMotif(x, L, Math.min(W - L - 30, L + 1100), ny + 70);
    x.fillStyle = '#6E6E73'; x.font = '500 32px ' + UIF; x.fillText('has completed', L, ny + 170);
    x.font = '700 56px ' + UIF; x.fillStyle = '#1D1D1F';
    var lines = wrapText(x, C.course || MF.APP.course, W - 2 * L);
    lines.forEach(function (ln, i) { x.fillText(ln, L, ny + 250 + i * 68); });
    var dy = ny + 250 + (lines.length - 1) * 68 + 70;
    x.fillStyle = '#6E6E73'; x.font = '500 32px ' + UIF; x.fillText((C.detail || '') + (C.dateLong ? ' · ' + C.dateLong : ''), L, dy);
    var sy = H - 210;
    x.strokeStyle = '#1D1D1F'; x.lineWidth = 2; x.beginPath(); x.moveTo(L, sy); x.lineTo(L + 520, sy); x.stroke();
    x.fillStyle = '#1D1D1F'; x.font = '700 34px ' + UIF; x.fillText(C.trainer || MF.APP.trainer || '', L, sy + 52);
    x.fillStyle = '#6E6E73'; x.font = '500 26px ' + UIF; x.fillText((C.trainerRole || 'Trainer') + ' · ' + (C.issuer || ''), L, sy + 92);
    x.textAlign = 'right'; x.fillStyle = '#86868B'; x.font = '500 22px ' + MONO;
    x.fillText('Verify: ' + verifyUrl(id).replace(/^https?:\/\//, ''), W - L, sy + 92);
    return cv;
  });
}
function drawSocial(name, id) {
  return certAssets().then(function (logo) {
    var C = MF.CERT || {}, W = 1200, H = 1200, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), L = 90;
    x.fillStyle = '#F5F5F7'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#FFFFFF'; roundRect(x, 50, 50, W - 100, H - 100, 36); x.fill();
    if (logo) { var lw = 300, lh = lw * logo.height / logo.width; x.drawImage(logo, L, 100, lw, lh); }
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#B84A00'; x.font = '700 34px ' + UIF; x.fillText('Certificate of Completion', L, 400);
    x.fillStyle = '#1D1D1F'; x.font = '800 72px ' + UIF;
    var lines = wrapText(x, C.course || MF.APP.course, W - 2 * L);
    lines.forEach(function (ln, i) { x.fillText(ln, L, 500 + i * 84); });
    var ny = 500 + (lines.length - 1) * 84 + 120;
    var ns = fitText(x, name, W - 2 * L, 52, 700, UIF, 32); x.fillStyle = '#1D1D1F'; x.fillText(name, L, ny);
    x.fillStyle = '#6E6E73'; x.font = '500 30px ' + UIF; x.fillText((C.issuer || '') + ' · Pattaya · ' + (C.dateLong || ''), L, ny + 56);
    routeMotif(x, L, W - L - 40, H - 190);
    x.fillStyle = '#86868B'; x.font = '500 20px ' + MONO; x.fillText('No. ' + id, L, H - 110);
    return cv;
  });
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

/* ───────── public certificate check (no join needed) ───────── */
function viewVerify(id) {
  var C = MF.CERT || {};
  $('#app').innerHTML = '<main class="verify"><div class="card verify-card" id="vcard"><img src="' + esc(C.logo || 'assets/brand/ctb-logo.png') + '" alt="' + esc(C.issuer || '') + '" class="vlogo"><p class="muted">Checking certificate ' + esc(id) + '…</p></div></main>';
  var room = (me && me.room) || MF.DEFAULT_ROOM;
  Promise.resolve(Live.driver ? null : Live.start(room, 'viewer')).then(function () { return Live.verifyCert(id); }).then(function (c) {
    $('#vcard').innerHTML = '<img src="' + esc(C.logo || 'assets/brand/ctb-logo.png') + '" alt="' + esc(C.issuer || '') + '" class="vlogo">' + (c
      ? '<div class="vok">' + icon('i-check', 28, 2.6) + '<b>Valid certificate</b></div><h1>' + esc(c.full_name) + '</h1><p>completed <b>' + esc(c.course || C.course) + '</b></p><p class="muted">' + esc(C.issuer || '') + ' · issued ' + new Date(c.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p><p class="mono small faint">' + esc(c.id) + '</p>'
      : '<div class="vbad">' + icon('i-x', 28, 2.6) + '<b>No certificate with this number</b></div><p class="muted">Check the number, or ask ' + esc(C.issuer || 'the issuer') + '.</p><p class="mono small faint">' + esc(id) + '</p>');
  });
}

/* ───────── boot ───────── */
function guard(fn) {
  return function () {
    if (!me) { MF.go('/join'); return; }
    fn.apply(null, arguments);
  };
}
function routes() {
  MF.route('/', guard(function () { MF.go(me && !me.solo ? '/live' : '/route'); }));
  MF.route('/join', viewJoin);
  MF.route('/live', guard(viewLive));
  MF.route('/route', guard(viewRoute));
  MF.route('/leg/:id', guard(viewLeg));
  MF.route('/lab/:id', guard(viewLab));
  MF.route('/case', guard(viewCase));
  MF.route('/tools', guard(function () { viewTools(''); }));
  MF.route('/tools/:sub', guard(viewTools));
  MF.route('/manifest', guard(viewManifest));
  MF.route('/welcome', guard(viewTour));
  MF.route('/help', guard(viewHelp));
  MF.route('/certificate', guard(viewCert));
  MF.route('/verify/:id', viewVerify);
}

function onState(st) {
  var act = st.act;
  if (act && act.phase === 'open' && act.id !== lastAct && st.mode === 'activity') {
    lastAct = act.id;
    var typing = document.activeElement && /input|textarea/i.test(document.activeElement.tagName) && document.activeElement.value;
    MF.vibrate([30, 60, 30]);
    if (MF.currentRoute() !== '/live' && !typing) { MF.go('/live'); return; }
  }
  if (st.certs && !certsWere) { certsWere = true; if (MF.currentRoute() === '/manifest' || MF.currentRoute() === '/live') MF.dispatch(); MF.toast('Your certificate is ready: Manifest → Your certificate'); }
  if (MF.currentRoute() === '/live') viewLive();
  else {
    /* refresh only the banner/points, never the page someone is typing in */
    var tb = $('.topbar .pts b'); if (tb) tb.textContent = myPoints().toLocaleString('en-US');
    var hasBanner = !!$('.livebanner'), want = act && act.phase === 'open';
    if (hasBanner !== !!want) MF.dispatch();
  }
}

function timers() {
  setInterval(function () {
    $$('[data-ends]').forEach(function (el) { el.textContent = MF.fmtClock((+el.getAttribute('data-ends') - Date.now()) / 1000); });
  }, 500);
}

function boot() {
  var th = MF.get('mf.theme', ''); if (th) document.documentElement.setAttribute('data-theme', th);
  loadP();
  routes();
  window.addEventListener('hashchange', function () { syncSoon(); });
  Live.on('messages-changed', function () { pollMessages(true); });
  setInterval(function () { pollMessages(false); }, 6000);
  setInterval(function () { if (me && !me.solo && !document.hidden) syncNow(); }, 60000);
  Live.on('state', onState);
  Live.on('status', function () { var s = $('.topbar .status'); if (s) s.className = 'status ' + Live.status; });
  Live.on('posts', function (ps) { posts = ps; if (MF.currentRoute() === '/live' && Live.state.act && Live.Score && (Live.activity(Live.state.act) || {}).kind === 'wall') {
    var wrap = $('.wall-wrap'); if (wrap) { var def = Live.activity(Live.state.act); wrap.innerHTML = MF.R.wall(def, posts.filter(function (p) { return p.board === Live.state.act.id; }), { canVote: true, voted: P.voted, byVotes: Live.state.act.phase !== 'open' }); wireVotes(); }
  } });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act="rejoin"]'); if (b) { if (me) me.solo = false; MF.go('/join'); }
  });
  timers();
  /* A room in the link beats a stale saved session: someone scanning the
     projector QR on a phone used yesterday should land in today's room. */
  var linkRoom = MF.normRoom(MF.param('room'));
  if (me && !me.solo && linkRoom && linkRoom !== me.room) { MF.go('/join'); return; }
  if (/^#\/verify\//.test(location.hash)) { MF.dispatch(); return; }
  if (me && !me.solo) connect().then(function () { syncNow(); pollMessages(true); }).catch(function () {});
  MF.dispatch();
}
function wireVotes() {
  $$('.wall-wrap [data-vote]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-vote'); if (P.voted[id]) return;
      P.voted[id] = 1; saveP(); b.classList.add('on'); Live.vote(isNaN(+id) ? id : +id);
    });
  });
}

MF.App = { shell: shell, P: function () { return P; }, saveP: saveP, me: function () { return me; }, fileRow: fileRow, openers: openers };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.MF = window.MF || {});
