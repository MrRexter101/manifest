/* MANIFEST · supabase driver: every phone in the room, one channel.
   Phones read room state from the sessions row and follow its UPDATEs.
   Host and projector also follow answers and joins as they arrive.
   Anything a phone fails to send (wall posts) is queued and retried. */
(function (MF) {
'use strict';

var sb = null, room = '', role = '', ch = null, me = null, hostKey = '';
var cache = { responses: {}, posts: {}, people: {} };
var queue = MF.get('mf.queue', []);
var retryDelay = 1000, retryT = null, emitT = {};

function client() {
  if (!sb) sb = window.supabase.createClient(MF.SUPABASE_URL, MF.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 20 } }
  });
  return sb;
}

function ts(v) { return typeof v === 'string' ? Date.parse(v) : (v || 0); }
function normPost(r) { r.at = ts(r.at); return r; }
function normResp(r) { r.at = ts(r.at); return r; }

/* Batch bursts: forty answers in two seconds become a handful of renders. */
function emitSoon(which) {
  if (emitT[which]) return;
  emitT[which] = setTimeout(function () {
    emitT[which] = null;
    if (which === 'posts') MF.Live.emit('posts', values(cache.posts));
    if (which === 'responses') MF.Live.emit('responses', values(cache.responses));
    if (which === 'people') MF.Live.acceptPeople(values(cache.people));
  }, 80);
}
function values(o) { return Object.keys(o).map(function (k) { return o[k]; }); }

function pull() {
  var c = client();
  c.from('sessions').select('state').eq('code', room).maybeSingle().then(function (res) {
    if (res.error) return;
    if (!res.data) { MF.Live.emit('noroom', room); return; }
    MF.Live.acceptState(res.data.state && res.data.state.seq != null ? res.data.state : MF.Live.blankState());
  });
  c.from('posts').select('*').eq('room', room).limit(3000).then(function (res) {
    if (res.error || !res.data) return;
    res.data.forEach(function (r) { cache.posts[r.id] = normPost(r); });
    emitSoon('posts');
  });
  if (role !== 'player') {
    c.from('responses').select('*').eq('room', room).limit(10000).then(function (res) {
      if (res.error || !res.data) return;
      res.data.forEach(function (r) { cache.responses[r.id] = normResp(r); });
      emitSoon('responses');
    });
    c.from('participants').select('*').eq('room', room).limit(500).then(function (res) {
      if (res.error || !res.data) return;
      res.data.forEach(function (r) { cache.people[r.id] = r; });
      emitSoon('people');
    });
  }
}

function subscribe() {
  var c = client();
  /* Drop the old channel first and forget it: its CLOSED callback must not
     schedule yet another reconnect (that loops forever). */
  var old = ch; ch = null;
  if (old) { try { c.removeChannel(old); } catch (e) {} }
  clearTimeout(retryT);
  MF.Live.setStatus('connecting');
  var mine = ch = c.channel('room-' + room + '-' + MF.uid(5));

  ch.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: 'code=eq.' + room },
    function (p) { if (p.new && p.new.state) MF.Live.acceptState(p.new.state); });

  /* Phones get room state and nothing else live. Supabase's free tier caps
     realtime at 100 messages a second counted per RECEIVER, so a wall post
     fanned out to 40 phones costs 40. Phones poll walls instead (below). */
  if (role !== 'player') {
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: 'room=eq.' + room },
      function (p) {
        if (p.eventType === 'DELETE') { if (p.old && p.old.id) delete cache.posts[p.old.id]; }
        else if (p.new && p.new.id) cache.posts[p.new.id] = normPost(p.new);
        emitSoon('posts');
      });
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'responses', filter: 'room=eq.' + room },
      function (p) {
        if (p.eventType === 'DELETE') { cache.responses = {}; }
        else if (p.new && p.new.id) cache.responses[p.new.id] = normResp(p.new);
        emitSoon('responses');
      });
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: 'room=eq.' + room },
      function (p) {
        if (p.eventType === 'DELETE') { cache.people = {}; }
        else if (p.new && p.new.id) cache.people[p.new.id] = p.new;
        emitSoon('people');
      });
  }

  ch.subscribe(function (status) {
    if (ch !== mine) return;                 // a replaced channel reporting in
    if (status === 'SUBSCRIBED') {
      retryDelay = 1000;
      MF.Live.setStatus('online');
      pull();
      flushQueue();
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      MF.Live.setStatus('offline');
      clearTimeout(retryT); retryT = setTimeout(subscribe, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    }
  });
}

/* ── wall posts survive a dropped connection ── */
function saveQueue() { MF.put('mf.queue', queue); }
function flushQueue() {
  if (!queue.length || !navigator.onLine) return;
  var item = queue[0];
  client().from('posts').insert(item).then(function (res) {
    if (!res.error || /violates|check constraint/i.test(res.error.message || '')) {
      queue.shift(); saveQueue();
      if (queue.length) flushQueue();
    }
  });
}

/* Phones refresh walls every 4 s while a wall is the open activity. */
var lastPostPoll = 0;
function pollPosts() {
  if (role !== 'player' || !room) return;
  var a = MF.Live.state && MF.Live.state.act;
  var d = a ? MF.Live.activity(a) : null;
  if (!d || d.kind !== 'wall' || document.hidden) return;
  if (Date.now() - lastPostPoll < 3500) return;
  lastPostPoll = Date.now();
  client().from('posts').select('*').eq('room', room).eq('board', a.id).limit(500).then(function (res) {
    if (res.error || !res.data) return;
    res.data.forEach(function (r) { cache.posts[r.id] = normPost(r); });
    emitSoon('posts');
  });
}
setInterval(pollPosts, 1000);

/* Phones sleep. When one wakes, catch up instead of showing a stale question. */
document.addEventListener('visibilitychange', function () { if (!document.hidden && room) { pull(); flushQueue(); } });
window.addEventListener('online', function () { if (room && MF.Live.status !== 'online') subscribe(); });

var Driver = {
  start: function (r, ro) {
    room = r; role = ro;
    subscribe();
    return client().from('sessions').select('code').eq('code', room).maybeSingle().then(function (res) {
      if (res.error) return { ok: false, error: res.error.message };
      return { ok: !!res.data, missing: !res.data };
    }, function (e) { return { ok: false, error: String(e) }; });
  },

  join: function (m) {
    me = m;
    return client().rpc('join_room', { p_id: m.id, p_room: room, p_name: m.name, p_team: m.team || '' }).then(function (res) {
      if (res.error) throw new Error(res.error.message);
      return m;
    });
  },

  respond: function (actId, answer, ms) {
    var row = { room: room, activity: actId, pid: me.id, name: me.name, team: me.team || '', answer: answer, ms: Math.max(0, Math.min(600000, Math.round(ms || 0))) };
    function attempt(n) {
      return client().from('responses').insert(row).then(function (res) {
        if (!res.error) return { ok: true };
        if (res.error.code === '23505') return { dup: true };
        if (res.error.code === '42501' || /row-level security/i.test(res.error.message)) return { late: true };
        if (n < 3) return new Promise(function (ok) { setTimeout(function () { ok(attempt(n + 1)); }, 700 * (n + 1)); });
        return { error: res.error.message };
      }, function () {
        if (n < 3) return new Promise(function (ok) { setTimeout(function () { ok(attempt(n + 1)); }, 700 * (n + 1)); });
        return { error: 'network' };
      });
    }
    return attempt(0);
  },

  post: function (board, body, col, anon) {
    var row = { room: room, board: board, pid: me.id, author: anon ? '' : me.name, team: me.team || '', body: String(body).slice(0, 280), col: col || '' };
    return client().from('posts').insert(row).select().single().then(function (res) {
      if (res.error) {
        if (/violates|check constraint/i.test(res.error.message)) throw new Error(res.error.message);
        queue.push(row); saveQueue(); return { queued: true };
      }
      cache.posts[res.data.id] = normPost(res.data); emitSoon('posts');
      return res.data;
    }, function () { queue.push(row); saveQueue(); return { queued: true }; });
  },

  vote: function (postId) {
    return client().from('votes').insert({ post: postId, pid: me.id }).then(function (res) {
      if (res.error && res.error.code === '23505') return { dup: true };
      if (res.error) return { error: res.error.message };
      return { ok: true };
    });
  },

  posts: function (board) {
    return Promise.resolve(values(cache.posts).filter(function (p) { return !board || p.board === board; }));
  },

  saveProgress: function (data, page, help) {
    if (!me) return Promise.resolve({ skipped: true });
    return client().rpc('save_progress', { p_pid: me.id, p_room: room, p_data: data || {}, p_page: page || '', p_help: help || '' })
      .then(function (res) { return res.error ? { error: res.error.message } : { ok: true }; }, function () { return { error: 'network' }; });
  },
  sendMessage: function (body, context) {
    if (!me) return Promise.reject(new Error('Join the room first.'));
    return client().rpc('send_message', { p_pid: me.id, p_room: room, p_body: body, p_context: context || '' }).then(function (res) {
      if (res.error) throw new Error(/54000|too many/.test(res.error.code + res.error.message) ? 'Too many messages. Wait a minute.' : 'Not sent. Check your connection and try again.');
      return res.data;
    });
  },
  myMessages: function (after) {
    if (!me) return Promise.resolve([]);
    return client().rpc('my_messages', { p_pid: me.id, p_room: room, p_after: after || 0 }).then(function (res) {
      return res.error || !res.data ? [] : res.data.map(function (m) { m.at = ts(m.at); return m; });
    }, function () { return []; });
  },
  claimCert: function (name) {
    if (!me) return Promise.reject(new Error('Join the room first.'));
    return client().rpc('claim_certificate', { p_pid: me.id, p_room: room, p_name: name }).then(function (res) {
      if (res.error) throw new Error(/not open/.test(res.error.message) ? 'Certificates are not open yet. The trainer opens them at the end of the day.' : res.error.message);
      return res.data;
    });
  },
  verifyCert: function (id) {
    return client().rpc('verify_certificate', { p_id: id }).then(function (res) {
      if (res.error || !res.data || !res.data.length) return null;
      var c = res.data[0]; c.issued_at = ts(c.issued_at); return c;
    }, function () { return null; });
  },

  /* host */
  hostInbox: function (after) {
    return client().rpc('host_inbox', { p_room: room, p_key: hostKey, p_after: after || 0 }).then(function (res) {
      return res.error || !res.data ? [] : res.data.map(function (m) { m.at = ts(m.at); return m; });
    }, function () { return []; });
  },
  hostReply: function (pid, body) {
    return client().rpc('host_reply', { p_room: room, p_key: hostKey, p_pid: pid, p_body: body }).then(function (res) {
      if (res.error) throw new Error(res.error.message); return res.data;
    });
  },
  hostMarkSeen: function (pid) { return client().rpc('host_mark_seen', { p_room: room, p_key: hostKey, p_pid: pid }); },
  hostProgress: function () {
    return client().rpc('host_progress', { p_room: room, p_key: hostKey }).then(function (res) {
      return res.error || !res.data ? [] : res.data.map(function (g) { g.updated_at = ts(g.updated_at); return g; });
    }, function () { return []; });
  },
  hostClearHelp: function (pid) { return client().rpc('host_clear_help', { p_room: room, p_key: hostKey, p_pid: pid }); },

  hostOpen: function (key, title) {
    hostKey = key;
    return client().rpc('host_open', { p_room: room, p_key: key, p_title: title || '' }).then(function (res) {
      if (res.error) throw new Error(res.error.message);
      if (res.data) pull();
      return !!res.data;
    });
  },
  setState: function (next) {
    return client().rpc('host_set_state', { p_room: room, p_key: hostKey, p_state: next }).then(function (res) {
      if (res.error) { MF.toast('Room did not update: ' + res.error.message, 'bad'); return false; }
      return true;
    }, function () { MF.toast('Room did not update: no connection', 'bad'); return false; });
  },
  responses: function (actId) {
    return client().from('responses').select('*').eq('room', room).eq('activity', actId).limit(1000).then(function (res) {
      if (!res.error && res.data) res.data.forEach(function (r) { cache.responses[r.id] = normResp(r); });
      return values(cache.responses).filter(function (r) { return r.activity === actId; });
    });
  },
  hidePost: function (id, hidden) {
    return client().rpc('host_hide_post', { p_room: room, p_key: hostKey, p_post: id, p_hidden: !!hidden });
  },
  resetRoom: function () {
    return client().rpc('host_reset', { p_room: room, p_key: hostKey }).then(function (res) {
      if (res.error) throw new Error(res.error.message);
      cache = { responses: {}, posts: {}, people: {} };
      emitSoon('posts'); emitSoon('responses'); emitSoon('people');
      return true;
    });
  }
};

MF.SupabaseDriver = Driver;
})(window.MF = window.MF || {});
