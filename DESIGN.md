---
name: Manifest
description: The live companion app for a one-day logistics and AI course, set in the port of Laem Chabang at first light.
colors:
  steel-body: "#FF6A00"
  steel-lit: "#FF8D45"
  steel-shade: "#D35400"
  brand-text: "#B84A00"
  brand-soft: "#FFF1E6"
  accent: "#0071E3"
  accent-text: "#0066CC"
  accent-soft: "#E8F1FC"
  sky-far: "#7FA6CC"
  sky-air: "#BFD3E6"
  sky-haze: "#E6EEF4"
  sky-near: "#F7EBDD"
  night-far: "#050A14"
  night-air: "#0B1526"
  night-haze: "#15223A"
  night-near: "#2E2620"
  horizon-far: "#B6CADC"
  horizon-mid: "#93ADC6"
  horizon-near: "#7E98B3"
  scene-ink: "#14202F"
  scene-ink-2: "#2B3B52"
  ground-top: "#E8EFF5"
  ground-mid: "#F1F2F1"
  ground-bottom: "#F7EEE3"
  surface: "#FFFFFF"
  surface-2: "#F4F6F8"
  surface-3: "#E9EDF1"
  text: "#1D1D1F"
  text-2: "#3C4250"
  text-3: "#626977"
  line: "#E2E7EC"
  line-strong: "#CBD3DB"
  locked-lit: "#E8ECF1"
  locked-body: "#CCD4DD"
  locked-shade: "#A8B2BE"
  locked-ink: "#3F4654"
  label-stock: "#FFFEFB"
  label-ink: "#1D1D1F"
  label-mute: "#5E6470"
  answer-rust: "#B8442E"
  answer-steel-blue: "#2F5F8A"
  answer-mustard: "#D4A62A"
  answer-reefer: "#2F7A5C"
  positive: "#248A3D"
  positive-fill: "#34C759"
  positive-soft: "#E9F7EE"
  negative: "#D70015"
  negative-fill: "#FF3B30"
  negative-soft: "#FDECEE"
  focus: "#0071E3"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "52px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  display-projector:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(44px, 6.2vw, 132px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  question:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.42
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.011em"
    fontFeature: "\"cv11\", \"ss01\""
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: "-0.005em"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "-0.003em"
  mono:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0"
    fontFeature: "\"tnum\""
rounded:
  box: "4px"
  sm: "10px"
  md: "14px"
  lg: "22px"
  xl: "30px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.steel-body}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-dark:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground-mid}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-soft}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 16px 0 12px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground-mid}"
  pill-brand:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 11px"
    height: "28px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    height: "50px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  sheet-glass:
    rounded: "{rounded.xl}"
    padding: "20px"
  label-stock:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.sm}"
    padding: "16px 18px"
  answer-tile-a:
    backgroundColor: "{colors.answer-rust}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
    height: "120px"
  answer-tile-b:
    backgroundColor: "{colors.answer-steel-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
    height: "120px"
  answer-tile-c:
    backgroundColor: "{colors.answer-mustard}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px"
    height: "120px"
  answer-tile-d:
    backgroundColor: "{colors.answer-reefer}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
    height: "120px"
  route-stop-done:
    backgroundColor: "{colors.steel-body}"
    textColor: "{colors.text}"
    rounded: "{rounded.box}"
    width: "46px"
    height: "30px"
  route-stop-locked:
    backgroundColor: "{colors.locked-body}"
    textColor: "{colors.locked-ink}"
    rounded: "{rounded.box}"
    width: "46px"
    height: "30px"
  tabbar:
    rounded: "32px"
    padding: "6px"
    height: "64px"
---

# Design System: Manifest

## Overview

**Creative North Star: "Port at First Light"**

Manifest lives in one place: the container port at Laem Chabang just after dawn. One low sun sits above-left, so every shadow in the product falls down and to the right, tinted from the sky rather than black. A theme here is a place with a lighting model, not a list of hex codes. Night mode is the same port re-lit: the sun becomes a cool moon, the horizon warms, and the crane lamps on the skyline come on. It is never an inversion.

The interface reads as an Apple-made app (SF Pro, iOS large titles, frosted bars, spring motion, tabular numerals) built from three modelled materials, each with a lit crown, a body and a shaded belly. Frosted glass is the chrome the app owns. Painted container steel in safety orange is anything you tap or earn. Label paper is the participant's own work, and it stays white in both themes because a label is a physical object. The sky scene (far haze down to warm sand, a port horizon of cranes, a ship and container stacks) opens the phone's join, greeting and route screens and sits behind the projector for the room's moments.

Density is calm and phone-first: one clear thing to do per screen, a 640px column, generous 20px card padding. The projector is a light keynote stage read from the back of a bright room. The host console is a macOS-style three-pane workspace on the same ground. The system rejects flat white SaaS, Kahoot candy colours, and the dark neon "AI" look.

**Key Characteristics:**
- One light source, above-left. Every cast shadow offsets down-right and is blurred.
- Three materials with three jobs: glass for chrome, steel for action and reward, paper for what the participant owns.
- Safety orange is the only brand colour; information blue is used sparingly.
- Containers are the recurring unit: route stops, rank stacks, podium blocks, table swatches and answer tiles are all painted boxes with ribs.
- Night is the same place re-lit, never a palette swap.

## Colors

A cool sea-haze atmosphere over warm sand, with one safety-orange paint for everything you act on and four muted port paints for answers.

### Primary
- **Safety Orange Steel** (steel-body, with steel-lit and steel-shade): the container paint. Fills the primary pill button, the live route node, earned rank boxes, done route stops, the XP bar, the projector's first-place marker and podium winner. Always drawn as a lit-to-shade gradient with vertical ribs, never as a flat fill on large areas.
- **Rust Ink** (brand-text): orange-family type on light ground (points, active tab label, low-timer digits). Pure safety orange is never used for text on light.
- **Orange Wash** (brand-soft): the quiet ground for brand pills, the points chip, the "why" explanation box and stuck-participant rows.

### Secondary
- **Information Blue** (accent, accent-text, accent-soft): links, ghost buttons, the top-bar back icon and focus rings. It informs; it never decorates.

### Tertiary
- **Port Paints** (answer-rust, answer-steel-blue, answer-mustard, answer-reefer): the four answer tiles, as seen on stacked container doors. Each pairs with a shape (triangle, diamond, circle, square) and passes AA with its ink (white, except mustard, which takes dark ink).

### Neutral
- **Sky stops** (sky-far, sky-air, sky-haze, sky-near): the scene gradient top to bottom, with a radial sun glow at 12% / 14%. Night counterparts (night-far through night-near) replace them in dark mode.
- **Horizon tones** (horizon-far, horizon-mid, horizon-near): aerial perspective on the skyline; far is paler and bluer.
- **Scene Ink** (scene-ink, scene-ink-2): type set directly on the sky.
- **Ground** (ground-top, ground-mid, ground-bottom): the page background, a fixed gradient from cool at the top to warm sand at the bottom.
- **Surfaces** (surface, surface-2, surface-3): white cards, quiet insets, and button and track fills.
- **Text** (text, text-2, text-3): near-black ink, secondary and tertiary. All three hold contrast on the ground.
- **Lines** (line, line-strong): hairlines and the 0.5px inset rims on cards.
- **Locked Steel** (locked-lit, locked-body, locked-shade, locked-ink): the same container model, desaturated. Locked, not broken.
- **Label Stock** (label-stock, label-ink, label-mute): identical in both themes.
- **Status** (positive, negative and their fills and softs): verdicts, correct ranks, toasts and connection dots.

### Named Rules
**The One Paint Rule.** Safety orange is the only brand colour, and it appears as steel (gradient plus ribs) on what you tap or earn. A second accent hue never takes its job.

**The Same Port Rule.** Dark mode re-lights the scene: night sky stops, a moon in place of the sun, lamps on the cranes, black-based casts. Label stock and answer paints do not change.

**The Shape Plus Colour Rule.** An answer is never identified by colour alone; every tile and result bar carries its shape.

## Typography

**Display Font:** SF Pro Display (with Inter, loaded from Google Fonts, as the fallback off Apple devices)
**Body Font:** SF Pro Text (with Inter)
**Label/Mono Font:** SF Mono (with JetBrains Mono, also loaded)

**Character:** Apple system type at iOS large-title scale: tight negative tracking on everything 19px and up, bold 700 for all headings, and tabular numerals wherever a number can change.

### Hierarchy
- **Display** (700, 52px, 1.0, -0.04em): the join screen's "Manifest." large title. The projector stage and lobby scale it to clamp(44px, 6.2vw, 132px) at 0.98.
- **Headline** (700, 32 to 34px, 1.05, -0.035em): the greeting "Good to see you, Nok.", the route head, the label's name.
- **Question** (700, 26px, 1.18, -0.025em): the live question on the phone. The projector uses clamp(30px, 3.2vw, 72px).
- **Title** (700, 22 to 24px, 1.1, -0.025em): section heads, the rank name, the "now" card.
- **Lead** (400, 19px, 1.42): the one-paragraph intro under a page head.
- **Body** (400, 17px, 1.47, -0.011em): everything else, with Inter's cv11 and ss01 alternates on.
- **Meta** (400, 15px, -0.005em): times, counts, secondary lines.
- **Label** (600, 13px, sentence case): names the content inside a card or panel ("Your prompt", "Room timer", "Tables"). Never uppercase, never placed above a headline as a kicker.
- **Mono** (500 to 600, 12 to 13px, tabular): agenda times, label-stock data, room codes. The room-code input is the one uppercase mono field (24px, 0.2em).

### Named Rules
**The Tabular Rule.** Every changing number (points, XP, timers, counts, ranks) uses tabular numerals, so digits never jitter.

**The Sentence Case Rule.** Type is sentence case throughout. Uppercase appears only as mono data on label stock and in the room code.

## Layout

The phone app is designed at 375px and centres in a 640px column above that. A sticky glass top bar (52px plus safe area) sits above the content, and a floating glass capsule tab bar (64px, 12px from the sides, 10px from the bottom, capped at 560px from 700px up) sits below. Pages open with a sky scene rounded like a widget (30px radius), and the next card overlaps its bottom edge by 20 to 26px, so the sheet appears to rest on the horizon. Cards stack with a 12px gap; card padding is 20px; chips gap 6 to 8px.

The projector is a full-viewport 16:9 stage with 2.6vh / 3.4vw padding, body size clamp(16px, 1.3vw, 30px), and every measure in vw, vh or em so it scales from a laptop to a wall. The QR card stays pinned bottom-right; the five-jobs strip runs along the bottom, clear of it.

The host console is a three-column grid (260px agenda, flexible script, 420px controls) under a 52px glass bar. It narrows to 220 / 370 at 1280px, drops the controls under the script at 1060px, and goes single-column at 720px.

### Named Rules
**The Clear Sky Rule.** On the projector the sky is shown for the room's moments (join, stage, leaderboard, podium, certificates) and fades out over 0.7s when a question or board is up, so the content wins.

## Elevation & Depth

Depth is physical. Surfaces float on cast shadows offset down-right from the sun, tinted from the sky (rgb 31,49,77) in day and pure black at night. Glass adds a bright 1px lip on its top edge where the light catches it. Steel adds an inner highlight on its crown and a 2px dark inner belly. Paper carries a two-frequency grain. Inputs and tracks are pressed in with a small inner shadow. There are no zero-blur offset shadows.

### Shadow Vocabulary
- **Cast 1** (`1px 1px 2px rgba(31,49,77,.06), 1px 3px 8px -2px rgba(31,49,77,.07)`): resting cards, chips, wall posts, the selected host agenda row.
- **Cast 2** (`2px 4px 10px -3px rgba(31,49,77,.10), 8px 18px 38px -14px rgba(31,49,77,.20)`): glass sheets, in-page scenes, label stock, the verdict card.
- **Cast 3** (`4px 10px 24px -6px rgba(31,49,77,.16), 16px 36px 72px -22px rgba(31,49,77,.30)`): the tab bar, toast, projector QR and podium blocks.
- **Steel cast** (`2px 6px 14px -5px rgba(178,72,0,.55)`): the warm shadow under orange steel.
- **Bar cast** (`0 6px 18px -14px rgba(31,49,77,.35)`): under sticky glass bars.

### Named Rules
**The One Sun Rule.** Every cast offsets right and down, never up or left, and every lit edge is on the top or left.

## Shapes

Two families of corners. Interactive controls are pills (999px): buttons, chips, pills, toasts, the tab bar. Containers of content round softly: 10px for small things and label stock, 14px for inputs and insets, 22px for cards and answer tiles, 30px for scenes and glass sheets. Cargo objects (route stops, rank boxes, table swatches, the job strip numbers, podium blocks) are near-square boxes at 2 to 4px with vertical ribs, because they are containers. Label stock is the only bordered surface: a 2.5px near-black rule, plus 2px rules around its stats row.

## Components

### Buttons
Pills that press on pointer-down.
- **Shape:** full pill (999px), 48px tall, 20px side padding, 600 weight at 17px.
- **Primary:** safety-orange steel (lit to shade gradient, faint 6px ribs, white inner crown, steel cast) with near-black ink at 700. One per view.
- **Hover / Focus:** scale to 0.97 on press (160ms ease-out); primary brightens slightly on hover and dims to 0.96 on press. Focus is a 3px blue ring at 70% with a 2px offset.
- **Secondary / Dark / Ghost:** grey surface-3 pill with a lit inner edge; a dark text-colour pill for strong neutral actions; a transparent blue-text ghost that gains a blue wash on hover. Small variant is 36px.

### Chips
- **Style:** white pill, 44px, 1px line-strong border, cast 1, 600 at 15px. Table chips lead with a small painted container swatch (18 by 12px, ribbed, lit on its crown).
- **State:** selected chips turn dark (text fill, ground-colour ink).

### Cards / Containers
- **Corner Style:** 22px.
- **Background:** white surface.
- **Shadow Strategy:** 0.5px inset line-strong rim plus cast 1.
- **Border:** none beyond the rim.
- **Internal Padding:** 20px.
- **Glass sheet:** the "now" card and join form, frosted (66% white, 180% saturate, 22px blur) with the lit top lip and cast 2, 30px radius, overlapping the scene above.

### Inputs / Fields
- **Style:** white, 1px line-strong border, 14px radius, 50px tall, 12px 14px padding, a faint pressed-in inner shadow. Field labels are 15px 600 above.
- **Focus:** border turns focus blue with a 4px blue halo at 18%.
- **Error / Disabled:** disabled buttons drop to 38% opacity.

### Navigation
- **Top bar:** sticky glass, 52px, logo mark in orange, centred 17px 600 title, a points chip in the orange wash.
- **Tab bar:** a floating glass capsule of four tabs (Live, Route, Toolkit, Manifest), 11px 600 labels under icons. Active tab takes rust ink on a 12% orange wash; an orange pip marks news.
- **Host:** the same glass bar; the agenda selects a row by raising it to a white surface with cast 1.

### Answer Tiles
Painted container doors: the port paint with 11px ribs, a lit crown, a shaded sill and a cast tinted from the paint itself. 22px radius, 120px tall on the phone, 700 at 19px with a 24px shape glyph (SVG). Press scales to 0.96. The picked tile gets a double ring (ground, then text); the others fade to 28% and desaturate after answering.

### Route Map
The shipment's path down the Route tab. Each leg is a numbered container stop (46 by 30px, 4px radius): steel once started, locked steel before. Travelled segments are 3px solid orange and draw in leg by leg; the road ahead is 2px dashed line-strong. A completed stop carries a small green check badge. On the join screen the same route is a horizontal SVG with one live orange node that pings.

### Rank Card
A stack of six container boxes, one per rank (Deckhand, Tally Clerk, Shipping Clerk, Planner, Dispatcher, Logistics Lead), earned boxes in steel and the rest locked, settling in one by one. Beside it the rank name (title), XP and distance to the next rank, and a steel XP bar.

### Label Stock
The participant's Manifest and saved prompts: white stock, 2.5px black rule, 10px radius, grain, mono data in label-mute, a barcode, and a ruled four-cell stats row.

### Greeting Home
The Live tab opens with a sky scene holding "Good to see you, <first name>." as the headline, then table swatch, room, points and connection status, with the glass "now" card overlapping it and naming the one next thing.

## Do's and Don'ts

### Do:
- **Do** offset every shadow down-right and light every edge from the top-left (the One Sun Rule).
- **Do** paint anything tappable or earned as orange steel: lit-to-shade gradient, vertical ribs, warm steel cast.
- **Do** show locked progress as the same object desaturated (locked-lit to locked-shade), never greyed-out flat or broken.
- **Do** put the participant's own work on white label stock with a 2.5px black rule, in both themes.
- **Do** pair every answer colour with its shape (triangle, diamond, circle, square).
- **Do** use rust ink (brand-text) for orange type on light, and tabular numerals for every number that changes.
- **Do** build dark mode by swapping the scene to night (moon, crane lamps, black casts), not by inverting.
- **Do** clear the projector sky when a question or board is up.

### Don't:
- **Don't** use safety orange (steel-body) as text on a light ground; it fails contrast. Use brand-text.
- **Don't** introduce a second brand hue, candy-bright answer colours, or a dark neon look.
- **Don't** use zero-blur offset shadows or shadows cast up or to the left.
- **Don't** theme label stock or the answer paints for dark mode.
- **Don't** set type in uppercase outside mono label data and the room code, and don't put a small label above a headline as a kicker.
- **Don't** fall back to a bare system font stack without Inter loaded; every page head loads Inter and JetBrains Mono.
