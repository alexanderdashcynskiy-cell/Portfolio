import React, { useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';

/*
 * Atmosphere for the scenes, adapted from Magic UI (MIT): slow shafts of late sunlight
 * (Light Rays) and a fine film grain over the whole site (Noise Texture).
 */

interface Ray {
  id: number;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
  intensity: number;
}

// Shafts fall from the top, leaning left as if the low sun stood to the right.
const createRays = (count: number, cycle: number): Ray[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 38 + Math.random() * 58,
    rotate: 22 + Math.random() * 16,
    width: 120 + Math.random() * 180,
    swing: 0.6 + Math.random() * 1.4,
    delay: Math.random() * cycle,
    duration: cycle * (0.8 + Math.random() * 0.5),
    intensity: 0.6 + Math.random() * 0.4,
  }));

interface LightRaysProps {
  count?: number;
  /** Seconds per breath of a ray. */
  speed?: number;
  className?: string;
}

export const LightRays: React.FC<LightRaysProps> = ({ count = 6, speed = 16, className = '' }) => {
  const [rays, setRays] = useState<Ray[]>([]);
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setRays(createRays(count, speed));
  }, [count, speed]);

  return (
    <div className={`light-rays ${className}`} aria-hidden="true">
      <div className="light-rays-glow" />
      {rays.map(({ id, left, rotate, width, swing, delay, duration, intensity }) => (
        <motion.div
          key={id}
          className="light-ray"
          style={{ left: `${left}%`, width } as CSSProperties}
          initial={{ rotate, opacity: still ? intensity * 0.6 : 0 }}
          animate={
            still
              ? undefined
              : { opacity: [0, intensity, 0], rotate: [rotate - swing, rotate + swing, rotate - swing] }
          }
          transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay, repeatDelay: duration * 0.1 }}
        />
      ))}
    </div>
  );
};

/** Fine film grain: a small noise tile drawn once, drifting a few pixels a few times a second. */
export const FilmGrain: React.FC = () => {
  const [tile, setTile] = useState('');
  useEffect(() => {
    const size = 160;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setTile(c.toDataURL('image/png'));
  }, []);
  if (!tile) return null;
  return <div className="film-grain" style={{ backgroundImage: `url(${tile})` }} aria-hidden="true" />;
};
