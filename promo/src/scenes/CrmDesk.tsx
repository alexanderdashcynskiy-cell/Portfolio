import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, Hud, SANS } from '../ui';
import { Caption, clamp, easeInOut, Laptop, LAPTOP, lx, Sfx } from '../kit';

// Regions on the CRM captures (1512×982 CSS px).
const NEW_CARD = { x: 100, y: 603, w: 295, h: 379 }; // order #1244 on the orders board
const STOCK = [
  { x: 461, y: 872, from: 14 }, // Перепечи с Сыром
  { x: 933, y: 872, from: 20 }, // Круассан Французский
  { x: 1405, y: 866, from: 9 }, // Пончик Глазированный
];
const SWITCH = 82; // frame where the board cuts to the stock page

/** Camera over the laptop: from the whole machine to a point on its screen at a given zoom. */
const camera = (t: number, sx: number, sy: number, zoom: number) => {
  const px = LAPTOP.x + lx(sx);
  const py = LAPTOP.y + lx(sy);
  const s = 1 + (zoom - 1) * t;
  const tx = (540 - px * zoom) * t;
  const ty = (1060 - py * zoom) * t;
  return `translate(${tx}px, ${ty}px) scale(${s})`;
};

/** 05 — the same order on the CRM, on a laptop: it lands on the board, then the stock drops by one. */
export const CrmDesk: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { stiffness: 110, damping: 18 } });
  const zoomBoard = easeInOut(interpolate(frame, [18, 40], [0, 1], clamp));
  const ring = spring({ frame: frame - 34, fps, config: { stiffness: 220, damping: 12 } });
  const pulse = 0.5 + 0.5 * Math.sin((frame - 34) / 4);
  const zoomStock = easeInOut(interpolate(frame, [SWITCH, SWITCH + 16], [0.55, 1], clamp));
  const stockPage = frame >= SWITCH;
  const cam = stockPage ? camera(zoomStock, 548, 740, 1.72) : camera(zoomBoard, NEW_CARD.x + NEW_CARD.w / 2, NEW_CARD.y + 150, 2.3);

  return (
    <AbsoluteFill style={{ background: '#F1EBE2' }}>
      <Hud chapter="// 04 — crm" offset={offset} />
      <div style={{ position: 'absolute', inset: 0, transform: cam, transformOrigin: '0 0' }}>
        <div style={{ transform: `translateY(${(1 - enter) * 700}px)` }}>
          <Laptop>
            <Img src={staticFile(`screens/${stockPage ? 'd5-stock' : 'd4-orders'}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            {!stockPage && (
              <div
                style={{
                  position: 'absolute',
                  left: lx(NEW_CARD.x) - 4,
                  top: lx(NEW_CARD.y) - 4,
                  width: lx(NEW_CARD.w) + 8,
                  height: lx(NEW_CARD.h) + 8,
                  borderRadius: lx(34),
                  border: `${3 / 1}px solid ${C.orange}`,
                  boxShadow: `0 0 ${10 + pulse * 18}px rgba(208,105,42,${0.35 + pulse * 0.3})`,
                  opacity: ring,
                  transform: `scale(${1.15 - ring * 0.15})`,
                }}
              />
            )}
            {stockPage &&
              STOCK.map((s, i) => {
                const at = SWITCH + 20 + i * 7;
                const done = frame >= at;
                const fly = interpolate(frame, [at, at + 14], [0, 1], clamp);
                return (
                  <React.Fragment key={i}>
                    <div
                      style={{
                        position: 'absolute',
                        left: lx(s.x - 20),
                        top: lx(s.y - 13),
                        width: lx(40),
                        height: lx(26),
                        background: '#fff',
                        color: done ? C.orange : '#0E9F6E',
                        fontFamily: SANS,
                        fontWeight: 700,
                        fontSize: lx(17),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {done ? s.from - 1 : s.from}
                    </div>
                    {done && fly < 1 && (
                      <div style={{ position: 'absolute', left: lx(s.x + 14), top: lx(s.y - 26) - fly * 16, fontFamily: SANS, fontWeight: 800, fontSize: lx(15), color: '#E5484D', opacity: 1 - fly }}>−1</div>
                    )}
                  </React.Fragment>
                );
              })}
          </Laptop>
        </div>
      </div>

      {/* A «new order» toast pinned to the frame, not the laptop, so it stays readable. */}
      {!stockPage && (
        <div
          style={{
            position: 'absolute',
            left: 120,
            right: 120,
            top: 470,
            padding: '26px 34px',
            borderRadius: 34,
            background: C.ink,
            color: C.cream,
            fontFamily: SANS,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            boxShadow: '0 30px 60px rgba(45,21,5,0.35)',
            transform: `translateY(${(1 - spring({ frame: frame - 30, fps, config: { stiffness: 240, damping: 18 } })) * -60}px)`,
            opacity: interpolate(frame, [30, 36, SWITCH - 6, SWITCH], [0, 1, 1, 0], clamp),
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 11, background: '#3CCB7F', boxShadow: '0 0 0 8px rgba(60,203,127,0.25)' }} />
          <div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>Новый заказ №1244</div>
            <div style={{ fontSize: 26, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>Аня · самовывоз 14:30 · 8.20 Б</div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: 'linear-gradient(#F1EBE2 72%, rgba(241,235,226,0))' }} />
      {stockPage ? (
        <Caption lines={[['А', 'склад'], [<Accent key="s">считается сам.</Accent>]]} at={SWITCH} size={96} />
      ) : (
        <Caption lines={[['Заказ', 'сразу'], ['в', <Accent key="c">CRM.</Accent>]]} at={2} size={104} />
      )}

      <Sfx at={30} name="chime" volume={0.7} />
      <Sfx at={SWITCH} name="whoosh" volume={0.35} />
      {STOCK.map((_, i) => (
        <Sfx key={i} at={SWITCH + 20 + i * 7} name="tick" volume={0.8} />
      ))}
    </AbsoluteFill>
  );
};
