import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { WORLDS, WORLD_FILTERS, WorldCard } from '../data/worldsData';

interface DigitalWorldsProps {
  onOpenContact: () => void;
  isActive?: boolean;
}

// One unit = one pixel of the 1536×1024 layout (same scale as the hero).
const u = (n: number) => `calc(${n} * var(--u))`;

// Stage = the 1536×1024 reference. The camera and every card pose below were
// solved from the card corners measured on the reference (≈2px RMS), so the
// real 3D slabs land exactly on the photo at rest.
const STAGE_W = 1536;
const STAGE_H = 1024;
const PERSPECTIVE = 1805;
const ORIGIN_X = 848;
const ORIGIN_Y = 694;
const CARD_W = 355;
const CARD_H = 640;
const DEPTH = 26; // slab thickness
const GLASS = 4; // how far the domed glass stands proud of the artwork
const CARDS_DROP = 36; // vertical offset of the whole card group on desktop
const RADIUS = 16; // corner radius of the slab

// The band around each rounded corner, approximated by short flat strips along the arc.
const CORNER_STRIPS = (() => {
  const steps = 5;
  const corners = [
    { cx: RADIUS, cy: RADIUS, from: Math.PI, bottom: false },
    { cx: CARD_W - RADIUS, cy: RADIUS, from: 1.5 * Math.PI, bottom: false },
    { cx: CARD_W - RADIUS, cy: CARD_H - RADIUS, from: 0, bottom: true },
    { cx: RADIUS, cy: CARD_H - RADIUS, from: 0.5 * Math.PI, bottom: true },
  ];
  return corners.flatMap(({ cx, cy, from, bottom }) =>
    Array.from({ length: steps }, (_, i) => {
      const a0 = from + (i / steps) * (Math.PI / 2);
      const a1 = from + ((i + 1) / steps) * (Math.PI / 2);
      const x = cx + RADIUS * Math.cos(a0);
      const y = cy + RADIUS * Math.sin(a0);
      const dx = cx + RADIUS * Math.cos(a1) - x;
      const dy = cy + RADIUS * Math.sin(a1) - y;
      return { x, y, len: Math.hypot(dx, dy) + 0.6, angle: Math.atan2(dy, dx), bottom };
    })
  );
})();

interface Pose {
  tx: number;
  ty: number;
  tz: number;
  th: number; // rotateY, radians
}

// Five resting slots.
const SLOTS: Pose[] = [
  { tx: 316.6, ty: 153.0, tz: -104.5, th: 0.958 },
  { tx: 525.3, ty: 155.7, tz: -485.2, th: 1.029 },
  { tx: 779.7, ty: 156.7, tz: -814.7, th: 0.799 },
  { tx: 1111.4, ty: 160.9, tz: -1007.5, th: 0.41 },
  { tx: 1473.3, ty: 168.2, tz: -979.2, th: -0.655 },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Slots used by n cards, plus a virtual slot on each side for wrapping.
const pathFor = (n: number): Pose[] => {
  const used = SLOTS.slice(0, Math.max(1, n));
  const last = used[used.length - 1];
  const prev = used.length > 1 ? used[used.length - 2] : SLOTS[0];
  const before: Pose = { tx: SLOTS[0].tx - 330, ty: SLOTS[0].ty, tz: SLOTS[0].tz + 150, th: 1.0 };
  const after: Pose = { tx: last.tx + 330, ty: last.ty, tz: last.tz - 60, th: clamp(2 * last.th - prev.th, -1.1, 1.1) };
  return [before, ...used, after];
};

// Position along the path, u in [0, path.length - 1], on a Catmull-Rom curve through the
// slots: velocity and turn change continuously as a card passes a slot (no kinks).
const poseAt = (path: Pose[], u: number): Pose => {
  const last = path.length - 1;
  const i = clamp(Math.floor(u), 0, last - 1);
  const t = clamp(u - i, 0, 1);
  const p0 = path[Math.max(0, i - 1)];
  const p1 = path[i];
  const p2 = path[i + 1];
  const p3 = path[Math.min(last, i + 2)];
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return {
    tx: cr(p0.tx, p1.tx, p2.tx, p3.tx),
    ty: cr(p0.ty, p1.ty, p2.ty, p3.ty),
    tz: cr(p0.tz, p1.tz, p2.tz, p3.tz),
    th: cr(p0.th, p1.th, p2.th, p3.th),
  };
};

const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  tx: a.tx + (b.tx - a.tx) * t,
  ty: a.ty + (b.ty - a.ty) * t,
  tz: a.tz + (b.tz - a.tz) * t,
  th: a.th + (b.th - a.th) * t,
});

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Card reveal choreography (Apple-style): cards cascade in left to right, each easing in
// from slightly to the right while turning into place; leaving cards fade out quickly.
const ENTER_MS = 1100;
const EXIT_MS = 380;
const STAGGER_MS = 90;
const LEAVE_MS = 520; // cards leaving with the page
const LEAVE_STAGGER_MS = 45; // right to left
const LEAVE_SHIFT_X = -46; // they drift on, the way the carousel turns
// Carousel motion: a critically damped spring (no overshoot) with a soft start and a long,
// quiet settle, instead of an ease that leaves at full speed.
const SPRING_W = 8.5; // rad/s; settles in ~0.75s

// Lifted card: a click draws the card out of the deck to face the viewer; "View project"
// turns it over, and while it stands edge-on (90°) it widens into the project panel.
const LIFT_MS = 760;
const FLIP_MS = 1000;
const RETURN_MS = 680;
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type LiftPhase = 'lifting' | 'front' | 'flipping' | 'open' | 'unflipping' | 'returning';
interface Lift {
  k: number;
  phase: LiftPhase;
  start: number;
  from: Pose; // pose the current move starts from
  front: Pose; // the card facing the viewer (narrow)
  wide: number; // width of the opened panel, stage units
}
const PAGE_ENTER_DELAY_MS = 320; // lets the page's own fade begin first
const ENTER_SHIFT_X = 70; // px in stage space
const ENTER_TURN = 0.14; // extra rotateY, radians
const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const smoothstep = (x: number) => x * x * (3 - 2 * x);

interface Reveal {
  from: number;
  to: 0 | 1;
  start: number;
  dur: number;
}
const revealAt = (r: Reveal, t: number) => {
  const x = clamp((t - r.start) / r.dur, 0, 1);
  return r.from + (r.to - r.from) * (r.to === 1 ? easeOutQuint(x) : easeOutCubic(x));
};

// Position of item j on the path for a given offset, in [-0.5, n - 0.5).
const slotOf = (j: number, offset: number, n: number) => {
  const p = mod(j - offset, n);
  return p >= n - 0.5 ? p - n : p;
};

const matches = (w: WorldCard, filter: string) => filter === 'ALL WORK' || w.tags.includes(filter);

export const DigitalWorlds: React.FC<DigitalWorldsProps> = ({ onOpenContact, isActive = true }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offset = useRef(0);
  const target = useRef(0);
  const reveal = useRef<Reveal[]>(WORLDS.map(() => ({ from: 0, to: 0, start: 0, dur: 1 })));
  const replayReveal = useRef(true);
  // Pose each card is drawn at; after a filter change, cards that stay glide to their new slot.
  const shown = useRef<(Pose | null)[]>(WORLDS.map(() => null));
  const glideUntil = useRef(0);
  const baseOpacity = useRef<number[]>(WORLDS.map(() => 0));
  const drag = useRef<{ x: number; start: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const hovering = useRef(false);
  const lastInteraction = useRef(0);
  const stageScale = useRef(1);
  const visible = useRef(true); // page shown: input and autoplay are live
  const leaveUntil = useRef(0); // keep animating until the leaving cascade has finished
  const leaving = useRef(false);
  const velocity = useRef(0); // carousel offset units per second

  const [filter, setFilter] = useState('WEB');
  const [lifted, setLifted] = useState<number | null>(null); // WORLDS index of the lifted card
  const [liftOpen, setLiftOpen] = useState(false); // back face fully turned to the viewer
  const lift = useRef<Lift | null>(null);
  const liftRef = useRef<HTMLDivElement>(null); // the lifted card (overlay copy)
  const liftStageRef = useRef<HTMLDivElement>(null); // overlay stage, laid out like the card stage
  const stageOffset = useRef({ ox: 0, oy: 0 });

  // Indices (into WORLDS) of the cards in the current filter, in carousel order.
  const items = useMemo(() => WORLDS.map((w, k) => (matches(w, filter) ? k : -1)).filter((k) => k >= 0), [filter]);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    offset.current = 0;
    target.current = 0;
    glideUntil.current = performance.now() + 1200;
  }, [items]);

  const step = useCallback((dir: 1 | -1) => {
    if (itemsRef.current.length < 2) return;
    target.current = Math.round(target.current) + dir;
    lastInteraction.current = performance.now();
  }, []);

  // Fit the stage into the section.
  useEffect(() => {
    const layout = () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const vw = section.clientWidth;
      const vh = section.clientHeight;
      let s: number, ox: number, oy: number;
      if (vw < 768) {
        s = Math.min((vh * 0.46) / 660, (vw * 0.62) / 248);
        ox = 20 - 381 * s;
        oy = vh * 0.42 - 137 * s;
      } else {
        s = Math.min(vw / STAGE_W, vh / STAGE_H);
        ox = (vw - STAGE_W * s) / 2;
        // Lowered so the cards line up with the text column ("02" … "Drag to explore").
        oy = (vh - STAGE_H * s) / 2 + CARDS_DROP * s;
      }
      stageScale.current = s;
      stageOffset.current = { ox, oy };
      stage.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
      if (liftStageRef.current) liftStageRef.current.style.transform = stage.style.transform;
    };
    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
  }, []);

  // ---- Lifted card -------------------------------------------------------------------
  // The pose that shows a card of the given width square to the viewer, centred on screen at
  // a comfortable size. Solved through the stage's perspective so the overlay copy projects
  // exactly like the deck.
  const facingPose = (width: number, screenW: number) => {
    const section = sectionRef.current;
    const vw = section?.clientWidth ?? window.innerWidth;
    const vh = section?.clientHeight ?? window.innerHeight;
    const s = stageScale.current;
    const { ox, oy } = stageOffset.current;
    const mobile = vw < 768;
    const k = Math.min((vh * (mobile ? 0.62 : 0.74)) / (CARD_H * s), screenW / (width * s));
    const tz = PERSPECTIVE * (1 - 1 / k);
    const targetX = (vw / 2 - ox) / s;
    const targetY = (vh * 0.52 - oy) / s;
    const cx = ORIGIN_X + (targetX - ORIGIN_X) / k;
    const cy = ORIGIN_Y + (targetY - ORIGIN_Y) / k;
    return { pose: { tx: cx - width / 2, ty: cy - CARD_H / 2, tz, th: 0 }, k };
  };

  const openLift = (k: number) => {
    if (lift.current) return;
    const from = shown.current[k];
    if (!from) return;
    const vw = sectionRef.current?.clientWidth ?? window.innerWidth;
    const { pose: front, k: scale } = facingPose(CARD_W, vw);
    const s = stageScale.current;
    const panelScreenW = Math.min(vw * (vw < 768 ? 0.92 : 0.84), 1080);
    const wide = Math.max(CARD_W, panelScreenW / (s * scale));
    lift.current = { k, phase: 'lifting', start: performance.now(), from, front, wide };
    lastInteraction.current = performance.now();
    setLiftOpen(false);
    setLifted(k);
  };

  const flipLift = () => {
    const l = lift.current;
    if (!l || l.phase !== 'front') return;
    l.phase = 'flipping';
    l.start = performance.now();
  };

  const closeLift = () => {
    const l = lift.current;
    if (!l) return;
    const t = performance.now();
    if (l.phase === 'open' || l.phase === 'flipping') {
      l.phase = 'unflipping';
      l.start = t;
      setLiftOpen(false);
    } else if (l.phase === 'front' || l.phase === 'lifting') {
      l.phase = 'returning';
      l.start = t;
    }
  };

  // Advances the lifted card one frame; called from the main animation loop.
  const stepLift = (t: number) => {
    const l = lift.current;
    const el = liftRef.current;
    if (!l || !el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prog = (ms: number) => (reduce ? 1 : clamp((t - l.start) / ms, 0, 1));
    let pose = l.front;
    let angle = 0; // degrees turned over
    let width = CARD_W;
    let lifted = 1; // 0 = in the deck, 1 = held in front of the viewer

    if (l.phase === 'lifting' || l.phase === 'returning') {
      const x = prog(l.phase === 'lifting' ? LIFT_MS : RETURN_MS);
      // Returning goes back to the card's live slot in the deck.
      const deck = l.phase === 'lifting' ? l.from : shown.current[l.k] ?? l.from;
      const e = easeInOutCubic(x);
      lifted = l.phase === 'lifting' ? e : 1 - e;
      pose = lerpPose(deck, l.front, lifted);
      // A slight arc toward the viewer on the way, so it reads as being drawn out of the deck.
      pose = { ...pose, tz: pose.tz + Math.sin(Math.PI * lifted) * 90 };
      if (x === 1) {
        if (l.phase === 'lifting') {
          l.phase = 'front';
        } else {
          lift.current = null;
          setLifted(null);
          return;
        }
      }
    } else if (l.phase === 'flipping' || l.phase === 'unflipping') {
      const x = prog(FLIP_MS);
      const e = easeInOutCubic(x);
      angle = 180 * (l.phase === 'flipping' ? e : 1 - e);
      if (x === 1) {
        if (l.phase === 'flipping') {
          l.phase = 'open';
          setLiftOpen(true);
        } else {
          l.phase = 'returning';
          l.start = t;
        }
      }
    } else if (l.phase === 'open') {
      angle = 180;
    }

    // Past 90° (edge-on, invisible) the card is the wide panel.
    if (angle > 90) width = l.wide;
    if (width !== CARD_W) {
      const centre = l.front.tx + CARD_W / 2;
      pose = { ...pose, tx: centre - width / 2 };
    }
    // Lift a touch toward the viewer while turning, for depth.
    const turnLift = Math.sin((Math.PI * angle) / 180) * 70;
    el.style.width = `${width}px`;
    el.style.transform = `translate3d(${pose.tx}px, ${pose.ty}px, ${pose.tz + turnLift}px) rotateY(${pose.th * (180 / Math.PI) + angle}deg)`;
    el.style.setProperty('--lift', String(lifted));
    el.style.setProperty('--glare', `${50 + pose.th * 45 - angle / 4}%`);
    const scrim = sectionRef.current?.querySelector<HTMLElement>('.lift-scrim');
    if (scrim) scrim.style.opacity = String(lifted);
  };

  // Leaving the page drops a lifted card back without ceremony.
  useEffect(() => {
    if (isActive || !lift.current) return;
    lift.current = null;
    setLifted(null);
    setLiftOpen(false);
  }, [isActive]);

  // Pause the animation loop and keyboard while this page is not shown; each arrival on
  // the page replays the cards' cascade.
  useEffect(() => {
    visible.current = isActive;
    if (isActive) {
      lastInteraction.current = performance.now();
      leaving.current = false;
    } else {
      replayReveal.current = true;
      leaving.current = true;
      leaveUntil.current = performance.now() + LEAVE_MS + WORLDS.length * LEAVE_STAGGER_MS + 100;
    }
  }, [isActive]);

  // Animation loop: easing toward target, card reveals, autoplay. Cards stay put vertically.
  useEffect(() => {
    let raf = 0;
    let lastAuto = performance.now();
    let lastT = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, t - lastT);
      lastT = t;
      if (!visible.current && t > leaveUntil.current) return;
      const list = itemsRef.current;
      const n = list.length;
      const path = pathFor(n);
      const replay = visible.current && replayReveal.current;
      if (replay) replayReveal.current = false;
      const leave = leaving.current;
      leaving.current = false;

      const idle = visible.current && !lift.current && !drag.current && !hovering.current && t - lastInteraction.current > 6000;
      if (idle && !reduceMotion && n > 1 && t - lastAuto > 5000) {
        target.current = Math.round(target.current) + 1;
        lastAuto = t;
      } else if (!idle) {
        lastAuto = t;
      }

      if (!drag.current) {
        if (reduceMotion) {
          offset.current = target.current;
          velocity.current = 0;
        } else {
          // Critically damped spring, integrated in ≤8ms sub-steps for stability at any frame rate.
          let left = dt / 1000;
          while (left > 0) {
            const h = Math.min(left, 0.008);
            const acc = SPRING_W * SPRING_W * (target.current - offset.current) - 2 * SPRING_W * velocity.current;
            velocity.current += acc * h;
            offset.current += velocity.current * h;
            left -= h;
          }
          if (Math.abs(target.current - offset.current) < 0.0005 && Math.abs(velocity.current) < 0.002) {
            offset.current = target.current;
            velocity.current = 0;
          }
        }
      }

      for (let k = 0; k < WORLDS.length; k++) {
        const el = cardRefs.current[k];
        if (!el) continue;
        const j = list.indexOf(k);
        const p = j >= 0 && n > 1 ? slotOf(j, offset.current, n) : 0;
        const r = reveal.current[k];
        const now = revealAt(r, t);
        if (leave && j >= 0) {
          // Leaving the page: cards dissolve right to left, drifting on.
          const slot = clamp(Math.round(p), 0, n - 1);
          reveal.current[k] = { from: now, to: 0, start: t + (n - 1 - slot) * LEAVE_STAGGER_MS, dur: LEAVE_MS };
        } else if (j >= 0 && (r.to === 0 || replay) && visible.current) {
          // Entering: cascade in reading order (slot 0 is the front card on the left).
          const slot = clamp(Math.round(p), 0, n - 1);
          reveal.current[k] = { from: replay ? 0 : now, to: 1, start: t + (replay ? PAGE_ENTER_DELAY_MS : 0) + slot * STAGGER_MS, dur: ENTER_MS };
        } else if (j < 0 && r.to === 1) {
          reveal.current[k] = { from: now, to: 0, start: t, dur: EXIT_MS };
        }
        if (j < 0 && revealAt(reveal.current[k], t) === 0) shown.current[k] = null;
        const v = reduceMotion ? (j >= 0 ? 1 : 0) : revealAt(reveal.current[k], t);
        el.style.pointerEvents = j >= 0 ? 'auto' : 'none';

        if (j >= 0) {
          let pose = poseAt(path, p + 1);
          const prev = shown.current[k];
          if (prev && r.to === 1 && t < glideUntil.current && !reduceMotion) {
            pose = lerpPose(prev, pose, 1 - Math.exp(-dt / 170));
          }
          shown.current[k] = pose;
          const rest = 1 - v; // 0 once the card has fully arrived
          const out = reveal.current[k].to === 0; // leaving: drift on instead of back
          const shift = (out ? LEAVE_SHIFT_X : ENTER_SHIFT_X) * rest;
          const turn = (out ? -ENTER_TURN * 0.6 : ENTER_TURN) * rest;
          el.style.transform = `translate3d(${pose.tx + shift}px, ${pose.ty}px, ${pose.tz}px) rotateY(${pose.th + turn}rad)`;
          el.style.zIndex = String(Math.round(3000 + pose.tz));
          // Glare slides across the glass as the slab turns.
          el.style.setProperty('--glare', `${50 + pose.th * 45}%`);
          // Soft fade at both ends of the path as cards wrap around.
          const edge = p < 0 ? 1 + 2 * p : p > n - 1 ? 1 - 2 * (p - (n - 1)) : 1;
          baseOpacity.current[k] = smoothstep(clamp(edge, 0, 1));
        }

        // Opacity goes on the faces, not the slab: opacity on a 3D group would flatten it.
        // The lifted card is drawn by its overlay copy; the original waits, invisible, in its slot.
        const hidden = lift.current && lift.current.k === k ? 0 : 1;
        el.style.setProperty('--o', String(baseOpacity.current[k] * v * hidden));
      }
      stepLift(t);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard arrows while the section is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible.current) return;
      if (e.key === 'Escape' && lift.current) return closeLift();
      if (lift.current) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-control]')) return;
    drag.current = { x: e.clientX, start: offset.current, moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || itemsRef.current.length < 2) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    offset.current = d.start - dx / (260 * stageScale.current);
    target.current = offset.current;
    velocity.current = (-d.v * 1000) / (260 * stageScale.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    lastInteraction.current = performance.now();
    if (!d) return;
    if (d.moved) {
      // Project the throw a little ahead and let the spring carry it there.
      const throwBy = clamp(velocity.current * 0.22, -2, 2);
      target.current = Math.round(offset.current + throwBy);
      return;
    }
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>('[data-card]');
    if (!cardEl) return;
    // A click opens that card's project in place; the carousel only moves by drag, throw,
    // arrows or autoplay.
    const k = Number(cardEl.dataset.card);
    if (itemsRef.current.includes(k)) openLift(k);
  };

  const selectFilter = (f: string) => {
    setFilter(f);
    lastInteraction.current = performance.now();
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="worlds-page font-hero-sans relative w-full h-viewport min-h-[600px] overflow-hidden text-[var(--hero-ink)] select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      {/* Cards stage (reference coordinates) */}
      <div data-reveal="stage" className="absolute inset-0">
        <div
          ref={stageRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: STAGE_W, height: STAGE_H, perspective: PERSPECTIVE, perspectiveOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px` }}
        >
          {WORLDS.map((w, k) => (
            <div
              key={w.id}
              ref={(el) => {
                cardRefs.current[k] = el;
              }}
              data-card={k}
              className="group absolute left-0 top-0 will-change-transform"
              style={{ width: CARD_W, height: CARD_H, transformStyle: 'preserve-3d', ['--o' as string]: 0, ['--r' as string]: `${RADIUS}px` }}
            >
              {/* Contact shadow on the floor, 1px below the slab's bottom so the two planes are
                  never coplanar (Safari mis-sorts coplanar 3D planes) */}
              <div
                className="slab-part absolute pointer-events-none"
                style={{
                  left: -40,
                  top: CARD_H + 1,
                  width: CARD_W + 80,
                  height: 170,
                  transformOrigin: 'top',
                  transform: 'rotateX(90deg)',
                  background: 'radial-gradient(ellipse 55% 60% at 50% 0%, rgba(38,24,12,0.42), transparent 70%)',
                }}
              />
              {/* Mirror reflection on the polished floor */}
              <div
                className="slab-part slab-reflection absolute overflow-hidden pointer-events-none"
                style={{ left: 0, top: CARD_H + 3, width: CARD_W, height: CARD_H * 0.42, transform: 'scaleY(-1)' }}
              >
                <img src={w.image} alt="" draggable={false} className="absolute left-0 w-full object-fill" style={{ top: -CARD_H * 0.58, height: CARD_H }} />
              </div>

              {/* Slab body: sides, top, bottom. There is no back plate: it can never be seen from
                  the front, and Safari's 3D sorting would sometimes paint pieces of it over the
                  artwork. */}
              <div className="slab-part slab-side slab-left absolute left-0" style={{ top: RADIUS, width: DEPTH, height: CARD_H - 2 * RADIUS, transformOrigin: 'left', transform: 'rotateY(90deg)' }} />
              <div className="slab-part slab-side slab-right absolute" style={{ left: CARD_W, top: RADIUS, width: DEPTH, height: CARD_H - 2 * RADIUS, transformOrigin: 'left', transform: 'rotateY(90deg)' }} />
              {/* Rounded corners of the bronze band */}
              {CORNER_STRIPS.map((c, i) => (
                <div
                  key={i}
                  className={`slab-part slab-corner absolute ${c.bottom ? 'slab-corner-bottom' : ''}`}
                  style={{ left: c.x, top: c.y, width: c.len, height: DEPTH, transformOrigin: '0 0', transform: `rotateZ(${c.angle}rad) rotateX(-90deg)` }}
                />
              ))}
              <div className="slab-part slab-cap absolute top-0" style={{ left: RADIUS, width: CARD_W - 2 * RADIUS, height: DEPTH, transformOrigin: 'top', transform: 'rotateX(-90deg)' }} />
              <div className="slab-part slab-cap slab-bottom absolute" style={{ left: RADIUS, top: CARD_H, width: CARD_W - 2 * RADIUS, height: DEPTH, transformOrigin: 'top', transform: 'rotateX(-90deg)' }} />

              {/* Domed glass lens raised above the artwork, with its own clear rim */}
              <div className="slab-part slab-glass-rim absolute top-0" style={{ left: 0, top: RADIUS, width: GLASS, height: CARD_H - 2 * RADIUS, transformOrigin: 'left', transform: `translateZ(${GLASS}px) rotateY(90deg)` }} />
              <div className="slab-part slab-glass-rim absolute" style={{ left: CARD_W, top: RADIUS, width: GLASS, height: CARD_H - 2 * RADIUS, transformOrigin: 'left', transform: `translateZ(${GLASS}px) rotateY(90deg)` }} />
              <div className="slab-part slab-glass-rim absolute" style={{ left: RADIUS, top: 0, width: CARD_W - 2 * RADIUS, height: GLASS, transformOrigin: 'top', transform: `translateZ(${GLASS}px) rotateX(-90deg)` }} />
              <div className="slab-part slab-glass absolute inset-0 rounded-[var(--r)] pointer-events-none" style={{ transform: `translateZ(${GLASS}px)` }}>
                <div className="slab-glass-dome absolute inset-0 rounded-[var(--r)]" />
                <div className="slab-glare absolute inset-0 rounded-[var(--r)]" />
              </div>

              {/* Front face, flush with the front edge of the frame */}
              <span className="slab-part absolute font-hero-sans text-[#1d1a17] leading-none" style={{ left: 30, top: -30, fontSize: 21, transform: `translateZ(${GLASS + 1}px)` }}>
                {w.number}
              </span>
              <div className="slab-part absolute inset-0" style={{ transform: 'translateZ(0.2px)' }}>
                <div className="slab-face absolute inset-0 overflow-hidden rounded-[var(--r)] bg-black">
                  <img
                    src={w.image}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-fill transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
                  <div className="absolute inset-0 text-white">
                    <svg className="absolute left-1/2 -translate-x-1/2 opacity-90" style={{ top: 38 }} width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.9">
                      <path d="M8 1 15 8 8 15 1 8z" />
                      <path d="M6 5.5 10.5 10M5.5 8.5 8 11" />
                    </svg>
                    <div className="absolute inset-x-0 text-center" style={{ top: 74 }}>
                      <div className="font-cormorant font-medium leading-none" style={{ fontSize: 44, letterSpacing: '0.02em' }}>
                        {w.title}
                      </div>
                      <div className="uppercase" style={{ fontSize: 11.5, letterSpacing: '0.1em', marginTop: 12 }}>
                        {w.subtitle}
                      </div>
                    </div>
                    <div className="absolute" style={{ left: 39, top: 462, fontSize: 18, lineHeight: 1.4 }}>
                      {w.tagline.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </div>
                    <div className="absolute flex items-center uppercase" style={{ left: 39, bottom: 45, fontSize: 11.5, letterSpacing: '0.04em', gap: 10 }}>
                      View project
                      <ArrowRight size={13} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile legibility veil */}
      <div className="absolute inset-x-0 top-0 h-[46%] md:hidden bg-gradient-to-b from-[#f4ebe0]/90 via-[#f4ebe0]/60 to-transparent pointer-events-none" />

      {/* Left column */}
      <div className="absolute" style={{ left: 'var(--eyebrow-x)', top: 'var(--eyebrow-y)' }}>
        <span data-reveal className="page-eyebrow">02 / WORK</span>
        <h2 className="font-condensed uppercase" style={{ fontSize: `max(46px, ${u(93)})`, lineHeight: 0.87, marginTop: u(31) }}>
          <span data-reveal="line" className="block font-extralight tracking-[-0.08em]">Digital</span>
          <span data-reveal="line" className="block font-extrabold tracking-[-0.065em]">Worlds</span>
        </h2>
        <p data-reveal className="uppercase" style={{ fontSize: `max(13px, ${u(18.5)})`, lineHeight: 1.15, marginTop: u(17) }}>
          Real products.
          <br />
          Different worlds.
        </p>

        {/* Filters */}
        <ul data-control data-reveal className="hidden md:block" style={{ marginTop: u(41) }}>
          {WORLD_FILTERS.map((f, i) => {
            const on = filter === f;
            return (
              <li key={f} style={{ height: u(45) }}>
                <button onClick={() => selectFilter(f)} className="group flex items-center h-full cursor-pointer" style={{ gap: u(27) }}>
                  <span
                    className={`flex items-center justify-center rounded-full tabular-nums transition-all duration-300 ${
                      on
                        ? 'border-[1.5px] border-[var(--hero-ink)] font-semibold text-[var(--hero-ink)]'
                        : 'border border-white/60 bg-white/30 text-[#6d645a] group-hover:border-[var(--hero-ink)]/40 group-hover:text-[var(--hero-ink)]'
                    }`}
                    style={{ width: u(43), height: u(43), fontSize: u(13.5) }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`flex items-center uppercase transition-colors duration-300 ${
                      on ? 'font-semibold' : 'group-hover:text-[var(--hero-bronze)]'
                    }`}
                    style={{ fontSize: u(14), gap: u(14) }}
                  >
                    {f}
                    {on && <span className="block rounded-full bg-[var(--hero-ink)]" style={{ width: u(4), height: u(4) }} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Drag to explore — its bottom lines up with the bottom of the front card */}
      <div data-reveal className="absolute hidden md:flex items-center pointer-events-none" style={{ left: u(53), top: u(781), gap: u(22) }}>
        <span className="flex items-center justify-center rounded-full border border-[var(--hero-ink)]/80" style={{ width: u(50), height: u(50) }}>
          <ArrowUpRight style={{ width: u(19), height: u(19) }} strokeWidth={1.4} />
        </span>
        <span className="uppercase" style={{ fontSize: u(13.5) }}>Drag to explore</span>
      </div>

      {/* Mobile filter chips */}
      <div data-control data-reveal className="md:hidden absolute left-5 right-5 bottom-6 flex gap-2 overflow-x-auto">
        {WORLD_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => selectFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wide backdrop-blur ${
              filter === f ? 'bg-[var(--hero-ink)] text-white' : 'bg-white/50 text-[var(--hero-ink)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lifted card: an overlay copy on a stage laid out exactly like the deck */}
      {lifted !== null && (
        <>
          <div data-control data-modal className="lift-scrim" style={{ opacity: 0 }} onClick={closeLift} />
          <div
            data-control
            data-modal
            ref={(el) => {
              liftStageRef.current = el;
              if (el && stageRef.current) el.style.transform = stageRef.current.style.transform;
            }}
            className="lift-stage absolute left-0 top-0 origin-top-left"
            style={{ width: STAGE_W, height: STAGE_H, perspective: PERSPECTIVE, perspectiveOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px` }}
          >
            <LiftedCard
              ref={liftRef}
              card={WORLDS[lifted]}
              open={liftOpen}
              onView={flipLift}
              onClose={closeLift}
              onContact={() => {
                lift.current = null;
                setLifted(null);
                setLiftOpen(false);
                onOpenContact();
              }}
            />
          </div>
        </>
      )}
    </section>
  );
};

interface LiftedCardProps {
  card: WorldCard;
  open: boolean;
  onView: () => void;
  onClose: () => void;
  onContact: () => void;
}

/** The card held in front of the viewer: its face, and on its back the project panel. */
const LiftedCard = React.forwardRef<HTMLDivElement, LiftedCardProps>(({ card, open, onView, onClose, onContact }, ref) => (
  <div
    ref={ref}
    className={`lift-card ${open ? 'is-open' : ''}`}
    style={{ width: CARD_W, height: CARD_H, ['--r' as string]: `${RADIUS}px` }}
    role="dialog"
    aria-modal="true"
    aria-label={card.title}
  >
    {/* Face */}
    <div className="lift-face lift-front">
      <img src={card.image} alt="" draggable={false} className="absolute inset-0 w-full h-full object-fill" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
      <div className="slab-glass-dome absolute inset-0 rounded-[var(--r)]" />
      <div className="slab-glare absolute inset-0 rounded-[var(--r)]" />
      <div className="absolute inset-0 text-white">
        <svg className="absolute left-1/2 -translate-x-1/2 opacity-90" style={{ top: 38 }} width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.9">
          <path d="M8 1 15 8 8 15 1 8z" />
          <path d="M6 5.5 10.5 10M5.5 8.5 8 11" />
        </svg>
        <div className="absolute inset-x-0 text-center" style={{ top: 74 }}>
          <div className="font-cormorant font-medium leading-none" style={{ fontSize: 44, letterSpacing: '0.02em' }}>
            {card.title}
          </div>
          <div className="uppercase" style={{ fontSize: 11.5, letterSpacing: '0.1em', marginTop: 12 }}>
            {card.subtitle}
          </div>
        </div>
        <div className="absolute" style={{ left: 39, top: 462, fontSize: 18, lineHeight: 1.4 }}>
          {card.tagline.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        <button onClick={onView} className="lift-view group absolute flex items-center uppercase" style={{ left: 39, bottom: 34 }}>
          View project
          <ArrowRight size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
      <button onClick={onClose} className="lift-close lift-close-front" aria-label="Put the card back">
        <X strokeWidth={1.5} />
      </button>
    </div>

    {/* Back: the project panel */}
    <div className="lift-face lift-back">
      <div className="lift-back-media">
        <img src={card.image} alt={card.title} draggable={false} />
      </div>
      <div className="lift-back-body">
        <span data-lift-reveal className="lift-back-meta">
          {card.number} — {card.tags.join(' · ')}
        </span>
        <h3 data-lift-reveal className="lift-back-title font-cormorant">
          {card.title}
        </h3>
        <span data-lift-reveal className="lift-back-sub">
          {card.subtitle}
        </span>
        <p data-lift-reveal className="lift-back-text">
          {card.description}
        </p>
        <dl data-lift-reveal className="lift-back-facts">
          <div>
            <dt>Category</dt>
            <dd>{card.category}</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>{card.tags.join(', ')}</dd>
          </div>
        </dl>
        <div data-lift-reveal className="lift-back-actions">
          <button onClick={onContact} className="lift-cta group">
            Discuss a similar project
            <ArrowRight strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button onClick={onClose} className="lift-back-link">
            Back to the deck
          </button>
        </div>
      </div>
      <button onClick={onClose} className="lift-close" aria-label="Close">
        <X strokeWidth={1.5} />
      </button>
    </div>
  </div>
));
LiftedCard.displayName = 'LiftedCard';
