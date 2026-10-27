import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

/*
 * Devices for the 16:9 film. Both sit in the right column (x ≥ 830); the left column is for text.
 * Phone captures are 1290×2796 (430 pt wide); CRM captures are 1512×982 CSS px.
 */
export const PH = { w: 410, h: 410 * (2796 / 1290), bezel: 14 };
PH.h = Math.round(PH.h);
export const PH_X = 1440 - (PH.w + PH.bezel * 2) / 2;
export const PH_Y = (1080 - (PH.h + PH.bezel * 2)) / 2;
/** iPhone points → phone screen pixels. */
export const ppt = (v: number) => (v * PH.w) / 430;

/** A slow, living 3D pose: the device turned toward the text column, breathing a few degrees. */
const usePose = (ry: number, rx: number) => {
  const frame = useCurrentFrame();
  return `perspective(2400px) rotateY(${ry + Math.sin(frame / 45) * 2}deg) rotateX(${rx + Math.sin(frame / 60 + 1) * 1.2}deg)`;
};

/** A glass sheen that sweeps across a screen once, as the device arrives. */
export const Sheen: React.FC<{ at?: number }> = ({ at = 4 }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at, at + 26], [-60, 160], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20, background: `linear-gradient(115deg, transparent ${x - 20}%, rgba(255,255,255,0.28) ${x}%, transparent ${x + 18}%)` }} />
  );
};

/** A soft contact shadow on the «floor» under a device. */
const Floor: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, height: 60, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(45,21,5,0.28), rgba(45,21,5,0))', filter: 'blur(6px)' }} />
);

export const Phone: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  const pose = usePose(-14, 5);
  return (
    <>
      <Floor x={PH_X + (PH.w + PH.bezel * 2) / 2 - 30} y={PH_Y + PH.h + PH.bezel * 2 - 6} w={PH.w + 120} />
      <div
        style={{
          position: 'absolute',
          left: PH_X,
          top: PH_Y,
          width: PH.w + PH.bezel * 2,
          height: PH.h + PH.bezel * 2,
          padding: PH.bezel,
          borderRadius: 66,
          background: 'linear-gradient(135deg, #2a211b, #0f0a07 60%)',
          boxShadow: '30px 50px 90px rgba(60,30,10,0.30), 8px 12px 24px rgba(60,30,10,0.18), inset 0 0 0 2px #4a3e35, inset 0 0 0 5px #0c0907',
          transform: pose,
          ...style,
        }}
      >
        <div style={{ position: 'relative', width: PH.w, height: PH.h, borderRadius: 54, overflow: 'hidden', background: '#000' }}>
          {children}
          <Sheen />
        </div>
      </div>
    </>
  );
};

export const PhoneScreen: React.FC<{ name: string; style?: React.CSSProperties }> = ({ name, style }) => (
  <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: 'absolute', left: 0, top: 0, width: PH.w, height: PH.h, ...style }} />
);

export const LP = { w: 1000, h: Math.round(1000 * (982 / 1512)), x: 840, bezel: 18 };
export const LP_Y = 175;
/** CRM capture pixels → laptop screen pixels. */
export const lpx = (v: number) => (v * LP.w) / 1512;

export const Laptop: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  const pose = usePose(-10, 4);
  return (
  <>
  <Floor x={LP.x + LP.w / 2} y={LP_Y + LP.h + 40} w={LP.w + 160} />
  <div style={{ position: 'absolute', left: LP.x - LP.bezel, top: LP_Y - LP.bezel, transform: pose, transformOrigin: '50% 100%', ...style }}>
    <div style={{ width: LP.w + LP.bezel * 2, height: LP.h + LP.bezel * 2, padding: LP.bezel, borderRadius: 28, background: 'linear-gradient(135deg, #2a231e, #110d0a 60%)', boxShadow: 'inset 0 0 0 2px #4a4038, 30px 40px 80px rgba(60,30,10,0.22)' }}>
      <div style={{ position: 'relative', width: LP.w, height: LP.h, borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
        {children}
        <Sheen />
      </div>
    </div>
    <div style={{ position: 'relative', width: LP.w + LP.bezel * 2 + 100, marginLeft: -50, height: 24, borderRadius: '0 0 24px 24px', background: 'linear-gradient(#cfc8c0, #a59d95)', boxShadow: '0 40px 70px rgba(60,30,10,0.3)' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, width: 150, height: 10, marginLeft: -75, borderRadius: '0 0 10px 10px', background: '#8f877f' }} />
    </div>
  </div>
  </>
  );
};

/**
 * A CRM capture on the laptop screen, zoomed like a screen recording: `t` 0→1 eases from the whole
 * page to `zoom`× around (fx, fy) in capture pixels, never showing past the page edges.
 */
export const LaptopScreen: React.FC<{ name: string; t?: number; fx?: number; fy?: number; zoom?: number; children?: React.ReactNode }> = ({
  name,
  t = 0,
  fx = 756,
  fy = 491,
  zoom = 1,
  children,
}) => {
  const s = 1 + (zoom - 1) * t;
  const clampTo = (v: number, min: number) => Math.min(0, Math.max(min, v));
  const tx = clampTo(LP.w / 2 - lpx(fx) * s, LP.w - LP.w * s);
  const ty = clampTo(LP.h / 2 - lpx(fy) * s, LP.h - LP.h * s);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: LP.w, height: LP.h, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
      <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {children}
    </div>
  );
};
