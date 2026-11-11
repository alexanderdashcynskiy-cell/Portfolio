/*
 * Soft Bento UI — motion presets for `motion/react` (Framer Motion).
 * Copy into the project. Everything is a spring; nothing bounces.
 */
import type { Transition, Variants } from 'motion/react';

/* ───────────── Springs ───────────── */

/** Default for state changes: toggles, checks, chips, pills. ≈250 ms, no visible overshoot. */
export const snappy: Transition = { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 };

/** Things that travel: the segmented pill, the selected date, the radio highlight, toasts. */
export const glide: Transition = { type: 'spring', stiffness: 380, damping: 34 };

/** Entrances and large surfaces. ≈380 ms. */
export const settle: Transition = { type: 'spring', stiffness: 260, damping: 30 };

/** Progress fills: rings, bars, sliders. Slower, still a spring. */
export const fill: Transition = { type: 'spring', stiffness: 120, damping: 22 };

/* ───────────── Entry: stagger from blur to sharp ───────────── */

/** Put on the grid; children use `blurIn`. */
export const grid: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

/** Each tray/card: appears out of a soft blur. */
export const blurIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: 'blur(12px)' },
  shown: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: settle },
};

/** Rows inside a card (list items, checks): a smaller, quicker version. */
export const rowIn: Variants = {
  hidden: { opacity: 0, y: 6, filter: 'blur(4px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: snappy },
};

/* ───────────── Micro-stories ───────────── */

/**
 * Button: idle → working → done. Animate the label with AnimatePresence (mode="popLayout"),
 * keyed by state; the button's width follows with `layout`.
 *   idle:    "Send"        background --sb-accent-grad
 *   working: spinner + "Sending"   background --sb-ink
 *   done:    "✓ Sent"      background --sb-accent-grad, then back to idle after ~1.2 s in a loop
 */
export const labelSwap: Variants = {
  enter: { opacity: 0, y: 8, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: snappy },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.12 } },
};

/** Press feedback for any tappable: scale down slightly, spring back. */
export const press = { whileTap: { scale: 0.96 }, transition: snappy } as const;

/** Check tick: the box fills with the accent, the tick draws in. */
export const checkBox: Variants = {
  off: { backgroundColor: 'var(--sb-sunken)', scale: 1 },
  on: { backgroundColor: 'var(--sb-accent)', scale: [1, 0.9, 1], transition: snappy },
};
export const checkTick: Variants = {
  off: { pathLength: 0, opacity: 0 },
  on: { pathLength: 1, opacity: 1, transition: { ...snappy, delay: 0.05 } },
};

/** Toggle knob: slides with `glide`; the track crossfades grey → accent. */
export const toggleKnob = (on: boolean) => ({ x: on ? 20 : 0, transition: glide });

/** Toast: slides down from above out of a blur, holds, leaves upward. */
export const toast: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.98, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: glide },
  gone: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.18 } },
};

/**
 * Rolling number (odometer). Split the formatted value into characters; every digit is a
 * vertical strip 0–9 that springs to its new position, with a short motion blur while moving.
 * Libraries that do exactly this: `@number-flow/react` (NumberFlow) — prefer it. Settings:
 *   <NumberFlow value={v} format={{ style: 'currency', currency: 'BYN' }}
 *     transformTiming={{ duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' }}
 *     spinTiming={{ duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' }} />
 * Without it: translateY(-digit * 1em) on a strip, `glide`, and filter: blur(2px) mid-flight.
 */
export const digitStrip = (digit: number) => ({ y: `${-digit}em`, transition: glide });

/** Progress ring: animate strokeDashoffset with `fill`; the label rolls with the number. */
export const ringOffset = (progress: number, circumference: number) => ({
  strokeDashoffset: circumference * (1 - progress),
  transition: fill,
});

/** Bar chart: bars grow from the baseline in a stagger, the active bar takes the accent. */
export const barGrow = (i: number): Transition => ({ ...fill, delay: 0.04 * i });

/* ───────────── Showcase loops ───────────── */

/**
 * In a showcase every component loops its story on its own clock so the grid never moves in
 * sync. Give each one a period of 2.4–4.2 s and a random phase. In product UI, play the story
 * once in response to the user instead.
 */
export const loopPeriod = (seed: number) => 2.4 + ((seed * 9301 + 49297) % 233280) / 233280 * 1.8;

/* ───────────── Reduced motion ───────────── */

/** Wrap a variant set: keep opacity/colour changes, drop movement, scale and blur. */
export const reduced = (v: Variants): Variants =>
  Object.fromEntries(
    Object.entries(v).map(([k, val]) => {
      if (typeof val !== 'object' || val === null) return [k, val];
      const { x, y, scale, filter, ...rest } = val as Record<string, unknown>;
      void x; void y; void scale; void filter;
      return [k, rest];
    }),
  ) as Variants;
