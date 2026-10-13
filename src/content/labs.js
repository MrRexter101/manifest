/* MANIFEST · hands-on labs. Every prompt follows SCR + Constraint.
   [CAPITALS IN BRACKETS] are blanks the app turns into fill-in fields.
   data.src is fetched from files/ so the text exists in one place only. */
(function (MF) {
'use strict';
var L = MF.LABS = {};
var ONLY = 'Use only what I have given you. If something is missing, write MISSING. Do not guess.';

L['lab-first'] = {
  title: 'Warm-up · read a messy forwarder email', arch: 'READ', time: '8 min', tools: 'ChatGPT or Gemini',
  blurb: 'Pull the facts out of a forwarder\'s email.',
  goal: 'A first real prompt, if you want a warm-up before Job 1 or practice after class. Work in pairs: the person who uses AI least holds the phone.',
  steps: ['Copy the email below.', 'Copy the prompt, open ChatGPT (or Gemini), paste the prompt, then paste the email under it.', 'Check every field against the email. Did it write MISSING for anything? Did it invent anything?'],
  data: { label: 'Forwarder email (fictional)', text:
'From: ops@bluetide-fwd.example\nSubject: RE: RE: KLD booking update - pls see below\n\nHi Khun Ploy,\nSorry for late reply. Your shpt of frozen shrimp (PO KLD-PO-26-1132) is now on MSC ARIANE vsl, voy 642S, ETD Ho Chi Minh 15/10. ETA LCB 19/10 but carrier says maybe +1 day due to berth congestion. Cntr no MSKU 7741203, 40\' reefer set -18C. Docs (B/L draft, cert of origin) to follow tmr. Pls arrange customs broker and trucking from LCB. Free time 5 days at port.\nRgds, Tuan' },
  prompt: 'Situation: I work in logistics at a food distributor in Chonburi, Thailand.\nComplication: Below is a messy email from our freight forwarder. I need the key facts in a clean format for our shipment tracker.\nResolution: Give me a table with these rows: PO number, product, vessel and voyage, port of loading, ETD, port of discharge, ETA, container number, container type and temperature, free time at port, documents still to come, actions for us.\nConstraint: ' + ONLY + ' Dates are DD/MM in 2026. "LCB" means Laem Chabang.\n\nEMAIL:\n[PASTE THE EMAIL HERE]',
  check: ['Every row matches the email word for word', 'ETA shows the possible +1 day, not just 19/10', 'Nothing was added that is not in the email (a time, a cost, a broker name)'],
  stretch: 'Ask: "Draft a 3-line LINE message to our customs broker with only the facts they need." Check it promises nothing.'
};

L['lab-brief'] = {
  title: 'Job 1 · The delay email: SCR + Constraint', arch: 'DRAFT', time: '12 min', tools: 'Any assistant',
  blurb: 'Same facts, three levels. Post your best prompt on the wall.',
  goal: 'Write a delay email the customer will accept, with **nothing invented**. Then post your prompt to the live wall.',
  steps: ['Pick your level: Bronze (fill in), Silver (write your own), Gold (break it, then fix it).', 'Run it. Read the output against the facts below.', 'Not good enough? Change **one** part (S, C, R or Constraint) and run again.', 'Post your best prompt on the wall when the trainer opens it.'],
  data: { label: 'The facts', text:
'Customer: Coral Coast Hotels – Jomtien (receiving: Khun Nida)\nPO: 26-0912 · 40 cases chilled dairy and 12 cases frozen\nPlanned delivery: Thursday 15 Oct 2026, 08:00–10:00\nWhat happened: our truck failed its pre-trip temperature check at 05:30. Goods are safe in our chilled room.\nNew plan: second truck, arrival 13:00–14:00 the same day\nWe may NOT offer: any discount, credit or free goods (manager has not approved)\nTone: polite, short, practical. English.' },
  tiers: {
    bronze: { label: 'Fill in', note: 'The structure is done. Fill the blanks, or paste the facts into the Complication.', prompt:
'Situation: You are a customer service coordinator at Koh Larn Distribution, a food distributor in Chonburi.\nComplication: Tomorrow\'s delivery to [CUSTOMER] will arrive at [NEW TIME] instead of [OLD TIME] because [REASON]. The goods are safe. PO [PO NUMBER].\nResolution: Draft an email to [CONTACT NAME], under 120 words, with one apology, the new time, and a contact for questions.\nConstraint: ' + ONLY + ' Do not offer any discount, credit or free goods.' },
    silver: { label: 'Your own', note: 'Write all four parts yourself from the facts. Then compare with Bronze.', prompt: 'Situation: [WHO THE AI IS]\nComplication: [WHAT HAPPENED, THE FACTS]\nResolution: [WHAT YOU WANT BACK, LENGTH, FORMAT]\nConstraint: [THE RULES]' },
    gold: { label: 'Break, then fix', note: 'First run the weak prompt and find what it invented. Then add the one Constraint that stops it. Post both on the wall.', prompt: 'Write an email to the customer about the delivery delay.' }
  },
  check: ['Arrival time is 13:00–14:00, Thursday 15 Oct', 'No discount, credit or free goods anywhere', 'No reason invented beyond the temperature check', 'Under 120 words'],
  stretch: 'Ask for the same message as a 2-line LINE message in Thai. Ask a Thai-speaking colleague: is the tone right for a hotel receiving team?'
};

L['lab-excel'] = {
  title: 'Job 2 · Clean the week 41 file and find OTIF', arch: 'SCREEN', time: '18 min', tools: 'ChatGPT (data analysis) or Claude',
  blurb: '40 messy rows: mixed dates, five carrier spellings, kg and tonnes.',
  goal: 'Get a clean table and a correct OTIF. **Flag, don\'t delete.** Every number must come from code or a formula.',
  steps: ['Laptop: upload the .xlsx. Phone: copy the CSV text below and paste it.', 'Run the prompt for your level.', 'Check: same number of rows in as out? Which rows did it flag as duplicates, and are they really duplicates?', 'Answer the live OTIF question on your phone.'],
  data: { label: 'Week 41 deliveries (CSV)', src: 'files/KLD_Deliveries_Wk41_RAW.csv' },
  files: [{ name: 'KLD_Deliveries_Wk41_RAW.xlsx', href: 'files/KLD_Deliveries_Wk41_RAW.xlsx', note: 'Same data as a spreadsheet' }],
  tiers: {
    bronze: { label: 'Guided', prompt:
'Situation: I am a logistics analyst. Below is last week\'s delivery log from our system. It is messy.\nComplication: Dates are mixed: most are DD/MM/2569 (Buddhist Era, subtract 543), some are YYYY-MM-DD, and a few look like MM/DD/YYYY. The carrier name is spelled several ways but there are only two carriers: KLD Fleet and Eastern Reefer Transport. Weight is in kg, but a few values under 10 are in tonnes.\nResolution: 1) Give me a cleaned table with dates as DD Mon 2026, one carrier name each, weight in kg. 2) Add a column "Possible duplicate" and explain each flag. 3) Using code, count deliveries on time (Arrived ≤ Window End), in full (Delivered ≥ Ordered), and both. Show row counts before and after.\nConstraint: Delete nothing. ' + ONLY + '\n\nDATA:\n[PASTE THE CSV HERE]' },
    silver: { label: 'Fewer hints', note: 'You write the Complication: what is wrong with this data?', prompt:
'Situation: I am a logistics analyst at a food distributor in Thailand.\nComplication: [WHAT IS MESSY ABOUT THIS FILE]\nResolution: A cleaned table, a duplicate flag column with reasons, and OTIF for the week calculated with code. Show row counts before and after.\nConstraint: Delete nothing. ' + ONLY + '\n\nDATA:\n[PASTE THE CSV HERE]' },
    gold: { label: 'Formulas only', note: 'For Excel users: make the AI write formulas, then do it in Excel yourself.', prompt:
'I have a delivery log in Excel with columns: Delivery No, PO No, Date, Customer, Area, Carrier, Window End, Arrived, Cases Ordered, Cases Delivered, Weight, Temp °C, Notes.\nWrite Excel formulas (Microsoft 365) for: 1) a "Possible duplicate" flag (same Delivery No AND every other field identical; same PO with different Delivery No is a split delivery, not a duplicate); 2) On time (Arrived ≤ Window End); 3) In full (Delivered ≥ Ordered); 4) OTIF count and %. Explain each formula in one line.\nConstraint: Do not calculate any results yourself. Formulas only.' }
  },
  check: ['Rows in = rows out (nothing deleted)', 'Exactly 2 rows flagged as true duplicates; the split deliveries are NOT flagged', 'OTIF counts deliveries that are both on time AND in full. Not on-time % × in-full %', 'The 4 tonne values were converted, not left as 1.15 kg'],
  stretch: 'Ask for a chart of OTIF by area, made with code. Then ask: "Which 3 deliveries above 5 °C should I report to QA?"'
};

L['lab-slides'] = {
  title: 'Job 5 · The Friday update in 5 slides', arch: 'DRAFT', time: '5 min in class', tools: 'ChatGPT, Claude, Gamma or Copilot in PowerPoint',
  blurb: 'From a KPI table to a deck your manager can read in 3 minutes.',
  goal: 'One message per slide. A title that states the point. Every number copied, not rounded.',
  steps: ['Copy the KPI table.', 'Run the prompt. Ask for an outline first, then the slides.', 'Laptop: ask Claude or ChatGPT for a .pptx file, or paste the outline into Gamma (free) or Copilot in PowerPoint.', 'Check every number on every slide against the table.'],
  data: { label: 'KPIs Jan–Sep 2026', src: 'files/KLD_KPI_Jan-Sep2026.txt' },
  files: [{ name: 'KLD_KPI_Jan-Sep2026.xlsx', href: 'files/KLD_KPI_Jan-Sep2026.xlsx', note: 'Same data as a spreadsheet' }],
  prompt: 'Situation: I am the operations manager at Koh Larn Distribution, a food distributor in Chonburi. I present the monthly ops review to our managing director on Friday.\nComplication: September OTIF fell to 91.5% against a 95% target from our biggest customer. The KPI table is below.\nResolution: A 5-slide outline. For each slide: a title that states the point in one sentence, 3 bullets maximum, one suggested chart, and 2 lines of speaker notes. Slide 5 is "Decisions we need".\nConstraint: Use only numbers from the table, copied exactly (no rounding). ' + ONLY + '\n\nKPI TABLE:\n[PASTE THE TABLE HERE]',
  check: ['Every number matches the table exactly (91.5%, not "about 92%")', 'Titles state a point, not a topic ("OTIF fell 3.5 points since May", not "OTIF")', 'No cause invented that is not in the data'],
  stretch: 'Ask: "What question will the MD ask about slide 2 that this data cannot answer?" Add that question to your notes.'
};

L['lab-email'] = {
  title: 'Extra · Inbox to plan, and the weekly update', arch: 'DRAFT', time: '20 min', tools: 'Any assistant (Copilot Chat in Outlook at work)',
  blurb: 'Turn a messy morning into decisions, owners and one clean email.',
  goal: 'Get a plan you would actually use, and an update email with no invented promises.',
  steps: ['Copy the messages below (fictional, names already masked).', 'Run part 1, check it, then run part 2 in the same chat.'],
  data: { label: 'Monday morning messages', text:
'1) LINE from Arthit (warehouse): chilled room at 94%, we need to move slow stock or rent space by Friday.\n2) Email from Coral Coast Jomtien: two late deliveries last week, want a call this week.\n3) Email from ERT (carrier): new fuel surcharge table attached for October.\n4) Teams from Finance: please send September freight accruals by Wed 17:00.\n5) Email from Siam Spring Water: PO 26-1187 delay, new date Sun 18 Oct.\n6) LINE from driver D-014: truck 70-4471 reefer alarm again, needs workshop.\n7) Email from HR: AI workshop feedback form due Thursday.' },
  prompt: 'Situation: I am a logistics supervisor at a food distributor. It is Monday 12 October 2026, 08:30.\nComplication: Below are this morning\'s messages. I have about 6 hours of free time this week.\nResolution: Part 1: a table with columns: item, decision needed, owner (me or who), deadline, and "waiting for". Sort by urgency. Part 2 (after I check part 1): a short update email to my manager, 5 bullets maximum.\nConstraint: ' + ONLY + ' Do not invent deadlines that are not stated; write "no deadline given".\n\nMESSAGES:\n[PASTE THE MESSAGES HERE]',
  check: ['Only the Finance item has a real deadline (Wed 17:00)', 'Nothing promised to Coral Coast or ERT that you did not decide', 'Driver and truck codes stayed as codes'],
  stretch: 'Ask it to draft a 4-line reply to Coral Coast proposing two call times. Who must approve the times?'
};

L['lab-quotes'] = {
  title: 'Job 3 · Three quotes, one pallet: landed cost', arch: 'READ', time: '12 min', tools: 'ChatGPT or Claude (laptop: upload the PDF)',
  blurb: 'Extract, then compare. The smallest number is not the cheapest.',
  goal: 'Find the true landed cost per pallet for each supplier. Then mark the AI: what did it catch, what did you catch, what did it make up?',
  steps: ['Before anything: answer the silent bet on your phone.', 'Step 1 (READ): extract every term from the three quotes, **including footnotes**.', 'Step 2: landed cost for each, using only the broker notes.', 'Check against the hint: B should come out at about THB 1,100 per pallet.', 'Post to the "Mark the machine" wall: one thing in each column.'],
  data: { label: 'Three quotes + broker notes', src: 'files/KLD_Pallet_Quotes.txt' },
  files: [{ name: 'KLD_Pallet_Quotes.pdf', href: 'files/KLD_Pallet_Quotes.pdf', note: 'The original quotes (4 pages)' }],
  tiers: {
    bronze: { label: 'Two steps', prompt:
'Situation: I am a procurement officer at a food distributor in Si Racha, Thailand. We need 2,000 plastic pallets for our chilled warehouse and for deliveries to hotel customers.\nComplication: I have three quotes on different Incoterms and currencies, plus notes from our broker and forwarder (below).\nResolution: Step 1: a table with one column per supplier and rows for: unit price, currency, Incoterm and named place, material, lead time, payment terms, MOQ, validity, warranty, and ANY footnotes or small print, copied word for word. Step 2: the landed cost per pallet in THB, excluding VAT, for each supplier, delivered to our DC in Si Racha. Show every step of the calculation.\nConstraint: Use only the rates in the broker notes (exchange rate, freight, insurance, duty, local charges, trucking). ' + ONLY + '\n\nQUOTES AND NOTES:\n[PASTE HERE]' },
    silver: { label: 'Extraction only', note: 'Do the landed cost yourself on a calculator from the AI\'s table. Faster than you think, and you will trust it.', prompt:
'Situation: I am a procurement officer comparing three supplier quotes for 2,000 plastic pallets.\nComplication: [WHAT MAKES THESE QUOTES HARD TO COMPARE]\nResolution: A table with one column per supplier and a row for every commercial term and every footnote, copied word for word.\nConstraint: Do not compare or recommend. ' + ONLY + '\n\nQUOTES:\n[PASTE HERE]' },
    gold: { label: 'Make it a reusable tool', note: 'Build a prompt you could reuse for any quote comparison next month.', prompt:
'Help me write a reusable prompt template for comparing supplier quotes on different Incoterms. It must: extract all terms and footnotes word for word; refuse to compare until I provide the exchange rate, freight, insurance, duty basis and local charges; compute landed cost per unit to our door with every step shown; and end with a list of assumptions and missing information. Ask me 3 questions first about how my company compares quotes.' }
  },
  check: ['Exchange rate is 33.00, from the broker notes, not one the AI remembered', 'Duty is 5% of CIF (not FOB)', 'C includes trucking from Lat Krabang (8 trips × 4,200)', 'Every footnote on every quote appears in the table'],
  stretch: 'Ask: "What could make Supplier B\'s landed cost go up after we place the order?" Check its list against the payment terms.'
};

L['lab-scorecard'] = {
  title: 'Supplier scorecard: you set the weights', arch: 'SCREEN', time: '10 min', tools: 'Any assistant',
  blurb: 'Same data, two sets of weights, two different winners.',
  goal: 'See that the weights are a business decision. The AI only applies them.',
  steps: ['Run the prompt with the weights below.', 'Change the weights (price 50, quality 20) and run again. Did the winner change?', 'Check the weights add up to 100 every time.'],
  data: { label: 'Scores out of 10 (fictional)', text: 'Criteria: Price, Quality, Delivery, Service\nSupplier A: 9, 6, 7, 8\nSupplier B: 7, 9, 8, 7\nSupplier C: 8, 8, 6, 9' },
  prompt: 'Situation: I evaluate suppliers for a food distributor.\nComplication: I have scores out of 10 for three suppliers (below).\nResolution: Calculate a weighted score for each with these weights: Price [PRICE WEIGHT]%, Quality [QUALITY WEIGHT]%, Delivery [DELIVERY WEIGHT]%, Service [SERVICE WEIGHT]%. Show the calculation for each supplier and rank them.\nConstraint: First check the weights add up to 100%. If they do not, stop and tell me. ' + ONLY + '\n\nSCORES:\n[PASTE HERE]',
  check: ['With 40/30/20/10, B wins with 7.8 (A 7.6, C 7.7)', 'With 50/20/20/10, A wins with 7.9', 'The AI stopped if the weights did not add up to 100'],
  stretch: 'Ask: "Which criterion would you add for a food-grade pallet supplier?" Is its answer something you can actually measure?'
};

L['lab-rfq'] = {
  title: 'Draft an RFQ in 3 minutes', arch: 'DRAFT', time: '5 min', tools: 'Any assistant',
  blurb: 'Fast finishers: write the RFQ that would have avoided today\'s confusion.',
  goal: 'An RFQ that makes suppliers quote on the same basis, so you never have to compare FOB with EXW again.',
  prompt: 'Situation: I am a procurement officer at a food distributor in Si Racha, Chonburi.\nComplication: Last time, suppliers quoted on different Incoterms and currencies, and one hid the material spec in a footnote.\nResolution: Draft an RFQ for [QUANTITY] [ITEM] with: specification, delivery place and the Incoterm we require (DAP our DC, Incoterms 2020), currency (THB), required certificates, lead time, payment terms, quote validity, how quotes will be evaluated, and the deadline [DEADLINE].\nConstraint: Plain English. Ask suppliers to state the material and any exclusions in the main table, not in footnotes. ' + ONLY,
  check: ['It asks for one Incoterm and one currency', 'Material and certificates are required fields', 'The deadline is the one you gave'],
  stretch: 'Ask for a 1-page evaluation sheet that matches the RFQ.'
};

L['lab-stock'] = {
  title: 'Stock review: flag first, then classify', arch: 'SCREEN', time: '20 min', tools: 'ChatGPT (data analysis) or Claude',
  blurb: '15 SKUs, a year of sales, four planted data problems.',
  goal: 'Find the data problems **before** any calculation. Then an ABC class for every SKU, with formulas.',
  steps: ['Laptop: upload the .xlsx. Phone: copy the CSV below.', 'Run step 1 only. How many of the 4 problems did it find?', 'Tell it how to fix each one, then run step 2.', 'Compare your A items with your table.'],
  data: { label: 'Stock review (CSV)', src: 'files/KLD_Stock_Review_Oct2026.csv' },
  files: [{ name: 'KLD_Stock_Review_Oct2026.xlsx', href: 'files/KLD_Stock_Review_Oct2026.xlsx', note: 'Includes the ROP example tab' }],
  prompt: 'Situation: I am an inventory planner at a food distributor in Thailand. Below are 12 months of sales (in cases) for 15 SKUs, with unit cost, stock on hand, on order and lead time.\nComplication: The data comes from our system and may contain errors.\nResolution: Step 1: list anything that looks like a data problem (unit errors, blanks, spikes, zeros), with the SKU, the months and your reason. Do not fix anything yet. Step 2 (only after I reply): annual consumption value per SKU (annual cases × unit cost) and an ABC class (A = about the top 80% of value, B the next 15%, C the rest), calculated with code. Show the table sorted by value.\nConstraint: Treat blank cells as missing, not zero. ' + ONLY + '\n\nDATA:\n[PASTE HERE]',
  check: ['Coconut water Jun–Aug flagged as bottles, not cases (÷ 24)', 'Jasmine rice March treated as missing, not 0', 'Lager December flagged as a promotion spike', 'Frozen shrimp July = 0 flagged as a stockout, not zero demand'],
  stretch: 'Ask: "Which 3 SKUs would you review first this week, and what question would you ask the buyer about each?"'
};

L['lab-rop'] = {
  title: 'Reorder point: formulas, not answers', arch: 'EXPLAIN', time: '10 min', tools: 'Any assistant, then Excel or a calculator',
  blurb: 'Make the AI show the formula, then check it with the calculator in the Toolkit.',
  goal: 'A reorder point you can defend, and the habit "no formula shown, no number used".',
  steps: ['Run the prompt.', 'Check its numbers with **Toolkit → Calculators → Safety stock & ROP**.', 'Then try the trap: give it a monthly σ of 66 and a lead time of 9 days. Does it notice?'],
  prompt: 'Situation: I plan stock for drinking water (KLD-1001, cases of 24) at a food distributor.\nComplication: Average daily demand is [DAILY DEMAND] cases, standard deviation of daily demand is [DAILY SIGMA] cases, supplier lead time is [LEAD TIME DAYS] days, and we want a [SERVICE LEVEL]% service level.\nResolution: Give me the safety stock and reorder point formulas, the z value you used and why, the result rounded up to whole cases, and the Excel formulas I can paste into a sheet.\nConstraint: Keep all time units in days. If any unit is unclear, stop and ask me. ' + ONLY,
  check: ['z for 95% is 1.645', 'With 40 / 12 / 9 days: safety stock 60 cases, ROP 420', 'It kept σ and lead time in the same unit (days)'],
  stretch: 'Ask how the answer changes if lead time varies by ±2 days. (Hint: safety stock rises to about 145.)'
};

L['lab-freight'] = {
  title: 'Audit the freight bill', arch: 'SCREEN', time: '15 min', tools: 'ChatGPT (data analysis) or Claude',
  blurb: '20 invoice lines against the rate card. Four errors are hiding.',
  goal: 'Find every overcharge, with the expected amount next to the billed amount.',
  data: { label: 'Rate card + September invoice', src: 'files/KLD_Freight_Audit_Sep2026.txt' },
  files: [{ name: 'KLD_Freight_Audit_Sep2026.xlsx', href: 'files/KLD_Freight_Audit_Sep2026.xlsx', note: 'Rate card and invoice tabs' }],
  prompt: 'Situation: I check carrier invoices for a food distributor in Chonburi.\nComplication: Below are our carrier\'s rate card, the contract rules for fuel surcharge and waiting time, and their September invoice (20 lines).\nResolution: Using code, recalculate every line: correct trip rate for the zone and truck type, fuel surcharge per the rule, waiting charge per the rule. Give me a table of only the lines that differ, with billed, expected and difference, and a total overbilled amount. Also flag any trip billed twice.\nConstraint: Apply the contract rules exactly as written. ' + ONLY + '\n\nDATA:\n[PASTE HERE]',
  check: ['It found all 4 errors (zone, fuel %, free waiting time, double billing)', 'The fuel surcharge is +3% for September (August diesel 31.50)', 'Waiting under 2 hours is free'],
  stretch: 'Ask it to draft a polite dispute email to ERT listing the lines. Who signs it?'
};

L['lab-sop'] = {
  title: 'Draft an SOP, then hunt its red flags', arch: 'DRAFT', time: '15 min', tools: 'Any assistant',
  blurb: 'Give it your real limits, or it invents them.',
  goal: 'A draft SOP that uses KLD\'s real thresholds and equipment. Then the team red-flag hunt on the pre-generated one.',
  steps: ['Run the prompt with the KLD facts.', 'Compare with the AI-drafted SOP the trainer shows: find the errors. Negative marking: a correct step marked as an error loses a point.'],
  data: { label: 'KLD facts for the SOP', text: 'Site: KLD Si Racha DC, chilled room 0–4 °C\nEquipment: electric pallet jacks, 2 counterbalance forklifts (no reach trucks), calibrated probe thermometers\nRule: probe core temperature of 2 cases per pallet\nAccept ≤ 4.0 °C. 4.1–5.0 °C: accept, quarantine, inform QA. Above 5.0 °C: reject.\nRecord in the receiving log within 15 minutes\nRoles: receiving clerk, shift leader, QA officer' },
  prompt: 'Situation: I am a warehouse manager at a food distributor.\nComplication: We need a one-page SOP for receiving chilled goods. Our facts and limits are below.\nResolution: A numbered SOP: purpose, scope, roles, equipment, steps, accept/quarantine/reject rules, records, and what to do when a delivery is rejected. Plain English for warehouse staff.\nConstraint: Use only our facts. Do not add equipment we do not have, temperatures we did not give, or references to laws or standards. Where something is missing, write [TO CONFIRM].\n\nFACTS:\n[PASTE HERE]',
  check: ['Reject above 5.0 °C (not 8 °C)', 'No reach truck, no invented law or standard number', 'Log within 15 minutes'],
  stretch: 'Ask for a Thai version of steps 1–5 for the receiving clerks. Have a Thai speaker check it.'
};

L['lab-supplier'] = {
  title: 'Job 4 · Siam Spring Water is late: the email and the LINE', arch: 'DRAFT', time: '6 min', tools: 'Any assistant',
  blurb: 'Firm, polite, and only what clause 8 says.',
  goal: 'A reply that protects KLD without claiming anything the contract does not give us.',
  data: { label: 'Their email + our clause 8', src: 'files/Siam_Spring_Water_Delay.txt' },
  tiers: {
    bronze: { label: 'Guided', prompt:
'Situation: I am a procurement officer at Koh Larn Distribution, a food distributor in Chonburi.\nComplication: Our supplier says PO 26-1187 (3,000 cases of drinking water, due Thu 15 Oct) will arrive Sun 18 Oct. We have about 10 days of normal stock, but our biggest hotel customer has a conference 16–18 Oct. Their email and our clause 8 are below.\nResolution: 1) A firm, polite email in English (under 150 words) that confirms the new date in writing, asks for a partial delivery by 15 Oct if possible, and reminds them of clause 8. 2) A 2-line LINE message in Thai with the same request.\nConstraint: Quote clause 8 exactly. Do not mention any penalty, percentage or amount that is not in clause 8. ' + ONLY + '\n\nTHEIR EMAIL AND CLAUSE 8:\n[PASTE HERE]' },
    silver: { label: 'Tone ladder', note: 'Ask for three versions: gentle, firm, formal notice. Which one would you send first, and why?', prompt:
'Using the facts below, write three versions of our reply to the supplier: (1) gentle, (2) firm, (3) formal notice. Under 120 words each. Quote clause 8 exactly in versions 2 and 3.\nConstraint: No penalty, percentage or amount that is not in clause 8. ' + ONLY + '\n\nFACTS:\n[PASTE HERE]' }
  },
  check: ['No "5% penalty" or any amount: clause 8 only covers expedite freight', 'Dates match: due Thu 15 Oct, new date Sun 18 Oct', 'Thai version says the same thing as the English (ask a colleague)'],
  stretch: 'Ask: "What should we do today about stock for the Coral Coast conference?" Is its plan possible with what we know?'
};

L['lab-docqa'] = {
  title: 'Contract detective: answers with the clause', arch: 'READ', time: '7 min', tools: 'Gemini Notebook (free) or ChatGPT',
  blurb: 'Six questions, four documents, one of them out of date.',
  goal: 'Every answer quotes the clause. "NOT FOUND" is a correct answer when it is not there.',
  steps: ['Laptop: open notebook.google (Gemini Notebook), create a notebook, upload the document pack PDF. Phone: copy the text below into ChatGPT.', 'Paste the rules prompt first, then ask the questions one by one.', 'For each answer, open the clause and check it yourself.'],
  data: { label: 'Document pack (text)', src: 'files/KLD_Document_Pack.txt' },
  files: [{ name: 'KLD_Document_Pack.pdf', href: 'files/KLD_Document_Pack.pdf', note: 'For Gemini Notebook' }],
  prompt: 'Situation: I work at Koh Larn Distribution. Below are four documents: our supply agreement with Coral Coast Hotels, our carrier agreement with ERT, and two versions of our chilled receiving SOP.\nComplication: I need exact answers I can act on.\nResolution: Answer my questions one at a time. For each answer give: the answer, the document name and version, and the clause number, quoted word for word.\nConstraint: Answer only from these documents. If the answer is not in them, reply NOT FOUND. If two documents disagree, say so and say which one is current.\n\nDOCUMENTS:\n[PASTE HERE]\n\nQuestion 1: [YOUR QUESTION]',
  check: ['Q: wrong hotel → NOT FOUND', 'Q: 6.2 °C → reject (SOP v3, effective 1 Aug 2026), not v2', 'Q: service credit at 91.5% → 3 full points = 3%, not 3.5%', 'Every answer has a clause number you opened and read'],
  stretch: 'Ask: "Can we use any supplier\'s plastic pallets at Coral Coast sites?" Then open your quotes again.'
};

L['lab-agent'] = {
  title: 'Design an agent for KLD (on paper first)', arch: 'SCREEN', time: '8 min', tools: 'Any assistant',
  blurb: 'Trigger, steps, tools, and where a person approves.',
  goal: 'Design one agent you would actually want, with the human checkpoint drawn in first.',
  steps: ['Fill the blanks: what starts it, what it does, which systems it touches, what a person approves.', 'Ask the AI to attack your design.'],
  prompt: 'Situation: I work in logistics at a food distributor in Thailand. I am designing an AI agent.\nComplication: The agent would start when [TRIGGER, e.g. a supplier emails a delay]. It would [STEPS IT TAKES]. It would use [SYSTEMS OR TOOLS]. A person must approve [WHAT A PERSON APPROVES].\nResolution: Act as a skeptical operations director. List the 5 ways this agent could go wrong in real life (misread email, wrong date, duplicate action, acting on old data, no owner for exceptions), and for each, the check or approval step that prevents it. Then rate the design: build now, pilot with limits, or not yet.\nConstraint: Be specific to logistics. ' + ONLY,
  check: ['A person approves anything that spends money, commits a date or reaches a customer', 'There is an owner for exceptions the agent cannot handle', 'No real passwords or company log-ins anywhere in the design'],
  stretch: 'Ask: "What would we need to measure in the first 2 weeks to know this agent is working?"'
};
})(window.MF = window.MF || {});
