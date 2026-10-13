# Manifest

The live companion app for **Generative AI for Logistics & Supply Chain Professionals** (Pattaya, Wednesday 14 October 2026, 10:00–12:00 and 13:00–14:30).

One app does three jobs in the room and one after it:

- **Phones** (`index.html`): join with a QR code, a 60-second tour, live quizzes, polls, word clouds and walls, the seven legs of the day, hands-on labs with copy-ready prompts, a **Help** page (FAQ + private chat with the trainer, and "I'm stuck" on every task), a **Manifest** (saved prompts + a 7/30/90-day plan) and, at the end, a **certificate** with the CTB logo, a LinkedIn-ready image and a public verify link.
- **Projector** (`screen.html`): join lobby with QR, the stage with KLD's five jobs ticking off, live questions with a countdown, results, walls, leaderboard, podium and the certificate screen.
- **Host console** (`host.html`): the agenda, the minute-by-minute script, the buttons that launch every activity, plus **People** (everyone's progress, current page, who is stuck) and **Help chat** (private replies), and **Issue certificates**.
- **After the day**: the same phone app works for self-study (Route, Toolkit, Manifest), with no room needed.

No build step. Plain HTML, CSS and JavaScript. The live layer is Supabase, set up by following the step-by-step guide in [`backend/README.md`](backend/README.md), with a no-network local mode for rehearsal.

## Run it locally

```bash
python3 -m http.server 8100
```

- Host: <http://localhost:8100/host.html?driver=local>
- Projector: opens from the host ("Open projector"), or <http://localhost:8100/screen.html?driver=local>
- Phones (rehearsal): <http://localhost:8100/?driver=local> in more tabs of the **same browser**

Local mode shares one room between tabs of one browser on one machine. That is how you rehearse, and the fallback if the venue loses internet.

## On the day

1. Trainer laptop: run the local server above (so `trainer/script.js` loads), open `host.html` (Supabase mode, no `?driver`), enter room `PTY14` and your host key.
2. "Open projector", drag that window to the projector, press **F** for full screen. **T** switches light/dark.
3. Phones scan the QR. It points at `MF.PUBLIC_URL` (the published site).
4. Host keys: **J** join screen · **S** stage · **L** lock · **R** reveal · **B** leaderboard · **N** next question.

## Publish

Push to GitHub; Settings → Pages → Source: **GitHub Actions**. The workflow publishes only `index.html`, `host.html`, `screen.html`, `src/`, `assets/`, `vendor/` and `files/`. `trainer/` and `research/` are gitignored **and** excluded by the workflow.

## Where things are

| Path | What |
|---|---|
| `src/content/agenda.js` | The day's segments (public) |
| `src/content/activities.js` | Every live quiz, poll, cloud, wall, number and ranking; games |
| `src/content/legs.js` | The seven legs (plus take-home practice): idea cards, traps, quick checks, files; the case and its five jobs; the checks |
| `src/content/help.js` | The first-run tour and the participant FAQ |
| `src/content/labs.js` | 15 hands-on labs with SCR + Constraint prompts and tiers |
| `src/app/` | Phone app (`app.js`) and Toolkit (`tools.js`: builder, library, calculators, paste-or-not, tool chooser, checks, glossary) |
| `src/live/` | Live layer: `live.js` (interface + scoring), `local.js`, `supabase.js`, `render.js` |
| `files/` | Practice files for participants (fictional KLD case) |
| `backend/` | `schema.sql`, the step-by-step setup guide, and the rules test |
| `assets/brand/` | CTB logo used on the certificate |
| `trainer/` | **Private.** Script, case bible, answer keys, deck, facilitator pack, AI outputs, generators |
| `research/` | **Private.** The four research reports behind the design |

## Change the content

- Times or titles: `src/content/agenda.js`. Script and answer keys: `trainer/script.js`. Then rebuild the printed pack: `sh trainer/generators/render_pack.sh`.
- A quiz answer: `src/content/activities.js` (`correct` is the option index, from 0).
- Teams: `MF.TEAMS` in `src/config.js`.
- Certificate wording, trainer name and LinkedIn organisation: `MF.CERT` in `src/config.js`.

## Scoring

A correct answer earns 750–1,000 points (speed counts for a quarter, so being right beats being fast). Wrong or no answer: 0. Streaks are shown but not scored. The table board shows the **average** per player, so a small table is not beaten for being small. The host can add +250 to every player at a table for paper activities (red-flag hunt).
