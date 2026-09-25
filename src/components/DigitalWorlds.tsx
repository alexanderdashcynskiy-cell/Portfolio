import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { WORLDS, WORLD_FILTERS, WorldCard } from '../data/worldsData';

interface DigitalWorldsProps {
  onOpenContact: () => void;
}

// One unit = one pixel of the 1536×1024 layout (same scale as the hero).
const u = (n: number) => `calc(${n} * var(--u))`;

// Stage = the 1536×1024 reference. Card faces and edges are measured there.
const STAGE_W = 1536;
const STAGE_H = 1024;
const CARD_W = 300;
const CARD_H = 640;
const EDGE_W = 20;

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL
interface Slot {
  face: Quad;
  edge: number; // visible thickness: < 0 on the left side, > 0 on the right
}

// Five resting slots — the exact card faces from the reference.
const SLOTS: Slot[] = [
  { face: [[381, 137], [629, 224], [625, 779], [381, 796]], edge: -12 },
  { face: [[650, 244], [809, 290], [806, 772], [647, 778]], edge: -4 },
  { face: [[838, 307], [1001, 338], [1000, 762], [837, 768]], edge: -7 },
  { face: [[1031, 343], [1226, 360], [1225, 761], [1031, 764]], edge: -5 },
  { face: [[1261, 366], [1483, 339], [1485, 770], [1261, 766]], edge: 6 },
];

const extrapolate = (a: Slot, b: Slot): Slot => ({
  face: a.face.map((p, i) => [2 * p[0] - b.face[i][0], 2 * p[1] - b.face[i][1]]) as Quad,
  edge: 2 * a.edge - b.edge,
});

// Slots used by n cards, plus a virtual slot on each side for wrapping.
const pathFor = (n: number): Slot[] => {
  const used = SLOTS.slice(0, Math.max(1, n));
  const last = used[used.length - 1];
  const beforeLast = used.length > 1 ? used[used.length - 2] : SLOTS[1];
  return [extrapolate(SLOTS[0], SLOTS[1]), ...used, extrapolate(last, beforeLast)];
};

const lerpSlot = (a: Slot, b: Slot, t: number): Slot => ({
  face: a.face.map((p, i) => [p[0] + (b.face[i][0] - p[0]) * t, p[1] + (b.face[i][1] - p[1]) * t]) as Quad,
  edge: a.edge + (b.edge - a.edge) * t,
});

// Projective transform mapping a w×h rectangle onto a quad.
const quadToMatrix3d = (q: Quad, w: number, h: number): string => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-6;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${x0},${y0},0,1)`;
};

const edgeQuad = ({ face: [tl, tr, br, bl], edge }: Slot): Quad =>
  edge < 0
    ? [[tl[0] + edge, tl[1] + 1], tl, bl, [bl[0] + edge, bl[1] - 1]]
    : [tr, [tr[0] + edge, tr[1] + 1], [br[0] + edge, br[1] - 1], br];

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Position of item j on the path for a given offset, in [-0.5, n - 0.5).
const slotOf = (j: number, offset: number, n: number) => {
  const p = mod(j - offset, n);
  return p >= n - 0.5 ? p - n : p;
};

const matches = (w: WorldCard, filter: string) => filter === 'ALL WORK' || w.tags.includes(filter);

export const DigitalWorlds: React.FC<DigitalWorldsProps> = ({ onOpenContact }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const edgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offset = useRef(0);
  const target = useRef(0);
  const presence = useRef<number[]>(WORLDS.map(() => 0));
  const baseOpacity = useRef<number[]>(WORLDS.map(() => 0));
  const drag = useRef<{ x: number; start: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const hovering = useRef(false);
  const lastInteraction = useRef(0);
  const stageScale = useRef(1);
  const visible = useRef(true);

  const [filter, setFilter] = useState('WEB');
  const [openCard, setOpenCard] = useState<WorldCard | null>(null);

  // Indices (into WORLDS) of the cards in the current filter, in carousel order.
  const items = useMemo(() => WORLDS.map((w, k) => (matches(w, filter) ? k : -1)).filter((k) => k >= 0), [filter]);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    offset.current = 0;
    target.current = 0;
  }, [items]);

  const goTo = useCallback((k: number) => {
    const list = itemsRef.current;
    const n = list.length;
    const j = list.indexOf(k);
    if (j < 0 || n < 2) return;
    const delta = slotOf(j, target.current, n);
    target.current = Math.round(target.current + (delta > n / 2 ? delta - n : delta));
    lastInteraction.current = performance.now();
  }, []);

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
        oy = (vh - STAGE_H * s) / 2;
      }
      stageScale.current = s;
      stage.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
    };
    layout();
    window.addEventListener('resize', layout);
    return () => window.removeEventListener('resize', layout);
  }, []);

  // Pause the animation loop while the section is off screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animation loop: easing toward target, filter fades, gentle float, autoplay.
  useEffect(() => {
    let raf = 0;
    let lastAuto = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible.current) return;
      const list = itemsRef.current;
      const n = list.length;
      const path = pathFor(n);

      const idle = !drag.current && !hovering.current && t - lastInteraction.current > 6000;
      if (idle && !reduceMotion && n > 1 && t - lastAuto > 5000) {
        target.current = Math.round(target.current) + 1;
        lastAuto = t;
      } else if (!idle) {
        lastAuto = t;
      }

      if (!drag.current) {
        offset.current += (target.current - offset.current) * 0.085;
        if (Math.abs(target.current - offset.current) < 0.0005) offset.current = target.current;
      }

      for (let k = 0; k < WORLDS.length; k++) {
        const el = cardRefs.current[k];
        const edgeEl = edgeRefs.current[k];
        if (!el || !edgeEl) continue;
        const j = list.indexOf(k);
        presence.current[k] += ((j >= 0 ? 1 : 0) - presence.current[k]) * (reduceMotion ? 1 : 0.12);
        el.style.pointerEvents = j >= 0 ? 'auto' : 'none';

        if (j >= 0) {
          const p = n > 1 ? slotOf(j, offset.current, n) : 0;
          const i = Math.max(0, Math.min(path.length - 2, Math.floor(p) + 1));
          const slot = lerpSlot(path[i], path[i + 1], p + 1 - i);
          const float = reduceMotion ? 0 : Math.sin(t / 1200 + k * 1.4) * 3;
          slot.face = slot.face.map(([x, y]) => [x, y + float]) as Quad;
          el.style.transform = quadToMatrix3d(slot.face, CARD_W, CARD_H);
          edgeEl.style.transform = quadToMatrix3d(edgeQuad(slot), EDGE_W, CARD_H);
          edgeEl.dataset.side = slot.edge < 0 ? 'left' : 'right';
          baseOpacity.current[k] = p < 0 ? Math.max(0, 1 + 2 * p) : p > n - 1 ? Math.max(0, 1 - 2 * (p - (n - 1))) : 1;
          const z = String(100 - Math.round(p * 10));
          el.style.zIndex = z;
          edgeEl.style.zIndex = z;
        }

        const o = String(baseOpacity.current[k] * presence.current[k]);
        el.style.opacity = o;
        edgeEl.style.opacity = o;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard arrows while the section is on screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible.current || openCard) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCard, step]);

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
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    lastInteraction.current = performance.now();
    if (!d) return;
    if (d.moved) {
      target.current = Math.round(offset.current - d.v * 1.2);
      return;
    }
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>('[data-card]');
    if (!cardEl) return;
    const k = Number(cardEl.dataset.card);
    const list = itemsRef.current;
    const front = list[mod(Math.round(offset.current), list.length)];
    if (k === front) setOpenCard(WORLDS[k]);
    else goTo(k);
  };

  const selectFilter = (f: string) => {
    setFilter(f);
    lastInteraction.current = performance.now();
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="font-hero-sans relative w-full h-screen min-h-[600px] overflow-hidden text-[var(--hero-ink)] select-none touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      {/* Cards stage (reference coordinates) */}
      <div ref={stageRef} className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H }}>
        {WORLDS.map((w, k) => (
          <React.Fragment key={w.id}>
            {/* Glass thickness */}
            <div
              ref={(el) => {
                edgeRefs.current[k] = el;
              }}
              className="world-edge absolute left-0 top-0 origin-top-left rounded-[6px]"
              style={{ width: EDGE_W, height: CARD_H, opacity: 0 }}
            />
            {/* Face */}
            <div
              ref={(el) => {
                cardRefs.current[k] = el;
              }}
              data-card={k}
              className="world-card group absolute left-0 top-0 origin-top-left will-change-transform"
              style={{ width: CARD_W, height: CARD_H, opacity: 0 }}
            >
              <span className="absolute font-hero-sans text-[#1d1a17]" style={{ left: 26, top: -34, fontSize: 21 }}>
                {w.number}
              </span>
              <div className="absolute inset-0 overflow-hidden rounded-[12px] bg-black shadow-[0_30px_60px_-24px_rgba(20,14,8,0.6)] ring-1 ring-black/40">
                <img
                  src={w.image}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
                <div className="absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/15" />
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
                  <div className="absolute" style={{ left: 33, top: 462, fontSize: 18, lineHeight: 1.4 }}>
                    {w.tagline.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                  <div className="absolute flex items-center uppercase" style={{ left: 33, bottom: 45, fontSize: 11.5, letterSpacing: '0.04em', gap: 10 }}>
                    View project
                    <ArrowRight size={13} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Mobile legibility veil */}
      <div className="absolute inset-x-0 top-0 h-[46%] md:hidden bg-gradient-to-b from-[#f4ebe0]/90 via-[#f4ebe0]/60 to-transparent pointer-events-none" />

      {/* Left column */}
      <div className="absolute" style={{ left: `max(20px, ${u(56)})`, top: `max(88px, ${u(165)})` }}>
        <div className="leading-none" style={{ fontSize: `max(13px, ${u(19)})` }}>02</div>
        <div className="flex items-center" style={{ marginTop: u(19), gap: u(10) }}>
          <span className="block h-px bg-[var(--hero-ink)]" style={{ width: u(37) }} />
          <span className="block rounded-full bg-[var(--hero-ink)]" style={{ width: 2, height: 2 }} />
        </div>
        <h2 className="font-condensed uppercase" style={{ fontSize: `max(46px, ${u(93)})`, lineHeight: 0.87, marginTop: u(23) }}>
          <span className="block font-extralight tracking-[-0.08em]">Digital</span>
          <span className="block font-extrabold tracking-[-0.065em]">Worlds</span>
        </h2>
        <p className="uppercase" style={{ fontSize: `max(13px, ${u(18.5)})`, lineHeight: 1.15, marginTop: u(17) }}>
          Real products.
          <br />
          Different worlds.
        </p>

        {/* Filters */}
        <ul data-control className="hidden md:block" style={{ marginTop: u(41) }}>
          {WORLD_FILTERS.map((f, i) => {
            const on = filter === f;
            return (
              <li key={f} style={{ height: u(47) }}>
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

      {/* Drag to explore */}
      <div className="absolute hidden md:flex items-center pointer-events-none" style={{ left: u(53), top: u(811), gap: u(22) }}>
        <span className="flex items-center justify-center rounded-full border border-[var(--hero-ink)]/80" style={{ width: u(50), height: u(50) }}>
          <ArrowUpRight style={{ width: u(19), height: u(19) }} strokeWidth={1.4} />
        </span>
        <span className="uppercase" style={{ fontSize: u(13.5) }}>Drag to explore</span>
      </div>

      {/* Mobile filter chips */}
      <div data-control className="md:hidden absolute left-5 right-5 bottom-6 flex gap-2 overflow-x-auto">
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

      {/* Project detail */}
      {openCard && (
        <div
          data-control
          className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-[#1a1512]/60 backdrop-blur-sm cursor-default"
          onClick={() => setOpenCard(null)}
        >
          <div
            className="relative w-full max-w-3xl grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden rounded-2xl bg-[#f6efe6] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={openCard.image} alt={openCard.title} className="w-full h-64 md:h-full object-cover" />
            <div className="p-7 sm:p-9 flex flex-col">
              <button
                onClick={() => setOpenCard(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs tracking-[0.14em] text-[var(--hero-bronze)]">
                {openCard.number} — {openCard.tags.join(' · ')}
              </span>
              <h3 className="font-cormorant text-5xl font-medium mt-3">{openCard.title}</h3>
              <span className="text-xs tracking-[0.14em] uppercase mt-1 text-[#6b6157]">{openCard.subtitle}</span>
              <p className="mt-6 text-[15px] leading-relaxed text-[#3b352f]">{openCard.description}</p>
              <button
                onClick={() => {
                  setOpenCard(null);
                  onOpenContact();
                }}
                className="mt-auto pt-8 self-start inline-flex items-center gap-2 text-sm uppercase tracking-[0.08em] hover:text-[var(--hero-bronze)] cursor-pointer"
              >
                Discuss a similar project <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
