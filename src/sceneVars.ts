import { gsap } from './gsapMotion';

/*
 * Scene-wide motion, written only onto the few elements that use it. Setting it on <html>
 * (or as inherited custom properties on large subtrees) would restyle the whole document on
 * every pointer move or animation frame.
 */

// Pointer parallax. Each element gets its transform written directly (no inherited custom
// properties), so a pointer move restyles only these few elements, not their subtrees.
const SCENE = '.scene-root, .about-stage, .worlds-page'; // moves with the scenes
const NEAR = '.hero-copy, .about-copy, .services-copy, .contact-copy'; // headlines, a little nearer
const DEPTH_MQ = '(hover: hover) and (pointer: fine) and (min-width: 768px) and (min-aspect-ratio: 4/3)';

let cache: { scene: HTMLElement[]; near: HTMLElement[]; lean: HTMLElement[]; caustic: HTMLElement[] } | null = null;
let cacheAt = 0;
let pending: { x: number; y: number } | null = null;
const query = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)];

function elements(t: number) {
  if (!cache || t - cacheAt > 1000 || cache.scene.some((el) => !el.isConnected)) {
    cache = { scene: query(SCENE), near: query(NEAR), lean: query('.sphere-lean'), caustic: query('.sphere-caustic') };
    cacheAt = t;
  }
  return cache;
}

export function setPointer(x: number, y: number) {
  const first = !pending;
  pending = { x, y };
  if (!first) return;
  requestAnimationFrame((t) => {
    if (!pending) return;
    const { x: px, y: py } = pending;
    pending = null;
    const els = elements(t);
    // The sphere's glint leans toward the pointer, its caustic away (always on).
    const hc = Math.max(window.innerWidth / 1536, window.innerHeight / 1024);
    els.lean.forEach((el) => (el.style.transform = `translate3d(${(px * 4).toFixed(2)}%, ${(py * 3).toFixed(2)}%, 0)`));
    els.caustic.forEach((el) => (el.style.transform = `translate3d(${(px * -14 * hc).toFixed(1)}px, 0, 0)`));
    if (!window.matchMedia(DEPTH_MQ).matches) return;
    const scene = `translate3d(${(px * -9).toFixed(2)}px, ${(py * -6).toFixed(2)}px, 0) scale(1.03)`;
    const near = `translate3d(${(px * -7).toFixed(2)}px, ${(py * -4).toFixed(2)}px, 0)`;
    els.scene.forEach((el) => (el.style.transform = scene));
    els.near.forEach((el) => (el.style.transform = near));
  });
}

// Leaving the depth layout (a narrow window, a touch screen) drops the parallax transforms.
if (typeof window !== 'undefined') {
  window.matchMedia(DEPTH_MQ).addEventListener('change', (e) => {
    if (e.matches) return;
    query(`${SCENE}, ${NEAR}`).forEach((el) => (el.style.transform = ''));
  });
}

// The sun's height (0 → 1 from page 1 to page 5), read by the warm grade, glass rims and glare.
const SUN = '.sun-grade, .glass, .glass-dark, .glare';

const sun = { v: 0 };
let sunTween: gsap.core.Tween | null = null;

function writeSun() {
  const v = sun.v.toFixed(4);
  document.querySelectorAll<HTMLElement>(SUN).forEach((el) => el.style.setProperty('--sun', v));
}

/** Sets the sun at once (during a gesture). */
export function setSun(v: number) {
  sunTween?.kill();
  sun.v = v;
  writeSun();
}

/** Lets the sun ease to a new height (after a page change). */
export function easeSun(v: number) {
  sunTween?.kill();
  sunTween = gsap.to(sun, { v, duration: 1.6, ease: 'power2.inOut', onUpdate: writeSun });
}
