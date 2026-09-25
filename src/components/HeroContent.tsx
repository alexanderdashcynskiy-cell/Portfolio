import React, { useState } from 'react';
import { ArrowRight, Sparkles, Layers, Code2, Rocket } from 'lucide-react';

interface HeroContentProps {
  onExploreClick: () => void;
  onTagClick?: (tag: string) => void;
  onPhaseHover?: (phase: string | null) => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  onExploreClick,
  onTagClick,
  onPhaseHover,
}) => {
  const [activeHeadline, setActiveHeadline] = useState<string | null>(null);

  const capabilities = ['UX/UI', 'WEB', 'APPS', 'MINI APPS', 'DASHBOARDS'];

  return (
    <div className="relative z-30 flex flex-col justify-between min-h-[calc(100vh-100px)] pt-24 sm:pt-28 pb-10 sm:pb-14 px-6 sm:px-10 lg:px-16 pointer-events-none max-w-7xl">
      {/* UPPER SECTION: Counter + Headline + Subtext + CTA */}
      <div className="flex flex-col items-start max-w-2xl lg:max-w-3xl pointer-events-auto">
        
        {/* 1. SECTION COUNTER & TAGLINE (Exact match to photo) */}
        <div className="group flex items-center gap-4 mb-6 sm:mb-8 cursor-default">
          <span className="text-sm sm:text-base font-semibold tracking-wider text-[#22201e] transition-colors duration-300 group-hover:text-[#9c6a3b]">
            01
          </span>
          <span className="w-8 sm:w-10 h-[1.5px] bg-[#22201e]/80 transition-all duration-300 group-hover:w-14 group-hover:bg-[#9c6a3b]" />
          <div className="flex flex-col text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] leading-tight text-[#2b2724] uppercase transition-colors duration-300 group-hover:text-[#181716]">
            <span>DIGITAL PRODUCTS</span>
            <span className="text-[#645c54]">FOR REAL BUSINESSES</span>
          </div>
        </div>

        {/* 2. MASSIVE HERO HEADLINE: "I DESIGN. I BUILD. I SHIP." */}
        <h1 className="flex flex-col font-serif font-bold text-5xl sm:text-7xl lg:text-[5.4rem] xl:text-[5.9rem] leading-[0.94] tracking-[-0.015em] text-[#141312] mb-6 sm:mb-8 select-none">
          {/* Line 1: I DESIGN. */}
          <span
            onMouseEnter={() => {
              setActiveHeadline('design');
              onPhaseHover?.('design');
            }}
            onMouseLeave={() => {
              setActiveHeadline(null);
              onPhaseHover?.(null);
            }}
            className="group relative inline-block transition-transform duration-300 hover:translate-x-1.5 cursor-pointer py-0.5"
          >
            <span className="transition-colors duration-300 group-hover:text-[#9c6a3b]">
              I DESIGN.
            </span>
            {/* Subtle interactive phase badge indicator */}
            <span className="hidden sm:inline-flex ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 align-middle text-[11px] font-sans font-medium tracking-widest text-[#9c6a3b] uppercase">
              • UX/UI & Systems
            </span>
          </span>

          {/* Line 2: I BUILD. */}
          <span
            onMouseEnter={() => {
              setActiveHeadline('build');
              onPhaseHover?.('build');
            }}
            onMouseLeave={() => {
              setActiveHeadline(null);
              onPhaseHover?.(null);
            }}
            className="group relative inline-block transition-transform duration-300 hover:translate-x-1.5 cursor-pointer py-0.5"
          >
            <span className="transition-colors duration-300 group-hover:text-[#9c6a3b]">
              I BUILD.
            </span>
            <span className="hidden sm:inline-flex ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 align-middle text-[11px] font-sans font-medium tracking-widest text-[#9c6a3b] uppercase">
              • Frontend & 3D WebGL
            </span>
          </span>

          {/* Line 3: I SHIP. (Warm Cognac / Gold tone matching photo) */}
          <span
            onMouseEnter={() => {
              setActiveHeadline('ship');
              onPhaseHover?.('ship');
            }}
            onMouseLeave={() => {
              setActiveHeadline(null);
              onPhaseHover?.(null);
            }}
            className="group relative inline-block text-[#9c6a3b] transition-transform duration-300 hover:translate-x-1.5 cursor-pointer py-0.5"
          >
            <span className="transition-colors duration-300 group-hover:text-[#b87d46] drop-shadow-xs">
              I SHIP.
            </span>
            <span className="hidden sm:inline-flex ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 align-middle text-[11px] font-sans font-medium tracking-widest text-[#66421e] uppercase">
              • Scale & Performance
            </span>
          </span>
        </h1>

        {/* 3. SUBTITLE TEXT (Matching photo) */}
        <p className="font-sans text-lg sm:text-xl lg:text-2xl text-[#282522]/90 font-normal leading-snug tracking-tight mb-5 sm:mb-6 max-w-lg transition-colors duration-300 hover:text-[#111111]">
          From the first idea to a working digital product.
        </p>

        {/* 4. CAPABILITIES LIST WITH MIDDLE DOTS (Matching photo) */}
        <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs sm:text-[13px] font-medium tracking-[0.14em] text-[#4f483f] uppercase mb-8 sm:mb-10">
          {capabilities.map((item, idx) => (
            <React.Fragment key={item}>
              <button
                onClick={() => onTagClick?.(item)}
                className="group relative py-0.5 transition-all duration-300 hover:text-[#9c6a3b] hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none"
                title={`Filter by ${item}`}
              >
                <span>{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#9c6a3b] transition-all duration-300 group-hover:w-full" />
              </button>
              {idx < capabilities.length - 1 && (
                <span className="text-[#8a7f72] font-semibold select-none" aria-hidden="true">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 5. "EXPLORE MY WORK" ACTION BUTTON (Matching photo) */}
        <button
          onClick={onExploreClick}
          className="group relative inline-flex items-center gap-4 sm:gap-5 cursor-pointer select-none focus-visible:outline-none"
          title="Scroll down to inspect selected digital products"
          aria-label="Explore my work"
        >
          {/* Circular Icon with Arrow */}
          <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-[#141312]/80 flex items-center justify-center transition-all duration-300 ease-out group-hover:border-[#9c6a3b] group-hover:bg-[#141312] group-hover:scale-110 shadow-xs group-hover:shadow-md">
            <ArrowRight className="w-5 h-5 text-[#141312] transition-all duration-300 ease-out group-hover:text-white group-hover:translate-x-1" />
          </div>

          {/* Text Label */}
          <span className="text-xs sm:text-[13px] lg:text-sm font-semibold tracking-[0.18em] uppercase text-[#141312] transition-all duration-300 group-hover:text-[#9c6a3b] group-hover:translate-x-1">
            EXPLORE MY WORK
          </span>
        </button>
      </div>

      {/* LOWER SECTION: "SCROLL" Indicator (Bottom Left, Matching photo) */}
      <div
        onClick={onExploreClick}
        className="pointer-events-auto mt-10 sm:mt-14 inline-flex flex-col items-start gap-2 cursor-pointer group"
        title="Scroll down"
      >
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase text-[#38332d] transition-all duration-300 group-hover:text-[#9c6a3b] group-hover:translate-y-0.5">
          SCROLL
        </span>
        <div className="w-[1.5px] h-7 bg-[#2e2a25] transition-all duration-300 group-hover:h-10 group-hover:bg-[#9c6a3b] animate-pulse" />
      </div>
    </div>
  );
};
