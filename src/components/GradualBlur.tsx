import React from 'react';

/*
 * Gradual blur (adapted from React Bits): stacked layers with rising blur, each masked to a
 * band, so content dissolves into the edge instead of being cut. Shown on stacked layouts.
 */
const LAYERS = 5;

const Band: React.FC<{ edge: 'top' | 'bottom' }> = ({ edge }) => (
  <div className={`gradual-blur gradual-blur-${edge}`} aria-hidden="true">
    {Array.from({ length: LAYERS }, (_, i) => {
      const blur = 0.6 * 2 ** i; // 0.6 … 9.6px
      const step = 100 / LAYERS;
      const a = i * step;
      const b = (i + 1) * step;
      const dir = edge === 'top' ? 'to top' : 'to bottom';
      const mask = `linear-gradient(${dir}, transparent ${Math.max(0, a - step)}%, #000 ${a}%, #000 ${b}%, transparent ${Math.min(100, b + step)}%)`;
      return (
        <span
          key={i}
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      );
    })}
  </div>
);

export const GradualBlur: React.FC = () => (
  <>
    <Band edge="top" />
    <Band edge="bottom" />
  </>
);
