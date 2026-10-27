import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Hud } from '../ui';
import { Caption, clamp, Sfx } from '../kit';

const HAND = 'Caveat, cursive';
const INK = '#26357A';
const LINE = 74;

// The paper order book: written fast, half of it crossed out.
const ROWS: { text: string; at: number; strike?: number }[] = [
  { text: 'Ольга — 2 круассана к 9:00', at: 6 },
  { text: 'Дмитрий — медовик, доставка??', at: 14, strike: 44 },
  { text: 'Ирина — багет ×2 (перезвонить!)', at: 22 },
  { text: 'Мария — торт на сб., уточнить', at: 30, strike: 52 },
  { text: 'Павел — перепечи ×3', at: 38 },
];

/** The notebook page itself, also used by the next scene as it flips away. */
export const NotebookPage: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sticky = spring({ frame: frame - 56, fps, config: { stiffness: 300, damping: 14 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        top: 520,
        width: 940,
        height: 1180,
        background: '#FFFDF6',
        borderRadius: 14,
        boxShadow: '0 50px 90px rgba(60,30,10,0.28), 0 2px 0 #e9e1d2',
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 2}px, #cfdcea ${LINE - 2}px, #cfdcea ${LINE}px)`,
        backgroundPosition: '0 150px',
        transform: 'rotate(-2deg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 110, top: 0, bottom: 0, width: 3, background: '#E8A0A0' }} />
      <div style={{ position: 'absolute', left: 140, top: 46, fontFamily: HAND, fontSize: 60, color: INK }}>Заказы 27.10</div>
      {ROWS.map((r, i) => {
        const write = interpolate(frame, [r.at, r.at + 12], [0, 1], clamp);
        const strike = r.strike === undefined ? 0 : interpolate(frame, [r.strike, r.strike + 6], [0, 1], clamp);
        return (
          <div key={i} style={{ position: 'absolute', left: 140, top: 150 + LINE * (1 + 2 * i) - 62, fontFamily: HAND, fontSize: 56, color: INK, whiteSpace: 'nowrap', clipPath: `inset(-20px ${(1 - write) * 100}% -20px 0)` }}>
            {r.text}
            {strike > 0 && <div style={{ position: 'absolute', left: -8, top: '52%', height: 5, width: `${strike * 104}%`, background: '#C0392B', borderRadius: 3, transform: 'rotate(-1.5deg)' }} />}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          right: 60,
          bottom: 120,
          width: 360,
          padding: '34px 30px',
          background: '#FFE16B',
          boxShadow: '0 18px 30px rgba(80,60,0,0.25)',
          fontFamily: HAND,
          fontSize: 58,
          lineHeight: 1.05,
          color: '#3a2a00',
          transform: `rotate(${6 - (1 - sticky) * 20}deg) scale(${0.4 + sticky * 0.6})`,
          opacity: Math.min(1, sticky * 2),
        }}
      >
        Медовик — кончился?!
      </div>
    </div>
  );
};

/** 02 — where the orders actually end up: a paper book, crossed out and guessed at. */
export const Notebook: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#EFE6D8' }}>
      <Hud chapter="// 02 — тетрадь" offset={offset} />
      <Caption lines={[['Заказы — в звонках,'], ['директе', 'и', <Accent key="n">тетради.</Accent>]]} at={2} size={84} />
      <NotebookPage frame={frame} fps={fps} />
      {ROWS.map((r) => (
        <Sfx key={r.at} at={r.at} name="pen" volume={0.5} />
      ))}
      <Sfx at={44} name="pen" volume={0.6} />
      <Sfx at={56} name="slap" volume={0.8} />
    </AbsoluteFill>
  );
};
