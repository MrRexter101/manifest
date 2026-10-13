/* MANIFEST · toolkit. Things people keep using after the room empties:
   a prompt builder, a prompt library, calculators that check the AI's math,
   the paste-or-not guide, the tool chooser, the checks and a glossary. */
(function (MF) {
'use strict';
var $ = MF.$, esc = MF.esc, md = MF.md, icon = MF.icon;

var ITEMS = [
  { id: 'builder', i: 'i-spark', t: 'Prompt builder', d: 'SCR + Constraint, with a strength meter' },
  { id: 'library', i: 'i-book', t: 'Prompt library', d: 'Logistics prompts by job, ready to copy' },
  { id: 'calc', i: 'i-calc', t: 'Check the math', d: 'Landed cost, ROP, EOQ, OTIF, freight, dates' },
  { id: 'safe', i: 'i-shield', t: 'Paste or not?', d: 'Green, amber, red: what goes into which tool' },
  { id: 'choose', i: 'i-grid', t: 'Which tool?', d: '13 tasks, the free tool and the work tool' },
  { id: 'checks', i: 'i-check', t: 'The checks', d: 'Before anything leaves your desk' },
  { id: 'glossary', i: 'i-search', t: 'Glossary', d: 'AI and logistics words, in plain English' }
];

function render(sub, shell) {
  var fn = { '': index, builder: builder, library: library, calc: calc, safe: safe, choose: choose, checks: checks, glossary: glossary }[sub || ''] || index;
  fn(shell);
}

function index(shell) {
  shell('/tools', '<section class="route-head"><h2>Keep these. Use them on Monday.</h2><p class="lead">The builder, the prompts and the checks from today, for your desk.</p></section>' +
    '<div class="toolgrid">' + ITEMS.map(function (x) {
      return '<a class="toolcard card" href="#/tools/' + x.id + '">' + icon(x.i, 26) + '<b>' + esc(x.t) + '</b><span class="muted small">' + esc(x.d) + '</span></a>';
    }).join('') + '</div>');
}
function page(shell, title, html) { shell('/tools', html, { back: '/tools', title: title }); }

/* ───────── Prompt builder ───────── */
var PRESETS = {
  S: ['You are a logistics coordinator at a food distributor in Chonburi, Thailand.', 'You are a procurement officer comparing supplier quotes.', 'You are an inventory planner who explains formulas simply.', 'You are a customer service lead writing to a hotel receiving team.'],
  R: ['A table with one row per item.', 'An email under 120 words.', '5 bullet points, one sentence each.', 'Excel formulas only, with a one-line explanation each.', 'Answer, then the clause number quoted word for word.'],
  C: ['Use only what I have given you. If something is missing, write MISSING.', 'Do not calculate yourself. Use code or give formulas.', 'Do not promise any date, price, credit or penalty.', 'Delete nothing. Flag problems in a new column.', 'If it is not in the document, reply NOT FOUND.', 'List your assumptions at the end.', 'Dates are DD/MM. Years like 2569 are Buddhist Era.']
};
function strength(p) {
  var score = 0, tips = [];
  if (p.S.trim().length > 15) score++; else tips.push('Say who the AI is and where it works.');
  if (p.C.trim().length > 30 && /\d/.test(p.C)) score++; else tips.push('Give the facts in the Complication: numbers, names, dates.');
  if (/table|email|bullet|words|slide|formula|list|format|under \d+/i.test(p.R)) score++; else tips.push('Say the shape of the answer: a table, an email under 120 words…');
  if (/only|missing|not found|do not|don't|never/i.test(p.K)) score++; else tips.push('Add a Constraint: "Use only what I have given you. If something is missing, write MISSING."');
  if (/assumption/i.test(p.K + p.R)) score++; else tips.push('Ask it to list its assumptions at the end.');
  return { score: score, tips: tips };
}
function builder(shell) {
  var P = MF.App.P(), p = P.notes.builder || { S: '', C: '', R: '', K: '' };
  function box(k, label, help, ph) {
    var presets = PRESETS[k === 'K' ? 'C' : k] || [];
    return '<label class="field b-field"><span><b class="scr">' + label[0] + '</b>' + esc(label) + ' <i class="faint">' + esc(help) + '</i></span>' +
      '<textarea class="textarea" data-b="' + k + '" rows="3" placeholder="' + esc(ph) + '">' + esc(p[k] || '') + '</textarea></label>' +
      (presets.length ? '<div class="presets">' + presets.map(function (x) { return '<button class="preset" data-add="' + k + '" data-text="' + esc(x) + '">+ ' + esc(x.length > 46 ? x.slice(0, 44) + '…' : x) + '</button>'; }).join('') + '</div>' : '');
  }
  var h = '<p class="muted small">Write each part. Tap a suggestion to add it. The meter checks for the five habits.</p>' +
    box('S', 'Situation', 'who the AI is, where', 'You are a … at a … in …') +
    box('C', 'Complication', 'what is hard, the facts', 'What happened, the numbers, the data') +
    box('R', 'Resolution', 'what you want back, its shape', 'A table / an email under 120 words / …') +
    box('K', 'Constraint', 'the guardrails', 'Use only what I have given you…') +
    '<section class="card meter-card"><div class="row"><span class="eyebrow">Brief strength</span><span class="spacer"></span><b id="bScore"></b></div><div class="meter"><i id="bBar"></i></div><ul id="bTips" class="tips"></ul></section>' +
    '<section class="card promptbox"><div class="row"><span class="eyebrow">Your prompt</span><span class="spacer"></span><button class="btn small primary" id="bCopy">' + icon('i-copy', 15) + 'Copy</button></div><pre class="prompt" id="bOut"></pre>' +
    '<div class="row wrap openers"><span class="small faint">Open:</span>' + MF.App.openers() + '</div></section>' +
    '<div class="row wrap"><button class="btn dark" id="bSave">' + icon('i-manifest', 18) + 'Save to my Manifest</button><button class="btn ghost" id="bClear">Clear</button></div>';
  page(shell, 'Prompt builder', h);
  function out() {
    var t = [];
    if (p.S.trim()) t.push('Situation: ' + p.S.trim());
    if (p.C.trim()) t.push('Complication: ' + p.C.trim());
    if (p.R.trim()) t.push('Resolution: ' + p.R.trim());
    if (p.K.trim()) t.push('Constraint: ' + p.K.trim());
    return t.join('\n');
  }
  function update() {
    P.notes.builder = p; MF.App.saveP();
    var s = strength(p);
    $('#bScore').textContent = s.score + ' / 5';
    $('#bBar').style.width = (s.score * 20) + '%';
    $('#bBar').className = s.score >= 4 ? 'good' : s.score >= 2 ? 'mid' : '';
    $('#bTips').innerHTML = s.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') || '<li>All five habits are there.</li>';
    $('#bOut').textContent = out() || 'Your prompt appears here.';
  }
  update();
  var pg = $('#page');
  pg.addEventListener('input', function (e) { var k = e.target.getAttribute('data-b'); if (k) { p[k] = e.target.value; update(); } });
  pg.addEventListener('click', function (e) {
    var b = e.target.closest('button,a'); if (!b) return;
    var k = b.getAttribute('data-add');
    if (k) { p[k] = (p[k] ? p[k].trim() + ' ' : '') + b.getAttribute('data-text'); pg.querySelector('[data-b="' + k + '"]').value = p[k]; update(); }
    if (b.id === 'bCopy' || b.hasAttribute('data-open')) MF.copy(out(), 'Prompt copied');
    if (b.id === 'bSave') { if (!out()) return; P.saved.push({ id: MF.uid(8), lab: 'builder-' + MF.uid(4), title: 'My prompt (builder)', arch: '', text: out(), at: Date.now() }); MF.App.saveP(); MF.toast('Saved to your Manifest'); }
    if (b.id === 'bClear') { p = { S: '', C: '', R: '', K: '' }; P.notes.builder = p; MF.App.saveP(); builder(shell); }
  });
}

/* ───────── Prompt library ───────── */
var ONLY = 'Use only what I have given you. If something is missing, write MISSING.';
MF.LIBRARY = [
  { a: 'READ', m: 'Email', t: 'Shipment facts from a forwarder email', p: 'Situation: I track inbound shipments.\nComplication: Below is an email from our forwarder.\nResolution: A table: PO, vessel/voyage, ETD, ETA, container no., temperature, free time, documents pending, actions for us.\nConstraint: ' + ONLY + ' Dates are DD/MM.\n\n[PASTE EMAIL]' },
  { a: 'READ', m: 'Contracts', t: 'Contract to a table of obligations', p: 'Situation: I manage a carrier contract.\nComplication: The contract text is below.\nResolution: A table of every fee, limit, deadline and notice period: item, value, clause number (quoted).\nConstraint: ' + ONLY + ' If a clause is unclear, say so.\n\n[PASTE CONTRACT]' },
  { a: 'READ', m: 'Procurement', t: 'Quote extraction with footnotes', p: 'Extract from each quote below: unit price, currency, Incoterm and named place, material/spec, lead time, payment terms, MOQ, validity, warranty and every footnote word for word. One column per supplier.\nConstraint: Do not compare or recommend. ' + ONLY + '\n\n[PASTE QUOTES]' },
  { a: 'READ', m: 'Documents', t: 'Answer only from documents', p: 'Answer only from the documents below. For each answer give the document, version and clause number, quoted word for word. If it is not there, reply NOT FOUND. If documents disagree, say which is current.\n\n[PASTE DOCUMENTS]\n\nQuestion: [QUESTION]' },
  { a: 'DRAFT', m: 'Email', t: 'Delay email to a customer', p: 'Situation: I am a customer service coordinator at a distributor.\nComplication: [WHAT HAPPENED, PO, OLD AND NEW TIME]\nResolution: An email under 120 words: one apology, the new time, a contact.\nConstraint: ' + ONLY + ' Do not offer any discount or credit.' },
  { a: 'DRAFT', m: 'Suppliers', t: 'Firm, polite supplier chaser', p: 'Situation: I buy from this supplier and want to keep the relationship.\nComplication: [WHAT IS LATE OR WRONG] Our contract clause: [PASTE CLAUSE]\nResolution: A firm, polite email under 150 words and a 2-line LINE message in Thai.\nConstraint: Quote only the clause given. No penalty or amount not in it. ' + ONLY },
  { a: 'DRAFT', m: 'Procurement', t: 'RFQ on one basis', p: 'Draft an RFQ for [QUANTITY] [ITEM]: specification, DAP [OUR SITE] (Incoterms 2020), THB, required certificates, lead time, payment terms, validity, evaluation criteria and deadline [DATE]. Ask suppliers to state material and exclusions in the main table, not footnotes.' },
  { a: 'DRAFT', m: 'Slides', t: 'Monthly ops review outline', p: 'Situation: I present the monthly ops review.\nComplication: KPI table below.\nResolution: 5 slides: a title that states the point, 3 bullets max, one chart idea, 2 lines of notes. Last slide: decisions needed.\nConstraint: Copy numbers exactly; no rounding. ' + ONLY + '\n\n[PASTE TABLE]' },
  { a: 'DRAFT', m: 'Warehouse', t: 'SOP from our real limits', p: 'Write a one-page SOP for [PROCESS] using only these facts: [EQUIPMENT, LIMITS, ROLES, TIMINGS]. Numbered steps, accept/reject rules, records.\nConstraint: No equipment, temperatures or legal references I did not give. Write [TO CONFIRM] where something is missing.' },
  { a: 'DRAFT', m: 'Daily work', t: 'Inbox to plan', p: 'Below are this morning\'s messages. Give me a table: item, decision needed, owner, deadline (write "no deadline given" if none), waiting for. Sort by urgency.\nConstraint: ' + ONLY + '\n\n[PASTE MESSAGES]' },
  { a: 'DRAFT', m: 'Daily work', t: 'Meeting notes to actions', p: 'Turn these meeting notes into: decisions made, actions (owner, due date), open questions. Do not add owners or dates that are not in the notes.\n\n[PASTE NOTES]' },
  { a: 'SCREEN', m: 'Excel', t: 'Clean a log: flag, don\'t delete', p: 'Clean the data below using code. Standardise dates to DD Mon YYYY (2569 = Buddhist Era), names to one spelling, weights to kg. Add a "Possible duplicate" column with reasons. Show row counts and totals before and after.\nConstraint: Delete nothing. ' + ONLY + '\n\n[PASTE DATA]' },
  { a: 'SCREEN', m: 'Inventory', t: 'Flag data problems before math', p: 'List anything in this sales history that looks like a data problem (unit errors, blanks, spikes, zeros from stockouts): SKU, months, reason. Do not fix or calculate anything yet.\n\n[PASTE DATA]' },
  { a: 'SCREEN', m: 'Inventory', t: 'ABC classification with code', p: 'Using code: annual value = annual quantity × unit cost for each SKU; sort high to low; class A = top ~80% of value, B next ~15%, C the rest. Show the table and the cut-off points.\nConstraint: Treat blanks as missing, not zero. ' + ONLY + '\n\n[PASTE DATA]' },
  { a: 'SCREEN', m: 'Transport', t: 'Freight invoice vs rate card', p: 'Using code, recalculate every invoice line against the rate card and contract rules below. Show only lines that differ: billed, expected, difference, reason. Flag duplicates. Total overbilled.\n\n[PASTE RATE CARD, RULES, INVOICE]' },
  { a: 'SCREEN', m: 'Procurement', t: 'Weighted supplier scorecard', p: 'Weighted score for each supplier: [CRITERIA AND WEIGHTS]. Check weights sum to 100 first; stop if not. Show each calculation and rank.\n\n[PASTE SCORES]' },
  { a: 'SCREEN', m: 'Customer service', t: 'Sort exceptions by urgency', p: 'Sort these delivery exceptions into: watch, act today, escalate now. Rules: [YOUR RULES]. Give the reason for each. I will review every "escalate now" myself.\n\n[PASTE EXCEPTIONS]' },
  { a: 'EXPLAIN', m: 'Inventory', t: 'Safety stock and ROP formulas', p: 'Average daily demand [D], daily σ [S], lead time [L] days, service level [X]%. Give the safety stock and reorder point formulas, the z value and why, the result rounded up, and Excel formulas. Keep all units in days; ask if unclear.' },
  { a: 'EXPLAIN', m: 'KPIs', t: 'Why did this KPI move?', p: 'Below is 9 months of KPI data. List 3 possible explanations for the change in [KPI], and for each, the data I would need to check it. Do not state any cause as fact.\n\n[PASTE DATA]' },
  { a: 'EXPLAIN', m: 'Learning', t: 'Explain a term to a new hire', p: 'Explain [TERM, e.g. Incoterms DAP vs FOB] to a new warehouse colleague in 5 short sentences, with one example from a Thai food distributor. Then give 2 questions to check they understood.' },
  { a: 'EXPLAIN', m: 'Checking', t: 'Attack my own output', p: 'Act as a skeptical reviewer. Here is an output I am about to send. List every number, date, name, promise and rule in it, and for each say how I can verify it. Then list what might be missing.\n\n[PASTE OUTPUT]' }
];
function library(shell) {
  var filt = MF.get('mf.libfilt', 'ALL'), q = '';
  function list() {
    var arr = MF.LIBRARY.filter(function (x) { return (filt === 'ALL' || x.a === filt) && (!q || (x.t + ' ' + x.m + ' ' + x.p).toLowerCase().indexOf(q) >= 0); });
    return arr.length ? arr.map(function (x, i) {
      var k = MF.LIBRARY.indexOf(x);
      return '<details class="lib card"><summary><span class="arch arch-' + x.a.toLowerCase() + '">' + x.a + '</span><span><b>' + esc(x.t) + '</b><i class="faint small">' + esc(x.m) + '</i></span></summary>' +
        '<pre class="prompt">' + esc(x.p) + '</pre><div class="row wrap"><button class="btn small primary" data-libcopy="' + k + '">' + icon('i-copy', 15) + 'Copy</button><button class="btn small" data-libsave="' + k + '">' + icon('i-manifest', 15) + 'Save</button></div></details>';
    }).join('') : '<p class="muted">Nothing matches.</p>';
  }
  var h = '<input class="input" id="libq" placeholder="Search: quote, email, OTIF…" autocomplete="off">' +
    '<div class="chips" id="libf" style="margin:10px 0">' + ['ALL', 'READ', 'DRAFT', 'SCREEN', 'EXPLAIN'].map(function (f) { return '<button class="chip" data-f="' + f + '" aria-pressed="' + (filt === f) + '">' + f + '</button>'; }).join('') + '</div><div id="libl">' + list() + '</div>';
  page(shell, 'Prompt library', h);
  var pg = $('#page');
  $('#libq').addEventListener('input', function () { q = this.value.trim().toLowerCase(); $('#libl').innerHTML = list(); });
  pg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.getAttribute('data-f')) { filt = b.getAttribute('data-f'); MF.put('mf.libfilt', filt); MF.$$('#libf .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); $('#libl').innerHTML = list(); }
    var c = b.getAttribute('data-libcopy'); if (c != null) MF.copy(MF.LIBRARY[+c].p, 'Prompt copied');
    var s = b.getAttribute('data-libsave');
    if (s != null) { var x = MF.LIBRARY[+s], P = MF.App.P(); P.saved.push({ id: MF.uid(8), lab: 'lib-' + s, title: x.t, arch: x.a, text: x.p, at: Date.now() }); MF.App.saveP(); MF.toast('Saved to your Manifest'); }
  });
}

/* ───────── Calculators ───────── */
var CALCS = {
  landed: { t: 'Landed cost per unit', f: [['qty', 'Quantity (units)', 2000], ['price', 'Unit price (USD)', 29.5], ['fx', 'Exchange rate (THB per USD)', 33], ['freight', 'Freight total (USD)', 3400], ['ins', 'Insurance total (USD)', 160], ['duty', 'Duty % (on CIF)', 5], ['local', 'Local charges total (THB)', 38000]],
    run: function (v) {
      var cif = (v.qty * v.price + v.freight + v.ins) * v.fx, duty = cif * v.duty / 100, tot = cif + duty + v.local;
      return [['CIF value', thb(cif)], ['Duty', thb(duty)], ['Local charges', thb(v.local)], ['Total landed', thb(tot)], ['Per unit', thb(tot / v.qty), true], ['Trap: duty on FOB instead', thb(v.qty * v.price * v.fx * v.duty / 100)]];
    } },
  rop: { t: 'Safety stock & reorder point', f: [['d', 'Average daily demand', 40], ['s', 'Std dev of DAILY demand', 12], ['lt', 'Lead time (days)', 9], ['z', 'z (90% 1.282 · 95% 1.645 · 98% 2.054 · 99% 2.326)', 1.645]],
    run: function (v) {
      var ss = v.z * v.s * Math.sqrt(v.lt), ssr = Math.ceil(ss - 1e-9);
      return [['Safety stock (exact)', n2(ss)], ['Safety stock (rounded up)', ssr], ['Demand over lead time', n2(v.d * v.lt)], ['Reorder point', n2(v.d * v.lt + ssr), true], ['Trap: monthly σ (×√30) used with days', Math.ceil(v.z * v.s * Math.sqrt(30) * Math.sqrt(v.lt))]];
    } },
  eoq: { t: 'Economic order quantity', f: [['D', 'Annual demand (units)', 12000], ['S', 'Cost per order (THB)', 1500], ['H', 'Holding cost per unit per year (THB)', 100]],
    run: function (v) {
      var q = Math.sqrt(2 * v.D * v.S / v.H);
      return [['EOQ', n2(q), true], ['Orders per year', n2(v.D / q)], ['Ordering cost / year', thb(v.D / q * v.S)], ['Holding cost / year', thb(q / 2 * v.H)]];
    } },
  otif: { t: 'OTIF and fill rate', f: [['n', 'Orders (deliveries)', 38], ['ot', 'On time', 33], ['inf', 'In full', 34], ['both', 'Both on time AND in full', 30]],
    run: function (v) {
      return [['On time %', pct(v.ot / v.n)], ['In full %', pct(v.inf / v.n)], ['OTIF %', pct(v.both / v.n), true], ['Trap: on-time × in-full', pct(v.ot / v.n * v.inf / v.n)]];
    } },
  freight: { t: 'Freight per km and per pallet', f: [['cost', 'Trip cost (THB)', 9000], ['km', 'Kilometres driven (round trip)', 240], ['loaded', 'Loaded kilometres', 120], ['pal', 'Pallets carried', 10]],
    run: function (v) {
      return [['Per km driven', thb(v.cost / v.km)], ['Per loaded km', thb(v.cost / v.loaded)], ['Per pallet', thb(v.cost / v.pal), true]];
    } },
  chg: { t: 'Air chargeable weight', f: [['l', 'Length (cm)', 60], ['w', 'Width (cm)', 40], ['h', 'Height (cm)', 50], ['kg', 'Actual weight (kg)', 14], ['div', 'Divisor (6000 air, 5000 many couriers)', 6000]],
    run: function (v) {
      var vol = v.l * v.w * v.h / v.div;
      return [['Volumetric weight', n2(vol) + ' kg'], ['Actual weight', n2(v.kg) + ' kg'], ['Chargeable weight', n2(Math.max(vol, v.kg)) + ' kg', true]];
    } },
  credit: { t: 'Service credit (full points)', f: [['target', 'Target %', 95], ['actual', 'Actual %', 91.5], ['per', 'Credit % per full point', 1], ['cap', 'Cap %', 5], ['inv', 'Invoice value (THB)', 2400000]],
    run: function (v) {
      var pts = Math.max(0, Math.floor(v.target - v.actual + 1e-9)), c = Math.min(v.cap, pts * v.per);
      return [['Full points below target', pts], ['Credit %', c + '%'], ['Credit (THB)', thb(v.inv * c / 100), true], ['Trap: part points counted', thb(v.inv * Math.min(v.cap, (v.target - v.actual) * v.per) / 100)]];
    } }
};
function thb(x) { return 'THB ' + (Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function n2(x) { return (Math.round(x * 100) / 100).toLocaleString('en-US'); }
function pct(x) { return (Math.round(x * 1000) / 10).toFixed(1) + '%'; }

function calc(shell) {
  var cur = MF.get('mf.calc', 'landed');
  var h = '<p class="muted small">Use these to check numbers an AI gives you. Defaults are today\'s case numbers.</p>' +
    '<div class="chips calcpick">' + Object.keys(CALCS).map(function (k) { return '<button class="chip" data-calc="' + k + '" aria-pressed="' + (k === cur) + '">' + esc(CALCS[k].t) + '</button>'; }).join('') + '</div>' +
    '<section class="card" id="calcBox"></section>' + dateTool();
  page(shell, 'Check the math', h);
  function draw() {
    var c = CALCS[cur];
    $('#calcBox').innerHTML = '<h3>' + esc(c.t) + '</h3><div class="calcform">' + c.f.map(function (f) {
      return '<label class="field"><span>' + esc(f[1]) + '</span><input class="input" inputmode="decimal" data-cf="' + f[0] + '" value="' + f[2] + '"></label>';
    }).join('') + '</div><dl class="calcout" id="calcOut"></dl>';
    compute();
  }
  function compute() {
    var c = CALCS[cur], v = {};
    c.f.forEach(function (f) { var el = $('[data-cf="' + f[0] + '"]'); v[f[0]] = parseFloat(String(el.value).replace(/,/g, '')) || 0; });
    $('#calcOut').innerHTML = c.run(v).map(function (r) { return '<div class="' + (r[2] ? 'key' : (/^Trap/.test(r[0]) ? 'trap' : '')) + '"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
  }
  draw();
  var pg = $('#page');
  pg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-calc]'); if (!b) return;
    cur = b.getAttribute('data-calc'); MF.put('mf.calc', cur);
    MF.$$('.calcpick .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); draw();
  });
  pg.addEventListener('input', function (e) { if (e.target.hasAttribute('data-cf')) compute(); if (e.target.hasAttribute('data-date')) dates(); });
  dates();
}
function dateTool() {
  return '<section class="card"><h3>Dates: Buddhist Era and adding days</h3><div class="calcform">' +
    '<label class="field"><span>Date (DD/MM/YYYY, BE or CE)</span><input class="input" data-date="d" value="14/10/2569"></label>' +
    '<label class="field"><span>Add calendar days</span><input class="input" data-date="n" inputmode="numeric" value="45"></label></div><dl class="calcout" id="dateOut"></dl></section>';
}
function dates() {
  var out = $('#dateOut'); if (!out) return;
  var raw = ($('[data-date="d"]').value || '').trim(), n = parseInt($('[data-date="n"]').value, 10) || 0;
  var m = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!m) { out.innerHTML = '<div><dt>Format</dt><dd>Type DD/MM/YYYY</dd></div>'; return; }
  var y = +m[3], be = y > 2400; if (be) y -= 543;
  var d = new Date(Date.UTC(y, +m[2] - 1, +m[1]));
  if (d.getUTCDate() !== +m[1]) { out.innerHTML = '<div class="trap"><dt>Check</dt><dd>That date does not exist</dd></div>'; return; }
  var e = new Date(d.getTime() + n * 864e5);
  function f(x) { return x.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }); }
  out.innerHTML = '<div><dt>' + (be ? 'Buddhist Era → CE' : 'CE → Buddhist Era') + '</dt><dd>' + f(d) + ' · ' + (d.getUTCFullYear() + 543) + ' BE</dd></div>' +
    '<div class="key"><dt>+ ' + n + ' days</dt><dd>' + f(e) + ' · ' + String(e.getUTCDate()).padStart(2, '0') + '/' + String(e.getUTCMonth() + 1).padStart(2, '0') + '/' + (e.getUTCFullYear() + 543) + ' BE</dd></div>' +
    '<div class="trap"><dt>Trap: read as MM/DD</dt><dd>' + (+m[1] <= 12 ? f(new Date(Date.UTC(y, +m[1] - 1, +m[2]))) : 'not possible') + '</dd></div>';
}

/* ───────── Paste or not ───────── */
var SAFE = [
  ['Public rules (Incoterms 2020, a published tariff page)', 'g'],
  ['Made-up or practice data (today\'s KLD files)', 'g'],
  ['Your own draft text with no names or prices', 'g'],
  ['Delivery file with customer names, addresses or phone numbers', 'a'],
  ['Supplier quote or rate card marked confidential', 'a'],
  ['Internal KPI report', 'a'],
  ['Driver names with GPS traces or incident reports', 'a'],
  ['Thai ID card, passport or driving license numbers', 'r'],
  ['Driver medical certificates or drug-test results', 'r'],
  ['Criminal background checks, fingerprint or face data', 'r'],
  ['Passwords, API keys, bank account details', 'r'],
  ['Company system log-ins "so the agent can do it"', 'r']
];
function safe(shell) {
  var label = { g: ['Green', 'Fine in any tool'], a: ['Amber', 'Company-approved tool only, or mask it first (CUST-17, D-004)'], r: ['Red', 'Never, in any AI tool, without legal sign-off'] };
  var h = '<div class="lights">' + ['g', 'a', 'r'].map(function (k) {
    return '<section class="light ' + k + '"><h3><i></i>' + label[k][0] + '</h3><p class="small">' + esc(label[k][1]) + '</p><ul>' + SAFE.filter(function (x) { return x[1] === k; }).map(function (x) { return '<li>' + esc(x[0]) + '</li>'; }).join('') + '</ul></section>';
  }).join('') + '</div>' +
    '<section class="card"><h3>Switch off training on free accounts</h3><ul class="plain">' +
    '<li><b>ChatGPT</b>: Settings → Data controls → "Improve the model for everyone" → off. Or start a temporary chat. A thumbs up or down can still send that chat for training.</li>' +
    '<li><b>Gemini</b>: myactivity.google.com → Gemini Apps → Keep Activity → off.</li>' +
    '<li><b>Claude</b>: Settings → Privacy → "Help improve Claude" → off.</li>' +
    '<li><b>At work</b>: use the company tool. In Microsoft Copilot Chat, look for the <b>green shield</b>. No shield means a personal account.</li></ul>' +
    '<p class="small faint">Settings as of October 2026. Menus move; the principle does not.</p></section>' +
    '<section class="card"><h3>Thailand PDPA in three lines</h3><ul class="plain"><li>Health, criminal record and biometric data are <b>sensitive</b> (Section 26).</li><li>Sending personal data abroad has its own rules (Section 28). Most public AI tools process data outside Thailand.</li><li>A breach must be reported to the PDPC within 72 hours where feasible.</li></ul><p class="small faint">Not legal advice. Ask your DPO or legal team for your company\'s rules.</p></section>';
  page(shell, 'Paste or not?', h);
}

/* ───────── Which tool ───────── */
var CHOOSE = [
  ['Draft an email or a letter', 'Any assistant, names masked', 'Copilot Chat in Outlook (green shield)', 'Check every date, amount and promise'],
  ['Clean or analyze an Excel file', 'ChatGPT data analysis or Claude (both run code)', 'Copilot in Excel (edit or plan mode)', 'Ignore totals typed into the chat. =COPILOT() was retired on 14 Sep 2026'],
  ['Build a slide deck', 'Gamma (free, exports PPTX) or Claude (.pptx)', 'Copilot in PowerPoint, Agent Mode', 'Every number on a slide is yours'],
  ['Ask questions over SOPs and contracts', 'Gemini Notebook (was NotebookLM), up to 50 sources', 'Copilot Chat with the file, or ChatGPT Business projects', 'Open the cited passage before you act'],
  ['Research on the web', 'Perplexity or ChatGPT search', 'Copilot Chat (shows its searches)', 'Citations are often wrong: open them'],
  ['Try an agent', 'ChatGPT Work (free: desktop app, limited)', 'Copilot Agent Mode; Claude paid plans', 'No real company log-ins'],
  ['Thai text and translation', 'Any major assistant; Typhoon for Thai', 'Company tool', 'A Thai speaker checks meaning, not just grammar'],
  ['Notes from a meeting or call', 'Otter.ai Free (about 300 min a month, 30 per recording, per 2026 reviews)', 'Teams or Google Meet recap, if your license includes it', 'Say you are recording. Check names, numbers and owners'],
  ['Read a photo: delivery note, damaged pallet, whiteboard', 'ChatGPT, Gemini or Copilot app: camera, then ask', 'Copilot on a company phone', 'Check every figure against the paper. Blur faces and plates'],
  ['A picture, poster or icon', 'Canva Free or Microsoft Designer (a few free credits a month)', 'Canva for Teams; Copilot in PowerPoint', 'No customer logos or real people'],
  ['A process map or diagram', 'Napkin AI Free (adds a watermark), or ask any assistant for a flowchart', 'Copilot in PowerPoint or Visio', 'Walk every step with the person who does it'],
  ['Learn a topic fast', 'Gemini or ChatGPT: explain it, then quiz me', 'Same, in the company tool', 'Check definitions against an official source'],
  ['Company or customer data', 'None of the free tools', 'Only the tool your company approved', 'If unsure, mask it or ask IT']
];
function choose(shell) {
  var h = '<p class="muted small">Pick by the data you are about to paste. As of October 2026; products change fast.</p>' + CHOOSE.map(function (r) {
    return '<section class="card choose"><h3>' + esc(r[0]) + '</h3><dl><div><dt>Free</dt><dd>' + esc(r[1]) + '</dd></div><div><dt>At work</dt><dd>' + esc(r[2]) + '</dd></div><div class="trap"><dt>Watch out</dt><dd>' + esc(r[3]) + '</dd></div></dl></section>';
  }).join('');
  page(shell, 'Which tool?', h);
}

/* ───────── The checks ───────── */
function checks(shell) {
  var P = MF.App.P();
  var h = '<p class="muted small">Run these before anything an AI helped write leaves your desk. Tick them off; they reset when you tap Reset.</p><section class="card"><ul class="ticks big">' + (MF.CHECKS || []).map(function (c, i) {
    var k = 'chk-all:' + i;
    return '<li><label><input type="checkbox" data-ck="' + k + '"' + (P.notes[k] ? ' checked' : '') + '> <span><b>' + esc(c.t) + '</b> ' + esc(c.d) + '</span></label></li>';
  }).join('') + '</ul><button class="btn small ghost" id="ckReset">Reset</button></section>';
  page(shell, 'The checks', h);
  $('#page').addEventListener('change', function (e) { var k = e.target.getAttribute('data-ck'); if (k) { P.notes[k] = e.target.checked; MF.App.saveP(); } });
  $('#ckReset').addEventListener('click', function () { (MF.CHECKS || []).forEach(function (c, i) { delete P.notes['chk-all:' + i]; }); MF.App.saveP(); checks(shell); });
}

/* ───────── Glossary ───────── */
var GLOSS = [
  ['AI agent', 'An AI that can take actions with tools (email, spreadsheet, a system) in steps towards a goal, not just answer.'],
  ['ABC analysis', 'Sorting SKUs by annual value: A = the few that make up most of the value, C = the many that make up little.'],
  ['CIF', 'Cost, Insurance and Freight: the seller pays freight and insurance to the destination port. Customs value in Thailand is usually based on CIF.'],
  ['Context window', 'How much text the AI can read at once. Paste too much and it silently ignores some.'],
  ['DAP', 'Delivered at Place: the seller delivers to the named place, ready for unloading. Import duty and clearance are the buyer\'s.'],
  ['EOQ', 'Economic order quantity: the order size that balances ordering cost and holding cost. √(2DS/H).'],
  ['EXW', 'Ex Works: you collect from the seller\'s premises and pay everything after that.'],
  ['FOB', 'Free on Board: the seller loads the goods on the ship at the named port. Freight, insurance, duty and local charges are yours. For containers, ICC recommends FCA instead.'],
  ['Hallucination', 'When the AI states something false as if it were fact: an invented code, clause, number or source.'],
  ['Incoterms 2020', 'The ICC rules that say who pays and who carries the risk at each step of a delivery. Always write the term AND the named place.'],
  ['Landed cost', 'Everything it costs to get goods to your door: price + freight + insurance + duty + local charges.'],
  ['LLM', 'Large language model: the engine behind ChatGPT, Gemini, Claude and Copilot. It predicts the next word.'],
  ['OTIF', 'On time, in full: the share of orders that were BOTH on time and complete. Not on-time % × in-full %.'],
  ['Prompt', 'Your instruction to the AI. Think of it as a brief to a new colleague: SCR + Constraint.'],
  ['Reorder point (ROP)', 'The stock level at which you place a new order: demand during lead time + safety stock.'],
  ['Safety stock', 'Extra stock to cover variation in demand during the lead time: z × σ × √lead time.'],
  ['SCR + Constraint', 'Situation, Complication, Resolution, plus the guardrail. Our prompt structure for the day.'],
  ['Token', 'A piece of a word. AI tools count usage and limits in tokens.'],
  ['Temporary chat', 'A chat mode that is not saved to your history or used for training (ChatGPT).']
];
function glossary(shell) {
  var h = '<input class="input" id="gq" placeholder="Search a word" autocomplete="off"><dl class="gloss" id="gl"></dl>';
  page(shell, 'Glossary', h);
  function draw(q) {
    $('#gl').innerHTML = GLOSS.filter(function (g) { return !q || (g[0] + g[1]).toLowerCase().indexOf(q) >= 0; })
      .map(function (g) { return '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>'; }).join('');
  }
  draw(''); $('#gq').addEventListener('input', function () { draw(this.value.trim().toLowerCase()); });
}

MF.Tools = { render: render };
})(window.MF = window.MF || {});
