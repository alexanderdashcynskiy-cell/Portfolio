import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Accent, C, Hud, MONO, Phone, SANS, Tap, usePop, Words } from '../ui';

// Tap points on the 540×1170 screen (the 780×1688 captures scaled by 0.692).
const PLUS_A = { x: 346, y: 976 };
const PLUS_B = { x: 108, y: 961 };
const CART = { x: 483, y: 80 };
const CHECKOUT = { x: 429, y: 1073 };
const TAPS = [28, 40, 52];

/** 03 — the real Mini App: three taps into the cart, one to check out. */
export const Shop: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const phone = usePop(0, 120, 17);
  const count = TAPS.filter((t) => frame >= t).length;
  const badge = usePop(TAPS[0], 400, 12);
  const bump = TAPS.reduce((b, t) => (frame >= t && frame < t + 8 ? 1 + (8 - (frame - t)) * 0.04 : b), 1);
  const toCart = interpolate(frame, [76, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slide = 1 - Math.pow(1 - toCart, 3);
  const sheet = usePop(104, 160, 18);
  const check = interpolate(frame, [112, 126], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 03 — mini app" offset={offset} />
      <div style={{ position: 'absolute', left: 64, top: 150, fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.03em' }}>
        <Words at={4}>{['Заказ']}</Words>
        <br />
        <Words at={12} step={7}>
          {['в', <Accent key="a">два касания.</Accent>]}
        </Words>
      </div>

      <Phone style={{ left: 250, top: 520, transform: `translateY(${(1 - phone) * 1300}px) rotate(${(1 - phone) * -8}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-slide * 540}px)` }}>
          <Img src={staticFile('img/shop-home.png')} style={{ position: 'absolute', left: 0, top: 0, width: 540 }} />
          <Img src={staticFile('img/shop-cart.png')} style={{ position: 'absolute', left: 540, top: 0, width: 540 }} />
        </div>

        {count > 0 && toCart < 1 && (
          <div
            style={{
              position: 'absolute',
              left: 498,
              top: 34,
              minWidth: 34,
              height: 34,
              borderRadius: 17,
              background: '#EF4444',
              color: '#fff',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${badge * bump}) translateX(${-slide * 540}px)`,
              boxShadow: '0 4px 10px rgba(239,68,68,0.45)',
            }}
          >
            {count}
          </div>
        )}

        {/* The order goes through: a sheet rises over the cart. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 520,
            background: C.paper,
            borderRadius: '48px 48px 0 0',
            boxShadow: '0 -20px 60px rgba(60,30,10,0.2)',
            transform: `translateY(${(1 - sheet) * 560}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 70,
          }}
        >
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="68" fill="#22A06B" />
            <path d="M44 78 L66 99 L107 55" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
          </svg>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.ink, marginTop: 34 }}>Заказ принят</div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.muted, marginTop: 14 }}>#1244 · самовывоз 14:30</div>
        </div>

        {TAPS.map((t, i) => (
          <Tap key={t} at={t} {...(i === 1 ? PLUS_B : PLUS_A)} />
        ))}
        <Tap at={68} {...CART} />
        <Tap at={98} {...CHECKOUT} />
      </Phone>
    </AbsoluteFill>
  );
};
