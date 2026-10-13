/* MANIFEST · activity rendering, shared by phone, projector and host.

   Kinds:  quiz   options[], correct (index or [indexes]), secs, why
           poll   options[]
           scale  min, max, labels:[low, high]
           cloud  max (chars)
           wall   cols[] (optional), anon (default true)
           rank   items[], correct? (array of item indexes, best first)
           number correct, tolerance, unit, secs
*/
(function (MF) {
'use strict';
var esc = MF.esc;

/* ── tally: one function the projector, host and phones all trust ── */
function tally(def, responses) {
  var t = { total: responses.length, counts: [], avg: 0, words: [], borda: [], numbers: [], correctN: 0 };
  if (!def) return t;
  if (def.kind === 'quiz' || def.kind === 'poll') {
    t.counts = (def.options || []).map(function () { return 0; });
    responses.forEach(function (r) { if (typeof r.answer === 'number' && t.counts[r.answer] != null) t.counts[r.answer]++; });
    if (def.kind === 'quiz') responses.forEach(function (r) { if (MF.Live.Score.isCorrect(def, r.answer)) t.correctN++; });
  } else if (def.kind === 'scale') {
    var lo = def.min || 1, hi = def.max || 5, sum = 0, n = 0;
    for (var v = lo; v <= hi; v++) t.counts.push(0);
    responses.forEach(function (r) { var x = +r.answer; if (x >= lo && x <= hi) { t.counts[x - lo]++; sum += x; n++; } });
    t.avg = n ? sum / n : 0;
  } else if (def.kind === 'cloud') {
    var map = {};
    responses.forEach(function (r) {
      String(r.answer || '').split(/[,;\n]/).forEach(function (w) {
        w = w.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
        if (w) map[w] = (map[w] || 0) + 1;
      });
    });
    t.words = Object.keys(map).map(function (w) { return { w: w, n: map[w] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 60);
  } else if (def.kind === 'rank') {
    var items = def.items || [], score = items.map(function () { return 0; });
    responses.forEach(function (r) {
      if (!Array.isArray(r.answer)) return;
      r.answer.forEach(function (idx, pos) { if (score[idx] != null) score[idx] += items.length - pos; });
    });
    t.borda = items.map(function (it, i) { return { i: i, text: it, s: score[i] }; }).sort(function (a, b) { return b.s - a.s; });
    if (def.correct) responses.forEach(function (r) { if (MF.Live.Score.isCorrect(def, r.answer)) t.correctN++; });
  } else if (def.kind === 'number') {
    responses.forEach(function (r) {
      var n = parseFloat(String(r.answer).replace(/[, ]/g, ''));
      if (!isNaN(n)) { t.numbers.push(n); if (Math.abs(n - def.correct) <= (def.tolerance || 0)) t.correctN++; }
    });
    t.numbers.sort(function (a, b) { return a - b; });
  }
  return t;
}

function kindLabel(k) {
  return { quiz: 'Quiz', poll: 'Poll', scale: 'Scale', cloud: 'Word cloud', wall: 'Wall', rank: 'Ranking', number: 'Number' }[k] || k;
}
function kindIcon(k) {
  return { quiz: 'i-target', poll: 'i-poll', scale: 'i-poll', cloud: 'i-cloud', wall: 'i-wall', rank: 'i-up', number: 'i-calc' }[k] || 'i-live';
}
function fmtNum(n) { return Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-US') : String(Math.round(n * 100) / 100); }

/* ── results block (used by projector, host, and phones after reveal) ── */
function results(def, t, opts) {
  opts = opts || {};
  var reveal = !!opts.reveal, h = '';
  if (!def) return '';
  if (def.kind === 'quiz' || def.kind === 'poll') {
    var max = Math.max.apply(null, t.counts.concat([1]));
    var correct = Array.isArray(def.correct) ? def.correct : [def.correct];
    h += '<div class="bars">' + (def.options || []).map(function (o, i) {
      var isC = def.kind === 'quiz' && correct.indexOf(i) >= 0;
      var dim = reveal && def.kind === 'quiz' && !isC;
      return '<div class="bar tile-' + MF.SHAPES[i % 4] + (dim ? ' dim' : '') + '">' +
        '<span class="lbl" style="color:var(--tile)">' + MF.shape(i, opts.big ? 30 : 20) + '</span>' +
        '<div class="track"><div class="fill" style="width:' + (100 * t.counts[i] / max) + '%"></div></div>' +
        '<span class="n">' + t.counts[i] + (reveal && isC ? ' ✓' : '') + '</span>' +
        (opts.labels ? '<span class="opt-text">' + esc(o) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  } else if (def.kind === 'scale') {
    var mx = Math.max.apply(null, t.counts.concat([1])), lo = def.min || 1;
    h += '<div class="hist">' + t.counts.map(function (c, i) {
      return '<div class="col"><div class="colbar" style="height:' + (100 * c / mx) + '%"><span>' + c + '</span></div><div class="colx">' + (lo + i) + '</div></div>';
    }).join('') + '</div>' +
      '<div class="row hist-foot"><span class="faint">' + esc((def.labels || [])[0] || '') + '</span><span class="spacer"></span>' +
      '<strong class="avg">Average ' + (t.avg ? t.avg.toFixed(1) : '–') + '</strong><span class="spacer"></span><span class="faint">' + esc((def.labels || [])[1] || '') + '</span></div>';
  } else if (def.kind === 'cloud') {
    var top = t.words.length ? t.words[0].n : 1, hues = ['var(--brand-text)', 'var(--accent)', 'var(--positive)', 'var(--points)', 'var(--text)'];
    h += '<div class="cloud">' + (t.words.length ? t.words.map(function (w, i) {
      var size = (opts.big ? 22 : 15) + (opts.big ? 54 : 22) * (w.n / top);
      return '<span style="font-size:' + size.toFixed(0) + 'px;color:' + hues[i % hues.length] + ';animation-delay:' + (i * 25) + 'ms">' + esc(w.w) + '</span>';
    }).join('') : '<span class="faint" style="font-size:18px;font-weight:600">Waiting for words…</span>') + '</div>';
  } else if (def.kind === 'rank') {
    var top2 = t.borda.length ? Math.max(1, t.borda[0].s) : 1;
    h += '<ol class="rankres">' + t.borda.map(function (b, i) {
      var good = reveal && def.correct && def.correct[i] === b.i;
      return '<li class="' + (good ? 'good' : '') + '"><span class="pos">' + (i + 1) + '</span><span class="txt">' + esc(b.text) +
        '</span><div class="track"><div class="fill" style="width:' + (100 * b.s / top2) + '%"></div></div></li>';
    }).join('') + '</ol>';
    if (reveal && def.correct) h += '<p class="faint small">Model answer: ' + def.correct.map(function (i) { return esc(def.items[i]); }).join(' → ') + '</p>';
  } else if (def.kind === 'number') {
    var nums = t.numbers, med = nums.length ? nums[Math.floor(nums.length / 2)] : null;
    h += '<div class="numres">' +
      '<div><div class="eyebrow">Answers</div><div class="big">' + nums.length + '</div></div>' +
      '<div><div class="eyebrow">Middle answer</div><div class="big">' + (med == null ? '–' : fmtNum(med)) + '</div></div>' +
      (reveal ? '<div class="ok"><div class="eyebrow">Correct' + (def.tolerance ? ' (± ' + fmtNum(def.tolerance) + ')' : '') + '</div><div class="big">' + fmtNum(def.correct) + ' ' + esc(def.unit || '') + '</div></div>' +
        '<div><div class="eyebrow">Got it</div><div class="big">' + t.correctN + '</div></div>' : '') +
      '</div>';
    if (nums.length) {
      h += '<div class="strip">' + nums.slice(0, 80).map(function (n) {
        var ok = reveal && Math.abs(n - def.correct) <= (def.tolerance || 0);
        return '<span class="' + (ok ? 'ok' : '') + '">' + fmtNum(n) + '</span>';
      }).join('') + '</div>';
    }
  }
  if (reveal && def.why) h += '<div class="why">' + MF.icon('i-spark', 18) + '<div>' + MF.md(def.why) + '</div></div>';
  return h;
}

/* ── wall (Padlet-style). Columns if the activity defines them. ── */
function wall(def, posts, opts) {
  opts = opts || {};
  var visible = posts.filter(function (p) { return opts.host || !p.hidden; });
  var sortFn = opts.byVotes ? function (a, b) { return (b.votes || 0) - (a.votes || 0) || b.at - a.at; } : function (a, b) { return b.at - a.at; };
  function card(p) {
    var voted = opts.voted && opts.voted[p.id];
    return '<article class="post' + (p.hidden ? ' hidden' : '') + '" data-id="' + esc(p.id) + '">' +
      '<p>' + esc(p.body) + '</p>' +
      '<footer><span class="who">' + (p.author ? esc(p.author) : 'Anonymous') + '</span><span class="spacer"></span>' +
      (opts.canVote ? '<button class="vote' + (voted ? ' on' : '') + '" data-vote="' + esc(p.id) + '" aria-label="Vote">' + MF.icon('i-up', 16, 2.4) + '<b>' + (p.votes || 0) + '</b></button>'
        : '<span class="votes">' + MF.icon('i-up', 15, 2.4) + (p.votes || 0) + '</span>') +
      (opts.host ? '<button class="hide" data-hide="' + esc(p.id) + '" data-hidden="' + (p.hidden ? 1 : 0) + '" title="' + (p.hidden ? 'Show' : 'Hide') + '">' + MF.icon(p.hidden ? 'i-eye' : 'i-eye-off', 15) + '</button>' : '') +
      '</footer></article>';
  }
  if (def && def.cols && def.cols.length) {
    return '<div class="wall cols" style="--ncol:' + def.cols.length + '">' + def.cols.map(function (c) {
      var ps = visible.filter(function (p) { return p.col === c; }).sort(sortFn);
      return '<section class="wcol"><h4>' + esc(c) + ' <span class="faint">' + ps.length + '</span></h4>' + ps.map(card).join('') + '</section>';
    }).join('') + '</div>';
  }
  var all = visible.slice().sort(sortFn);
  return '<div class="wall masonry">' + (all.length ? all.map(card).join('') : '<p class="faint empty">Nothing posted yet.</p>') + '</div>';
}

MF.R = { tally: tally, results: results, wall: wall, kindLabel: kindLabel, kindIcon: kindIcon, fmtNum: fmtNum };
})(window.MF = window.MF || {});
