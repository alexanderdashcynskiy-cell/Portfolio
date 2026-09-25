import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { WORLDS, WORLD_CATEGORIES, WorldCard } from '../data/worldsData';

interface DigitalWorldsProps {
  onOpenAllWorks: () => void;
  onOpenContact: () => void;
}

// One unit = one pixel of the 1536×1024 layout (same scale as the hero).
const u = (n: number) => `calc(${n} * var(--u))`;

// Stage = the 1280×853 reference photo. Card faces are measured there.
const STAGE_W = 1280;
const STAGE_H = 853;
const CARD_W = 300;
const CARD_H = 640;

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

// Five resting slots — the exact card faces from the reference.
const SLOTS: Quad[] = [
  [[333, 64], [557, 152], [557, 665], [322, 690]],
  [[591, 185], [716, 238], [717, 645], [590, 655]],
  [[744, 250], [884, 275], [886, 637], [746, 643]],
  [[911, 282], [1073, 290], [1080, 632], [913, 635]],
  [[1100, 298], [1264, 278], [1270, 637], [1105, 633]],
];

const extrapolate = (a: Quad, b: Quad): Quad =>
  a.map((p, i) => [2 * p[0] - b[i][0], 2 * p[1] - b[i][1]]) as Quad;

// Virtual slots before the first and after the last, used while cards wrap around.
const PATH: Quad[] = [extrapolate(SLOTS[0], SLOTS[1]), ...SLOTS, extrapolate(SLOTS[4], SLOTS[3])];

const lerpQuad = (a: Quad, b: Quad, t: number): Quad =>
  a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]) as Quad;

// Projective transform mapping the CARD_W×CARD_H rectangle onto a quad.
const quadToMatrix3d = (q: Quad): string => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  return `matrix3d(${a / CARD_W},${d / CARD_W},0,${g / CARD_W},${b / CARD_H},${e / CARD_H},0,${h / CARD_H},0,0,1,0,${x0},${y0},0,1)`;
};

const N = WORLDS.length;
const mod = (n: number, m: number) => ((n % m) + m) % m;

// Position of card k on the path for a given carousel offset, in [-0.5, 4.5).
const slotOf = (k: number, offset: number) => {
  const p = mod(k - offset, N);
  return p >= N - 0.5 ? p - N : p;
};

const CATEGORY_TO_INDEX: Record<string, number> = Object.fromEntries(
  WORLDS.map((w, i) => [w.category, i])
);

export const DigitalWorlds: React.FC<DigitalWorldsProps> = ({ onOpenAllWorks, onOpenContact }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offset = useRef(0);
  const target = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const hovering = useRef(false);
  const lastInteraction = useRef(0);
  const stageScale = useRef(1);
  const visible = useRef(true);

  const [active, setActive] = useState(0);
  const [openCard, setOpenCard] = useState<WorldCard | null>(null);

  const goTo = useCallback((index: number) => {
    // Shortest way round to bring card `index` to the front slot.
    const delta = slotOf(index, target.current);
    target.current = Math.round(target.current + (delta > N / 2 ? delta - N : delta));
    lastInteraction.current = performance.now();
  }, []);

  const step = useCallback((dir: 1 | -1) => {
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
        s = Math.min((vh * 0.46) / 625, (vw * 0.62) / 240);
        ox = 20 - 322 * s;
        oy = vh * 0.44 - 64 * s;
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

  // Animation loop: easing toward target, gentle float, autoplay.
  useEffect(() => {
    let raf = 0;
    let lastActive = -1;
    let lastAuto = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible.current) return;

      const idle = !drag.current && !hovering.current && t - lastInteraction.current > 6000;
      if (idle && !reduceMotion && t - lastAuto > 5000) {
        target.current = Math.round(target.current) + 1;
        lastAuto = t;
      } else if (!idle) {
        lastAuto = t;
      }

      if (!drag.current) {
        offset.current += (target.current - offset.current) * 0.085;
        if (Math.abs(target.current - offset.current) < 0.0005) offset.current = target.current;
      }

      for (let k = 0; k < N; k++) {
        const el = cardRefs.current[k];
        if (!el) continue;
        const p = slotOf(k, offset.current);
        const i = Math.max(0, Math.min(PATH.length - 2, Math.floor(p) + 1));
        const q = lerpQuad(PATH[i], PATH[i + 1], p + 1 - i);
        const float = reduceMotion ? 0 : Math.sin(t / 1200 + k * 1.4) * 3;
        const floated = q.map(([x, y]) => [x, y + float]) as Quad;
        el.style.transform = quadToMatrix3d(floated);
        el.style.opacity = String(p < 0 ? Math.max(0, 1 + 2 * p) : p > N - 1 ? Math.max(0, 1 - 2 * (p - (N - 1))) : 1);
        el.style.zIndex = String(100 - Math.round(p * 10));
      }

      const a = mod(Math.round(offset.current), N);
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
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
    if (!d) return;
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
    offset.current = d.start - dx / (230 * stageScale.current);
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
    if (k === mod(Math.round(offset.current), N)) setOpenCard(WORLDS[k]);
    else goTo(k);
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
      {/* Cards stage (reference-photo coordinates) */}
      <div
        ref={stageRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: STAGE_W, height: STAGE_H }}
      >
        {WORLDS.map((w, k) => (
          <div
            key={w.id}
            ref={(el) => {
              cardRefs.current[k] = el;
            }}
            data-card={k}
            className="world-card group absolute left-0 top-0 origin-top-left will-change-transform"
            style={{ width: CARD_W, height: CARD_H }}
          >
            <span className="absolute font-hero-sans text-[#2a2622]" style={{ left: 42, top: -30, fontSize: 15 }}>
              {w.number}
            </span>
            <div className="absolute inset-0 overflow-hidden bg-black shadow-[0_30px_60px_-20px_rgba(20,14,8,0.55)] ring-1 ring-white/15">
              <img
                src={w.image}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
              <div className="absolute inset-0 text-white">
                <div className="absolute inset-x-0 text-center" style={{ top: 90 }}>
                  <div
                    className="font-cormorant font-medium leading-none"
                    style={{ fontSize: w.titleSize, letterSpacing: '0.01em' }}
                  >
                    {w.title}
                  </div>
                  <div className="uppercase" style={{ fontSize: 11.5, letterSpacing: '0.08em', marginTop: 16 }}>
                    {w.subtitle}
                  </div>
                </div>
                <svg className="absolute left-1/2 -translate-x-1/2 opacity-80" style={{ top: 50 }} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="0.9">
                  <path d="M2 3h10L7 12z" />
                  <path d="M4.5 3 7 8l2.5-5" />
                </svg>
                <div className="absolute" style={{ left: 30, top: 476, fontSize: 15, lineHeight: 1.36 }}>
                  {w.tagline.map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                </div>
                <div className="absolute flex items-center uppercase" style={{ left: 30, bottom: 36, fontSize: 10.5, letterSpacing: '0.05em', gap: 10 }}>
                  View project
                  <ArrowRight size={11} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile legibility veil */}
      <div className="absolute inset-x-0 top-0 h-[46%] md:hidden bg-gradient-to-b from-[#f4ebe0]/90 via-[#f4ebe0]/60 to-transparent pointer-events-none" />

      {/* Left column */}
      <div className="absolute pointer-events-none" style={{ left: `max(20px, ${u(56)})`, top: `max(88px, ${u(158)})` }}>
        <div className="leading-none" style={{ fontSize: `max(12px, ${u(16)})` }}>02</div>
        <div className="h-px bg-[var(--hero-ink)]" style={{ width: u(38), marginTop: u(17) }} />
        <h2 className="font-condensed uppercase" style={{ fontSize: `max(48px, ${u(101)})`, lineHeight: 0.87, marginTop: u(26) }}>
          <span className="block font-extralight tracking-[-0.035em]">Digital</span>
          <span className="block font-extrabold tracking-[-0.04em]">Worlds</span>
        </h2>
        <p className="uppercase leading-[1.3]" style={{ fontSize: `max(13px, ${u(18.5)})`, marginTop: u(28) }}>
          Real products.
          <br />
          Different worlds.
        </p>
        <ul className="hidden md:block uppercase pointer-events-auto" style={{ fontSize: u(13.5), lineHeight: u(23.6), marginTop: u(46) }}>
          {WORLD_CATEGORIES.map((c) => (
            <li key={c}>
              <button
                data-control
                onClick={() => goTo(CATEGORY_TO_INDEX[c] ?? 0)}
                className={`transition-colors duration-300 hover:text-[var(--hero-bronze)] cursor-pointer ${
                  WORLDS[active].category === c ? 'text-[var(--hero-bronze)]' : ''
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Drag to explore */}
      <div
        className="absolute hidden md:flex items-center pointer-events-none"
        style={{ left: u(56), top: u(751), gap: u(21) }}
      >
        <span className="flex items-center justify-center rounded-full border border-[var(--hero-ink)]" style={{ width: u(56), height: u(56) }}>
          <ArrowUpRight style={{ width: u(20), height: u(20) }} strokeWidth={1.4} />
        </span>
        <span className="uppercase" style={{ fontSize: u(13) }}>Drag to explore</span>
      </div>

      {/* Counter + progress */}
      <div className="absolute flex items-center pointer-events-none" style={{ left: `max(20px, ${u(56)})`, bottom: `max(24px, ${u(76)})`, gap: u(26) }}>
        <span className="tabular-nums" style={{ fontSize: `max(12px, ${u(14)})` }}>
          {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </span>
        <span className="relative block h-px bg-[var(--hero-ink)]/20" style={{ width: `max(120px, ${u(194)})` }}>
          <span
            className="absolute inset-y-0 left-0 bg-[var(--hero-ink)] transition-[width] duration-500"
            style={{ width: `${((active + 1) / N) * 100}%` }}
          />
        </span>
      </div>

      {/* Prev / next */}
      <div
        data-control
        className="absolute hidden md:flex items-center justify-center rounded-full border border-white/80 text-white backdrop-blur-[2px]"
        style={{ right: `max(20px, ${u(59)})`, top: `max(0px, ${u(790)})`, width: `max(46px, ${u(54)})`, height: `max(46px, ${u(54)})` }}
      >
        <button onClick={() => step(-1)} className="p-1 cursor-pointer hover:opacity-70" aria-label="Previous project">
          <ChevronLeft style={{ width: `max(14px, ${u(15)})`, height: `max(14px, ${u(15)})` }} strokeWidth={1.5} />
        </button>
        <button onClick={() => step(1)} className="p-1 cursor-pointer hover:opacity-70" aria-label="Next project">
          <ChevronRight style={{ width: `max(14px, ${u(15)})`, height: `max(14px, ${u(15)})` }} strokeWidth={1.5} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="absolute hidden md:flex" style={{ right: u(58), top: u(880), gap: u(13) }}>
        {WORLDS.map((w, k) => (
          <button
            key={w.id}
            data-control
            onClick={() => goTo(k)}
            className={`relative overflow-hidden rounded-[3px] cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
              active === k ? 'ring-1 ring-white shadow-lg' : 'opacity-90'
            }`}
            style={{ width: u(56), height: u(67) }}
            aria-label={`Show ${w.title}`}
          >
            <img src={w.image} alt="" draggable={false} className="w-full h-full object-cover object-[50%_40%]" />
          </button>
        ))}
        <button
          data-control
          onClick={onOpenAllWorks}
          className="flex items-center justify-center rounded-[3px] bg-white/35 backdrop-blur-sm text-[var(--hero-ink)] cursor-pointer transition-colors hover:bg-white/60"
          style={{ width: u(56), height: u(67) }}
          aria-label="All works"
        >
          <Plus style={{ width: u(18), height: u(18) }} strokeWidth={1.3} />
        </button>
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
                {openCard.number} — {openCard.category}
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
