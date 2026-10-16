import { gsap } from './gsapMotion';

/*
 * Scene-wide motion variables, written only onto the few elements that read them. Setting
 * them on <html> would make every element in the document recalculate its styles on every
 * pointer move or animation frame.
 */

// Pointer position in -1..1, read by the depth parallax and the sphere's light.
const PARALLAX = '.scene-root, .about-stage, .worlds-page, .hero-copy, .about-copy, .services-copy, .contact-copy, .sphere-lean, .sphere-caustic';
// The sun's height (0 → 1 from page 1 to page 5), read by the warm grade, glass rims and glare.
const SUN = '.sun-grade, .glass, .glass-dark, .glare';

let parallaxEls: HTMLElement[] = [];
let parallaxAt = 0;
let pending: { x: number; y: number } | null = null;

export function setPointer(x: number, y: number) {
  const first = !pending;
  pending = { x, y };
  if (!first) return;
  requestAnimationFrame((t) => {
    if (!pending) return;
    if (t - parallaxAt > 1000 || parallaxEls.some((el) => !el.isConnected)) {
      parallaxEls = [...document.querySelectorAll<HTMLElement>(PARALLAX)];
      parallaxAt = t;
    }
    const px = pending.x.toFixed(3);
    const py = pending.y.toFixed(3);
    pending = null;
    for (const el of parallaxEls) {
      el.style.setProperty('--px', px);
      el.style.setProperty('--py', py);
    }
  });
}

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
