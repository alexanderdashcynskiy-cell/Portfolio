import React from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, MONO, SANS } from '../ui';
import { clamp, Sfx } from '../kit';

export const CHAPTER_LEN = 210; // 7 s: 2 s of «было», then 5 s of «стало»
export const AFTER = 66;

/*
 * One benefit, as a contrast. Left column: the pain in grey, then the benefit in ink and orange.
 * Right column: the pain drawn as a picture, then the real product doing the job.
 */
export const Chapter: React.FC<{
  n: number;
  title: string;
  before: string;
  benefit: React.ReactNode;
  line: string;
  beforeArt: React.ReactNode;
  afterArt: React.ReactNode;
  len?: number;
}> = ({ n, title, before, benefit, line, beforeArt, afterArt, len = CHAPTER_LEN }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (at: number, k = 200, d = 18) => spring({ frame: frame - at, fps, config: { stiffness: k, damping: d } });
  const beforeIn = pop(4);
  const swap = interpolate(frame, [AFTER - 8, AFTER + 6], [0, 1], clamp);
  const afterIn = pop(AFTER + 2, 170, 20);
  const benefitIn = pop(AFTER + 8);
  const lineIn = pop(AFTER + 18);
  const exit = interpolate(frame, [len - 10, len], [0, 1], clamp);
  const pill = (bg: string, fg: string): React.CSSProperties => ({ display: 'inline-block', fontFamily: MONO, fontSize: 22, letterSpacing: '0.14em', padding: '8px 18px', borderRadius: 999, background: bg, color: fg, marginBottom: 26 });

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 30}px) scale(${1 - exit * 0.02})` }}>
      {/* The chapter number, huge and outlined, far behind everything */}
      <div style={{ position: 'absolute', left: 60, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 620, lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px rgba(208,105,42,0.10)', letterSpacing: '-0.05em', transform: `translateX(${-frame * 0.25}px)`, opacity: pop(0, 80, 20) }}>
        {String(n).padStart(2, '0')}
      </div>
      {/* Chapter label */}
      <div style={{ position: 'absolute', left: 120, top: 250, fontFamily: MONO, fontSize: 26, letterSpacing: '0.04em', color: C.orange, opacity: pop(0) }}>
        {String(n).padStart(2, '0')} / 08 · {title}
      </div>

      {/* Before: grey, then pushed up and out */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 640, opacity: (1 - swap) * beforeIn, transform: `translateY(${(1 - beforeIn) * 30 - swap * 40}px)` }}>
        <div style={pill('rgba(45,21,5,0.08)', 'rgba(45,21,5,0.55)')}>БЫЛО</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: 'rgba(45,21,5,0.55)', letterSpacing: '-0.02em' }}>{before}</div>
      </div>

      {/* After: the benefit, then the plain sentence that backs it */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 660 }}>
        <div style={{ ...pill(C.orange, '#fff'), opacity: benefitIn, transform: `scale(${0.8 + benefitIn * 0.2})`, transformOrigin: '0 50%' }}>СТАЛО</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.03em', opacity: benefitIn, transform: `translateY(${(1 - benefitIn) * 40}px)` }}>{benefit}</div>
        <div style={{ width: `${lineIn * 120}px`, height: 4, borderRadius: 2, background: C.orange, marginTop: 34 }} />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.4, color: '#6F5440', marginTop: 26, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 24}px)` }}>{line}</div>
      </div>

      {/* Right column: the pain picture, desaturated, sliding away as the product slides in */}
      <div style={{ position: 'absolute', inset: 0, filter: 'saturate(0.35)', opacity: (1 - swap) * beforeIn, transform: `translateX(${(1 - beforeIn) * 80 - swap * 120}px)` }}>{beforeArt}</div>
      <div style={{ position: 'absolute', inset: 0, opacity: afterIn, transform: `translateX(${(1 - afterIn) * 160}px)` }}>
        <Sequence from={AFTER} layout="none">
          {afterArt}
        </Sequence>
      </div>

      <Sfx at={AFTER - 6} name="whoosh" volume={0.35} />
    </AbsoluteFill>
  );
};
