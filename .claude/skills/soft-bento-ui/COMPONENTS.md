# Soft Bento UI — components and their micro-stories

Every component sits in a tray (`--sb-tray`, radius 28) with a white card inside (radius 20,
`--sb-shadow-card`). Below: what it looks like, and the one short story it animates. Springs
and variants are in `MOTION.ts`.

## Actions

**Primary button** — full-width pill, `--sb-accent-grad`, white 15px/600 label, `--sb-shadow-accent`.
Story: `Send` → (press, scale 0.96) → black pill with a spinner and `Sending` → orange `✓ Sent`.
Labels swap with `labelSwap`; width follows with `layout`.

**Dark button** — black pill, white label, icon left (e.g. lock + `Pay 24.00`). Same story.

**Status pill** — small black pill `◌ Sending` → `✓ Sent` (the spinner morphs into the tick).

**Icon buttons** — 40px circles: one black (primary, e.g. ✕), the rest white with a soft shadow.
Press: scale 0.92 and back.

**Cancel / Continue pair** — two pills side by side: white (secondary) and black (primary).

## Selection

**Toggle** — 44×26 track; off `--sb-sunken`, on `--sb-accent`; white knob with `--sb-shadow-pill`.
Row layout: coloured round icon (24px), title 14/600, secondary line 12/500, toggle on the right.
Story: the knob glides, the track crossfades.

**Checkbox list ("Who's in?")** — avatar dot + name rows; checkbox on the right, 20px, radius 6.
Story: ticks fill one by one (60–90 ms apart), the counter "2 of 5 friends" rolls.

**Radio rows ("Split evenly / By item / Custom")** — rows of height 44 in a card; the selected
row has `--sb-accent-soft-grad` and an orange dot; right column shows the value in secondary text.
Story: the highlight slides to the next row with `layoutId` (`glide`).

**Chips** — pills: off = white with soft shadow, on = `--sb-accent-grad` with white `✓ label`.
Story: chips switch on in turn; each pops (scale 0.94 → 1).

**Segmented control** — `--sb-sunken` track, white pill with `--sb-shadow-pill` under the
active label. Story: the pill glides between `Items / People / Activity` (`layoutId`).

**Calendar** — month title + ‹ › circle buttons, weekday letters 11px grey, days 14px; today in a
grey circle, the selected day in an orange circle with white digit; event line at the bottom in
a sunken pill (`📅 Thanksgiving at Sam's, Thu 5:00 pm`). Story: the selected circle travels to
another date (`layoutId`), the event line swaps with `labelSwap`.

**Stepper** — `−  5  +` with round buttons, label above ("People at the table"). Story: the
number rolls up/down.

**Dropdown** — a field `Evenly ⌄`; the menu opens below as a floating card (`--sb-shadow-float`),
items fade in with `rowIn`, the chosen one shows a `✓`.

## Numbers and progress

**Hero amount** — `$24.00`, 44px/700 tabular, with `−` and `+` circle buttons on both sides and a
small caption above ("Your share"). Story: the amount rolls like an odometer (NumberFlow).

**Progress ring (black tile)** — on `--sb-ink`: ring track `--sb-ink-2`, progress stroke
`--sb-accent-grad`, `3/4` in the centre 26px/600 white, caption under it. Story: the ring fills
1/4 → 4/4 with `fill`, the fraction rolls.

**Mini bar chart** — caption "Dinners this month", amount 24px/700 rolling, 8 thin rounded bars,
grey, the current one orange and taller. Story: bars grow in a stagger.

**Tip slider** — label left, `18%` right, a thin track with an orange fill. Story: the fill
glides, the percent rolls.

**Steps ("Step 2 of 3")** — list of steps with orange ticks for done, grey for the rest. Story:
the next tick fills.

**Countdown** — `47:12` large, caption above ("Request expires in"), small play/refresh buttons.
Story: seconds roll down every second.

**Code input** — 4–6 boxes `4 8 1 7 |`, the active one with a blinking caret. Story: digits type in.

**Upload** — file icon, `receipt.jpg`, "1.6 of 2.4 MB", thin orange progress bar.

## Messages

**Toast** — white floating card: round coloured icon with ✓, text `Leo paid you $24.00`, `now` on
the right. Story: slides in from above out of a blur (`toast`), holds, leaves.

**Chat bubbles** — incoming: white bubble with avatar dot; outgoing: black bubble, white text.
A typing indicator (three dots) precedes each reply.

**Voice note (black tile)** — avatar, name, "Voice note in Pizza night", play button, a waveform
of thin rounded bars in the accent, duration `0:05`. Story: the waveform fills as it plays.

**Rating** — "How was dinner?" + five stars; stars fill in turn with a small pop.

**FAQ / accordion** — rows with `⌄`; one opens with a height spring, text fades in.

**Avatars stack** — overlapping coloured dots with a `+` circle, caption under it ("Pizza night ·
5 people"). Story: a new dot slides in from the right.

**Search field** — sunken pill with a magnifier and grey placeholder; on focus, a soft accent ring.

## Composition (showcase / dashboards)

- Bento grid of trays, gap 16px, trays of different sizes (1×1, 1×2, 2×1); align to a 4px grid.
- Distribute the black tiles: one top area, one lower area; never adjacent.
- Orange should appear in small spots all over the grid — never one big orange block.
- Entry: the whole grid staggers in from blur (reading order, 40–60 ms apart).
- Then each component loops its own story on its own clock (2.4–4.2 s, random phase).
