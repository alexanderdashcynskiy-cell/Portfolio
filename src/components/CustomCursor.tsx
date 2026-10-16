import React, { useEffect, useRef } from 'react';

/*
 * A subtle dot that follows a mouse, growing into a bronze ring over anything clickable.
 * It moves by transform from a requestAnimationFrame, outside React, so following the pointer
 * costs no re-renders and no layout; the dot/ring change is a 160ms transition on scale.
 */
const CLICKABLE = 'button, a, [role="button"], .cursor-pointer, input, textarea, label';

export const CustomCursor: React.FC = () => {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    let x = -100;
    let y = -100;
    let queued = false;
    let pointer = false;

    const draw = () => {
      queued = false;
      o.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      o.style.opacity = '1';
      if (!queued) {
        queued = true;
        requestAnimationFrame(draw);
      }
      const over = !!(e.target as Element | null)?.closest?.(CLICKABLE);
      if (over !== pointer) {
        pointer = over;
        i.classList.toggle('is-pointer', over);
      }
    };
    const onLeave = () => (o.style.opacity = '0');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={outer} className="cursor-follow" style={{ opacity: 0 }} aria-hidden="true">
      <div ref={inner} className="cursor-dot" />
    </div>
  );
};
