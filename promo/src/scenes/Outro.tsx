import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Accent, C, Cup, Hud, MONO, SANS, SERIF, usePop, useRamp, Words } from '../ui';

/** 05 — dark: what the owner does, and what the system does. */
export const Tagline: React.FC<{ offset: number }> = ({ offset }) => {
  const cup = usePop(0, 140, 16);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Hud chapter="// 05 — flow" offset={offset} dark />
      <div style={{ position: 'absolute', left: 64, top: 470, fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1.05, color: C.cream, letterSpacing: '-0.03em' }}>
        <Words at={4} step={8}>
          {['Вы', <Accent key="p" color={C.gold}>печёте.</Accent>]}
        </Words>
      </div>
      <div style={{ position: 'absolute', left: 64, top: 720, fontFamily: SANS, fontWeight: 800, fontSize: 104, lineHeight: 1.08, color: 'rgba(251,246,238,0.5)', letterSpacing: '-0.03em' }}>
        <Words at={30} step={6}>{['Заказы,', 'склад,']}</Words>
        <br />
        <Words at={42} step={6}>{['ответы —']}</Words>
        <br />
        <Words at={52} step={7}>
          {['на', <Accent key="s" color={C.orange}>системе.</Accent>]}
        </Words>
      </div>
      <Cup size={640} steam={false} style={{ left: 470, top: 1340, transform: `translateX(${(1 - cup) * 700}px) rotate(${-6 + (1 - cup) * 20}deg)` }} />
    </AbsoluteFill>
  );
};

/** 06 — a cream circle swallows the dark, and the sign-off. */
export const EndCard: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const r = Math.pow(wipe, 1.6) * 1250;
  const cup = usePop(10, 200, 13);
  const logo = usePop(6, 160, 18);
  const sub = useRamp(22, 34);
  const cta = usePop(30, 220, 15);
  const foot = useRamp(40, 52);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <div style={{ position: 'absolute', left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.cream }} />
      <Hud chapter="// 06 — end" offset={offset} />

      <Cup size={420} bob style={{ left: 330, top: 560, transform: `translateY(${(1 - cup) * 160}px) scale(${cup})`, transformOrigin: '50% 100%' }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 800,
          textAlign: 'center',
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 150,
          color: C.ink,
          letterSpacing: '-0.02em',
          transform: `translateY(${(1 - logo) * 60}px)`,
          opacity: logo,
        }}
      >
        Мамин Хлеб
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 42, color: C.ink, opacity: sub }}>
        Telegram Mini App и CRM — <Accent>в одной системе.</Accent>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, transform: `scale(${cta})` }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#fff', background: C.orange, padding: '22px 44px', borderRadius: 999 }}>Хочу так же</span>
        <span style={{ fontFamily: MONO, fontSize: 26, color: C.muted }}>Alexander Dashcynskiy</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontFamily: MONO, fontSize: 24, color: C.muted, opacity: foot }}>
        дизайн и разработка&nbsp;&nbsp;·&nbsp;&nbsp;заказ → CRM за секунду&nbsp;&nbsp;·&nbsp;&nbsp;7 категорий
      </div>
    </AbsoluteFill>
  );
};
