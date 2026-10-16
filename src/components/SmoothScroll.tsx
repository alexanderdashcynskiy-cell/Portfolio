import { useEffect } from 'react';
import Lenis from 'lenis';

/*
 * Lenis smooth scrolling, only where content scrolls inside a page: the stacked layouts on
 * narrow windows and the lifted card's project panel. The full-screen paging itself stays
 * gesture-driven (see App). Touch keeps the platform's own scrolling, which is already
 * inertial; Lenis smooths wheel and trackpad scrolling.
 */
const SELECTOR = '.site-page, .lift-back-body';

export const SmoothScroll: React.FC = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const instances = new Map<HTMLElement, Lenis>();

    const sync = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        const scrollable = el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY !== 'hidden';
        const has = instances.get(el);
        if (scrollable && !has && el.firstElementChild) {
          instances.set(
            el,
            new Lenis({
              wrapper: el,
              content: el.firstElementChild as HTMLElement,
              lerp: 0.09,
              wheelMultiplier: 0.9,
              autoRaf: true,
            }),
          );
        } else if (!scrollable && has) {
          has.destroy();
          instances.delete(el);
        }
      });
      instances.forEach((lenis, el) => {
        if (!el.isConnected) {
          lenis.destroy();
          instances.delete(el);
        }
      });
    };

    sync();
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
      instances.forEach((l) => l.destroy());
    };
  }, []);
  return null;
};
