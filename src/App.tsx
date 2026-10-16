/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { HeroContent } from './components/HeroContent';
import { DigitalWorlds } from './components/DigitalWorlds';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { ContactPage } from './components/ContactPage';
import { CustomCursor } from './components/CustomCursor';
import { PageRail } from './components/PageRail';
import { SphereLight } from './components/SphereLight';
import { FilmGrain, LightRays } from './components/Atmosphere';
import { scrub } from './motion';
import { Intro } from './components/Intro';
import { playPageIn, prefersReducedMotion, settlePage, splitHeadlines, gsap } from './gsapMotion';

const PAGE_COUNT = 5;
// Each page's backdrop scene; pages 3–5 lay theirs out on the shared stage.
const SCENES: { src: string; staged: boolean; tint?: string }[] = [
  { src: '/hero.jpg', staged: false },
  { src: '/worlds/bg.jpg', staged: false },
  { src: '/about.jpg', staged: true },
  { src: '/services.jpg', staged: true },
  { src: '/contact.jpg', staged: true, tint: 'scene-tint-contact' },
];
const SCENE_SRCS = SCENES.map((sc) => sc.src);

const PAGE_LOCK_MS = 850;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  // Asks page 2 to open its overview (all cards in a row), optionally with a filter.
  const [overviewRequest, setOverviewRequest] = useState<{ filter: string | null; id: number } | null>(null);

  // Full-screen pages: each page owns a backdrop scene and a set of [data-reveal] elements
  // that are choreographed in and out (see "Page transitions" in index.css).
  const [page, setPage] = useState(0);
  // The first page plays its entrance once the site has painted.
  const [ready, setReady] = useState(false);
  const splitDone = useRef<Promise<void>>(Promise.resolve());
  // The first visit of a session opens with a short intro (skipped under reduced motion).
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      if (sessionStorage.getItem('intro-seen')) return false;
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage blocked: play it */
    }
    return true;
  });
  const pageRef = useRef(0);
  const lockUntil = useRef(0);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);

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
      return !t?.closest?.('[data-page]') || !!t.closest('[data-modal]');
    };

    // ---- Gesture-driven transitions -------------------------------------------------
    // A trackpad swipe or a finger drag scrubs the transition to the next page: the scenes
    // and content follow the gesture (see "Gesture-driven transitions" in index.css). On
    // release it completes past ~40% (or with a quick flick), otherwise it settles back.
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let sc: { from: number; to: number; dir: number; p: number; v: number } | null = null;
    let endTimer = 0;
    let classTimer = 0;

    const mark = (from: number, to: number) => {
      document.querySelectorAll('[data-scrub]').forEach((el) => el.removeAttribute('data-scrub'));
      pageEls.current[from]?.setAttribute('data-scrub', 'out');
      pageEls.current[to]?.setAttribute('data-scrub', 'in');
      document.querySelector(`[data-scene="${from}"]`)?.setAttribute('data-scrub', 'out');
      document.querySelector(`[data-scene="${to}"]`)?.setAttribute('data-scrub', 'in');
    };
    const begin = (dir: number) => {
      const from = pageRef.current;
      const to = from + dir;
      if (to < 0 || to >= PAGE_COUNT) return false;
      sc = { from, to, dir, p: 0, v: 0 };
      // The arriving page is revealed by the gesture itself, so its GSAP parts start settled.
      settlePage(pageEls.current[to]);
      root.classList.remove('scrub-commit', 'scrub-cancel');
      mark(from, to);
      root.classList.add('is-scrubbing');
      return true;
    };
    const update = (p: number) => {
      if (!sc) return;
      sc.p = Math.min(1, Math.max(0, p));
      root.style.setProperty('--p', sc.p.toFixed(4));
      Object.assign(scrub, { from: sc.from, to: sc.to, p: sc.p });
    };
    const finish = () => {
      window.clearTimeout(endTimer);
      if (!sc) return;
      const { to, p, v } = sc;
      sc = null;
      const commit = p > 0.4 || (p > 0.12 && v > 0.9);
      document.querySelectorAll('[data-scrub]').forEach((el) => el.removeAttribute('data-scrub'));
      root.classList.remove('is-scrubbing');
      root.classList.add(commit ? 'scrub-commit' : 'scrub-cancel');
      Object.assign(scrub, { from: -1, to: -1, p: 0 });
      window.clearTimeout(classTimer);
      classTimer = window.setTimeout(() => root.classList.remove('scrub-commit', 'scrub-cancel'), 1400);
      if (commit) goToPage(to);
      else lockUntil.current = performance.now() + 350; // swallow the rest of the inertia
    };

    // A mouse wheel clicks (multiples of 120 in wheelDelta, or line/page deltas); a trackpad
    // streams small pixel deltas.
    const isWheelClick = (e: WheelEvent) => {
      const wd = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
      if (e.deltaMode !== 0) return true;
      if (wd !== undefined && wd !== 0) return Math.abs(wd) % 120 === 0;
      return Math.abs(e.deltaY) >= 50;
    };

    const onWheel = (e: WheelEvent) => {
      if (blocked(e.target)) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      // While a page transition runs, swallow trackpad inertia completely.
      if (performance.now() < lockUntil.current) return e.preventDefault();
      if (!sc && canScrollInside(dir)) return;
      e.preventDefault();
      if (!sc && (reduce || isWheelClick(e))) {
        if (Math.abs(e.deltaY) < 6) return;
        goToPage(pageRef.current + dir);
        return;
      }
      if (!sc && !begin(dir)) return;
      const s = sc!;
      const step = (e.deltaY * s.dir) / (window.innerHeight * 0.8);
      s.v = (e.deltaY * s.dir) / 12; // rough speed, per event
      const p = s.p + step;
      if (p <= 0) {
        // Dragged back to where it started: drop the scrub quietly.
        update(0);
        sc = null;
        document.querySelectorAll('[data-scrub]').forEach((el) => el.removeAttribute('data-scrub'));
        root.classList.remove('is-scrubbing');
        Object.assign(scrub, { from: -1, to: -1, p: 0 });
        return;
      }
      update(p);
      if (s.p >= 1) return finish();
      window.clearTimeout(endTimer);
      endTimer = window.setTimeout(finish, 140);
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (document.querySelector('[data-modal]') || tag === 'INPUT' || tag === 'TEXTAREA') return;
      const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (e.key === 'Home') return goToPage(0);
      if (e.key === 'End') return goToPage(PAGE_COUNT - 1);
      if (!dir || canScrollInside(dir)) return;
      e.preventDefault();
      if (performance.now() >= lockUntil.current) goToPage(pageRef.current + dir);
    };

    // Touch: the drag decides its direction after a few pixels; if the page can still scroll
    // that way it scrolls natively, otherwise the drag scrubs the transition.
    let touch: { y: number; mode: 'pending' | 'native' | 'scrub'; lastY: number; lastT: number; v: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (blocked(e.target) || sc) return void (touch = null);
      const y = e.touches[0].clientY;
      touch = { y, mode: 'pending', lastY: y, lastT: performance.now(), v: 0 };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch) return;
      const y = e.touches[0].clientY;
      const dy = touch.y - y;
      if (touch.mode === 'pending') {
        if (Math.abs(dy) < 10) return;
        const dir = dy > 0 ? 1 : -1;
        if (reduce || canScrollInside(dir) || performance.now() < lockUntil.current || !begin(dir)) {
          touch.mode = 'native';
          return;
        }
        touch.mode = 'scrub';
      }
      if (touch.mode !== 'scrub' || !sc) return;
      e.preventDefault();
      const now = performance.now();
      touch.v = ((touch.lastY - y) * sc.dir) / Math.max(1, now - touch.lastT);
      touch.lastY = y;
      touch.lastT = now;
      update(((touch.y - y) * sc.dir) / (window.innerHeight * 0.55));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touch) return;
      const t = touch;
      touch = null;
      if (t.mode === 'scrub' && sc) {
        sc.v = t.v * 2; // px/ms -> the flick threshold in finish()
        return finish();
      }
      if (t.mode !== 'pending' || !reduce) return;
      // Reduced motion: a plain swipe pages discretely.
      const dy = t.y - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 50) return;
      const dir = dy > 0 ? 1 : -1;
      if (canScrollInside(dir) || performance.now() < lockUntil.current) return;
      goToPage(pageRef.current + dir);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.clearTimeout(endTimer);
      window.clearTimeout(classTimer);
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
  const openContact = () => goToPage(4);

  // Hero capability tags open every matching project, laid out in a row on page 2.
  const handleTagClick = (tag: string) => {
    setOverviewRequest({ filter: tag === 'UX/UI' ? 'UX / UI' : tag, id: Date.now() });
    goToPage(1);
  };

  useLayoutEffect(() => {
    // Stagger order: every revealed element gets its index within its page.
    pageEls.current.forEach((el) =>
      el?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((r, i) => r.style.setProperty('--i', String(i))),
    );
    // Headlines split into characters once fonts are in.
    splitDone.current = prefersReducedMotion() ? Promise.resolve() : splitHeadlines();
    if (!showIntro) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  // Each arrival on a page plays its GSAP layer: the headline wave and lines drawing in. A page
  // reached by a finished drag is shown at once instead.
  useEffect(() => {
    if (!ready) return;
    const el = pageEls.current[page];
    const instant = document.documentElement.classList.contains('scrub-commit');
    splitDone.current.then(() => (instant ? settlePage(el) : playPageIn(el)));
  }, [page, ready]);

  // A specular highlight follows the pointer across glass surfaces (.glass, .glass-dark).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        document.documentElement.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        document.documentElement.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      }
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('.glass, .glass-dark');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
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
      <FilmGrain />
      {showIntro && (
        <Intro
          scenes={SCENE_SRCS}
          onReveal={() => {
            const root = document.documentElement;
            root.classList.add('intro-flare');
            gsap.delayedCall(2, () => root.classList.remove('intro-flare'));
            setReady(true);
          }}
          onDone={() => setShowIntro(false)}
        />
      )}

      <Navigation onOpenSection={handleOpenSection} activeSection={activeSection} light={page === 4} />
      <PageRail
        page={page}
        labels={['Home', 'Work', 'About', 'Services', 'Contact']}
        light={page === 4}
        onSelect={goToPage}
      />

      {/* ONE FIXED BACKDROP: each page has its own scene; scenes only cross-fade. Pages 3 and 4
          lay theirs out on the shared stage, so 3 → 4 dissolves the figure out of the terrace. */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SCENES.map(({ src, staged, tint }, i) => (
          <div key={src} data-scene={i} className={`scene-layer ${stateOf(i)}`}>
            <img
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${staged ? 'scene-fill' : ''}`}
              draggable={false}
            />
            {staged && <img src={src} alt="" className="stage-scene" draggable={false} />}
            {tint && <div className={tint} />}
            {i === 0 && <SphereLight />}
            {(i === 0 || i === 2) && <LightRays />}
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
        <DigitalWorlds isActive={page === 1} onOpenContact={openContact} overviewRequest={overviewRequest} />
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

    </div>
  );
}
