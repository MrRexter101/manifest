/* MANIFEST · live activity bank. Every activity feeds a decision or a
   conversation within ten minutes; none is here for decoration.
   Quiz options map to shapes in order: triangle, diamond, circle, square. */
(function (MF) {
'use strict';
var A = MF.ACTIVITIES = {};

/* ── Leg 1 · opening ── */
A['a-pulse'] = { kind: 'poll', q: 'How often do you use AI tools for work today?', options: ['Never', 'Tried once or twice', 'Every week', 'Every day'] };
A['w-backlog'] = { kind: 'wall', q: 'The backlog: one task from last week you never want to do by hand again', placeholder: 'e.g. Typing PO numbers from forwarder emails into Excel', anon: true };
A['a-next'] = { kind: 'cloud', q: 'Finish the sentence: "Please find attached the ___"', max: 24 };
A['a-confident'] = { kind: 'quiz', secs: 25, q: 'An AI gives you an HS code for frozen shrimp, fluently and with no hesitation. What does that confidence tell you?',
  options: ['It checked the official tariff', 'Nothing about whether the code is right', 'It is at least 90% sure', 'The code is valid in Thailand'], correct: 1,
  why: 'Fluent and correct feel the same. In a 2025 benchmark the best model got the full 10-digit tariff code right only **40%** of the time.' };

A['q-history'] = { kind: 'quiz', secs: 20, q: 'The "T" in ChatGPT stands for Transformer. When was the transformer design published?',
  options: ['1997, by IBM', '2017, by Google researchers', '2022, by OpenAI', '2025, by Microsoft'], correct: 1,
  why: 'The 2017 paper "Attention Is All You Need" (Google). ChatGPT arrived five years later, in November 2022.' };

/* ── Leg 2 · sort the work (archetypes) ── */
var ARCH = ['READ', 'DRAFT', 'SCREEN', 'EXPLAIN'];
A['q-arch-1'] = { kind: 'quiz', secs: 20, q: 'Pull the PO number, ETA and container number out of 30 forwarder emails.', options: ARCH, correct: 0, why: '**READ**: structure out of documents. Low risk: you can check each line against the email.' };
A['q-arch-2'] = { kind: 'quiz', secs: 20, q: 'First version of a reply to a customer whose delivery is 3 days late.', options: ARCH, correct: 1, why: '**DRAFT**: you were going to rewrite it anyway. Check every date and promise in it.' };
A['q-arch-3'] = { kind: 'quiz', secs: 20, q: 'Sort 200 delivery exceptions into watch / act today / escalate.', options: ARCH, correct: 2, why: '**SCREEN**: medium risk. A missed flag is invisible, so a person reviews the escalate pile.' };
A['q-arch-4'] = { kind: 'quiz', secs: 20, q: 'Why did fill rate drop last month when OTIF stayed flat?', options: ARCH, correct: 3, why: '**EXPLAIN**: highest risk. It will answer confidently from nothing. Give it the data and ask for its assumptions.' };
A['q-arch-5'] = { kind: 'quiz', secs: 20, q: 'Turn a 12-page carrier contract into a table of fees, limits and deadlines.', options: ARCH, correct: 0, why: '**READ**. Ask for the clause number on every row so you can check it.' };
A['q-arch-6'] = { kind: 'quiz', secs: 20, q: 'Rank 15 suppliers against our scorecard weights.', options: ARCH, correct: 2, why: '**SCREEN**. You set the weights. The AI applies them and shows the working.' };

/* ── Leg 3 · toolkit ── */
A['q-tool-1'] = { kind: 'quiz', secs: 25, q: 'You need to clean a 2,000-row shipment file and get correct totals. Which kind of tool?',
  options: ['Any chatbot: paste it and ask for the totals', 'A tool that runs code or writes Excel formulas', 'An image generator', 'A web search engine'], correct: 1,
  why: 'Numbers need a tool that **calculates**: ChatGPT data analysis, Claude, Copilot in Excel, Gemini in Sheets. Totals typed back in a chat are guesses.' };
A['q-tool-2'] = { kind: 'quiz', secs: 25, q: 'You want answers from 40 pages of SOPs, with the page each answer came from. Best free choice?',
  options: ['Gemini Notebook (was NotebookLM)', 'Ask ChatGPT from memory', 'An AI image tool', 'A translation app'], correct: 0,
  why: 'Gemini Notebook answers only from the files you load and points to the passage. Open the passage before you act on it.' };
A['q-tool-4'] = { kind: 'quiz', secs: 25, q: 'A driver hands you a crumpled delivery note with a damage remark. Fastest way to get it into your report?',
  options: ['Retype it by hand', 'Photo into the ChatGPT, Gemini or Copilot app, then check every figure', 'Ask the AI what the note probably says', 'Translate it first'], correct: 1,
  why: 'Your phone camera is a scanner: a READ job. Check each figure against the paper, and blur faces and plates first.' };
A['q-tool-5'] = { kind: 'quiz', secs: 25, q: 'You want notes and action owners from a 45-minute supplier call. Best free option?',
  options: ['An AI image tool', 'A meeting note-taker like Otter.ai (tell people you record)', 'Paste nothing and ask for a summary', 'A web search'], correct: 1,
  why: 'Otter.ai has a free plan (limits change; check). At work, Teams or Meet recaps if your license has them. Always say you are recording, and check names and owners.' };
A['q-tool-3'] = { kind: 'quiz', secs: 25, q: 'At work, with a company Microsoft 365 account, what tells you your data is protected in Copilot Chat?',
  options: ['A blue tick', 'The green shield at the top', 'The word "Pro"', 'Nothing: all AI is the same'], correct: 1,
  why: 'The green shield means enterprise data protection: prompts are not used for training. No shield means a personal account. Stop and switch.' };

/* ── Leg 2 · the brief ── */
A['q-missing'] = { kind: 'quiz', secs: 30, q: '"You are a logistics coordinator. Write an email to Coral Coast Hotels about tomorrow\'s delivery." What is missing most?',
  options: ['The Situation', 'The Complication (what went wrong, the facts)', 'A polite tone', 'Emojis'], correct: 1,
  why: 'With no facts, the AI invents them: a reason, a new time, maybe an apology for something that did not happen.' };
A['q-constraint'] = { kind: 'quiz', secs: 30, q: 'Which sentence does most to stop the AI inventing facts?',
  options: ['"Be accurate."', '"Use only what I have given you. If something is missing, write MISSING."', '"Double-check your work."', '"You are a world-class expert."'], correct: 1,
  why: 'Thirteen words, the closest thing to a cure. It gives the AI permission to say it does not know.' };
A['w-prompts'] = { kind: 'wall', q: 'Post your best delay-email prompt. Vote for the one you would steal.', placeholder: 'Paste your SCR + Constraint prompt', anon: false };

/* ── Leg 3 · desk ── */
A['a-otif'] = { kind: 'number', secs: 60, q: 'Week 41, after cleaning: what is OTIF, in %? (one decimal)', unit: '%', correct: 78.9, tolerance: 0.15,
  hint: 'Only deliveries that are **both** on time **and** in full count.',
  why: '30 of 38 deliveries were on time **and** in full = **78.9%**. Multiplying on-time % by in-full % gives 77.7%, a different and wrong answer.' };
A['a-flag'] = { kind: 'quiz', secs: 30, q: 'The AI "removed duplicates" and the file went from 40 rows to 36. Two of the removed rows were split deliveries of one PO. What should you have asked for?',
  options: ['"Remove all duplicates"', '"Flag possible duplicates in a new column. Delete nothing."', '"Sort by date"', '"Make it look nice"'], correct: 1,
  why: '**Flag, don\'t delete.** Check the row count and the totals before and after every clean-up.' };
A['w-desk'] = { kind: 'wall', q: 'Mark the machine: the AI\'s Excel clean-up', cols: ['It caught', 'We caught', 'It made up'], anon: true };

/* ── Round 1 (before lunch) ── */
A['r1-1'] = { kind: 'quiz', secs: 20, q: 'Large language models produce text by…', options: ['Looking up facts in a database', 'Predicting the next likely word', 'Searching the internet every time', 'Copying one source'], correct: 1, why: 'They predict. That is why they write fluently and can be confidently wrong.' };
A['r1-2'] = { kind: 'quiz', secs: 20, q: 'Which archetype carries the highest risk if the AI is wrong?', options: ['READ', 'DRAFT', 'SCREEN', 'EXPLAIN'], correct: 3, why: 'EXPLAIN: it answers from nothing if you let it.' };
A['r1-3'] = { kind: 'quiz', secs: 20, q: 'In SCR + Constraint, where do the facts of the problem go?', options: ['Situation', 'Complication', 'Resolution', 'Constraint'], correct: 1, why: 'Complication: what is hard, what is at stake, the data.' };
A['r1-4'] = { kind: 'quiz', secs: 20, q: 'Your first output is not good enough. Best next move?', options: ['Start a new chat with the same prompt', 'Change one part of the prompt and run again', 'Add "please" and "important!!!"', 'Give up: AI cannot do this'], correct: 1, why: 'Iteration as diagnosis: change one part, see what changed.' };
A['r1-5'] = { kind: 'quiz', secs: 20, q: 'AI wrote your monthly deck. Who is responsible for the numbers on the slides?', options: ['The AI', 'IT', 'You', 'Nobody, it is a draft'], correct: 2, why: 'AI builds the slide. Every number on it is yours.' };
A['r1-6'] = { kind: 'quiz', secs: 20, q: 'Free consumer AI accounts: is your chat used to train the model by default?', options: ['Never', 'Usually yes, unless you switch it off', 'Only on weekends', 'Only for images'], correct: 1, why: 'ChatGPT: Settings → Data controls → "Improve the model for everyone" → off. Or use a temporary chat.' };

/* ── Round 2 (13:00, standing) ── */
A['r2-1'] = { kind: 'quiz', secs: 20, q: 'Which line belongs in the Constraint?', options: ['"You are a planner at a food distributor"', '"Our OTIF dropped to 91.5% in September"', '"Give me a 5-row table"', '"Use only my data. Write MISSING if absent."'], correct: 3 };
A['r2-2'] = { kind: 'quiz', secs: 20, q: 'Cleaning a file with AI. The safest instruction about duplicates?', options: ['Delete them', 'Flag them in a new column', 'Ignore them', 'Average them'], correct: 1 };
A['r2-3'] = { kind: 'quiz', secs: 20, q: 'On time 92%, in full 94%. OTIF is…', options: ['86.5%', '93%', 'Cannot tell without the order list', '94%'], correct: 2, why: 'OTIF counts orders that are both. You need the order-level data.' };
A['r2-4'] = { kind: 'quiz', secs: 20, q: 'Which task should a free chatbot NOT do from memory?', options: ['Suggest a subject line', 'Give the duty rate for an HS code', 'Make an email more polite', 'Summarize text you pasted'], correct: 1, why: 'Rates, codes and rules change. Check them with an official source or your broker.' };
A['r2-5'] = { kind: 'quiz', secs: 20, q: 'Your file has dates like 10/9/2026 and 14/10/2569. What do you tell the AI?', options: ['Nothing, it will work it out', 'The date format and that 2569 is Buddhist Era', 'Delete the dates', 'Use American format'], correct: 1, why: 'AI does not ask clarifying questions. Answer them in advance.' };

/* ── Leg 4 · procurement ── */
A['a-bet'] = { kind: 'poll', q: 'Silent bet: which supplier is cheapest for 2,000 pallets?', options: ['A · Rayong Polymer Works', 'B · Ningbo Everlift', 'C · Siam Pallet Trading', 'Cannot tell yet'] };
A['w-quotes'] = { kind: 'wall', q: 'Mark the machine: the AI\'s quote comparison', cols: ['It caught', 'We caught', 'It made up'], anon: true };
A['a-landed'] = { kind: 'number', secs: 90, q: 'Landed cost per pallet for Supplier B, in THB (excluding VAT)?', unit: 'THB', correct: 1102.85, tolerance: 1,
  hint: 'CIF in USD × 33, plus 5% duty on CIF, plus local charges, divided by 2,000.',
  why: 'CIF USD 62,560 × 33 = 2,064,480. Duty 5% = 103,224. Local 4 × 9,500 = 38,000. Total 2,205,704 ÷ 2,000 = **THB 1,102.85**.' };
A['a-rank'] = { kind: 'rank', secs: 60, q: 'Rank the three quotes by landed cost, cheapest first.', items: ['A · Rayong (DAP Si Racha)', 'B · Ningbo (FOB Ningbo)', 'C · Siam Pallet (EXW Lat Krabang)'], correct: [2, 1, 0],
  why: 'C 1,001.80 · B 1,102.85 · A 1,180.00. The smallest number on the PDF was not the cheapest.' };
A['q-weights'] = { kind: 'quiz', secs: 30, q: 'The AI scored suppliers with weights price 40, quality 30, delivery 20, service 20. What is wrong?',
  options: ['Nothing', 'The weights add up to 110%', 'Quality should be first', 'Service is not a criterion'], correct: 1, why: 'Check the weights sum to 100 before you read a single score. People set weights; AI applies them.' };

/* ── Leg 5 · inventory ── */
A['a-coconut'] = { kind: 'quiz', secs: 30, q: 'Coconut water sales jump about 24× in June, July and August, then fall back. Most likely?',
  options: ['A viral TikTok', 'Those months were entered in bottles, not cases (24 per case)', 'A data center fire', 'Real demand: summer'], correct: 1,
  why: 'Unit-of-measure errors look like demand. Ask the AI to **flag** anomalies with a reason before it calculates anything.' };
A['a-blank'] = { kind: 'quiz', secs: 30, q: 'Jasmine rice has a blank cell for March (system outage). The AI averaged 12 months, counting March as 0. Effect?',
  options: ['None', 'Average demand too low, so reorder point too low', 'Average too high', 'Lead time changes'], correct: 1,
  why: 'Blank is not zero. Tell the AI: "Treat blanks as missing, not zero. Say which months you excluded."' };
A['a-rop'] = { kind: 'number', secs: 90, q: 'KLD-1001 drinking water: 40 cases/day average, daily σ 12, lead time 9 days, 95% service (z = 1.645). Reorder point, in cases?', unit: 'cases', correct: 420, tolerance: 1,
  hint: 'Safety stock = z × σ × √lead time (round up). ROP = daily demand × lead time + safety stock.',
  why: 'SS = 1.645 × 12 × √9 = 59.2 → **60**. ROP = 40 × 9 + 60 = **420**. Using the monthly σ (≈66) with a daily lead time gives SS ≈ 326: the most common AI mistake.' };

/* ── Leg 5 · transport & warehouse ── */
A['q-route'] = { kind: 'quiz', secs: 30, q: 'Should a chatbot plan tonight\'s 14 delivery routes around Pattaya?',
  options: ['Yes, it knows the roads', 'No: it has no live traffic, truck bans or time windows. Use it to draft, check or explain', 'Yes, if you say please', 'Only for Jomtien'], correct: 1,
  why: 'Chat AI is not a route optimizer. Use routing software for the plan; use AI to explain exceptions and draft driver notes.' };
A['a-overbill'] = { kind: 'number', secs: 120, q: 'ERT\'s September invoice: how much were we overbilled, in THB?', unit: 'THB', correct: 6899, tolerance: 1,
  hint: 'Four errors: wrong zone, wrong fuel %, waiting time inside the free 2 hours, a trip billed twice.',
  why: 'Billed 89,563, correct 82,664: **THB 6,899** over. Line 18 duplicates line 17 (5,450). Line 7 Z3 rate on a Z2 trip (927). Line 14 waiting charged inside the free 2 hours (300). Line 11 fuel at 6% not 3% (222).' };
A['w-sop'] = { kind: 'wall', q: 'Red-flag hunt: errors in the AI-drafted SOP', cols: ['Error', 'Not sure'], anon: false };

/* ── Leg 6 · supplier & documents ── */
A['a-tone'] = { kind: 'scale', q: 'Siam Spring Water is 3 days late before a busy weekend. How firm should our first email be?', min: 1, max: 5, labels: ['Gentle', 'Formal notice'] };
A['q-penalty'] = { kind: 'quiz', secs: 30, q: 'The AI\'s draft says "as per our agreement, a 5% late-delivery penalty will apply". Clause 8 says…',
  options: ['5% penalty', '10% penalty', 'No penalty: the supplier pays any expedite freight we incur', 'Nothing about lateness'], correct: 2,
  why: 'The AI invented a penalty. Send that and you have made a claim your contract does not support.' };
A['a-credit'] = { kind: 'number', secs: 90, q: 'September OTIF was 91.5% on an invoice of THB 2,400,000. Service credit under clause 5.3, in THB?', unit: 'THB', correct: 72000, tolerance: 0,
  hint: '1% for each **full** percentage point below 95%.',
  why: '91.5% is 3 **full** points below 95% (3.5 is not a full point): 3% × 2,400,000 = **THB 72,000**. 3.5% = 84,000 is the trap.' };
A['q-temp'] = { kind: 'quiz', secs: 25, q: 'A chilled pallet arrives at 6.2 °C. The AI quoted SOP-WH-07 and said "accept". What happened?',
  options: ['It is right', 'It read v2 (reject above 8 °C). v3 says reject above 5 °C', 'It confused °F and °C', 'Chilled goods have no limit'], correct: 1,
  why: 'Wrong version. Load only current documents, and ask for the document version with every answer.' };
A['q-notfound'] = { kind: 'quiz', secs: 25, q: 'What does the Coral Coast agreement say about delivering to the wrong hotel?',
  options: ['Clause 4.2: refused delivery', 'Clause 9.1: KLD is liable', 'It is not in the document', 'Clause 5.3: service credit'], correct: 2,
  why: 'A good document assistant often says **NOT FOUND**. Worry when it never does.' };
A['a-reveal'] = { kind: 'poll', q: 'Can KLD use Siam Pallet Trading\'s pallets for Coral Coast deliveries?', options: ['Yes', 'No', 'Not sure'] };
A['a-decide'] = { kind: 'poll', q: 'Clause 7.4 rules out C. Now: Ningbo or Rayong?', options: ['B · Ningbo: THB 1,102.85, deposit, 37 days', 'A · Rayong: THB 1,180, local, net 30', 'Need more information'] };
A['w-decide'] = { kind: 'wall', q: 'One reason for your choice, or the one question you would ask first', anon: true };

/* ── Leg 7 · agents, checks, plan ── */
A['q-agent'] = { kind: 'quiz', secs: 25, q: 'What turns a chatbot into an agent?', options: ['A nicer interface', 'It can take actions with tools, step by step, towards a goal', 'It speaks Thai', 'It is more expensive'], correct: 1,
  why: 'A chatbot gives you a wrong answer. An agent **sends** it. So: the agent proposes, a person approves money, dates and anything a customer sees.' };
A['a-approve'] = { kind: 'poll', q: 'An agent reads supplier emails and updates ETAs in our system. Which step must a person approve?', options: ['Reading the email', 'Updating an ETA', 'Telling the customer a new delivery date', 'Filing the email'] };
A['s-1'] = { kind: 'quiz', secs: 20, q: 'Paste or not? Public Incoterms 2020 rules into free ChatGPT.', options: ['Green: fine', 'Amber: mask or use the company tool', 'Red: never'], correct: 0, why: 'Public information. Fine anywhere.' };
A['s-2'] = { kind: 'quiz', secs: 20, q: 'Paste or not? Week 41 delivery file with consignee names and phone numbers, into free ChatGPT.', options: ['Green: fine', 'Amber: mask or use the company tool', 'Red: never'], correct: 1, why: 'Personal data. Replace names and phones with codes (CUST-17), or use the company-approved tool.' };
A['s-3'] = { kind: 'quiz', secs: 20, q: 'Paste or not? Driver drug-test results, to "summarize trends".', options: ['Green: fine', 'Amber: mask or use the company tool', 'Red: never'], correct: 2, why: 'Health data is sensitive under the PDPA (Section 26). Not into any AI tool without legal sign-off.' };
A['s-4'] = { kind: 'quiz', secs: 20, q: 'Paste or not? A supplier\'s quote marked "Confidential", into your personal Gemini account.', options: ['Green: fine', 'Amber: mask or use the company tool', 'Red: never'], correct: 1, why: 'Confidential business data: only in a company tool with a data agreement, or with names and prices removed.' };
A['s-5'] = { kind: 'quiz', secs: 20, q: 'Paste or not? Your company login password, so the agent can "do it for you".', options: ['Green: fine', 'Amber: mask or use the company tool', 'Red: never'], correct: 2, why: 'Never. No real company log-ins in any AI tool, ever.' };
A['a-confident2'] = { kind: 'poll', q: 'Next week, how ready are you to use AI on one real task?', options: ['Not ready', 'With help', 'Ready', 'Already planned it'] };

/* ── Round 3 (final, podium) ── */
A['r3-1'] = { kind: 'quiz', secs: 20, q: 'The cheapest quote is the one with…', options: ['The smallest number on the PDF', 'The lowest landed cost', 'The longest payment terms', 'The nicest letterhead'], correct: 1 };
A['r3-2'] = { kind: 'quiz', secs: 20, q: 'Best prompt habit for numbers in Excel?', options: ['"Calculate it for me"', '"Write the Excel formula. Do not calculate yourself."', '"Round everything"', '"Guess if unsure"'], correct: 1, why: 'Let AI write the formula. Let Excel do the math.' };
A['r3-3'] = { kind: 'quiz', secs: 20, q: 'Document Q&A answered with no clause number. You…', options: ['Trust it', 'Ask it to quote the clause, then open the clause', 'Ask a different AI', 'Print it'], correct: 1 };
A['r3-4'] = { kind: 'quiz', secs: 20, q: 'An AI email promises the customer a credit nobody approved. Whose problem?', options: ['The AI vendor\'s', 'Yours: your name is on the email', 'IT\'s', 'Nobody\'s'], correct: 1 };
A['r3-5'] = { kind: 'quiz', secs: 20, q: 'We fixed the arithmetic. What did we still miss on Supplier C?', options: ['The exchange rate', 'The footnote: recycled PP, not food-grade', 'The MOQ', 'The warranty'], correct: 1, why: 'We fixed the arithmetic and still bought the wrong pallet. Read the source, not just the summary.' };

MF.GAMES = {
  'g-sort': { title: 'Sort the work', items: ['q-arch-1', 'q-arch-2', 'q-arch-3', 'q-arch-4'] },
  'g-tools': { title: 'Pick the tool', items: ['q-tool-1', 'q-tool-2', 'q-tool-4', 'q-tool-5', 'q-tool-3'] },
  'g-r1': { title: 'Morning check', items: ['r1-1', 'r1-2', 'r1-3', 'r1-4', 'r1-6'] },
  'g-r2': { title: 'Stand up', items: ['r2-1', 'r2-2', 'r2-3'] },
  'g-safe': { title: 'Paste or not?', items: ['s-2', 's-3', 's-5'] },
  'g-r3': { title: 'Final round', items: ['r3-1', 'r3-3', 'r3-4', 'r3-5'] }
};
})(window.MF = window.MF || {});
