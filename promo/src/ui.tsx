import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/* Brand: the Mini App's own warm palette, cut down to two loud colours like a poster. */
export const C = {
  cream: '#FBF6EE',
  paper: '#FFFFFF',
  ink: '#2D1505',
  muted: '#A07850',
  orange: '#D0692A',
  gold: '#E8B430',
  night: '#1C1009',
  line: 'rgba(45, 21, 5, 0.1)',
};

export const SANS = 'Montserrat, sans-serif';
export const SERIF = '"Playfair Display", serif';
export const MONO = '"JetBrains Mono", monospace';

/** 0→1 spring that starts at `at` frames into the current sequence. */
export const usePop = (at: number, stiffness = 170, damping = 15) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { stiffness, damping } });
};

/** Linear 0→1 between two frames, clamped. */
export const useRamp = (from: number, to: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** The accent word: Playfair italic in the brand orange, drawn with a hand stroke under it. */
export const Accent: React.FC<{ children: React.ReactNode; color?: string; underline?: number }> = ({
  children,
  color = C.orange,
  underline,
}) => (
  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color, position: 'relative', letterSpacing: '-0.01em' }}>
    {children}
    {underline !== undefined && (
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: 'absolute', left: '4%', bottom: '-0.12em', width: '92%', height: '0.2em', overflow: 'visible' }}>
        <path
          d="M2 8 C 30 2, 70 2, 98 6"
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - underline}
        />
      </svg>
    )}
  </span>
);

/** Words that rise in one after another. Each child is one word. */
export const Words: React.FC<{ at: number; step?: number; children: React.ReactNode[]; style?: React.CSSProperties }> = ({
  at,
  step = 5,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={style}>
      {children.map((w, i) => {
        const p = spring({ frame: frame - at - i * step, fps, config: { stiffness: 210, damping: 18 } });
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', padding: '0 0.04em 0.12em', margin: '0 0 -0.12em' }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, opacity: p > 0.01 ? 1 : 0 }}>{w}</span>
            {i < children.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </span>
  );
};

/** Corner labels, like a cut from an editor: chapter on the left, brand and timecode on the right. */
export const Hud: React.FC<{ chapter: string; dark?: boolean; offset: number }> = ({ chapter, dark, offset }) => {
  const frame = useCurrentFrame() + offset;
  const f = String(frame % 30).padStart(2, '0');
  const s = String(Math.floor(frame / 30)).padStart(2, '0');
  const color = dark ? 'rgba(251,246,238,0.45)' : 'rgba(45,21,5,0.4)';
  const st: React.CSSProperties = { position: 'absolute', top: 56, fontFamily: MONO, fontSize: 22, letterSpacing: '0.04em', color };
  return (
    <>
      <div style={{ ...st, left: 56 }}>{chapter}</div>
      <div style={{ ...st, right: 56 }}>MAMINHLEB&nbsp;&nbsp;00:00:{s}:{f}</div>
    </>
  );
};

/** A fine still grain over everything, so flat colour reads as print rather than screen. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity }}>
    <svg width="100%" height="100%">
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.2" />
      </filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

/** The mascot: the bakery's cappuccino, breathing a little and leaning into its lines. */
export const Cup: React.FC<{ size: number; style?: React.CSSProperties; bob?: boolean; steam?: boolean }> = ({ size, style, bob = true, steam = true }) => {
  const frame = useCurrentFrame();
  const y = bob ? Math.sin(frame / 9) * size * 0.015 : 0;
  const sq = bob ? 1 + Math.sin(frame / 9 + 1.2) * 0.012 : 1;
  return (
    <div style={{ position: 'absolute', width: size, height: size * 0.686, ...style }}>
      {steam &&
        [0, 1, 2].map((i) => {
          const t = ((frame + i * 18) % 54) / 54;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${36 + i * 9}%`,
                top: `${-4 - t * 30}%`,
                width: size * 0.05,
                height: size * 0.16,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
                filter: `blur(${size * 0.018}px)`,
                opacity: Math.sin(t * Math.PI) * 0.4,
                transform: `translateX(${Math.sin(t * 6 + i) * size * 0.02}px) scaleY(${0.7 + t * 0.6})`,
              }}
            />
          );
        })}
      <Img
        src={staticFile('img/cup.png')}
        style={{ width: '100%', height: '100%', transform: `translateY(${y}px) scale(${2 - sq}, ${sq})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 30px 40px rgba(60,30,10,0.28))' }}
      />
    </div>
  );
};

/** A speech bubble that pops out of the mascot. */
export const Bubble: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ at, children, style, dark }) => {
  const p = usePop(at, 260, 14);
  return (
    <div
      style={{
        position: 'absolute',
        padding: '18px 30px',
        borderRadius: 40,
        border: `3px solid ${dark ? C.cream : C.ink}`,
        background: dark ? C.night : C.paper,
        color: dark ? C.cream : C.ink,
        fontFamily: MONO,
        fontSize: 34,
        transform: `scale(${p})`,
        transformOrigin: '100% 100%',
        opacity: p > 0.02 ? 1 : 0,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A phone in a dark bezel. Screen is 540×1170 so the Mini App captures (780×1688 at 2×) fill it. */
export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: 'absolute',
      width: 580,
      height: 1210,
      borderRadius: 86,
      background: '#120a05',
      padding: 20,
      boxShadow: '0 60px 120px rgba(60,30,10,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)',
      ...style,
    }}
  >
    <div style={{ position: 'relative', width: 540, height: 1170, borderRadius: 68, overflow: 'hidden', background: C.cream }}>
      {children}
      <div style={{ position: 'absolute', top: 18, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 30, background: '#120a05', zIndex: 10 }} />
    </div>
  </div>
);

/** A fingertip: lands, presses, ripples. Coordinates are in the parent's space. */
export const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -10 || t > 26) return null;
  const land = interpolate(t, [-10, 0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const press = t >= 0 && t < 6 ? 0.82 : 1;
  const ripple = interpolate(t, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const out = interpolate(t, [16, 26], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', opacity: out }}>
      {t >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: -60,
            top: -60,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `4px solid ${C.orange}`,
            transform: `scale(${0.3 + ripple * 0.9})`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: -34,
          top: -34,
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.75)',
          border: `3px solid ${C.ink}`,
          boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
          transform: `translate(${(1 - land) * 60}px, ${(1 - land) * 90}px) scale(${press})`,
          opacity: land,
        }}
      />
    </div>
  );
};

/** A white card with a mono label, the building block of the CRM scene. */
export const Panel: React.FC<{ label: string; at: number; style?: React.CSSProperties; children?: React.ReactNode; right?: React.ReactNode }> = ({
  label,
  at,
  style,
  children,
  right,
}) => {
  const p = usePop(at, 190, 18);
  return (
    <div
      style={{
        position: 'absolute',
        background: C.paper,
        borderRadius: 40,
        border: `2px solid ${C.line}`,
        boxShadow: '0 20px 50px rgba(60,30,10,0.08)',
        padding: 36,
        overflow: 'hidden',
        transform: `translateY(${(1 - p) * 80}px) scale(${0.94 + p * 0.06})`,
        opacity: Math.min(1, p * 1.5),
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 22, color: C.muted, marginBottom: 18 }}>
        <span>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
};
