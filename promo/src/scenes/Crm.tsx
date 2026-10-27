import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Accent, C, Cup, Hud, MONO, Panel, SANS, SERIF, usePop, Words } from '../ui';

const ORDER = [
  ['Перепечи с сыром', '2.50'],
  ['Круассан французский', '3.50'],
  ['Пончик глазированный', '2.20'],
];
const STOCK = [
  ['Перепечи с сыром', 14],
  ['Круассан', 20],
  ['Пончик', 9],
] as const;
const BARS = [0.32, 0.5, 0.44, 0.7, 0.62, 0.86];
const STATUS = [
  { at: 0, text: 'Новый', bg: '#FDECEC', fg: '#D93D3D' },
  { at: 62, text: 'Готовится', bg: '#FFF4D6', fg: '#A87A00' },
  { at: 96, text: 'Готов', bg: '#E3F6EC', fg: '#1D8A5A' },
];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 04 — the same order lands in the CRM: counters tick, stock drops, the client hears back. */
export const Crm: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const tick = interpolate(frame, [24, 40], [0, 1], clamp);
  const ease = 1 - Math.pow(1 - tick, 3);
  const orders = frame >= 30 ? 44 : 43;
  const revenue = 783.2 + ease * 8.2;
  const stock = interpolate(frame, [40, 54], [0, 1], clamp);
  const status = [...STATUS].reverse().find((s) => frame >= s.at)!;
  const statusPop = usePop(STATUS.reduce((a, s) => (frame >= s.at ? s.at : a), 0), 380, 14);
  const ding = interpolate(frame, [10, 16, 40], [0, 1, 0], clamp);
  const typing = frame >= 84 && frame < 100;
  const msg = usePop(100, 220, 17);
  const stamp = usePop(118, 260, 13);
  const ring = interpolate(frame, [114, 136], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: '#F4EEE5' }}>
      <Hud chapter="// 04 — crm" offset={offset} />
      <div style={{ position: 'absolute', left: 56, top: 128, fontFamily: SANS, fontWeight: 800, fontSize: 80, color: C.ink, letterSpacing: '-0.03em' }}>
        <Words at={0} step={5}>
          {['А', 'в', <Accent key="c">CRM</Accent>, '— уже.']}
        </Words>
      </div>

      <Panel
        label="// новый заказ"
        at={8}
        right={<span style={{ color: C.orange }}>● #1244</span>}
        style={{ left: 48, top: 270, width: 600, height: 560, borderColor: `rgba(208,105,42,${0.15 + ding * 0.85})` }}
      >
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: C.ink }}>Алексей</div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.muted, marginTop: 6 }}>самовывоз · 14:30 · Ленина 74</div>
        <div style={{ marginTop: 26, borderTop: `2px dashed ${C.line}` }} />
        {ORDER.map(([n, p]) => (
          <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.ink, marginTop: 18 }}>
            <span>{n}</span>
            <span style={{ fontFamily: MONO, fontSize: 26 }}>{p}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 34 }}>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 26,
              padding: '10px 22px',
              borderRadius: 999,
              background: status.bg,
              color: status.fg,
              transform: `scale(${0.85 + statusPop * 0.15})`,
              display: 'inline-block',
            }}
          >
            {status.text}
          </span>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.ink, letterSpacing: '-0.02em' }}>8.20 Б</span>
        </div>
      </Panel>

      <Panel label="// on air" at={14} right={<span style={{ color: '#E5484D', opacity: Math.floor(frame / 12) % 2 ? 0.35 : 1 }}>● live</span>} style={{ left: 672, top: 270, width: 360, height: 560, background: C.cream }}>
        <Cup size={380} style={{ left: -26, top: 200 }} />
      </Panel>

      <Panel label="// заказы сегодня" at={18} style={{ left: 48, top: 854, width: 480, height: 300 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, color: C.ink, lineHeight: 1, letterSpacing: '-0.04em', overflow: 'hidden', height: 134 }}>
          <div style={{ transform: `translateY(${-ease * 134}px)` }}>
            <div>43</div>
            <div>44</div>
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: '#1D8A5A', marginTop: 10 }}>↗ +1 только что · {orders} всего</div>
      </Panel>

      <Panel label="// выручка, Б" at={22} style={{ left: 552, top: 854, width: 480, height: 300 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: '-0.03em' }}>{revenue.toFixed(2)}</div>
        <div style={{ position: 'absolute', left: 36, right: 36, bottom: 34, height: 90, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {BARS.map((h, i) => {
            const last = i === BARS.length - 1;
            const hh = last ? h * (0.7 + ease * 0.3) : h;
            return <div key={i} style={{ flex: 1, height: `${hh * 100}%`, borderRadius: 8, background: last ? C.orange : 'rgba(208,105,42,0.25)' }} />;
          })}
        </div>
      </Panel>

      <Panel label="// склад" at={26} right={<span>остаток</span>} style={{ left: 48, top: 1178, width: 984, height: 290 }}>
        {STOCK.map(([n, s], i) => {
          const d = interpolate(stock, [i * 0.2, i * 0.2 + 0.6], [0, 1], clamp);
          const v = s - (d >= 0.5 ? 1 : 0);
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: i ? 20 : 4 }}>
              <span style={{ width: 330, fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.ink }}>{n}</span>
              <div style={{ flex: 1, height: 14, borderRadius: 7, background: 'rgba(45,21,5,0.07)' }}>
                <div style={{ width: `${((s - d) / 22) * 100}%`, height: '100%', borderRadius: 7, background: C.gold }} />
              </div>
              <span style={{ width: 120, textAlign: 'right', fontFamily: MONO, fontSize: 28, color: d > 0 && d < 1 ? C.orange : C.ink }}>{v} шт</span>
            </div>
          );
        })}
      </Panel>

      <Panel label="// telegram → клиенту" at={30} style={{ left: 48, top: 1492, width: 984, height: 300, background: '#EAF3FB' }}>
        {typing && (
          <div style={{ display: 'inline-flex', gap: 10, padding: '22px 28px', borderRadius: 30, background: C.paper }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: '#7A8CA0', opacity: 0.35 + 0.65 * Math.abs(Math.sin((frame + i * 4) / 5)) }} />
            ))}
          </div>
        )}
        {frame >= 100 && (
          <div
            style={{
              display: 'inline-block',
              maxWidth: 820,
              padding: '22px 30px',
              borderRadius: '30px 30px 30px 8px',
              background: C.paper,
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 30,
              lineHeight: 1.35,
              color: C.ink,
              transform: `scale(${0.9 + msg * 0.1})`,
              transformOrigin: '0 100%',
              opacity: msg,
            }}
          >
            <b>Мамин Хлеб:</b> ваш заказ #1244 готов! Ждём на Ленина 74
            <span style={{ fontFamily: MONO, fontSize: 20, color: '#4FAE7B', marginLeft: 14 }}>14:21 ✓✓</span>
          </div>
        )}
      </Panel>

      {/* «Готово.» — the stamp over the whole board, with a hand-drawn ring. */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ellipse cx="560" cy="1010" rx="470" ry="330" fill="none" stroke={C.orange} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-8 560 1010)" opacity={0.8} />
      </svg>
      {frame >= 118 && (
        <div
          style={{
            position: 'absolute',
            left: 230,
            top: 900,
            padding: '6px 54px 22px',
            border: `8px solid ${C.orange}`,
            borderRadius: 26,
            background: 'rgba(251,246,238,0.94)',
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 170,
            color: C.orange,
            transform: `rotate(-9deg) scale(${2.2 - stamp * 1.2})`,
            opacity: Math.min(1, stamp * 2),
            boxShadow: '0 30px 60px rgba(120,50,10,0.25)',
          }}
        >
          Готово.
        </div>
      )}
    </AbsoluteFill>
  );
};
