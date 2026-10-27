import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { Accent, C, Cup, Hud, MONO, SANS, Words } from '../ui';

const ITEMS = [
  { tag: '// новинка', n: '01', name: 'Круассан', price: '3.20', img: 'croissant.jpg', x: 40, y: 760, r: -7 },
  { tag: '// выпечка', n: '02', name: 'Хачапури', price: '2.10', img: 'hachapuri.jpg', x: 384, y: 700, r: 1 },
  { tag: '// десерт', n: '03', name: 'Медовик', price: '4.20', img: 'medovik.jpg', x: 728, y: 770, r: 7 },
];

/** 02 — hard cut to orange: the menu deals itself onto the table. */
export const Menu: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.orange }}>
      <Hud chapter="// 02 — menu" offset={offset} dark />
      <div style={{ position: 'absolute', left: 64, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 132, lineHeight: 1.02, color: C.cream, letterSpacing: '-0.03em' }}>
        <Words at={2}>{['Всё', 'меню —']}</Words>
        <br />
        <Words at={12} step={7}>
          {['в', <Accent key="k" color={C.ink}>кармане.</Accent>]}
        </Words>
      </div>

      {ITEMS.map((it, i) => {
        const p = spring({ frame: frame - 8 - i * 7, fps, config: { stiffness: 140, damping: 16 } });
        const tx = (1 - p) * (900 + i * 120);
        const rot = it.r + (1 - p) * 40;
        return (
          <div
            key={it.name}
            style={{
              position: 'absolute',
              left: it.x,
              top: it.y,
              width: 312,
              padding: 18,
              borderRadius: 34,
              background: C.paper,
              boxShadow: '0 40px 70px rgba(80,30,0,0.32)',
              transform: `translateX(${tx}px) rotate(${rot}deg)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 19, color: C.muted, padding: '2px 4px 14px' }}>
              <span>{it.tag}</span>
              <span>{it.n}</span>
            </div>
            <Img src={staticFile(`img/${it.img}`)} style={{ width: 276, height: 330, objectFit: 'cover', objectPosition: '50% 34%', borderRadius: 22, display: 'block' }} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, margin: '22px 4px 4px', letterSpacing: '-0.02em' }}>{it.name}</div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: C.orange, margin: '0 4px 6px' }}>{it.price} Б</div>
          </div>
        );
      })}

      <Cup size={620} style={{ left: -90, top: 1440, transform: 'rotate(8deg)' }} />
    </AbsoluteFill>
  );
};
