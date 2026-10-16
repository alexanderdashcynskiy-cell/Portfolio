import React, { useEffect, useRef } from 'react';
import { gsap } from '../gsapMotion';

interface IntroProps {
  /** Every scene image, preloaded while the intro plays. */
  scenes: string[];
  /** Called as the light comes up: the first page starts its entrance. */
  onReveal: () => void;
  onDone: () => void;
}

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

/**
 * First visit: the site opens like the start of a film. Dark, then a warm glow rises where
 * the sphere sits, the terrace comes up out of it, the sphere flares and the headline
 * assembles. The scenes of every page load in the meantime.
 */
export const Intro: React.FC<IntroProps> = ({ scenes, onReveal, onDone }) => {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const cb = useRef({ onReveal, onDone });
  cb.current = { onReveal, onDone };

  useEffect(() => {
    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;
    const all = Promise.all(scenes.map(loadImage));
    // Start once the first scene is in (or after 2.5s at worst); the rest keep loading.
    const first = Promise.race([loadImage(scenes[0]), new Promise((r) => setTimeout(r, 2500))]);
    const minimum = new Promise((r) => setTimeout(r, 450));
    Promise.all([first, minimum]).then(() => {
      if (cancelled) return;
      tl = gsap.timeline({ onComplete: () => cb.current.onDone() });
      tl.fromTo(glow.current, { opacity: 0, scale: 0.25 }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
        .call(() => cb.current.onReveal(), [], 0.55)
        .to(root.current, { opacity: 0, duration: 1.3, ease: 'power2.inOut' }, 0.5)
        .to(glow.current, { scale: 1.8, duration: 1.3, ease: 'power2.out' }, 0.5);
    });
    void all;
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, [scenes]);

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div ref={glow} className="intro-glow" />
    </div>
  );
};
