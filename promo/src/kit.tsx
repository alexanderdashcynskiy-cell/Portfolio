import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SANS, Words } from './ui';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);

/** 0→1 over [from, to] with an ease. */
export const useTween = (from: number, to: number, ease: (t: number) => number = easeInOut) => {
  const frame = useCurrentFrame();
  return ease(interpolate(frame, [from, to], [0, 1], clamp));
};

/** A sound effect at a frame of the current sequence. */
export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 1 }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/**
 * The scene title: two short lines in the top safe zone (below the Reels/TikTok header).
 * Each line is a list of words; an <Accent> counts as one word.
 */
export const Caption: React.FC<{ lines: React.ReactNode[][]; at?: number; size?: number; color?: string; top?: number }> = ({
  lines,
  at = 0,
  size = 92,
  color = C.ink,
  top = 190,
}) => (
  <div style={{ position: 'absolute', left: 64, right: 64, top, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.04, color, letterSpacing: '-0.03em' }}>
    {lines.map((words, i) => (
      <React.Fragment key={i}>
        <Words at={at + i * 8} step={5}>
          {words}
        </Words>
        <br />
      </React.Fragment>
    ))}
  </div>
);

/*
 * A full iPhone: the captures are complete 1290×2796 screens (status bar and island included),
 * so the bezel only frames them. Coordinates passed to children are in the capture's CSS points
 * (430 wide); `pt` converts them to screen pixels.
 */
export const PHONE = { screenW: 650, screenH: 650 * (2796 / 1290), bezel: 18 };
export const pt = (v: number) => (v * PHONE.screenW) / 430;

export const IPhone: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      position: 'absolute',
      left: (1080 - PHONE.screenW - PHONE.bezel * 2) / 2,
      top: 420,
      width: PHONE.screenW + PHONE.bezel * 2,
      height: PHONE.screenH + PHONE.bezel * 2,
      padding: PHONE.bezel,
      borderRadius: 104,
      background: '#15100c',
      boxShadow: '0 70px 120px rgba(60,30,10,0.33), inset 0 0 0 3px #3a302a, inset 0 0 0 6px #0c0907',
      ...style,
    }}
  >
    <div style={{ position: 'relative', width: PHONE.screenW, height: PHONE.screenH, borderRadius: 88, overflow: 'hidden', background: '#000' }}>{children}</div>
  </div>
);

/** One capture filling the phone screen. */
export const Screen: React.FC<{ name: string; style?: React.CSSProperties }> = ({ name, style }) => (
  <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: 'absolute', left: 0, top: 0, width: PHONE.screenW, height: PHONE.screenH, ...style }} />
);

/*
 * A laptop: the CRM captures are 1512×982 CSS px (a MacBook Pro 14"), shown on a 960-wide screen.
 * `lx`/`ly` convert capture pixels to positions on that screen.
 */
export const LAPTOP = { screenW: 960, screenH: 960 * (982 / 1512), x: 60, y: 760, bezel: 22 };
export const lx = (v: number) => (v * LAPTOP.screenW) / 1512;

export const Laptop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { screenW, screenH, x, y, bezel } = LAPTOP;
  return (
    <div style={{ position: 'absolute', left: x - bezel, top: y - bezel }}>
      <div style={{ width: screenW + bezel * 2, height: screenH + bezel * 2, padding: bezel, borderRadius: 34, background: '#16120f', boxShadow: 'inset 0 0 0 2px #3a322c' }}>
        <div style={{ position: 'relative', width: screenW, height: screenH, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>{children}</div>
      </div>
      <div style={{ position: 'relative', width: screenW + bezel * 2 + 120, marginLeft: -60, height: 30, borderRadius: '0 0 30px 30px', background: 'linear-gradient(#cfc8c0, #a59d95)', boxShadow: '0 40px 70px rgba(60,30,10,0.35)' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 170, height: 12, marginLeft: -85, borderRadius: '0 0 12px 12px', background: '#8f877f' }} />
      </div>
    </div>
  );
};

/** A red count badge that pops whenever its number changes. */
export const Badge: React.FC<{ count: number; changedAt: number; x: number; y: number; size?: number }> = ({ count, changedAt, x, y, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - changedAt, fps, config: { stiffness: 420, damping: 11 } });
  if (count <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: '#EF4444',
        border: '3px solid #fff',
        color: '#fff',
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size * 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${0.6 + p * 0.4 + (1 - p) * 0.3})`,
        boxShadow: '0 4px 10px rgba(239,68,68,0.45)',
      }}
    >
      {count}
    </div>
  );
};
