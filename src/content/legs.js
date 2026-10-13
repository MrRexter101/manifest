/* MANIFEST · the seven legs. Plain English: short sentences, terms defined once.
   Facts carry their source; company figures are labelled as company-reported. */
(function (MF) {
'use strict';
var F = function (name, file, note) { return { name: name, href: 'files/' + file, note: note }; };

MF.CASE = {
  name: 'Koh Larn Distribution Co., Ltd. (KLD)',
  line: 'A fictional food and beverage distributor in Si Racha, Chonburi. You work here today.',
  /* The case that comes full circle: five jobs at 10:00, all cleared by 14:30. */
  monday: {
    from: 'Khun Wichai, Operations Director',
    at: 'Wednesday 14 October, 07:58 · LINE',
    hello: 'Morning team. Five things before Friday, please. Coral Coast is watching us.',
    jobs: [
      { n: 1, t: 'Tell Coral Coast Jomtien their delivery is late', d: 'Tomorrow\'s truck failed its temperature check. One clear email, nothing promised that we cannot keep.', leg: 'leg2', lab: 'lab-brief' },
      { n: 2, t: 'Find our real OTIF for week 41', d: 'Coral Coast says we slipped. The delivery file is a mess. What is the true number?', leg: 'leg4', lab: 'lab-excel' },
      { n: 3, t: 'Buy 2,000 plastic pallets', d: 'Three quotes are in, in three currencies and three Incoterms. Pick the right one.', leg: 'leg5', lab: 'lab-quotes' },
      { n: 4, t: 'Siam Spring Water is three days late', d: 'Right before Coral Coast\'s conference weekend. Write to them, firmly and correctly.', leg: 'leg6', lab: 'lab-supplier' },
      { n: 5, t: 'Five slides for Friday\'s review', d: 'September in numbers, and one honest line on what AI did for us this week.', leg: 'leg7', lab: 'lab-slides' }
    ],
    bye: 'Check everything before it leaves the building. W.'
  },
  facts: [
    ['What KLD does', 'Delivers chilled, frozen and dry food and drinks to about **900 hotels, restaurants and minimarts** in Pattaya, Jomtien, Si Racha and Rayong. About 1,400 products.'],
    ['Warehouse', 'Si Racha DC: ambient 6,000 m², chilled (0–4 °C) 1,200 m², frozen (−18 °C) 600 m².'],
    ['Trucks', '22 own reefer trucks. Overflow goes to **Eastern Reefer Transport (ERT)**.'],
    ['Biggest customer', '**Coral Coast Hotels**: 9 hotels in Pattaya and Jomtien, about 18% of sales.'],
    ['Today', 'Wednesday 14 October 2026 (2569 in the Buddhist Era). OTIF slipped to 91.5% in September. The chilled room is 94% full. Procurement needs 2,000 new plastic pallets.'],
    ['People', 'Khun Wichai (operations director), Khun Ploy (procurement), Khun Arthit (warehouse), Khun Mint (customer service).']
  ],
  files: [F('Case overview (1 page)', 'KLD_Case_Overview.pdf', 'Who is who. Read this first.')]
};

/* The checks. Shown in the toolkit and printed on every Manifest. */
MF.CHECKS = [
  { t: 'Numbers', d: 'Came from a spreadsheet or code, not typed by the chat. Re-check one row by hand.' },
  { t: 'Totals', d: 'Row counts and column totals match the source, before and after.' },
  { t: 'Units', d: 'kg or tonnes, cases or pieces, THB or USD, the exchange rate and its date.' },
  { t: 'Dates', d: 'DD/MM, Buddhist Era or CE, calendar or working days, Thai holidays.' },
  { t: 'Terms', d: 'Incoterm and named place match the contract (Incoterms 2020).' },
  { t: 'Codes and rules', d: 'HS codes, duty rates and regulations checked with an official source or your broker.' },
  { t: 'Names', d: 'Every supplier, PO, clause and person exists in your own system.' },
  { t: 'Sources', d: 'Document answers quote the clause or page. "Not in the document" is allowed.' },
  { t: 'Promises', d: 'No new date, price, credit or penalty that a person did not approve.' },
  { t: 'Data', d: 'No personal or confidential data went into an unapproved tool.' },
  { t: 'Sign-off', d: 'A named person signs off anything that leaves the company.' }
];

MF.LEGS = [
  {
    id: 'leg1', name: 'Engine Room', time: '10:00–10:35', mods: '1',
    tagline: 'Where generative AI came from, and how it really works.',
    intro: 'Generative AI writes by **predicting the next word**. That one fact explains why it is fast, fluent and useful, and why it is sometimes confidently wrong.',
    cards: [
      { t: 'From rules to ChatGPT, in five steps', b: ['**Rules (1950s–1980s).** People wrote every rule by hand: "if the pallet is over 1,000 kg, use the forklift". Reliable, but it only knew what someone typed in.', '**Machine learning (1990s–2000s).** Instead of rules, the computer learns patterns from data. This is how demand forecasts and fraud checks work.', '**Deep learning (2012 on).** Much bigger models that learn from images and sound too. Your phone recognizing a face or your voice.', '**The transformer (2017).** A Google paper, "Attention Is All You Need", showed a model that reads a whole sentence at once and learns which words matter to each other. Every chatbot today is built on it.', '**ChatGPT (November 2022) and after.** A transformer trained on a huge amount of text, then tuned with human feedback to answer like an assistant. Since 2024 these models also read photos, files and voice, and some can take actions.'], ex: 'The "T" in GPT stands for transformer: Generative Pre-trained Transformer.' },
      { t: 'It predicts. It does not look things up.', b: ['A large language model (LLM) learned patterns from a huge amount of text. When you ask something, it writes the most likely next word, again and again.', 'So it sounds right because it was trained to sound right. Sounding right and being right feel the same to the reader.'], ex: 'Ask for the HS code of frozen shrimp and you get a code, fast and fluent. In a 2025 test, the best AI got the full 10-digit tariff code right only 40% of the time (ATLAS benchmark).' },
      { t: 'Two kinds of AI in logistics', b: ['**Prediction AI** works on numbers: demand forecasts, ETAs, route optimization. It lives inside planning and routing systems.', '**Language AI** (ChatGPT, Gemini, Copilot, Claude) works on words: emails, documents, quotes, reports. That is today\'s workshop.'], ex: 'Amazon\'s forecasting model improved regional forecasts by about 20% (company-reported). That is prediction AI, not a chatbot.' },
      { t: 'Where the real results are', b: ['Almost every measured result in logistics is in **email, quotes, orders, appointments and documents**. Almost none is "AI runs the supply chain".'], ex: 'C.H. Robinson\'s AI answers an emailed rate request with a quote in **32 seconds**, and builds an order from an emailed tender in about 90 seconds (company-reported, 2025).' },
      { t: 'Thailand, in two numbers', b: ['Thailand spent about **14.1% of GDP** on logistics in 2023: transport 6.7%, **holding inventory 6.4%** (NESDC data via NSO). We spend almost as much keeping stock as moving it.', 'Laem Chabang, 30 km from this room, handled **10.15 million TEU** in fiscal 2025 (Port Authority of Thailand).'] }
    ],
    labs: [],
    trap: 'Fluent is not correct. The more confident the answer sounds, the more important it is to ask: **where did this number come from?**',
    check: [
      { q: 'An LLM writes its answer by…', o: ['Searching a database of facts', 'Predicting the next likely word', 'Copying from Wikipedia'], a: 1, why: 'Prediction, word by word. That is why it can be fluent and wrong.' },
      { q: 'The "T" in ChatGPT stands for…', o: ['Translator', 'Transformer', 'Terminal'], a: 1, why: 'Generative Pre-trained Transformer: the 2017 design every chatbot is built on.' },
      { q: 'A demand forecast inside your planning system is mostly…', o: ['Language AI', 'Prediction AI', 'A chatbot'], a: 1 }
    ],
    files: [F('Case overview', 'KLD_Case_Overview.pdf', 'The company you work for today')]
  },
  {
    id: 'leg2', name: 'The Brief', time: '10:35–11:05', mods: '3', job: 1,
    tagline: 'Four jobs AI does, and prompts that work the first time.',
    intro: 'A prompt is a **brief**, like the one you would give a new colleague. AI does not ask clarifying questions, so answer them in advance.',
    cards: [
      { t: 'The four jobs: READ, DRAFT, SCREEN, EXPLAIN', b: ['**READ**: pull structure out of a document (low risk: you can check it).', '**DRAFT**: a first version you will edit (low risk).', '**SCREEN**: sort and flag against your rules (medium: a missed flag is invisible).', '**EXPLAIN**: answer questions (highest risk: it answers from nothing if you let it).', 'Start with READ and DRAFT. That is where the time is, and where being wrong costs a minute, not a customer.'] },
      { t: 'SCR + Constraint', b: ['**Situation**: who the AI is and what world it is in.', '**Complication**: what is hard or at stake, and the facts or data.', '**Resolution**: the output you want, in the shape you want (a table, 5 bullets, an email under 120 words).', '**Constraint**: the guardrail. "Use only what I have given you. If something is missing, write MISSING."'], ex: 'S: You are a customer service coordinator at a food distributor in Chonburi.\nC: Tomorrow\'s delivery to Coral Coast – Jomtien will arrive at 14:00, not 10:00, because a truck failed its temperature check. 40 cases, PO 26-0912.\nR: Draft a short, polite email in English, under 120 words, with one apology and the new time.\nConstraint: Use only these facts. Do not offer any discount or credit.' },
      { t: 'The constraint is the part people forget', b: ['Without it, the AI fills gaps silently: a reason, a date, a discount, a currency.', 'Write these thirteen words into every prompt that uses facts: **"Use only what I have given you. If something is missing, write MISSING."**'] },
      { t: 'Say the things a logistics person would assume', b: ['Incoterm **and** named place. Currency **and** the exchange rate. Units (cases or pieces, kg or tonnes). Date format, and whether the year is Buddhist Era (2569) or CE (2026).'], ex: '"All dates are DD/MM. Years like 2569 are Buddhist Era: subtract 543."' },
      { t: 'Iterate like a diagnosis', b: ['First output not good enough? Do not start again. **Change one part** (S, C, R or Constraint), run it again, and see what changed.', 'End prompts that involve facts with: **"List your assumptions at the end."** You will find most errors in that list.'] }
    ],
    labs: ['lab-brief', 'lab-first'],
    trap: 'A vague prompt does not give a vague answer. It gives a **specific, invented** one. "Write an email about the delay" produces a reason and a new time you never gave it.',
    check: [
      { q: 'Which job is the riskiest to hand to AI?', o: ['READ a contract into a table', 'DRAFT a reply', 'EXPLAIN why a KPI moved'], a: 2, why: 'EXPLAIN: it will answer confidently from nothing.' },
      { q: 'Where do the facts go in SCR + Constraint?', o: ['Situation', 'Complication', 'Resolution'], a: 1 },
      { q: 'Which line stops the AI inventing a discount in a delay email?', o: ['"Be professional."', '"Do not offer any discount or credit."', '"Be brief."'], a: 1 }
    ],
    files: []
  },
  {
    id: 'leg3', name: 'The Toolkit', time: '11:05–11:20', mods: '2, 15',
    tagline: 'Ten kinds of task, the free tool for each, and what you may paste.',
    intro: 'There is no single best AI. **Choose the tool by the job and by the data you are about to paste.** The full list is in Toolkit → Which tool?',
    cards: [
      { t: 'Words, numbers, documents', b: ['**Words** (emails, letters, summaries): any assistant. ChatGPT, Gemini, Copilot or Claude.', '**Numbers** (Excel, totals, charts): a tool that **runs code or writes formulas**: ChatGPT data analysis, Claude, or Copilot in Excel at work.', '**Your own documents** (SOPs, contracts): Gemini Notebook (it used to be called NotebookLM). It answers from your files and shows where.'] },
      { t: 'Your phone camera is a scanner', b: ['Take a photo of a delivery note, a damaged pallet, a whiteboard or a printed rate card, and ask the ChatGPT, Gemini or Copilot app to pull out the facts.', 'That is a READ job: check every figure against the paper. Blur faces and number plates first.'] },
      { t: 'Meetings, slides, pictures and diagrams', b: ['**Meeting notes**: Otter.ai has a free plan (about 300 minutes a month, 30 per recording, per 2026 reviews). At work, Teams or Google Meet can write the recap if your license includes it. Tell people you are recording.', '**Slides**: Gamma (free, exports PowerPoint), Canva, or Claude, which can create a .pptx file.', '**Pictures and posters**: Canva Free or Microsoft Designer (a small number of free credits a month).', '**Process maps**: Napkin AI (free tier, adds a watermark), or ask any assistant for a flowchart.'] },
      { t: 'Research, translation, learning', b: ['**Web research**: Perplexity or ChatGPT search. Open every source: in 2025 tests, AI search tools got their citations wrong more often than right.', '**Thai and English**: any major assistant; Typhoon for Thai. A Thai speaker reads it for meaning, not just grammar.', '**Learn something fast**: ask Gemini or ChatGPT to explain a topic, then to quiz you on it.'] },
      { t: 'What you may paste', b: ['**Green**: public or made-up data. **Amber**: business data: use the company-approved tool, or mask names and numbers (CUST-17, D-004). **Red**: ID numbers, health, criminal records, passwords: never.', 'Free personal accounts usually train on your chats. ChatGPT: Settings → Data controls → "Improve the model for everyone" → off. At work, use the company tool; in Copilot Chat look for the **green shield**.', 'Thailand\'s PDPA treats health, criminal and biometric data as sensitive (Section 26). Not legal advice: ask your DPO.'] }
    ],
    labs: [],
    trap: 'Free limits change every few weeks, and a tool that is free today can add a paywall tomorrow. **Never build a weekly process on a free tier** without checking with IT what is approved.',
    check: [
      { q: 'You need correct totals from a 2,000-row file. Which tool?', o: ['Any chatbot, paste and ask', 'One that runs code or writes formulas', 'An image generator'], a: 1 },
      { q: 'Best free choice for answers from 40 pages of SOPs, with the page each answer came from?', o: ['Gemini Notebook', 'An image generator', 'Any chatbot from memory'], a: 0 },
      { q: 'A customer list with phone numbers, into a free personal chatbot?', o: ['Green: fine', 'Amber: approved tool or mask it', 'Red: never'], a: 1, why: 'Business data with personal details: use the approved tool, or mask names and numbers first.' }
    ],
    files: []
  },
  {
    id: 'leg4', name: 'The Numbers', time: '11:20–12:00', mods: '4–6', job: 2,
    tagline: 'Excel, email and your daily work, faster and still right.',
    intro: 'This is where most of your hours go. AI saves real time here, as long as **every number stays yours**.',
    cards: [
      { t: 'Excel: let AI write the formula, let Excel do the math', b: ['Ask for **formulas and steps**, not answers typed into the chat. Use a tool that runs code (ChatGPT data analysis, Claude, Copilot in Excel).', 'Check the row count and the totals **before and after** every clean-up.'], ex: 'Microsoft\'s Agent Mode in Excel scored 57% on a 912-task spreadsheet benchmark; humans scored 71% (2025).' },
      { t: 'Flag, don\'t delete', b: ['"Remove duplicates" deleted two split deliveries of one PO in our demo. Ask instead: **"Flag possible duplicates in a new column. Delete nothing."** Then you decide.'] },
      { t: 'OTIF means both', b: ['On time **and** in full, for the same delivery. Multiplying the on-time rate by the in-full rate is a different number, and most AI tools do exactly that unless you say otherwise.'] },
      { t: 'Email: your name is on it, not the AI\'s', b: ['AI is very good at tone. It is also very good at **promising things nobody agreed**: a date, a credit, a rate.', 'Give it the facts and a rule: "Do not promise any date, price or credit."'], ex: 'UPS drafts replies to some of its ~52,000 daily customer emails with AI. A person confirms every reply before it goes (CIO.com, 2024).' },
      { t: 'Organizing daily work', b: ['Paste a messy list of tasks or a long email thread. Ask for: decisions needed, owners, deadlines, and "what I am waiting for".', 'Good for a Monday plan. Not a place for customer phone numbers.'] }
    ],
    labs: ['lab-excel', 'lab-email'],
    trap: 'The "clean" file loses rows. Before you trust it: **same number of rows? Same total weight and cases?** If not, find out why before you send anything.',
    check: [
      { q: 'Best instruction for numbers in Excel?', o: ['"Calculate the totals"', '"Write the Excel formula; do not calculate yourself"', '"Round everything"'], a: 1 },
      { q: 'On time 92%, in full 94%. OTIF is…', o: ['86.5%', 'Cannot tell without order-level data', '93%'], a: 1, why: 'OTIF counts orders that are both. Multiplying assumes they are independent. They are not.' },
      { q: 'The AI draft promises "a 10% credit for the inconvenience". You…', o: ['Send it, customers like credits', 'Delete it unless a manager approved it', 'Change it to 5%'], a: 1 }
    ],
    files: [F('Deliveries week 41 (raw)', 'KLD_Deliveries_Wk41_RAW.xlsx', '40 rows, messy on purpose'), F('KPIs Jan–Sep 2026', 'KLD_KPI_Jan-Sep2026.xlsx', 'For Friday\'s deck')]
  },
  {
    id: 'leg5', name: 'The Buy', time: '13:00–13:35', mods: '8', job: 3,
    tagline: 'RFQs, quotation comparison and supplier evaluation.',
    intro: 'Procurement is full of documents that look alike and are not. AI is excellent at **lining them up**. You decide what "cheapest" means.',
    cards: [
      { t: 'The cheapest quote is the lowest landed cost', b: ['Landed cost = price + freight + insurance + duty + local charges, in one currency, at an agreed exchange rate, **to the same place**.', 'A FOB Ningbo price, an EXW Bangkok price and a DAP Si Racha price are three different things. Convert all three to "delivered to our door" before you compare.'] },
      { t: 'Extract first, compare second', b: ['Step 1 (READ): "Extract unit price, currency, Incoterm and place, MOQ, lead time, payment terms, validity and **any footnotes**. Write MISSING if absent."', 'Step 2: compare only after you have checked the extraction against the PDFs.'] },
      { t: 'Give it the rates. Never let it remember them.', b: ['Exchange rates, freight and duty change. If you do not give them, the AI uses whatever it remembers, and does not tell you.'], ex: 'Our pre-generated comparison used USD 1 = THB 32.0. Finance agreed 33.00.' },
      { t: 'Scorecards: people set weights, AI applies them', b: ['Ask for the calculation, not just the scores. Check the weights add up to 100%.', 'Change the weights and the winner can change. That is a business decision, not an AI one.'], ex: 'Walmart\'s negotiation bot (Pactum) closed deals with about 68% of suppliers it approached, at about 3% savings. Around three in four suppliers said they preferred it (2023, company and press reports).' }
    ],
    labs: ['lab-quotes', 'lab-scorecard', 'lab-rfq'],
    trap: 'Ranking on headline price across different Incoterms and currencies. And the quiet one: **footnotes**. A summary table drops the small print unless you ask for it.',
    check: [
      { q: 'Quote A is FOB Ningbo, Quote B is DAP Si Racha. To compare them you…', o: ['Compare the unit prices', 'Add freight, insurance, duty and local charges to A', 'Pick the shorter lead time'], a: 1 },
      { q: 'You did not give the AI an exchange rate. It will…', o: ['Ask you for one', 'Use one it remembers, usually without saying', 'Refuse'], a: 1 },
      { q: 'Scorecard weights: price 40, quality 30, delivery 20, service 20. Problem?', o: ['None', 'They add up to 110', 'Service should be 0'], a: 1 }
    ],
    files: [F('Three pallet quotes + broker notes', 'KLD_Pallet_Quotes.pdf', '2,000 pallets, three suppliers')]
  },
  {
    id: 'leg6', name: 'The Paper Trail', time: '13:35–14:05', mods: '11–13', job: 4,
    tagline: 'Supplier letters, contracts, SOPs and records.',
    intro: 'Two jobs: write to suppliers **firmly and correctly**, and get answers from documents **with the clause attached**.',
    cards: [
      { t: 'Firm, polite, and only what the contract says', b: ['Give the AI the clause and the facts. Ask for a firm, polite email and a short LINE message.', 'Rule: "Quote only clauses I have given you. Do not add penalties, dates or amounts."'], ex: 'Our AI draft said "a 5% late-delivery penalty will apply". The contract has no penalty, only expedite freight.' },
      { t: 'Thai and English', b: ['AI can draft both. Translation can **soften or harden** a clause. Have a Thai speaker read the Thai version for meaning, not just grammar.'] },
      { t: 'Answer only from the files', b: ['Load the documents into Gemini Notebook (free), or paste them. Prompt: **"Answer only from these documents. Quote the clause number. If it is not there, reply NOT FOUND."**', 'A good document assistant often says NOT FOUND. Worry when it never does.'], ex: 'Even specialist legal AI tools that answer from documents gave wrong or unsupported answers on 17–33% of test queries (Stanford, 2024).' },
      { t: 'Version control is a safety issue', b: ['Two versions of the same SOP in one folder means the AI may quote the old one. Load only current documents, and ask for the version with every answer.'] },
      { t: 'Read the source, not the summary', b: ['A summary is a READ job with a hidden risk: what it leaves out. Footnotes, exclusions and "subject to" clauses are what summaries drop first.'] }
    ],
    labs: ['lab-supplier', 'lab-docqa'],
    trap: '"Day 9" or "9 days after"? "Full percentage point" or "any part of a point"? The AI will not ask which. **Read the clause yourself before you send a number to anyone.**',
    check: [
      { q: 'The AI answers a contract question with no clause number. You…', o: ['Trust it', 'Ask for the clause, then open it', 'Ask again more politely'], a: 1 },
      { q: 'OTIF 91.5% vs a 95% target, 1% per full point. Service credit?', o: ['3%', '3.5%', '4%'], a: 0 },
      { q: 'Your folder has SOP v2 and v3. Best practice?', o: ['Load both, the AI will choose', 'Load only the current version', 'Load neither'], a: 1 }
    ],
    files: [F('Document pack (4 documents)', 'KLD_Document_Pack.pdf', 'Customer agreement, carrier agreement, two SOP versions'), F('Supplier delay email', 'Siam_Spring_Water_Delay.txt', 'For the supplier letter')]
  },
  {
    id: 'leg7', name: 'Full Circle', time: '14:05–14:30', mods: '7, 14–16', job: 5,
    tagline: 'Friday\'s slides, agents, the checks, and your own task.',
    intro: 'Five jobs, done with AI and checked by you. Now the same method on **your** work, starting with the task you wrote on the card at 10:00.',
    cards: [
      { t: 'Slides: AI builds the slide, the numbers are yours', b: ['Paste the KPI table. Ask for **one message per slide**, a title that states the point, and speaker notes.', 'Then check every number against the table. "Summarize" can quietly turn 91.5% into "about 92%".'], ex: '20,000 UK civil servants using Copilot reported saving about 26 minutes a day, most in drafting and PowerPoint (UK Government trial, 2024, self-reported).' },
      { t: 'What an agent is', b: ['A goal, a set of tools (email, spreadsheet, your TMS), and a loop: plan, act, check, repeat.', 'Real today: email-to-order, rate quotes, dock appointments, missed-pickup chasing, invoice checks. Mostly hype: "the autonomous supply chain".'], ex: 'Gartner (2025) expects over 40% of agentic AI projects to be canceled by the end of 2027.' },
      { t: 'The approval rule', b: ['**The agent proposes. A person approves** anything that spends money, commits a date, or reaches a customer.', 'Design the human checkpoint first, then the automation.'] },
      { t: 'Your own task, the same way', b: ['Which job is it: READ, DRAFT, SCREEN or EXPLAIN? Which tool, given the data? What will you check before it leaves your desk?', 'Write it as: "When this happens, I will do this, and I will check that."'] },
      { t: 'Time it, then time it again', b: ['Pick one weekly task. Time it today. Use AI with a written check step for two weeks. Time it again.', 'That before-and-after is what convinces a manager, not a demo.'], ex: 'McKinsey (2025): 88% of firms use AI somewhere, but only about 39% see any profit impact. The gap is usually no baseline, no owner and no check step.' }
    ],
    labs: ['lab-slides', 'lab-agent'],
    trap: 'Agents act on what they misread: last month\'s rate, the wrong date in an email, a duplicate order. **No real company log-ins in any AI tool**, and a person on every step that commits money or a date.',
    check: [
      { q: 'Which step must a person approve?', o: ['The agent reads a supplier email', 'The agent tells a customer a new delivery date', 'The agent files the email'], a: 1 },
      { q: 'Driver drug-test results into free ChatGPT?', o: ['Fine if anonymous', 'Never: sensitive data', 'Only on weekends'], a: 1 },
      { q: 'Best way to prove AI helped?', o: ['A great demo', 'Time a weekly task before and after, with a check step', 'Ask the vendor'], a: 1 }
    ],
    files: []
  },
  {
    id: 'leg8', bonus: true, name: 'The Flow', time: 'After class', mods: '9–10',
    tagline: 'Take-home practice: inventory, demand, freight and the warehouse.',
    intro: 'Not in today\'s room time. Here AI is a **planner\'s assistant**: it explains, writes formulas, spots odd data and drafts notes. The forecast and the route plan stay in your systems.',
    cards: [
      { t: 'No formula shown, no number used', b: ['Ask the AI to **write the Excel formulas** for average demand, standard deviation, safety stock and reorder point. Then Excel does the math.', 'Safety stock = z × σ(daily demand) × √(lead time in days). Reorder point = daily demand × lead time + safety stock.'], ex: '40 cases/day, σ 12, lead time 9 days, 95% (z = 1.645): SS = 59.2 → 60. ROP = 360 + 60 = 420 cases.' },
      { t: 'Bad data looks like demand', b: ['Units entered as bottles instead of cases. A blank month treated as zero. A promotion spike. A stockout month that shows zero sales because there was nothing to sell.', 'Ask first: **"Flag anything that looks like a data problem, with a reason. Do not fix it yet."**'] },
      { t: 'ABC in one prompt', b: ['Annual value = annual quantity × unit cost. Sort high to low. A = the items that make up about 80% of value, B the next 15%, C the rest.', 'The 80/15/5 split is a rule of thumb. Your company may use different cut-offs.'] },
      { t: 'Freight: check the bill, not the route', b: ['AI is good at comparing 20 invoice lines against a rate card and listing the gaps.', 'A chatbot is **not** a route optimizer: no live traffic, truck bans or delivery windows.'], ex: 'Dow uses two Copilot agents to read 100,000+ freight invoices a year and flag billing errors (Microsoft, 2025; savings are Dow\'s projection).' },
      { t: 'SOPs: AI drafts, the floor decides', b: ['Give it your real limits (temperatures, equipment, roles, timings). Otherwise it writes a generic SOP with equipment you do not have and thresholds from somewhere else.', 'Then walk the SOP with the person who does the job.'] }
    ],
    labs: ['lab-stock', 'lab-rop', 'lab-freight', 'lab-sop'],
    trap: 'Mixed time units. Monthly σ used with a lead time in days makes safety stock about **5.5 times too big** (√30). The AI will not warn you.',
    check: [
      { q: 'Coconut water sales jump 24× for three months. First question?', o: ['Is it real demand?', 'Were those months entered in bottles, not cases?', 'Should we order 24× more?'], a: 1 },
      { q: 'A blank month in the sales history should be treated as…', o: ['Zero', 'Missing: average the other months', 'The highest month'], a: 1 },
      { q: 'Best use of chat AI for transport?', o: ['Plan tonight\'s routes', 'Check invoice lines against the rate card', 'Set fuel prices'], a: 1 }
    ],
    files: [F('Stock review, 15 SKUs', 'KLD_Stock_Review_Oct2026.xlsx', 'With four planted data problems'), F('ERT freight audit, September', 'KLD_Freight_Audit_Sep2026.xlsx', 'Rate card + 20 invoice lines')]
  }
];
})(window.MF = window.MF || {});
