import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Accent, C, Hud, MONO, Phone, SANS, Tap, usePop, Words } from '../ui';

/*
 * The Mini App captured at 430×880 CSS px (an iPhone Pro Max screen under its status bar), shown
 * on the 540×1170 phone screen: K scales app pixels to screen pixels, BAR is the status bar.
 * Tap points are the real button centres from the capture (see coords in the capture script).
 */
const K = 540 / 430;
const BAR = 1170 - 880 * K;
const HEADER = 158; // the app's sticky header, CSS px
const SCROLL = 440; // how far the feed scrolls to reach «Рекомендуемые», CSS px
const at = (x: number, y: number, scroll = 0) => ({ x: x * K, y: BAR + (y - scroll) * K });

const PEREPECHI = at(270, 689);
const CROISSANT = at(191, 1125, SCROLL);
const DONUT = at(390, 1126, SCROLL);
const CART = at(389, 49);
const CHECKOUT = at(332, 802);
const ADDS = [26, 60, 72];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** iOS-style status bar in the app's own background colour. */
const StatusBar: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#FFFDF9', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 46px 0 54px', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: C.ink }}>
    <span>9:41</span>
    <svg width="96" height="22" viewBox="0 0 96 22" fill={C.ink}>
      <rect x="0" y="14" width="5" height="7" rx="1.5" />
      <rect x="8" y="10" width="5" height="11" rx="1.5" />
      <rect x="16" y="6" width="5" height="15" rx="1.5" />
      <rect x="24" y="2" width="5" height="19" rx="1.5" />
      <path d="M46 7a13 13 0 0 1 17 0l-2.4 2.6a9.5 9.5 0 0 0-12.2 0Zm4 4.4a7 7 0 0 1 9 0l-4.5 5Z" />
      <rect x="69" y="3" width="23" height="15" rx="4" fill="none" stroke={C.ink} strokeWidth="1.6" opacity="0.5" />
      <rect x="71.5" y="5.5" width="17" height="10" rx="2.2" />
      <rect x="93.5" y="8" width="2" height="5" rx="1" opacity="0.5" />
    </svg>
  </div>
);

/** 03 — the real Mini App: three items into the cart, then one tap to check out. */
export const Shop: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const phone = usePop(0, 120, 17);
  const scroll = inOut(interpolate(frame, [36, 54], [0, 1], clamp)) * SCROLL;
  const count = ADDS.filter((t) => frame >= t).length;
  const badge = usePop(ADDS[0], 400, 12);
  const bump = ADDS.reduce((b, t) => (frame >= t && frame < t + 8 ? 1 + (8 - (frame - t)) * 0.05 : b), 1);
  const slide = 1 - Math.pow(1 - interpolate(frame, [90, 104], [0, 1], clamp), 3);
  const sheet = usePop(120, 160, 18);
  const check = interpolate(frame, [128, 142], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 03 — mini app" offset={offset} />
      <div style={{ position: 'absolute', left: 64, top: 150, fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.03em' }}>
        <Words at={4}>{['Заказ']}</Words>
        <br />
        <Words at={12} step={7}>
          {['в', <Accent key="a">пару касаний.</Accent>]}
        </Words>
      </div>

      <Phone style={{ left: 250, top: 520, transform: `translateY(${(1 - phone) * 1300}px) rotate(${(1 - phone) * -8}deg)` }}>
        <StatusBar />
        <div style={{ position: 'absolute', left: 0, top: BAR, width: 540, height: 1170 - BAR, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-slide * 540}px)` }}>
          {/* Home: the feed scrolls under the app's sticky header. */}
          <Img src={staticFile('img/home-tall.png')} style={{ position: 'absolute', left: 0, top: -scroll * K, width: 540 }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: HEADER * K, overflow: 'hidden', boxShadow: scroll > 4 ? '0 6px 18px rgba(60,30,10,0.08)' : 'none' }}>
            <Img src={staticFile('img/home-tall.png')} style={{ position: 'absolute', left: 0, top: 0, width: 540 }} />
          </div>
          {count > 0 && (
            <div
              style={{
                position: 'absolute',
                left: (389 + 13) * K,
                top: (49 - 34) * K,
                minWidth: 30,
                height: 30,
                borderRadius: 15,
                background: '#EF4444',
                color: '#fff',
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${badge * bump})`,
                boxShadow: '0 4px 10px rgba(239,68,68,0.45)',
              }}
            >
              {count}
            </div>
          )}
          {/* Cart, slid in from the right. */}
          <Img src={staticFile('img/cart.png')} style={{ position: 'absolute', left: 540, top: 0, width: 540 }} />
          </div>
        </div>

        {/* The order goes through: a sheet rises over the cart. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 520,
            zIndex: 6,
            background: C.paper,
            borderRadius: '48px 48px 0 0',
            boxShadow: '0 -20px 60px rgba(60,30,10,0.2)',
            transform: `translateY(${(1 - sheet) * 580}px)`,
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
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.muted, marginTop: 14 }}>#1244 · 8.20 Б · самовывоз</div>
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
          <Tap at={ADDS[0]} {...PEREPECHI} />
          <Tap at={ADDS[1]} {...CROISSANT} />
          <Tap at={ADDS[2]} {...DONUT} />
          <Tap at={84} {...CART} />
          <Tap at={114} {...CHECKOUT} />
        </div>
      </Phone>
    </AbsoluteFill>
  );
};
