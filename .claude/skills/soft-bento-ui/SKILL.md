---
name: soft-bento-ui
description: Alexander's house style for app interfaces — "Soft Bento": light grey canvas, white cards inside pale trays, big radii, one warm orange accent, black contrast tiles, and small spring micro-interactions that each tell a one-second story (button → spinner → done, digits rolling, rings filling, toggles, checks ticking in turn, toasts). Use when building or restyling any screen, component, dashboard, landing or product showcase in Alexander's projects, or when asked for "soft bento", "как в референсе", "мой стиль", a component showcase grid, or micro-interactions in this style. Tokens are in TOKENS.css, motion presets in MOTION.ts, component recipes in COMPONENTS.md.
---

# Soft Bento UI

The style recorded from Alexander's reference (a split-bills UI kit showcase): dozens of small
live components on a calm, almost white canvas, each one animating its own tiny story at the
same time. It reads as expensive because everything is quiet — one accent colour, soft depth,
generous space — and every motion is short, springy and meaningful.

Read before building:
- `TOKENS.css` — colours, radii, shadows, type, spacing. Copy it into the project and use the
  variables; never hard-code a colour or a radius.
- `MOTION.ts` — springs, durations and ready variants for `motion/react` (Framer Motion).
- `COMPONENTS.md` — how each component looks and what its micro-story is.

## The rules

**Surfaces**
1. Canvas `--sb-canvas` (#FCFCFC). Components sit in **trays** (`--sb-tray`, a pale warm grey,
   radius `--sb-r-tray` 28px), and the content inside a tray is a **white card** (radius
   `--sb-r-card` 20px) with the soft shadow `--sb-shadow-card`. The tray-in-card double layer is
   the signature: it gives depth without borders.
2. No borders except hairlines `--sb-line` inside lists. No hard shadows, no gradients on
   surfaces, no glassmorphism.
3. One or two **black tiles** per screen (`--sb-ink`) for the hero metric or a media item —
   a progress ring, a voice note, a big number. They anchor the composition. Never more than
   ~10% of the area.

**Colour**
4. Greys and black carry everything. The **accent is orange** (`--sb-accent` #FF7A1A, gradient
   `--sb-accent-grad` to amber) and appears only on: the selected state, the primary action,
   progress, success ticks, and the one number that matters. If more than ~8% of a screen is
   orange, remove some.
5. Small coloured avatar dots (red, pink, amber, green, violet) are the only other colours —
   people, never decoration.

**Type**
6. Inter or SF Pro. Big numbers `--sb-fs-hero` 44px weight 700, tabular figures, tight
   tracking. Titles 15–16px/600. Secondary text 12–13px/500 in `--sb-text-2`. Lots of air.
7. Money and counters always use tabular numbers so rolling digits do not jitter.

**Motion** (details in MOTION.ts)
8. Everything moves on **springs**, not linear tweens: quick (≈220–380 ms), no overshoot
   bigger than a few percent, no bouncing.
9. Entry: blocks appear in a **stagger from blur to sharp** — opacity 0→1, blur 12px→0,
   scale 0.96→1, 40–60 ms apart, in reading order.
10. Each component tells **one short story** and then holds: button `Send` → spinner
    `Sending` → `✓ Sent`; ring 1/4 → 4/4; checks ticking one by one; the radio highlight
    sliding down; chips toggling; a number **rolling like an odometer with motion blur**; a
    toast sliding in; stars filling; a timer ticking. In a showcase they loop; in a real app
    they play once in response to the user.
11. Animate only `transform`, `opacity` and `filter`. Layout changes go through `layout` /
    `layoutId` (the segmented-control pill, the selected date, the radio highlight).
12. Respect `prefers-reduced-motion`: keep colour/opacity changes, drop movement and blur.

## Checklist before handing a screen over
- Are all colours, radii and shadows from TOKENS.css?
- Is orange used only for state, action and the key number?
- Does every component sit in a tray, with a white card inside?
- Is there at most one or two black tiles?
- Do numbers roll (not jump) and use tabular figures?
- Does every interactive element have its micro-story (pressed → working → done)?
- Is every animation a spring under ~400 ms, with no bounce?
- Does it still read with reduced motion?
