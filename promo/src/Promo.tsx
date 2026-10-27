import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Grain } from './ui';
import { Hook } from './scenes/Hook';
import { Menu } from './scenes/Menu';
import { Shop } from './scenes/Shop';
import { Crm } from './scenes/Crm';
import { EndCard, Tagline } from './scenes/Outro';

// Scene lengths in frames at 30 fps. Hard cuts between them, like the reference.
const SCENES = [
  { C: Hook, len: 80 },
  { C: Menu, len: 72 },
  { C: Shop, len: 160 },
  { C: Crm, len: 150 },
  { C: Tagline, len: 92 },
  { C: EndCard, len: 90 },
];

export const PROMO_FRAMES = SCENES.reduce((n, s) => n + s.len, 0);

export const Promo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SCENES.map(({ C, len }, i) => {
        const at = from;
        from += len;
        return (
          <Sequence key={i} from={at} durationInFrames={len}>
            <C offset={at} />
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};
