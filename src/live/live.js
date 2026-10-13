/* MANIFEST · live: one interface, two drivers.

   The host is the only writer of room state. Phones write exactly three
   things: their own answer to an activity (once), wall posts, and votes.
   Everything a phone shows comes from the state the host publishes, so the
   room can never disagree with the projector.

   State shape (host writes, everyone reads):
   {
     seq:      monotonic counter, so a late or duplicate message is ignored
     mode:     'stage' | 'activity' | 'board' | 'podium'
     segment:  agenda segment id (phones offer the matching lesson)
     act:      { id, phase:'open'|'locked'|'reveal', openedAt, secs, def? } | null
     reveal:   { counts:[], correct:[], points:{pid:n}, avg? } | null
     totals:   { pid: points }            running quiz score
     streaks:  { pid: n }                 consecutive correct answers
     timer:    { endsAt, label } | null   room countdown for group work
     board:    board id shown in 'board' mode
     note:     one-line banner, or ''
     certs:    true once the trainer issues certificates
   }
*/
(function (MF) {
'use strict';

var listeners = {};
function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
function emit(evt, data) { (listeners[evt] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); }

function blankState() {
  return { seq: 0, mode: 'stage', segment: '', act: null, reveal: null, totals: {}, streaks: {}, timer: null, board: '', note: '', certs: false };
}

/* ── Scoring. Kahoot's shape (up to 1000, falling with time) but with speed
   worth a quarter, not a half: a correct answer at the buzzer still earns 750.
   Speed-heavy scoring makes people guess (Wang & Tahir 2020), and this room
   is being taught to check before it answers. Streaks are shown but earn
   nothing extra: Kahoot reportedly dropped streak points too. ── */
var Score = {
  MAX: 1000,
  SPEED_SHARE: 0.25,
  STREAK_STEP: 0,
  STREAK_CAP: 500,
  points: function (correct, ms, limitMs) {
    if (!correct) return 0;
    var r = MF.clamp(ms / Math.max(1, limitMs), 0, 1);
    return Math.round(Score.MAX * (1 - r * Score.SPEED_SHARE));
  },
  streakBonus: function (streak) { return streak > 1 ? Math.min((streak - 1) * Score.STREAK_STEP, Score.STREAK_CAP) : 0; },
  isCorrect: function (def, answer) {
    if (!def || answer == null) return false;
    if (def.kind === 'number') {
      var n = parseFloat(String(answer).replace(/[, ]/g, ''));
      return !isNaN(n) && Math.abs(n - def.correct) <= (def.tolerance || 0);
    }
    if (def.kind === 'rank') {
      return Array.isArray(answer) && JSON.stringify(answer) === JSON.stringify(def.correct);
    }
    var c = Array.isArray(def.correct) ? def.correct : [def.correct];
    return c.indexOf(answer) >= 0;
  }
};

/* Team score is the average of members who have played, so a table of
   four is not beaten by a table of seven just for being bigger. */
function teamTotals(totals, people) {
  var t = {};
  (MF.TEAMS || []).forEach(function (tm) { t[tm.id] = { id: tm.id, name: tm.name, color: tm.color, sum: 0, n: 0, avg: 0 }; });
  Object.keys(totals || {}).forEach(function (pid) {
    var p = people[pid]; if (!p || !t[p.team]) return;
    t[p.team].sum += totals[pid]; t[p.team].n++;
  });
  return Object.keys(t).map(function (k) { var x = t[k]; x.avg = x.n ? Math.round(x.sum / x.n) : 0; return x; })
    .filter(function (x) { return x.n > 0; })
    .sort(function (a, b) { return b.avg - a.avg; });
}

/* ── Activity lookup: an inline definition (ad-hoc question typed by the
   host) wins over the bank. ── */
function activity(act) {
  if (!act) return null;
  if (act.def) return act.def;
  return (MF.ACTIVITIES || {})[act.id] || null;
}

/* ── Driver selection ── */
function pickDriver() {
  var forced = MF.param('driver');
  if (forced === 'local' || forced === 'supabase') return forced;
  if (MF.DRIVER === 'local' || MF.DRIVER === 'supabase') return MF.DRIVER;
  return (MF.SUPABASE_URL && MF.SUPABASE_ANON_KEY && window.supabase) ? 'supabase' : 'local';
}

var Live = {
  on: on, emit: emit, blankState: blankState, Score: Score, teamTotals: teamTotals, activity: activity,
  driver: null, kind: '', room: '', role: '', state: blankState(), people: {}, online: {},
  status: 'connecting',

  start: function (room, role) {
    var r = MF.normRoom(room || MF.DEFAULT_ROOM);
    /* Joining after boot calls start again: reuse the running connection. */
    if (Live.driver && Live.room === r && Live.role === role && Live._started) return Live._started;
    Live.room = r;
    Live.role = role;
    Live.kind = pickDriver();
    Live.driver = Live.kind === 'supabase' ? MF.SupabaseDriver : MF.LocalDriver;
    /* A room that is not open yet must be re-checked next time, not cached. */
    Live._started = Promise.resolve(Live.driver.start(Live.room, role)).then(function (res) {
      if (!res || res.missing || res.error) Live._started = null;
      return res;
    });
    return Live._started;
  },
  setStatus: function (s) { if (Live.status !== s) { Live.status = s; emit('status', s); } },
  acceptState: function (st) {
    if (!st) return;
    if (typeof st === 'string') { try { st = JSON.parse(st); } catch (e) { return; } }
    if (st.seq && Live.state && Live.state.seq && st.seq < Live.state.seq) return; // stale; seq 0 means a reset and always wins
    Live.state = Object.assign(blankState(), st);
    emit('state', Live.state);
  },
  acceptPeople: function (list) {
    var map = {};
    (list || []).forEach(function (p) { map[p.id] = p; });
    Live.people = map; emit('people', map);
  },

  /* player */
  join: function (me) { return Live.driver.join(me); },
  respond: function (actId, answer, ms) { return Live.driver.respond(actId, answer, ms); },
  post: function (board, body, col, anon) { return Live.driver.post(board, body, col, anon); },
  vote: function (postId) { return Live.driver.vote(postId); },
  posts: function (board) { return Live.driver.posts(board); },

  /* progress, help chat and certificates: private to one phone and the host */
  saveProgress: function (data, page, help) { return Live.driver.saveProgress(data, page, help); },
  sendMessage: function (body, context) { return Live.driver.sendMessage(body, context); },
  myMessages: function (after) { return Live.driver.myMessages(after || 0); },
  claimCert: function (name) { return Live.driver.claimCert(name); },
  verifyCert: function (id) { return Live.driver.verifyCert(id); },

  /* host */
  hostOpen: function (key, title) { return Live.driver.hostOpen(key, title); },
  hostInbox: function (after) { return Live.driver.hostInbox(after || 0); },
  hostReply: function (pid, body) { return Live.driver.hostReply(pid, body); },
  hostMarkSeen: function (pid) { return Live.driver.hostMarkSeen(pid); },
  hostProgress: function () { return Live.driver.hostProgress(); },
  hostClearHelp: function (pid) { return Live.driver.hostClearHelp(pid); },
  setState: function (patch) {
    var next = Object.assign({}, Live.state, patch);
    next.seq = (Live.state.seq || 0) + 1;
    next.at = Date.now();
    Live.state = next;
    emit('state', next);           // the host sees its own change at once
    return Live.driver.setState(next);
  },
  responses: function (actId) { return Live.driver.responses(actId); },
  hidePost: function (id, hidden) { return Live.driver.hidePost(id, hidden); },
  resetRoom: function () { return Live.driver.resetRoom(); }
};

MF.Live = Live;
})(window.MF = window.MF || {});
