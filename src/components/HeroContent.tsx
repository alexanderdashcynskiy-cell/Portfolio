import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroContentProps {
  onExploreClick: () => void;
  onTagClick?: (tag: string) => void;
}

// One unit = one pixel of the 1536×1024 reference artwork.
const u = (n: number) => `calc(${n} * var(--u))`;

const capabilities = ['UX/UI', 'WEB', 'APPS', 'MINI APPS', 'DASHBOARDS'];

export const HeroContent: React.FC<HeroContentProps> = ({ onExploreClick, onTagClick }) => {
  return (
    <section className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#e9dfd2]">
      {/* Scene */}
      <img
        src="/hero.jpg"
        alt="Glass sphere resting on a stone in a sunlit travertine courtyard"
        className="absolute inset-0 w-full h-full object-cover object-[68%_50%] md:object-center select-none pointer-events-none"
        draggable={false}
      />
      {/* Mobile legibility veil */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-r from-[#f1e6d8]/85 via-[#f1e6d8]/50 to-transparent pointer-events-none" />

      <div
        className="font-hero-sans u-px relative z-10 h-full flex flex-col text-[var(--hero-ink)]"
        style={{ paddingTop: `max(110px, ${u(165)})` }}
      >
        {/* 01 — DIGITAL PRODUCTS FOR REAL BUSINESSES */}
        <div className="flex items-start">
          <div className="flex flex-col" style={{ width: u(32) }}>
            <span className="leading-none" style={{ fontSize: `max(15px, ${u(19)})`, marginTop: u(6) }}>
              01
            </span>
            <span className="block h-px bg-[var(--hero-ink)]/60" style={{ width: u(32), marginTop: u(14) }} />
          </div>
          <span className="block h-px bg-[var(--hero-ink)]" style={{ width: u(45), marginLeft: u(14), marginTop: u(14) }} />
          <div
            className="flex flex-col uppercase leading-[1.4] tracking-[0.01em]"
            style={{ fontSize: `max(10px, ${u(12)})`, marginLeft: u(21) }}
          >
            <span>Digital products</span>
            <span>For real businesses</span>
          </div>
        </div>

        {/* I DESIGN. I BUILD. I SHIP. */}
        <h1
          className="font-display font-normal uppercase select-none"
          style={{
            fontSize: u(137),
            lineHeight: 0.775,
            letterSpacing: '-0.02em',
            marginTop: u(20),
          }}
        >
          <span className="block">I Design.</span>
          <span className="block">I Build.</span>
          <span className="block text-[var(--hero-bronze)]">I Ship.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="leading-[1.24] tracking-[-0.005em] text-[#141312]"
          style={{ fontSize: `max(16px, ${u(24)})`, marginTop: u(8), maxWidth: `max(300px, ${u(380)})` }}
        >
          From the first idea to a working digital product.
        </p>

        {/* Capabilities */}
        <div
          className="flex flex-wrap items-center uppercase tracking-[0.01em]"
          style={{ fontSize: `max(11px, ${u(15)})`, marginTop: u(22), columnGap: u(16) }}
        >
          {capabilities.map((item, idx) => (
            <React.Fragment key={item}>
              <button
                onClick={() => onTagClick?.(item)}
                className="transition-colors duration-300 hover:text-[var(--hero-bronze)] cursor-pointer"
                title={`Filter by ${item}`}
              >
                {item}
              </button>
              {idx < capabilities.length - 1 && (
                <span className="opacity-70 select-none" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Explore my work */}
        <button
          onClick={onExploreClick}
          className="group self-start inline-flex items-center cursor-pointer"
          style={{ marginTop: u(31), gap: u(22) }}
          aria-label="Explore my work"
        >
          <span
            className="flex items-center justify-center rounded-full border border-[var(--hero-ink)] transition-all duration-300 group-hover:bg-[var(--hero-ink)]"
            style={{ width: `max(52px, ${u(75)})`, height: `max(52px, ${u(75)})` }}
          >
            <ArrowRight
              className="transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5"
              style={{ width: `max(18px, ${u(24)})`, height: `max(18px, ${u(24)})` }}
              strokeWidth={1.4}
            />
          </span>
          <span
            className="uppercase tracking-[0.01em] transition-colors duration-300 group-hover:text-[var(--hero-bronze)]"
            style={{ fontSize: `max(13px, ${u(17)})` }}
          >
            Explore my work
          </span>
        </button>

        {/* Scroll */}
        <button
          onClick={onExploreClick}
          className="group absolute flex flex-col items-start cursor-pointer"
          style={{ left: `max(20px, ${u(71)})`, top: u(920), gap: u(12) }}
          aria-label="Scroll down"
        >
          <span className="uppercase leading-none" style={{ fontSize: `max(10px, ${u(12)})` }}>
            Scroll
          </span>
          <span className="block w-px bg-[var(--hero-ink)] ml-[3px]" style={{ height: u(32) }} />
          <span className="block w-px bg-[var(--hero-ink)]/60 ml-[3px]" style={{ height: u(24) }} />
        </button>
      </div>
    </section>
  );
};
