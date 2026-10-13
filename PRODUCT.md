# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Participants** (about 15 to 25): logistics, procurement, warehouse, transport and supply-chain staff in Thailand at a one-day public course run with Corporate Training Bangkok (CTB). Mostly on their own phones, a few laptops. English is a working language, not a first language. Mixed AI experience, from never to daily.
- **The trainer (Ayush)**: runs the room from a laptop beside the projector; needs the script, the live controls and the room's state in one place.
- **The room**: everyone reads the projector from the back of a bright hotel meeting room in Pattaya.

## Product Purpose

Manifest is the live companion app for "Generative AI for Logistics & Supply Chain Professionals" (Wednesday 14 October 2026, 10:00 to 16:00). In the room it replaces Kahoot and Padlet: quizzes, polls, word clouds, walls and timers run from the host console to the projector and every phone. Between and after sessions it is the course itself: seven legs covering 16 modules, 15 hands-on labs with copy-ready prompts, a toolkit, and a personal Manifest (saved prompts plus a 7/30/90-day plan) to take home. Success: every participant runs real prompts on real logistics tasks, checks the output, and leaves with a plan they act on in week one.

## Positioning

A logistics course built around one running fictional company (Koh Larn Distribution) and a planted twist that pays off in the afternoon, with the trainer's script, the live games and the self-study material in one tool. Generic quiz tools cannot carry the case, the labs or the plan.

## Operating Context

- Phones join by scanning the projector QR; the host runs host.html locally; the projector shows screen.html.
- Live layer: Supabase (set up by a friend of the trainer); local mode for rehearsal and wifi failure.
- Participants copy prompts into free ChatGPT, Gemini, Copilot or Claude.
- The trainer also presents a slide deck built in Canva.

## Capabilities and Constraints

- Static HTML/CSS/JS, no build step, GitHub Pages. Trainer material (script, answer keys) is never published.
- Phone-first (375 px), projector at 16:9, host at laptop width.
- Free tiers only; nothing confidential is ever entered.

## Brand Commitments

- Name: Manifest. Course title as published by CTB.
- The trainer asked for Apple-grade design (type, spacing, materials, motion) that still reads as a logistics course. Light keynote look for the projector and slides. (Confirmed 12 Oct 2026.)

## Evidence on Hand

- Fictional case files in files/ (quotes, deliveries, KPIs, stock, freight, document pack). No real customers, testimonials or logos.
- Research with sources in research/.

## Product Principles

- The room's attention is the scarce resource: one clear thing to do at any moment.
- Criticise the machine, never the person: scores are table averages, mistakes are the AI's.
- Every number is checkable: show the working, link the source, flag the trap.
- What participants make is theirs and goes home with them.

## Accessibility & Inclusion

Plain English for second-language readers; answer tiles carry shape as well as colour; legible from the back of a bright room; works on older Android phones.
