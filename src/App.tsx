/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { HeroContent } from './components/HeroContent';
import { WorkShowcase } from './components/WorkShowcase';
import { DigitalWorlds } from './components/DigitalWorlds';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { AboutModal } from './components/AboutModal';
import { ContactPage } from './components/ContactPage';
import { CustomCursor } from './components/CustomCursor';

const PAGE_COUNT = 5;
const PAGE_LOCK_MS = 1100;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [workFilter, setWorkFilter] = useState<string | null>(null);
  const [isWorksModalOpen, setIsWorksModalOpen] = useState(false);

  // Full-screen pages: each page owns a backdrop scene and a set of [data-reveal] elements
  // that are choreographed in and out (see "Page transitions" in index.css).
  const [page, setPage] = useState(0);
  // The first page plays its entrance once the site has painted.
  const [ready, setReady] = useState(false);
  const pageRef = useRef(0);
  const lockUntil = useRef(0);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const modalOpen = useRef(false);
  modalOpen.current = isAboutOpen || isWorksModalOpen;

  const goToPage = useCallback((next: number) => {
    const target = Math.max(0, Math.min(PAGE_COUNT - 1, next));
    if (target === pageRef.current) return;
    pageRef.current = target;
    lockUntil.current = performance.now() + PAGE_LOCK_MS;
    const el = pageEls.current[target];
    if (el) el.scrollTop = target > page ? 0 : el.scrollTop;
    setActiveSection(['home', 'work', 'about', 'services', 'contact'][target]);
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
    else if (section === 'about') goToPage(2);
    else if (section === 'services') goToPage(3);
    else if (section === 'contact') goToPage(4);
  };

  const scrollToWorks = () => goToPage(1);
  const openContact = () => {
    setIsAboutOpen(false);
    setIsWorksModalOpen(false);
    goToPage(4);
  };

  const openAllWorks = (filter: string | null = null) => {
    setWorkFilter(filter);
    setIsWorksModalOpen(true);
  };

  const handleTagClick = (tag: string) => openAllWorks(tag);

  useLayoutEffect(() => {
    // Stagger order: every revealed element gets its index within its page.
    pageEls.current.forEach((el) =>
      el?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((r, i) => r.style.setProperty('--i', String(i))),
    );
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  const stateOf = (i: number) => (ready && page === i ? 'is-active' : i < page ? 'is-above' : 'is-below');

  const pageProps = (i: number) => ({
    'data-page': i,
    ref: (el: HTMLDivElement | null) => {
      pageEls.current[i] = el;
    },
    'aria-hidden': page !== i,
    className: `site-page ${stateOf(i)}`,
  });

  return (
    <div className="relative h-viewport overflow-hidden bg-[#ece6dc] text-[#141312] selection:bg-[#9c6a3b] selection:text-white">
      {/* Custom magnetic follower cursor */}
      <CustomCursor />

      <Navigation onOpenSection={handleOpenSection} activeSection={activeSection} light={page === 4} />

      {/* ONE FIXED BACKDROP: each page has its own scene; scenes only cross-fade. Pages 3 and 4
          lay theirs out on the shared stage, so 3 → 4 dissolves the figure out of the terrace. */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { src: '/hero.jpg', staged: false },
          { src: '/worlds/bg.jpg', staged: false },
          { src: '/about.jpg', staged: true },
          { src: '/services.jpg', staged: true },
          { src: '/contact.jpg', staged: true, tint: 'scene-tint-contact' },
        ].map(({ src, staged, tint }, i) => (
          <div key={src} className={`scene-layer ${stateOf(i)}`}>
            <img
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${staged ? 'scene-fill' : ''}`}
              draggable={false}
            />
            {staged && <img src={src} alt="" className="stage-scene" draggable={false} />}
            {tint && <div className={tint} />}
          </div>
        ))}
      </div>

      {/* PAGE 1 — hero */}
      <div {...pageProps(0)}>
        <main className="relative">
          <HeroContent onExploreClick={scrollToWorks} onTagClick={handleTagClick} />
        </main>
      </div>

      {/* PAGE 2 — Digital Worlds carousel */}
      <div {...pageProps(1)}>
        <DigitalWorlds isActive={page === 1} onOpenContact={openContact} />
      </div>

      {/* PAGE 3 — About */}
      <div {...pageProps(2)}>
        <AboutPage />
      </div>

      {/* PAGE 4 — Services */}
      <div {...pageProps(3)}>
        <ServicesPage onOpenContact={openContact} />
      </div>

      {/* PAGE 5 — Contact */}
      <div {...pageProps(4)}>
        <ContactPage />
      </div>

      {/* Interactive Works Fullscreen Modal (for direct instant access on WORK / EXPLORE clicks) */}
      {isWorksModalOpen && (
        <WorkShowcase
          isModal={true}
          initialFilter={workFilter}
          onClose={() => setIsWorksModalOpen(false)}
          onOpenContact={openContact}
        />
      )}

      {/* Interactive About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenContact={openContact}
      />
    </div>
  );
}
