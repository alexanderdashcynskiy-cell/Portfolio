import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Hud, SANS } from '../ui';
import { Caption, IPhone, Sfx } from '../kit';

type Note = { at: number; app: string; icon: string; color: string; title: string; text: string };

// The usual morning: questions from every channel at once. Generic icons, no third-party logos.
const NOTES: Note[] = [
  { at: 8, app: 'TELEGRAM', icon: '✈', color: '#2AABEE', title: 'Ольга', text: 'Есть сегодня круассаны?' },
  { at: 17, app: 'ТЕЛЕФОН', icon: '✆', color: '#34C759', title: 'Пропущенный вызов', text: '+375 29 •••• (3)' },
  { at: 26, app: 'ДИРЕКТ', icon: '✉', color: '#E1306C', title: 'irina_vit', text: 'Можно 2 багета к 9:00?' },
  { at: 34, app: 'TELEGRAM', icon: '✈', color: '#2AABEE', title: 'Дмитрий', text: 'А доставка на Ленина есть?' },
  { at: 42, app: 'ТЕЛЕФОН', icon: '✆', color: '#34C759', title: 'Пропущенный вызов', text: '+375 33 •••• (5)' },
  { at: 50, app: 'TELEGRAM', icon: '✈', color: '#2AABEE', title: 'Мария', text: 'Торт на субботу ещё можно?' },
];
const CARD_H = 148;

const Notification: React.FC<{ n: Note; y: number; p: number }> = ({ n, y, p }) => (
  <div
    style={{
      position: 'absolute',
      left: 22,
      right: 22,
      top: y,
      height: CARD_H - 14,
      borderRadius: 40,
      background: 'rgba(255, 250, 244, 0.86)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '0 26px',
      transform: `translateY(${(1 - p) * -60}px) scale(${0.92 + p * 0.08})`,
      opacity: p,
    }}
  >
    <div style={{ width: 70, height: 70, borderRadius: 18, background: n.color, color: '#fff', fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n.icon}</div>
    <div style={{ flex: 1, minWidth: 0, fontFamily: SANS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 700, color: 'rgba(0,0,0,0.42)', letterSpacing: '0.05em' }}>
        <span>{n.app}</span>
        <span style={{ letterSpacing: 0, fontWeight: 500 }}>сейчас</span>
      </div>
      <div style={{ fontSize: 27, fontWeight: 700, color: '#111', marginTop: 4 }}>{n.title}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: '#222', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.text}</div>
    </div>
  </div>
);

/** The lock screen at 8:00 filling with notifications; it shakes with each one. */
export const LockPhone: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const last = [...NOTES].reverse().find((n) => frame >= n.at);
  const since = last ? frame - last.at : 99;
  const shake = since < 10 ? Math.sin(since * 2.6) * 9 * (1 - since / 10) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      <IPhone style={{ transform: `translateX(${shake}px) rotate(${shake * 0.15}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 0%, #c98a4b 0%, #7a4422 45%, #2b170c 100%)' }} />
        {/* Status bar and island, as on the captured screens. */}
        <div style={{ position: 'absolute', top: 36, left: 74, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#fff' }}>8:00</div>
        <div style={{ position: 'absolute', top: 33, left: '50%', width: 190, height: 56, marginLeft: -95, borderRadius: 30, background: '#000' }} />
        <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: SANS, color: '#fff' }}>
          <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.85 }}>вторник, 27 октября</div>
          <div style={{ fontSize: 190, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 6 }}>8:00</div>
        </div>
        {NOTES.map((n, i) => {
          if (frame < n.at) return null;
          const p = spring({ frame: frame - n.at, fps, config: { stiffness: 260, damping: 20 } });
          // Each later notification pushes this one down by a card.
          const pushed = NOTES.slice(i + 1).reduce((s, m) => s + spring({ frame: frame - m.at, fps, config: { stiffness: 260, damping: 22 } }), 0);
          return <Notification key={i} n={n} p={p} y={470 + pushed * CARD_H} />;
        })}
        <div style={{ position: 'absolute', bottom: 22, left: '50%', width: 220, height: 8, marginLeft: -110, borderRadius: 4, background: 'rgba(255,255,255,0.8)' }} />
      </IPhone>
    </div>
  );
};

/** 01 — 8:00, the phone on the counter fills up with questions; it shakes with each one. */
export const Rush: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { stiffness: 120, damping: 18 } });

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Hud chapter="// 01 — 8:00" offset={offset} />
      <Caption lines={[['Пекарня', 'открылась.'], ['Телефон —', <Accent key="t">тоже.</Accent>]]} at={2} size={84} />

      <LockPhone style={{ transform: `translateY(${(1 - enter) * 900}px)` }} />

      {NOTES.map((n) => (
        <React.Fragment key={n.at}>
          <Sfx at={n.at} name="buzz" volume={0.7} />
          <Sfx at={n.at + 1} name="ding" volume={0.45} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

