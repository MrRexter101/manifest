/* MANIFEST · the day. Public: times, titles and what each segment opens.
   The trainer's script and answer keys live in trainer/script.js (never published).
   job = which of KLD's five jobs the segment clears (see MF.CASE.monday). */
(function (MF) {
'use strict';
MF.AGENDA = [
  { id: 's01', block: 'Morning · how AI works, how to brief it, which tool', start: '10:00', end: '10:08', leg: 1, mods: '1', title: 'Five jobs before Friday', sub: 'One question on paper. Then the five jobs KLD needs done, which we clear today.' },
  { id: 's02', start: '10:08', end: '10:15', leg: 1, mods: '1', title: 'Come aboard', sub: 'Scan the code, take the 60-second tour, and tell us where you are with AI.' },
  { id: 's03', start: '10:15', end: '10:35', leg: 1, mods: '1', title: 'How the machine actually works', sub: 'From rules to ChatGPT in five steps. It predicts the next word, and that explains everything.' },
  { id: 's04', start: '10:35', end: '11:05', leg: 2, mods: '3', job: 1, title: 'Job 1 · The brief: prompts that work', sub: 'Read, Draft, Screen, Explain. Then Situation, Complication, Resolution, plus the Constraint.', labs: ['lab-brief'] },
  { id: 's05', start: '11:05', end: '11:20', leg: 3, mods: '2, 15', title: 'The toolkit: right tool, right task', sub: 'Ten kinds of task, the free tool for each, and what you may paste.' },
  { id: 's06', start: '11:20', end: '11:52', leg: 4, mods: '4–6', job: 2, title: 'Job 2 · The real OTIF', sub: 'A messy Excel file. Let AI write the formula, let Excel do the math.', labs: ['lab-excel'] },
  { id: 's07', start: '11:52', end: '12:00', leg: 4, mods: '1–6', title: 'Morning check', sub: 'Five questions, then lunch.' },
  { id: 'lunch', start: '12:00', end: '13:00', kind: 'break', title: 'Lunch', sub: 'Back at 13:00. We start standing up.' },
  { id: 's08', block: 'Afternoon · the five jobs, done with AI', start: '13:00', end: '13:05', leg: 5, mods: '3', title: 'Stand up', sub: 'Three questions on this morning. On your feet.' },
  { id: 's09', start: '13:05', end: '13:35', leg: 5, mods: '8', job: 3, title: 'Job 3 · Three quotes, one pallet', sub: 'Extract, then compare on landed cost. Mark the machine.', labs: ['lab-quotes'] },
  { id: 's10', start: '13:35', end: '13:45', leg: 6, mods: '11', job: 4, title: 'Job 4 · A supplier is late', sub: 'Firm, polite, and only what the contract says.', labs: ['lab-supplier'] },
  { id: 's11', start: '13:45', end: '14:05', leg: 6, mods: '12–13', job: 3, title: 'Ask the documents', sub: 'Answers with the clause attached, and a clause that reopens Job 3.', labs: ['lab-docqa'] },
  { id: 's12', start: '14:05', end: '14:15', leg: 7, mods: '7, 14', job: 5, title: 'Job 5 · The Friday update', sub: 'Five slides from one prompt. Then: what changes when AI can act.', labs: ['lab-slides'] },
  { id: 's13', start: '14:15', end: '14:30', leg: 7, mods: '15–16', title: 'Full circle', sub: 'The five jobs, done and checked. Your own task from 10:00. Final round and your certificate.' }
];
})(window.MF = window.MF || {});
