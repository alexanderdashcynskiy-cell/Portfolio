import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(SplitText, DrawSVGPlugin);

/*
 * GSAP layer on top of the page choreography in index.css:
 * - headlines split into characters that resolve out of a blur as a wave;
 * - the page label's underline, dividers, rules and icon strokes draw themselves in.
 * Pages arriving by a finished drag (scrub) are shown at once: the gesture was the reveal.
 */

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON_PARTS = 'path, line, circle, rect, polyline, polygon, ellipse';
const ICONS = '.about-principle-icon, .services-card-icon';

/** Splits every headline line into characters once fonts are ready. */
export async function splitHeadlines(root: ParentNode = document) {
  await document.fonts?.ready;
  root.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach((el) => {
    if (el.classList.contains('is-split')) return;
    SplitText.create(el, { type: 'chars', charsClass: 'ch', aria: 'auto' });
    el.classList.add('is-split');
  });
}

const parts = (page: HTMLElement) => ({
  chars: page.querySelectorAll<HTMLElement>('.is-split .ch'),
  eyebrows: page.querySelectorAll<HTMLElement>('.page-eyebrow'),
  dividers: page.querySelectorAll<HTMLElement>('.about-divider, .services-stack-divider'),
  rules: page.querySelectorAll<HTMLElement>('.services-card-rule'),
  strokes: page.querySelectorAll<SVGElement>(`:is(${ICONS}) :is(${ICON_PARTS})`),
});

/** Shows a page's GSAP-driven parts in their final state, with no motion. */
export function settlePage(page: HTMLElement | null | undefined) {
  if (!page) return;
  const p = parts(page);
  gsap.killTweensOf([...p.chars, ...p.eyebrows, ...p.dividers, ...p.rules, ...p.strokes]);
  gsap.set(p.chars, { opacity: 1, clearProps: 'filter' });
  gsap.set([...p.eyebrows, ...p.dividers, ...p.rules], { clearProps: 'backgroundSize,transform' });
  gsap.set(p.strokes, { drawSVG: '100%' });
}

/** Plays a page's arrival: the headline wave and the lines drawing themselves in. */
export function playPageIn(page: HTMLElement | null | undefined, delay = 0.32) {
  if (!page) return;
  if (prefersReducedMotion()) return settlePage(page);
  const p = parts(page);
  gsap.killTweensOf([...p.chars, ...p.eyebrows, ...p.dividers, ...p.rules, ...p.strokes]);
  const tl = gsap.timeline({ delay });
  tl.fromTo(
    p.chars,
    { opacity: 0, filter: 'blur(8px)' },
    { opacity: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out', stagger: 0.024, clearProps: 'filter' },
    0,
  );
  p.eyebrows.forEach((el) => {
    const end = getComputedStyle(el).backgroundSize;
    tl.fromTo(el, { backgroundSize: `0px ${end.split(' ')[1] ?? '1px'}` }, { backgroundSize: end, duration: 0.9, ease: 'power2.inOut', clearProps: 'backgroundSize' }, 0.1);
  });
  if (p.dividers.length)
    tl.fromTo(p.dividers, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 1.1, ease: 'power2.inOut', stagger: 0.09, clearProps: 'transform' }, 0.35);
  if (p.rules.length)
    tl.fromTo(p.rules, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1, ease: 'power2.inOut', stagger: 0.08, clearProps: 'transform' }, 0.45);
  if (p.strokes.length)
    tl.fromTo(p.strokes, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut', stagger: 0.02 }, 0.4);
}

export { gsap };
