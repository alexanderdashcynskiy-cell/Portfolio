import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Accent, C, Hud, MONO, SANS, SERIF, usePop, useRamp, Words } from '../ui';
import { clamp, Sfx } from '../kit';

/** 07 — dark: what the owner does, and what the system does. */
export const Tagline: React.FC<{ offset: number }> = ({ offset }) => (
  <AbsoluteFill style={{ background: C.night }}>
    <Hud chapter="// 06 — flow" offset={offset} dark />
    <div style={{ position: 'absolute', left: 72, top: 640, fontFamily: SANS, fontWeight: 800, fontSize: 168, lineHeight: 1.04, color: C.cream, letterSpacing: '-0.03em' }}>
      <Words at={4} step={8}>
        {['Вы', <Accent key="p" color={C.gold}>печёте.</Accent>]}
      </Words>
    </div>
    <div style={{ position: 'absolute', left: 72, top: 880, fontFamily: SANS, fontWeight: 800, fontSize: 118, lineHeight: 1.08, color: 'rgba(251,246,238,0.55)', letterSpacing: '-0.03em' }}>
      <Words at={34} step={6}>{['Остальное —']}</Words>
      <br />
      <Words at={44} step={7}>
        {['в', <Accent key="s" color={C.orange}>системе.</Accent>]}
      </Words>
    </div>
  </AbsoluteFill>
);

/** 08 — a cream circle swallows the dark, and the sign-off. */
export const EndCard: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 16], [0, 1], clamp);
  const r = Math.pow(wipe, 1.6) * 1250;
  const title = usePop(8, 150, 18);
  const sub = useRamp(20, 32);
  const cta = usePop(30, 220, 15);
  const sign = useRamp(40, 52);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <div style={{ position: 'absolute', left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.cream }} />
      <Hud chapter="// 07 — end" offset={offset} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: MONO, fontSize: 28, color: C.muted, opacity: sub }}>
        // для пекарен и кофеен
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 630,
          textAlign: 'center',
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 132,
          lineHeight: 1.05,
          color: C.ink,
          letterSpacing: '-0.02em',
          transform: `translateY(${(1 - title) * 60}px)`,
          opacity: title,
        }}
      >
        Mini App
        <br />
        <span style={{ fontStyle: 'italic', color: C.orange }}>+ CRM</span>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 940, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, lineHeight: 1.35, color: C.ink, opacity: sub }}>
        Заказы, склад и клиенты —<br /><Accent>в одной системе.</Accent>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', transform: `scale(${cta})` }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: '#fff', background: C.orange, padding: '26px 54px', borderRadius: 999, boxShadow: '0 20px 40px rgba(208,105,42,0.35)' }}>Написать в Telegram</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1260, textAlign: 'center', fontFamily: MONO, fontSize: 28, color: C.muted, opacity: sign }}>
        Alexander Dashcynskiy · дизайн и разработка
      </div>
      <Sfx at={2} name="whoosh" volume={0.5} />
      <Sfx at={8} name="hit" volume={0.8} />
    </AbsoluteFill>
  );
};
