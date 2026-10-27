import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Accent, Bubble, C, Cup, Hud, MONO, SANS, usePop, useRamp, Words } from '../ui';

/** 01 — the mascot leans in: «пс-с…», and the question. */
export const Hook: React.FC<{ offset: number }> = ({ offset }) => {
  const cup = usePop(0, 150, 14);
  const label = useRamp(16, 26);
  const line = useRamp(44, 60);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 01 — hook" offset={offset} />
      <div style={{ position: 'absolute', left: 72, top: 330, fontFamily: MONO, fontSize: 30, color: C.muted, opacity: label }}>// для пекарен и кафе</div>
      <div style={{ position: 'absolute', left: 64, top: 390, fontFamily: SANS, fontWeight: 800, fontSize: 158, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.03em' }}>
        <Words at={20}>{['Пекарня']}</Words>
        <br />
        <Words at={30} step={8}>
          {['в', <Accent key="t" underline={line}>Telegram?</Accent>]}
        </Words>
      </div>
      <Cup size={820} style={{ left: 240, top: 1180, transform: `translateY(${(1 - cup) * 700}px) rotate(${(1 - cup) * 12}deg)` }} />
      <Bubble at={9} style={{ left: 120, top: 1150 }}>
        пс-с…
      </Bubble>
    </AbsoluteFill>
  );
};
