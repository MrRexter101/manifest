/* MANIFEST · host console. The only page that writes room state.
   Built for a laptop beside the lectern: agenda on the left, the segment's
   script and live controls in the middle, the room on the right. */
(function (MF) {
'use strict';
var $ = MF.$, $$ = MF.$$, esc = MF.esc, Live = MF.Live;
var responses = [], posts = [], selSeg = '', autoT = null, view = { tab: 'script', pid: '', draft: '' };
var progress = {}, inbox = [], lastMsgId = 0, inboxBoot = false;

/* ── helpers ── */
function st() { return Live.state; }
function seg(id) {
  var s = (MF.AGENDA || []).filter(function (x) { return x.id === id; })[0] || null;
  /* The script and answer keys live in trainer/script.js, which is never
     published: participants can read anything in the public bundle. */
  return s ? Object.assign({}, s, (MF.SCRIPT || {})[id] || {}) : null;
}
function def(id) { return (MF.ACTIVITIES || {})[id] || null; }
function actResponses(id) { return responses.filter(function (r) { return r.activity === id; }); }
/* Who is in the room. Local mode has real presence; on Supabase, presence
   would fan out to every phone, so "active" = joined or answered in the
   last 15 minutes. */
function activeSet() {
  var on = Object.assign({}, Live.online || {}), cut = Date.now() - 15 * 60000;
  Object.keys(Live.people).forEach(function (pid) { var p = Live.people[pid], j = Date.parse(p.joined_at || '') || p.joined || 0; if (j > cut) on[pid] = true; });
  responses.forEach(function (r) { if (r.at > cut) on[r.pid] = true; });
  return on;
}
function onlineCount() { return Object.keys(activeSet()).length || Object.keys(Live.people).length; }
function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
function nowSegment() {
  var d = new Date(), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  var list = MF.AGENDA || [];
  for (var i = 0; i < list.length; i++) if (hm >= list[i].start && hm < list[i].end) return list[i].id;
  return list.length ? list[0].id : '';
}

/* ── room actions ── */
function show(mode, extra) { return Live.setState(Object.assign({ mode: mode }, extra || {})); }
function goSegment(id) {
  selSeg = id;
  var s = seg(id);
  Live.setState({ segment: id, mode: st().mode === 'activity' && st().act && st().act.phase !== 'reveal' ? st().mode : 'stage' });
  render();
  if (s && s.timer) MF.toast('Suggested timer: ' + s.timer + ' min');
}
function launch(actId, game) {
  var d = def(actId); if (!d) return;
  var act = { id: actId, phase: 'open', openedAt: Date.now(), secs: d.secs || 0 };
  if (game) { act.gameId = game.id; act.gameTitle = game.title; act.qn = game.qn; act.qt = game.qt; }
  Live.setState({ mode: 'activity', act: act, reveal: null });
  armAuto();
}
function launchInline(d) {
  var id = 'adhoc-' + MF.uid(6);
  MF.ACTIVITIES[id] = d;                     // so this console can tally it
  Live.setState({ mode: 'activity', act: { id: id, phase: 'open', openedAt: Date.now(), secs: d.secs || 0, def: d }, reveal: null });
}
function lock() {
  var a = st().act; if (!a || a.phase !== 'open') return;
  Live.setState({ act: Object.assign({}, a, { phase: 'locked' }) });
}
function reveal() {
  var a = st().act; if (!a) return;
  var d = Live.activity(a); if (!d) return;
  clearInterval(autoT);
  Live.responses(a.id).then(function (rs) {
    var scored = clone(st().scored), totals = clone(st().totals), streaks = clone(st().streaks), points = {};
    var gradable = d.kind === 'quiz' || d.kind === 'number' || (d.kind === 'rank' && d.correct);
    if (gradable && !scored[a.id]) {
      var limit = (a.secs || d.secs || 20) * 1000, answered = {};
      rs.forEach(function (r) {
        answered[r.pid] = 1;
        var ok = Live.Score.isCorrect(d, r.answer);
        if (ok) {
          streaks[r.pid] = (streaks[r.pid] || 0) + 1;
          var p = Live.Score.points(true, r.ms, limit) + Live.Score.streakBonus(streaks[r.pid]);
          points[r.pid] = p; totals[r.pid] = (totals[r.pid] || 0) + p;
        } else { streaks[r.pid] = 0; points[r.pid] = 0; totals[r.pid] = totals[r.pid] || 0; }
      });
      Object.keys(streaks).forEach(function (pid) { if (!answered[pid]) streaks[pid] = 0; });
      scored[a.id] = true;
    } else if (st().reveal && st().reveal.points) points = st().reveal.points;
    var t = MF.R.tally(d, rs);
    Live.setState({
      act: Object.assign({}, a, { phase: 'reveal' }),
      reveal: { counts: t.counts, correct: d.correct, points: points, avg: t.avg },
      totals: totals, streaks: streaks, scored: scored
    });
  });
}
/* Kahoot behaviour: the question closes itself when time is up or when
   everyone in the room has answered. */
function armAuto() {
  clearInterval(autoT);
  autoT = setInterval(function () {
    var a = st().act; if (!a || a.phase !== 'open') { clearInterval(autoT); return; }
    var d = Live.activity(a); if (!d) return;
    var n = actResponses(a.id).length, room = onlineCount();
    var timeUp = a.secs && Date.now() > a.openedAt + a.secs * 1000 + 600;
    var allIn = room > 0 && n >= room && (d.kind === 'quiz' || d.kind === 'number');
    if (timeUp || allIn) {
      if (d.kind === 'quiz' || d.kind === 'number' || d.kind === 'rank') reveal(); else lock();
    }
  }, 400);
}

/* games: an ordered list of activity ids with a leaderboard between */
function gameState(gid) {
  var g = (MF.GAMES || {})[gid]; if (!g) return null;
  var a = st().act, idx = a && a.gameId === gid ? g.items.indexOf(a.id) : -1;
  return { g: g, idx: idx };
}
function gameNext(gid) {
  var gs = gameState(gid); if (!gs) return;
  var n = gs.idx + 1;
  if (n >= gs.g.items.length) { show('podium'); return; }
  launch(gs.g.items[n], { id: gid, title: gs.g.title, qn: n + 1, qt: gs.g.items.length });
}

function awardTeam(teamId, pts) {
  var totals = clone(st().totals), n = 0;
  Object.keys(Live.people).forEach(function (pid) { if (Live.people[pid].team === teamId) { totals[pid] = (totals[pid] || 0) + pts; n++; } });
  if (!n) { MF.toast('Nobody has joined that table yet', 'bad'); return; }
  Live.setState({ totals: totals });
  MF.toast('+' + pts + ' to every player at ' + teamName(teamId));
}
function teamName(id) { var t = MF.TEAMS.filter(function (x) { return x.id === id; })[0]; return t ? t.name : id; }

function startTimer(min, label) {
  Live.setState({ timer: { endsAt: Date.now() + min * 60000, label: label || 'Time left', min: min }, mode: st().mode === 'activity' ? 'activity' : 'stage' });
}

function exportCsv() {
  function cell(v) { v = v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)); return '"' + v.replace(/"/g, '""') + '"'; }
  var rows = [['type', 'activity_or_board', 'question', 'name', 'team', 'answer_or_post', 'ms_or_votes', 'time']];
  responses.forEach(function (r) {
    var d = def(r.activity) || {};
    var ans = r.answer;
    if ((d.kind === 'quiz' || d.kind === 'poll') && typeof ans === 'number' && d.options) ans = d.options[ans];
    if (d.kind === 'rank' && Array.isArray(ans) && d.items) ans = ans.map(function (i) { return d.items[i]; }).join(' > ');
    rows.push(['answer', r.activity, d.q || '', r.name, teamName(r.team), ans, r.ms, new Date(r.at).toISOString()]);
  });
  posts.forEach(function (p) {
    var d = def(p.board) || {};
    rows.push(['post', p.board + (p.col ? ' / ' + p.col : ''), d.q || '', p.author || 'Anonymous', teamName(p.team), p.body + (p.hidden ? ' [hidden]' : ''), p.votes, new Date(p.at).toISOString()]);
  });
  MF.download('manifest-' + Live.room + '-' + new Date().toISOString().slice(0, 10) + '.csv', rows.map(function (r) { return r.map(cell).join(','); }).join('\n'), 'text/csv;charset=utf-8');
}

/* ── rendering ── */
function agendaHtml() {
  var cur = st().segment;
  var html = '', lastBlock = '';
  (MF.AGENDA || []).forEach(function (s) {
    if (s.block && s.block !== lastBlock) { html += '<div class="ag-block">' + esc(s.block) + '</div>'; lastBlock = s.block; }
    html += '<button class="ag' + (s.id === selSeg ? ' sel' : '') + (s.id === cur ? ' live' : '') + (s.kind === 'break' ? ' brk' : '') + '" data-seg="' + s.id + '">' +
      '<span class="t">' + esc(s.start) + '</span><span class="nm">' + esc(s.title) + (s.mods ? '<i>' + esc(s.mods) + '</i>' : '') + '</span>' +
      (s.id === cur ? '<span class="livepip" title="On the projector"></span>' : '') + '</button>';
  });
  return html;
}

function scriptHtml(s) {
  if (!s) return '<p class="faint">Pick a segment on the left.</p>';
  var h = '<div class="seg-head"><h2>' + esc(s.title) + '</h2><div class="headmeta">' + esc(s.start + ' to ' + s.end) + (s.mods ? ' · Module ' + esc(s.mods) : '') + (s.leg ? ' · Leg ' + s.leg : '') + '</div>' +
    (s.goal ? '<p class="goal">' + MF.md(s.goal) + '</p>' : '') + '</div>';
  if (s.slides && s.slides.length) h += '<div class="slides-ref">' + MF.icon('i-slides', 16) + ' Slides ' + esc(s.slides.join(', ')) + '</div>';
  (s.flow || []).forEach(function (f) {
    h += '<div class="flow ' + (f.say ? 'say' : f.do ? 'do' : 'note') + '"><span class="mm">' + esc(f.m || '') + '</span><div>' +
      (f.say ? '<blockquote>' + MF.md(f.say) + '</blockquote>' : '') +
      (f.do ? '<p>' + MF.md(f.do) + '</p>' : '') +
      (f.note ? '<p class="faint">' + MF.md(f.note) + '</p>' : '') +
      (f.act ? '<button class="btn small primary" data-launch="' + esc(f.act) + '">' + MF.icon('i-play', 14) + 'Launch: ' + esc((def(f.act) || {}).q || f.act).slice(0, 60) + '</button>' : '') +
      (f.game ? '<button class="btn small primary" data-game="' + esc(f.game) + '">' + MF.icon('i-play', 14) + 'Start game: ' + esc(((MF.GAMES || {})[f.game] || {}).title || f.game) + '</button>' : '') +
      (f.timer ? '<button class="btn small" data-timer="' + f.timer + '">' + MF.icon('i-timer', 14) + f.timer + ' min timer</button>' : '') +
      '</div></div>';
  });
  if (s.risks && s.risks.length) {
    h += '<details class="risks"><summary>What can go wrong (' + s.risks.length + ')</summary>' + s.risks.map(function (r) {
      return '<div class="risk"><b>' + MF.md(r[0]) + '</b><p>' + MF.md(r[1]) + '</p></div>';
    }).join('') + '</details>';
  }
  if (s.key) h += '<details class="key"><summary>Trainer-only answer key</summary><div>' + MF.md(s.key).replace(/\n/g, '<br>') + '</div></details>';
  return h;
}

function controlsHtml() {
  var a = st().act, d = a ? Live.activity(a) : null, h = '';
  h += '<div class="ctl-modes">' +
    btnMode('join', 'i-qr', 'Join screen') + btnMode('stage', 'i-screen', 'Stage') + btnMode('leaderboard', 'i-trophy', 'Leaderboard') + btnMode('podium', 'i-star', 'Podium') +
    '</div><div class="ctl-certs row wrap">' + (st().certs
      ? '<span class="pill brand">' + MF.icon('i-award', 14) + 'Certificates are open</span>' + btnMode('certs', 'i-award', 'Show on screen') + '<button class="btn small ghost" data-do="certsoff">Close</button>'
      : '<button class="btn small" data-do="certson">' + MF.icon('i-award', 14) + 'Issue certificates</button>') + '</div>';
  if (a && d) {
    var rs = actResponses(a.id), t = MF.R.tally(d, rs);
    var gs = a.gameId ? gameState(a.gameId) : null;
    h += '<div class="ctl-act"><div class="row"><span class="pill brand">' + MF.icon(MF.R.kindIcon(d.kind), 14) + MF.R.kindLabel(d.kind) + '</span>' +
      '<span class="pill">' + a.phase + '</span>' + (gs ? '<span class="pill">' + esc(a.gameTitle) + ' · ' + a.qn + '/' + a.qt + '</span>' : '') +
      '<span class="spacer"></span><b class="mono">' + (d.kind === 'wall' ? posts.filter(function (p) { return p.board === a.id; }).length + ' posts' : t.total + ' / ' + onlineCount()) + '</b></div>' +
      '<h3>' + esc(d.q) + '</h3><div class="row wrap">' +
      (a.phase === 'open' ? '<button class="btn small" data-do="lock">' + MF.icon('i-lock', 14) + 'Lock</button>' : '') +
      (a.phase !== 'reveal' ? '<button class="btn small primary" data-do="reveal">' + MF.icon('i-eye', 14) + 'Reveal</button>' : '') +
      (a.phase !== 'open' && d.kind !== 'wall' ? '<button class="btn small" data-do="reopen">' + MF.icon('i-refresh', 14) + 'Re-open</button>' : '') +
      (gs && a.phase === 'reveal' ? '<button class="btn small" data-mode="leaderboard">' + MF.icon('i-trophy', 14) + 'Leaderboard</button><button class="btn small primary" data-gamenext="' + a.gameId + '">' + MF.icon('i-next', 14) + (gs.idx + 1 >= gs.g.items.length ? 'Podium' : 'Next question') + '</button>' : '') +
      (st().mode !== 'activity' ? '<button class="btn small" data-mode="activity">' + MF.icon('i-screen', 14) + 'Back to activity</button>' : '') +
      '<button class="btn small ghost" data-do="close">' + MF.icon('i-x', 14) + 'Close</button></div>' +
      '<div class="preview">' + (d.kind === 'wall' ? MF.R.wall(d, posts.filter(function (p) { return p.board === a.id; }), { host: true, byVotes: true })
        : MF.R.results(d, t, { reveal: a.phase === 'reveal', labels: true })) + '</div></div>';
  } else {
    h += '<p class="faint small" style="margin:12px 2px">No live activity. Launch one from the script, the bank, or ask the room.</p>';
  }
  var tm = st().timer;
  h += '<div class="ctl-timer"><span class="eyebrow">Room timer</span><div class="row wrap">' +
    [3, 5, 8, 10, 15].map(function (m) { return '<button class="btn small" data-timer="' + m + '">' + m + 'm</button>'; }).join('') +
    (tm ? '<span class="tleft mono" data-ends="' + tm.endsAt + '"></span><button class="btn small ghost" data-do="notimer">Clear</button>' : '') + '</div></div>';
  return h;
}
function btnMode(m, ic, label) { return '<button class="btn small' + (st().mode === m ? ' dark' : '') + '" data-mode="' + m + '">' + MF.icon(ic, 14) + label + '</button>'; }

function roomHtml() {
  var people = Object.keys(Live.people).map(function (k) { return Live.people[k]; });
  var teams = Live.teamTotals(st().totals, Live.people);
  var tot = st().totals || {}, act = activeSet();
  var h = '<div class="room-head"><b>' + people.length + '</b> joined · <b>' + Object.keys(activeSet()).length + '</b> active</div>';
  h += '<div class="eyebrow">Tables</div><div class="teams">' + MF.TEAMS.map(function (t) {
    var tt = teams.filter(function (x) { return x.id === t.id; })[0];
    var n = people.filter(function (p) { return p.team === t.id; }).length;
    return '<div class="team"><i style="background:' + t.color + '"></i><span>' + esc(t.name) + ' <span class="faint">' + n + '</span></span><span class="spacer"></span><b class="mono">' + (tt ? tt.avg : 0) + '</b>' +
      '<button class="btn small ghost" data-award="' + t.id + '" title="Give every player at this table 250 points">+250</button></div>';
  }).join('') + '</div>';
  h += '<div class="eyebrow" style="margin-top:14px">People</div><div class="people">' + people.sort(function (a, b) { return (tot[b.id] || 0) - (tot[a.id] || 0); }).map(function (p) {
    var t = MF.TEAMS.filter(function (x) { return x.id === p.team; })[0];
    return '<div class="person"><span class="dot" style="color:' + (act[p.id] ? '#3FBF8F' : 'var(--line-strong)') + '"></span><span class="nm">' + esc(p.name) + '</span>' +
      (t ? '<i style="background:' + t.color + '"></i>' : '') + '<span class="spacer"></span><span class="mono faint">' + (tot[p.id] || 0) + '</span></div>';
  }).join('') + '</div>';
  return h;
}

function bankHtml() {
  var all = MF.ACTIVITIES || {}, games = MF.GAMES || {};
  var h = '<div class="eyebrow">Games</div>' + Object.keys(games).map(function (g) {
    return '<button class="bank" data-game="' + g + '">' + MF.icon('i-trophy', 15) + '<span>' + esc(games[g].title) + ' <i class="faint">' + games[g].items.length + ' Qs</i></span></button>';
  }).join('');
  h += '<div class="eyebrow" style="margin-top:12px">All activities</div>' + Object.keys(all).filter(function (k) { return k.indexOf('adhoc-') !== 0; }).map(function (k) {
    var d = all[k];
    return '<button class="bank" data-launch="' + k + '">' + MF.icon(MF.R.kindIcon(d.kind), 15) + '<span>' + esc(d.q) + ' <i class="faint">' + MF.R.kindLabel(d.kind) + '</i></span></button>';
  }).join('');
  return h;
}

function askHtml() {
  return '<form id="ask" class="stack"><div class="eyebrow">Ask the room, right now</div>' +
    '<input class="input" name="q" maxlength="140" placeholder="Your question" required>' +
    '<div class="chips" role="radiogroup">' + ['poll', 'cloud', 'wall', 'scale'].map(function (k, i) {
      return '<label class="chip"><input type="radio" name="kind" value="' + k + '"' + (i === 0 ? ' checked' : '') + '> ' + MF.R.kindLabel(k) + '</label>';
    }).join('') + '</div>' +
    '<input class="input" name="opts" placeholder="Poll options, separated by |  e.g. Yes | No | Not sure">' +
    '<button class="btn primary block" type="submit">' + MF.icon('i-play', 16) + 'Launch</button></form>';
}

/* ── admin: who is where, who is stuck, and the help chat ── */
function pageLabel(pg) {
  if (!pg) return '';
  var m = pg.match(/^\/lab\/(.+)$/); if (m) { var x = (MF.LABS || {})[m[1]]; return x ? x.title : m[1]; }
  m = pg.match(/^\/leg\/(leg\d)$/); if (m) { var L = (MF.LEGS || []).filter(function (l) { return l.id === m[1]; })[0]; return L ? L.name : m[1]; }
  return { '/live': 'Live', '/route': 'Route', '/manifest': 'Manifest', '/help': 'Help', '/certificate': 'Certificate', '/welcome': 'Tour', '/case': 'The case' }[pg] || (pg.indexOf('/tools') === 0 ? 'Toolkit' : pg);
}
function ago(t) { if (!t) return ''; var m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; }
function unreadCount() { return inbox.filter(function (m) { return !m.from_host && !m.seen; }).length; }
function peopleHtml() {
  var people = Object.keys(Live.people).map(function (k) { return Live.people[k]; }), tot = st().totals || {};
  var rows = people.map(function (p) { return { p: p, g: progress[p.id] || null }; });
  rows.sort(function (a, b) {
    var ha = a.g && a.g.help ? 1 : 0, hb = b.g && b.g.help ? 1 : 0; if (ha !== hb) return hb - ha;
    var pa = a.g && a.g.data && a.g.data.of ? a.g.data.cargo / a.g.data.of : 0, pb = b.g && b.g.data && b.g.data.of ? b.g.data.cargo / b.g.data.of : 0;
    return pa - pb;
  });
  var stuck = rows.filter(function (r) { return r.g && r.g.help; }).length;
  var avg = rows.length ? Math.round(100 * rows.reduce(function (a, r) { var d = r.g && r.g.data; return a + (d && d.of ? d.cargo / d.of : 0); }, 0) / rows.length) : 0;
  var certs = rows.filter(function (r) { return r.g && r.g.data && r.g.data.cert; }).length;
  var h = '<div class="ppl-sum"><div><b>' + people.length + '</b><span>joined</span></div><div><b>' + avg + '%</b><span>average progress</span></div><div class="' + (stuck ? 'warn' : '') + '"><b>' + stuck + '</b><span>asking for help</span></div><div><b>' + certs + '</b><span>certificates</span></div></div>';
  if (!rows.length) return h + '<p class="faint">Nobody has joined yet. Press J to put the join screen on the projector.</p>';
  h += '<table class="ppl"><thead><tr><th>Name</th><th>Progress</th><th>Labs</th><th>Points</th><th>Now on</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
    var p = r.p, g = r.g, d = g && g.data || {}, t = MF.TEAMS.filter(function (x) { return x.id === p.team; })[0];
    var pct = d.of ? Math.round(100 * d.cargo / d.of) : 0;
    return '<tr class="' + (g && g.help ? 'stuck' : '') + '"><td><span class="nm">' + (t ? '<i style="background:' + t.color + '"></i>' : '') + esc(p.name) + '</span>' + (g && g.help ? '<span class="stuckmsg">' + MF.icon('i-hand', 13) + esc(g.help.replace(/^(Task|Leg): /, '')) + '</span>' : '') + '</td>' +
      '<td><span class="bar"><i style="width:' + pct + '%"></i></span><span class="mono faint">' + pct + '%</span></td>' +
      '<td class="mono">' + (d.labs ? d.labs.length : 0) + '</td><td class="mono">' + (tot[p.id] || 0) + '</td>' +
      '<td>' + (g ? esc(pageLabel(g.page)) + '<span class="faint small"> · ' + ago(g.updated_at) + '</span>' : '<span class="faint">no activity yet</span>') + '</td>' +
      '<td class="acts"><button class="btn small" data-chat="' + p.id + '">' + MF.icon('i-chat', 14) + 'Chat</button>' + (g && g.help ? '<button class="btn small ghost" data-clearhelp="' + p.id + '">Done</button>' : '') + '</td></tr>';
  }).join('') + '</tbody></table>';
  return h;
}
function helpHtml() {
  var byPid = {};
  inbox.forEach(function (m) { (byPid[m.pid] = byPid[m.pid] || []).push(m); });
  var pids = Object.keys(byPid).sort(function (a, b) { var la = byPid[a][byPid[a].length - 1].id, lb = byPid[b][byPid[b].length - 1].id; return lb - la; });
  if (!view.pid && pids.length) view.pid = pids[0];
  var h = '<div class="hchat"><div class="hthreads">' + (pids.length ? pids.map(function (pid) {
    var ms = byPid[pid], last = ms[ms.length - 1], un = ms.filter(function (m) { return !m.from_host && !m.seen; }).length, p = Live.people[pid];
    return '<button class="hthr' + (view.pid === pid ? ' on' : '') + (un ? ' un' : '') + '" data-thread="' + pid + '"><b>' + esc(p ? p.name : 'Someone') + (un ? '<i class="tbadge">' + un + '</i>' : '') + '</b><span>' + (last.from_host ? 'You: ' : '') + esc(last.body.slice(0, 60)) + '</span></button>';
  }).join('') : '<p class="faint small">No messages yet. Questions from phones appear here, privately.</p>') + '</div>';
  var sel = view.pid ? (byPid[view.pid] || []) : [], who = Live.people[view.pid];
  if (view.pid) {
    var g = progress[view.pid];
    h += '<div class="hconv"><div class="hconv-head"><b>' + esc(who ? who.name : 'Participant') + '</b>' + (g ? '<span class="faint small">On ' + esc(pageLabel(g.page)) + (g.help ? ' · asked for help' : '') + '</span>' : '') + '</div>' +
      '<div class="hthread" id="hthread">' + (sel.length ? sel.map(function (m) {
        return '<div class="msg ' + (m.from_host ? 'me' : 'them') + '">' + (m.context && !m.from_host ? '<span class="ctx">' + esc(pageLabel(m.context) || m.context) + '</span>' : '') + '<p>' + esc(m.body) + '</p><time>' + new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '</time></div>';
      }).join('') : '<p class="faint small">No messages with this person yet. Write the first one.</p>') + '</div>' +
      '<form class="composer" id="hreply"><textarea class="textarea" id="replyBox" rows="2" maxlength="500" placeholder="Reply to ' + esc(who ? who.name : '') + '">' + esc(view.draft) + '</textarea><button class="btn primary">' + MF.icon('i-send', 16) + 'Send</button></form>' +
      '<div class="quick">' + ['On my way to your table.', 'Paste the facts into the Complication part.', 'Tap Copy in the app, then paste into ChatGPT.', 'Try Gemini or Copilot instead; ChatGPT is busy.'].map(function (q) { return '<button class="chip" data-quick="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div></div>';
  }
  return h + '</div>';
}
function pullInbox() {
  if (!Live.hostInbox || $('#app').hidden) return;
  Live.hostInbox(Live.kind === 'local' ? 0 : lastMsgId).then(function (list) {
    if (Live.kind === 'local') inbox = list;
    else list.forEach(function (m) { var i = inbox.findIndex(function (x) { return x.id === m.id; }); if (i >= 0) inbox[i] = m; else inbox.push(m); });
    var fresh = list.filter(function (m) { return !m.from_host && m.id > lastMsgId; });
    inbox.forEach(function (m) { if (m.id > lastMsgId) lastMsgId = m.id; });
    if (inboxBoot && fresh.length) { var p = Live.people[fresh[fresh.length - 1].pid]; MF.toast('Message from ' + (p ? p.name : 'a participant')); }
    inboxBoot = true;
    if (fresh.length || Live.kind === 'local') renderSoon();
  });
}
function pullProgress() {
  if (!Live.hostProgress || $('#app').hidden) return;
  Live.hostProgress().then(function (list) {
    var next = {}; list.forEach(function (g) { next[g.pid] = g; });
    var newStuck = list.filter(function (g) { return g.help && !(progress[g.pid] && progress[g.pid].help); });
    progress = next;
    if (newStuck.length) { var p = Live.people[newStuck[0].pid]; MF.toast((p ? p.name : 'Someone') + ' is stuck: ' + newStuck[0].help.replace(/^(Task|Leg): /, '')); }
    renderSoon();
  });
}
function seenThread(pid) {
  var had = inbox.some(function (m) { return m.pid === pid && !m.from_host && !m.seen; });
  inbox.forEach(function (m) { if (m.pid === pid && !m.from_host) m.seen = true; });
  if (had) Live.hostMarkSeen(pid);
}

function render() {
  var s = seg(selSeg);
  $('#agenda').innerHTML = agendaHtml();
  var stuckN = Object.keys(progress).filter(function (k) { return progress[k].help; }).length, unreadN = unreadCount();
  $('#tabs').innerHTML = ['script', 'bank', 'ask', 'people', 'help'].map(function (t) {
    var badge = t === 'people' && stuckN ? '<i class="tbadge">' + stuckN + '</i>' : t === 'help' && unreadN ? '<i class="tbadge">' + unreadN + '</i>' : '';
    return '<button class="tab' + (view.tab === t ? ' on' : '') + '" data-tab="' + t + '">' + { script: 'Script', bank: 'Activity bank', ask: 'Ask the room', people: 'People', help: 'Help chat' }[t] + badge + '</button>';
  }).join('');
  var typing = document.activeElement && document.activeElement.id === 'replyBox';
  if (!typing) $('#mid').innerHTML = view.tab === 'script' ? scriptHtml(s) : view.tab === 'bank' ? bankHtml() : view.tab === 'ask' ? askHtml() : view.tab === 'people' ? peopleHtml() : helpHtml();
  if (view.tab === 'help' && !typing) { var th = $('#hthread'); if (th) th.scrollTop = th.scrollHeight; }
  $('#controls').innerHTML = controlsHtml();
  $('#room').innerHTML = roomHtml();
  $('#status').className = 'status ' + Live.status;
  $('#status').innerHTML = '<span class="dot"></span>' + Live.status + (Live.kind === 'local' ? ' · this browser only' : '');
  tickTimer();
}
var tmT = null;
function tickTimer() {
  clearInterval(tmT);
  function step() { var el = $('.tleft'); if (el) el.textContent = MF.fmtClock((+el.getAttribute('data-ends') - Date.now()) / 1000); }
  step(); tmT = setInterval(step, 500);
}
var renderSoon = (function () { var t = null; return function () { if (t) return; t = setTimeout(function () { t = null; render(); }, 120); }; })();

/* ── events ── */
function wire() {
  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var d = b.dataset;
    if (d.seg) goSegment(d.seg);
    else if (d.tab) { view.tab = d.tab; if (d.tab === 'help' && view.pid) seenThread(view.pid); render(); }
    else if (d.chat) { view.tab = 'help'; view.pid = d.chat; view.draft = ''; seenThread(d.chat); render(); var rb = $('#replyBox'); if (rb) rb.focus(); }
    else if (d.thread) { view.pid = d.thread; view.draft = ''; seenThread(d.thread); render(); }
    else if (d.clearhelp) { if (progress[d.clearhelp]) progress[d.clearhelp].help = ''; Live.hostClearHelp(d.clearhelp); render(); }
    else if (d.quick) { var box = $('#replyBox'); if (box) { box.value = d.quick; view.draft = d.quick; box.focus(); } }
    else if (d.launch) launch(d.launch);
    else if (d.game) { var g = MF.GAMES[d.game]; launch(g.items[0], { id: d.game, title: g.title, qn: 1, qt: g.items.length }); }
    else if (d.gamenext) gameNext(d.gamenext);
    else if (d.mode) show(d.mode);
    else if (d.timer) startTimer(+d.timer);
    else if (d.award) awardTeam(d.award, 250);
    else if (d.hide) Live.hidePost(isNaN(+d.hide) ? d.hide : +d.hide, d.hidden !== '1');
    else if (d.do === 'lock') lock();
    else if (d.do === 'reveal') reveal();
    else if (d.do === 'reopen') { var a = st().act; Live.setState({ mode: 'activity', act: Object.assign({}, a, { phase: 'open', openedAt: Date.now() }) }); armAuto(); }
    else if (d.do === 'close') Live.setState({ act: null, reveal: null, mode: 'stage' });
    else if (d.do === 'notimer') Live.setState({ timer: null });
    else if (d.do === 'certson') { if (confirm('Issue certificates now? Every phone in the room can then create its certificate.')) Live.setState({ certs: true, mode: 'certs' }); }
    else if (d.do === 'certsoff') Live.setState({ certs: false, mode: st().mode === 'certs' ? 'stage' : st().mode });
    else if (d.do === 'projector') window.open('screen.html?room=' + Live.room + (MF.param('driver') ? '&driver=' + MF.param('driver') : ''), 'manifest-screen', 'width=1280,height=720');
    else if (d.do === 'csv') exportCsv();
    else if (d.do === 'reset') {
      if (confirm('Wipe every answer, post and person in room ' + Live.room + '? Scores reset too. This cannot be undone.')) {
        Live.resetRoom().then(function () { Live.setState(Live.blankState()); MF.toast('Room ' + Live.room + ' is clean'); });
      }
    }
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'replyBox') view.draft = e.target.value; });
  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'replyBox' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#hreply').requestSubmit(); }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'hreply') {
      e.preventDefault();
      var body = view.draft.trim(), pid = view.pid; if (!body || !pid) return;
      Live.hostReply(pid, body).then(function () {
        view.draft = ''; var rb = $('#replyBox'); if (rb) { rb.value = ''; rb.blur(); }
        if (progress[pid]) progress[pid].help = '';
        pullInbox(); setTimeout(pullInbox, 600);
      }).catch(function (err) { MF.toast('Not sent: ' + err.message, 'bad'); });
      return;
    }
    if (e.target.id !== 'ask') return;
    e.preventDefault();
    var f = e.target, q = f.q.value.trim(), kind = f.kind.value;
    if (!q) return;
    var d = { kind: kind, q: q };
    if (kind === 'poll') {
      d.options = f.opts.value.split('|').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4);
      if (d.options.length < 2) { MF.toast('A poll needs at least two options, separated by |', 'bad'); return; }
    }
    if (kind === 'scale') { d.min = 1; d.max = 5; d.labels = ['Not at all', 'Completely']; }
    if (kind === 'cloud') d.max = 30;
    launchInline(d); f.reset();
  });
  document.addEventListener('keydown', function (e) {
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'r') reveal();
    if (e.key === 'l') lock();
    if (e.key === 'n' && st().act && st().act.gameId) gameNext(st().act.gameId);
    if (e.key === 'b') show('leaderboard');
    if (e.key === 'j') show('join');
    if (e.key === 's') show('stage');
  });
}

/* ── boot: sign in to a room ── */
function gate() {
  var room = MF.param('room') || MF.get('mf.host.room', MF.DEFAULT_ROOM);
  $('#gate').hidden = false;
  $('#gate').innerHTML = '<form class="card gate"><div class="row">' + MF.icon('i-box', 28, 2) + '<h1>Host console</h1></div>' +
    '<p class="muted">You are the only one who changes what the room sees. ' + (MF.SUPABASE_URL ? 'Live mode: phones anywhere can join.' : '<b>Local mode</b>: the projector and phones must be tabs in this browser. Add Supabase keys in <code>src/config.js</code> for the real room.') + '</p>' +
    '<label class="field"><span>Room code</span><input class="input code" name="room" value="' + esc(room) + '" maxlength="8" required></label>' +
    (MF.SUPABASE_URL && MF.param('driver') !== 'local' ? '<label class="field"><span>Host key (first use sets it; 6+ characters)</span><input class="input" name="key" type="password" minlength="6" autocomplete="current-password" required></label>' : '') +
    '<button class="btn primary block" type="submit">Open the room</button><p class="hint" id="gateMsg"></p></form>';
  $('#gate form').addEventListener('submit', function (e) {
    e.preventDefault();
    var r = MF.normRoom(this.room.value), key = this.key ? this.key.value : 'local';
    MF.put('mf.host.room', r);
    $('#gateMsg').textContent = 'Opening…';
    Live.start(r, 'host');
    Live.hostOpen(key, MF.APP.course).then(function (ok) {
      if (!ok) { $('#gateMsg').textContent = 'That key does not match this room.'; return; }
      $('#gate').hidden = true; $('#app').hidden = false;
      selSeg = Live.state.segment || nowSegment();
      render(); pullInbox(); pullProgress();
    }).catch(function (err) { $('#gateMsg').textContent = 'Could not open the room: ' + err.message; });
  });
}

function boot() {
  Live.on('state', function () { if (!$('#app').hidden) renderSoon(); });
  Live.on('responses', function (rs) { responses = rs; renderSoon(); });
  Live.on('posts', function (ps) { posts = ps; renderSoon(); });
  Live.on('people', renderSoon);
  Live.on('presence', renderSoon);
  Live.on('status', renderSoon);
  Live.on('messages-changed', pullInbox);
  Live.on('progress-changed', pullProgress);
  setInterval(function () { if (!document.hidden) pullInbox(); }, 4000);
  setInterval(function () { if (!document.hidden) pullProgress(); }, 8000);
  wire();
  gate();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.MF = window.MF || {});
