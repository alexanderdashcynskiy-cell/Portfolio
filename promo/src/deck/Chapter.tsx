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
}> = ({ n, title, before, benefit, line, beforeArt, afterArt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (at: number, k = 200, d = 18) => spring({ frame: frame - at, fps, config: { stiffness: k, damping: d } });
  const beforeIn = pop(4);
  const swap = interpolate(frame, [AFTER - 8, AFTER + 6], [0, 1], clamp);
  const afterIn = pop(AFTER + 2, 170, 20);
  const benefitIn = pop(AFTER + 8);
  const lineIn = pop(AFTER + 18);

  return (
    <AbsoluteFill>
      {/* Chapter label */}
      <div style={{ position: 'absolute', left: 120, top: 250, fontFamily: MONO, fontSize: 26, letterSpacing: '0.04em', color: C.orange, opacity: pop(0) }}>
        {String(n).padStart(2, '0')} / 08 · {title}
      </div>

      {/* Before: grey, then pushed up and out */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 640, opacity: (1 - swap) * beforeIn, transform: `translateY(${(1 - beforeIn) * 30 - swap * 40}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: 'rgba(45,21,5,0.45)', letterSpacing: '0.12em', marginBottom: 18 }}>БЫЛО</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: 'rgba(45,21,5,0.55)', letterSpacing: '-0.02em' }}>{before}</div>
      </div>

      {/* After: the benefit, then the plain sentence that backs it */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 660 }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.orange, letterSpacing: '0.12em', marginBottom: 18, opacity: benefitIn }}>СТАЛО</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.03em', opacity: benefitIn, transform: `translateY(${(1 - benefitIn) * 40}px)` }}>{benefit}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: 1.4, color: '#6F5440', marginTop: 34, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 24}px)` }}>{line}</div>
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
