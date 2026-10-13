# Set up the live backend yourself: a step-by-step guide

This gets the app live for up to **60 people on free plans**: Supabase (the database) and GitHub Pages (the website). You do not write any code. You copy one file into Supabase, paste two values into one file, and publish.

Budget **about 75 minutes**: 20 to set up Supabase, 20 to publish, 35 to test with real phones. Do it the evening before, not the morning of.

**What you need:** a laptop, an email address, your phone and one or two other phones for the test.

---

## How it fits together (read once)

- The **website** is plain files (`index.html`, `host.html`, `screen.html` and folders). GitHub Pages hosts them for free. Phones open it from the QR code.
- The **database** is one Supabase project. It holds the room, everyone's answers, wall posts, help-chat messages, progress and certificates. The file [`schema.sql`](schema.sql) creates all of it in one go.
- Phones never sign in. The database's own rules decide what each phone may do (answer once while a question is open, read only its own chat, and so on). You, the host, prove who you are with a **host key** you choose.
- Your private script and answer keys (`trainer/`) are **never** published. You run the host console from your own laptop.

---

## Part A · Supabase (20 minutes)

1. Go to **supabase.com** and sign up (email, or "Continue with GitHub").
2. Click **New project**.
   - Name: `manifest`
   - Database password: click "Generate a password" and **save it in your password manager**. You will not need it today, but you cannot see it again.
   - Region: **Southeast Asia (Singapore)**. It is the closest to Pattaya, so phones respond fastest.
   - Plan: **Free**.
3. Wait about two minutes while it says "Setting up project".
4. In the left menu open **SQL Editor**, then **New query**.
5. On your laptop, open `backend/schema.sql` in any text editor (TextEdit is fine), select all, copy.
6. Paste it into the SQL Editor and press **Run**. You should see **"Success. No rows returned."** If you see a red error, copy the first line of it and send it to me; do not run it again half-fixed.
7. Check live updates are switched on: left menu **Database → Publications → supabase_realtime**. The tables `sessions`, `participants`, `responses` and `posts` should be on. (The SQL does this; you are just checking.)
8. Get your two values: left menu **Project Settings → API Keys**.
   - Copy the **Publishable key**. It starts with `sb_publishable_`. If you only see "Legacy API Keys", copy the **anon** key instead; both work.
   - Copy the **Project URL**. It looks like `https://abcdefgh.supabase.co`. You find it in the **Connect** button at the top of the project, or under Project Settings → Data API.
   - **Never copy the secret key** (`sb_secret_…`) or `service_role` anywhere. It bypasses every rule.

## Part B · Plug the values in (5 minutes)

Open `src/config.js` and fill in the two lines:

```js
MF.SUPABASE_URL = 'https://abcdefgh.supabase.co';
MF.SUPABASE_ANON_KEY = 'sb_publishable_xxxxxxxxxxxxxxxx';
```

The publishable key is meant to be public. The database rules, not the key, keep the data safe.

## Part C · Publish the website on GitHub Pages (20 minutes)

1. Sign up at **github.com** if you do not have an account.
2. Click **+ → New repository**. Name: `manifest`. Visibility: **Public** (free GitHub Pages needs a public repository). Do not tick "Add a README". Click **Create repository**.
3. On your laptop, open the Terminal app and run these lines one at a time. They create a repository for this folder only and send it to GitHub. `.gitignore` keeps `trainer/` and `research/` out.

```bash
cd ~/Downloads/"VS Code"/"claude code"/manifest
```
```bash
git init -b main
```
```bash
git add .
```
```bash
git status
```

   **Stop and look at the list.** It must not contain `trainer/` or `research/`. If it does, do not continue; tell me.

```bash
git commit -m "Manifest workshop app"
```
```bash
git remote add origin https://github.com/YOUR-USERNAME/manifest.git
```
```bash
git push -u origin main
```

   GitHub asks you to sign in the first time; follow the prompt.
4. On github.com, open the repository → **Settings → Pages**. Under "Build and deployment", Source: **GitHub Actions**.
5. Open the **Actions** tab. Wait for the green tick (about one minute). Your site is now at `https://YOUR-USERNAME.github.io/manifest/`.
6. Back in `src/config.js`, set the address the projector's QR code points to:

```js
MF.PUBLIC_URL = 'https://YOUR-USERNAME.github.io/manifest/';
```

   Then publish the change:

```bash
git commit -am "Set public URL" && git push
```

The publishing step ships only `index.html`, `host.html`, `screen.html`, `src/`, `assets/`, `vendor/` and `files/`. It refuses to publish if `trainer/`, `research/` or `backend/` ever end up in the site.

## Part D · Test with real phones (35 minutes)

Do this exactly as you will on the day.

1. **Your laptop runs the host console locally**, so your private script loads. In Terminal:

```bash
cd ~/Downloads/"VS Code"/"claude code"/manifest && python3 -m http.server 8100
```

2. Open **http://localhost:8100/host.html**. Room code `PTY14`. Choose a **host key** (6 or more characters). The first time sets it; after that only that key opens the room. Write it down.
3. Click **Open projector**. A second window shows the join screen with the QR code.
4. Join from 3 phones by scanning the QR: one iPhone, one Android, one on mobile data instead of wifi. Each phone shows the 60-second tour.
5. Run through this list. Every line should work:
   - **Quiz:** Activity bank → "Pick the tool". Every phone switches to the question, answers arrive on the host, the question closes when everyone has answered, points appear.
   - **Wall:** launch "The backlog", post from two phones, vote. Phones refresh walls every 4 seconds.
   - **Too late:** lock a question, then try to answer from a phone that had not answered. It must say "Too late".
   - **I'm stuck:** on a phone, open any task and tap "I'm stuck", then send a message. On the host, the **People** tab shows the person highlighted and the **Help chat** tab shows the message within a few seconds. Reply. The phone shows the reply.
   - **Certificate:** host → **Issue certificates**. On a phone: Manifest → Your certificate → type a name → Create. Tap the "verify" link at the bottom: it must say "Valid certificate". Tap "Add to my LinkedIn profile" and check the form fills in (do not save it).
6. When the test is done: host → **Reset room**. This wipes the test answers, chats, progress and certificates. **Never press Reset after the real class**: it deletes participants' certificates too.

## Part E · On the day

- [ ] Laptop: `python3 -m http.server 8100` in the manifest folder, then http://localhost:8100/host.html, room `PTY14`, your host key.
- [ ] Open projector, drag it to the projector screen, press **F** for full screen.
- [ ] Phone hotspot on your own phone as a backup for the laptop.
- [ ] Keep the host console's **People** tab in a second browser tab: anyone who taps "I'm stuck" shows up there.
- [ ] At the end: **Issue certificates**. Leave them open for 48 hours so people can finish on the bus.

## How 60 people fit on the free plan

| Limit on the free plan | What 60 people use |
|---|---|
| 200 live connections at once | About 62: one per phone, plus host and projector |
| 100 live messages a second | One room change reaches about 62 screens at once. 60 answers in a burst reach 2 screens (host and projector), so about 120 messages over 10 to 20 seconds |
| 2 million live messages a month | About 30,000 for the whole day |
| 500 MB database | Under 5 MB for the day |

Help chat and progress do not use live messages: phones check for replies every few seconds over a normal web request, and the host console checks every 4 seconds. That keeps the live channel for the questions.

These limits come from Supabase's documentation and 2026 pricing guides; Supabase changes them from time to time, so glance at **supabase.com/pricing** before the day. To watch usage during the class: Supabase → your project → **Usage**.

**One catch on the free plan:** a project with no activity for 7 days is **paused**. The app's lessons and toolkit keep working on phones (they are plain files), but live features and the certificate "verify" link stop until you press **Restore** in the Supabase dashboard. Log in once a week for the first month, or upgrade to Pro if CTB wants certificates verifiable for years.

## If something breaks

| What you see | What to do |
|---|---|
| Phones say "Room PTY14 is not open yet" | Open the host console first and enter the room. The first host login creates the room. |
| The host says "That key does not match this room" | You chose a different key before. Use that one. If it is lost, run `delete from session_secrets where code = 'PTY14';` in the SQL Editor, then open the room again with a new key. |
| A phone is stuck on an old question | Pull down to refresh. The app re-reads the room whenever it wakes up. |
| No internet at all | Open `host.html?driver=local` and `screen.html?driver=local` on the laptop. Questions still run on the projector; tables answer by show of hands and you score them with the **+250** buttons. Certificates then wait until you are online. |
| Host laptop crashes | Open `host.html` on any device with the same room code and key. The room carries on where it was. |
| "Too many messages, wait a minute" on a phone | Someone sent 20 messages in 10 minutes. It is the spam guard; they can send again shortly. |

## What the database enforces

| Rule | How |
|---|---|
| One answer per person per question, only while it is open | A unique key on answers, and a rule that checks the room's open question |
| One vote per person per post | A unique key on votes |
| Only the host changes the room, hides posts, reads the help chat and progress, replies, or resets | Every host action checks the host key, stored scrambled (bcrypt) in a table no phone can read |
| A phone reads only its own help chat and progress | Those tables have no public access at all; a phone reaches its own rows only through its random participant ID |
| Certificates only after you issue them | The certificate function checks the room's "certificates open" switch |
| Anyone can check a certificate is real | A public verify function returns the name, course and date for a certificate number, nothing else |
| Spam guard | 20 help messages per person per 10 minutes |

Honest limits: anyone with the room code can read the room's quiz answers and wall posts (first names only). Participants are told not to post personal or confidential data.

## Test the rules without Supabase (optional, 2 minutes)

`test/` runs `schema.sql` in an in-memory Postgres (PGlite) and checks 63 rules as an anonymous phone would:

```bash
cd backend/test && npm install && npm test
```

Expected: `63 passed, 0 failed`. This proves the SQL and the rules. The phone test in Part D proves the live connection.

## Files

- `schema.sql`: run once in the SQL Editor (safe to run again on an empty project).
- `src/live/supabase.js`: the live driver. No changes needed.
- `src/live/local.js`: the no-internet driver for rehearsal (`?driver=local`).
