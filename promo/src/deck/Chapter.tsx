import React from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, MONO, SANS } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';

export const CHAPTER_LEN = 210; // fallback; the deck sizes each chapter to its voice-over
export const AFTER = 66;
/** Frames two neighbouring chapters overlap: one pushes out as the next pushes in. */
export const OVERLAP = 14;

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
  after?: number;
}> = ({ n, title, before, benefit, line, beforeArt, afterArt, len = CHAPTER_LEN, after: AFTER_ = AFTER }) => {
  const AFTER = AFTER_;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (at: number, k = 200, d = 18) => spring({ frame: frame - at, fps, config: { stiffness: k, damping: d } });
  const beforeIn = pop(4);
  const swap = interpolate(frame, [AFTER - 8, AFTER + 6], [0, 1], clamp);
  const afterIn = pop(AFTER + 2, 170, 20);
  const benefitIn = pop(AFTER + 8);
  const lineIn = pop(AFTER + 18);
  // Push transition: in from the right during the first OVERLAP frames, out to the left after `len`.
  const enter = 1 - easeInOut(interpolate(frame, [0, OVERLAP], [0, 1], clamp));
  const exit = easeInOut(interpolate(frame, [len, len + OVERLAP], [0, 1], clamp));
  const push = enter * 160 - exit * 160;
  const blur = (enter + exit) * 10;
  const drift = 1 + 0.025 * (frame / (len + OVERLAP)); // the camera keeps creeping in
  const strike = interpolate(frame, [AFTER - 18, AFTER - 8], [0, 1], clamp);
  const reveal = (p: number): React.CSSProperties => ({ clipPath: `inset(-10px -40px ${(1 - p) * 100}% -10px)`, transform: `translateY(${(1 - p) * 60}px)` });
  const pill = (bg: string, fg: string): React.CSSProperties => ({ display: 'inline-block', fontFamily: MONO, fontSize: 22, letterSpacing: '0.14em', padding: '8px 18px', borderRadius: 999, background: bg, color: fg, marginBottom: 26 });

  return (
    <AbsoluteFill style={{ opacity: 1 - Math.max(enter, exit) * 0.9, transform: `translateX(${push}px) scale(${drift})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      {/* The chapter number, huge and outlined, far behind everything */}
      <div style={{ position: 'absolute', left: 60, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 620, lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px rgba(208,105,42,0.10)', letterSpacing: '-0.05em', transform: `translateX(${-frame * 0.25}px)`, opacity: pop(0, 80, 20) }}>
        {String(n).padStart(2, '0')}
      </div>
      {/* Chapter label */}
      <div style={{ position: 'absolute', left: 120, top: 252, display: 'flex', alignItems: 'center', gap: 18, fontFamily: MONO, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.orange, opacity: pop(0) }}>
        <span style={{ fontWeight: 700 }}>{String(n).padStart(2, '0')}</span>
        <span style={{ width: 44 * pop(2), height: 2, background: C.orange }} />
        <span style={{ color: 'rgba(45,21,5,0.55)' }}>{title}</span>
      </div>

      {/* Before: grey, then pushed up and out */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 640, opacity: (1 - swap) * beforeIn, transform: `translateY(${(1 - beforeIn) * 30 - swap * 40}px)` }}>
        <div style={pill('rgba(45,21,5,0.08)', 'rgba(45,21,5,0.55)')}>БЫЛО</div>
        <div style={{ position: 'relative', fontFamily: SANS, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: 'rgba(45,21,5,0.55)', letterSpacing: '-0.02em', textDecorationLine: 'line-through', textDecorationThickness: 4, textDecorationColor: `rgba(208,105,42,${strike})` }}>
          {before}
        </div>
      </div>

      {/* After: the benefit, then the plain sentence that backs it */}
      <div style={{ position: 'absolute', left: 120, top: 320, width: 660 }}>
        <div style={{ ...pill(C.orange, '#fff'), opacity: benefitIn, transform: `scale(${0.8 + benefitIn * 0.2})`, transformOrigin: '0 50%' }}>СТАЛО</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.035em', ...reveal(benefitIn) }}>{benefit}</div>
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

      <Sfx at={AFTER - 18} name="pen" volume={0.35} />
      <Sfx at={AFTER - 6} name="whoosh" volume={0.3} />
    </AbsoluteFill>
  );
};
