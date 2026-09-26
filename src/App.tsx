/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { HeroContent } from './components/HeroContent';
import { WorkShowcase } from './components/WorkShowcase';
import { DigitalWorlds } from './components/DigitalWorlds';
import { ServicesSection } from './components/ServicesSection';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { CustomCursor } from './components/CustomCursor';

const PAGE_COUNT = 3;
const PAGE_LOCK_MS = 1100;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [workFilter, setWorkFilter] = useState<string | null>(null);
  const [isWorksModalOpen, setIsWorksModalOpen] = useState(false);

  // Full-screen pages: the backdrop never moves, only the content of each page swaps.
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const lockUntil = useRef(0);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const modalOpen = useRef(false);
  modalOpen.current = isAboutOpen || isContactOpen || isWorksModalOpen;

  const goToPage = useCallback((next: number) => {
    const target = Math.max(0, Math.min(PAGE_COUNT - 1, next));
    if (target === pageRef.current) return;
    pageRef.current = target;
    lockUntil.current = performance.now() + PAGE_LOCK_MS;
    const el = pageEls.current[target];
    if (el) el.scrollTop = target > page ? 0 : el.scrollTop;
    setPage(target);
  }, [page]);

  useEffect(() => {
    // Can the current page scroll further in this direction on its own (e.g. a tall services page)?
    const canScrollInside = (dir: number) => {
      const el = pageEls.current[pageRef.current];
      if (!el) return false;
      return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
    };
    const blocked = (target: EventTarget | null) => {
      const t = target as Element | null;
      return modalOpen.current || !t?.closest?.('[data-page]') || !!t.closest('[data-modal]');
    };

    const onWheel = (e: WheelEvent) => {
      if (blocked(e.target)) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      // While a page transition runs, swallow trackpad inertia completely.
      if (performance.now() < lockUntil.current) return e.preventDefault();
      if (canScrollInside(dir)) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      goToPage(pageRef.current + dir);
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (modalOpen.current || document.querySelector('[data-modal]') || tag === 'INPUT' || tag === 'TEXTAREA') return;
      const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (e.key === 'Home') return goToPage(0);
      if (e.key === 'End') return goToPage(PAGE_COUNT - 1);
      if (!dir || canScrollInside(dir)) return;
      e.preventDefault();
      if (performance.now() >= lockUntil.current) goToPage(pageRef.current + dir);
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = blocked(e.target) ? null : e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) < 50) return;
      const dir = dy > 0 ? 1 : -1;
      if (canScrollInside(dir) || performance.now() < lockUntil.current) return;
      goToPage(pageRef.current + dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [goToPage]);

  const handleOpenSection = (section: 'home' | 'about' | 'work' | 'services' | 'contact') => {
    setActiveSection(section);
    if (section === 'home') goToPage(0);
    else if (section === 'work') goToPage(1);
    else if (section === 'services') goToPage(2);
    else if (section === 'about') setIsAboutOpen(true);
    else if (section === 'contact') setIsContactOpen(true);
  };

  const scrollToWorks = () => goToPage(1);

  const openAllWorks = (filter: string | null = null) => {
    setWorkFilter(filter);
    setIsWorksModalOpen(true);
  };

  const handleTagClick = (tag: string) => openAllWorks(tag);

  const pageProps = (i: number) => ({
    'data-page': i,
    ref: (el: HTMLDivElement | null) => {
      pageEls.current[i] = el;
    },
    'aria-hidden': page !== i,
    className: `site-page ${page === i ? 'is-active' : i < page ? 'is-above' : 'is-below'}`,
  });

  return (
    <div className="relative h-screen overflow-hidden bg-[#ece6dc] text-[#141312] selection:bg-[#9c6a3b] selection:text-white">
      {/* Custom magnetic follower cursor */}
      <CustomCursor />

      <Navigation onOpenSection={handleOpenSection} activeSection={activeSection} />

      {/* ONE FIXED BACKDROP for the whole site; the sphere layer dissolves away from the first page */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <img src="/worlds/bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-in-out"
          style={{ opacity: page === 0 ? 1 : 0 }}
          draggable={false}
        />
      </div>

      {/* PAGE 1 — hero */}
      <div {...pageProps(0)}>
        <main className="relative">
          <HeroContent onExploreClick={scrollToWorks} onTagClick={handleTagClick} />
        </main>
      </div>

      {/* PAGE 2 — Digital Worlds carousel */}
      <div {...pageProps(1)}>
        <DigitalWorlds isActive={page === 1} onOpenContact={() => setIsContactOpen(true)} />
      </div>

      {/* PAGE 3 — Services & footer (scrolls inside if taller than the screen) */}
      <div {...pageProps(2)}>
        <div className="page-scroll-fade min-h-full flex flex-col">
          <ServicesSection onOpenContact={() => setIsContactOpen(true)} />

        <footer className="mt-auto py-8 px-6 sm:px-10 lg:px-16 relative bg-[#f4ece2]/75 backdrop-blur-md border-t border-white/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#6e6457]">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-[#141312]">A.</span>
            <span>© 2026 Alexander Dashcynskiy. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 font-medium tracking-wider uppercase text-[#3a352e]">
            <button onClick={() => setIsAboutOpen(true)} className="hover:text-[#9c6a3b] transition-colors cursor-pointer">
              About
            </button>
            <button onClick={scrollToWorks} className="hover:text-[#9c6a3b] transition-colors cursor-pointer">
              Works
            </button>
            <button onClick={() => setIsContactOpen(true)} className="hover:text-[#9c6a3b] transition-colors cursor-pointer">
              Contact
            </button>
            <a href="mailto:alexanderdashcynskiy@gmail.com" className="hover:text-[#9c6a3b] transition-colors">
              Email
            </a>
          </div>
        </footer>
        </div>
      </div>

      {/* Interactive Works Fullscreen Modal (for direct instant access on WORK / EXPLORE clicks) */}
      {isWorksModalOpen && (
        <WorkShowcase
          isModal={true}
          initialFilter={workFilter}
          onClose={() => setIsWorksModalOpen(false)}
          onOpenContact={() => {
            setIsWorksModalOpen(false);
            setIsContactOpen(true);
          }}
        />
      )}

      {/* Interactive About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Interactive Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
