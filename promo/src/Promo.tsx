import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Grain } from './ui';
import { Rush } from './scenes/Rush';
import { Notebook } from './scenes/Notebook';
import { Order, Turn } from './scenes/Order';
import { CrmDesk } from './scenes/CrmDesk';
import { Notify } from './scenes/Notify';
import { EndCard, Tagline } from './scenes/Outro';

/*
 * «8:00. Телефон уже звонит» — problem, then the product as the answer.
 * Scene lengths in frames at 30 fps; the voice-over lines below are timed to them.
 */
export const SCENES = [
  { C: Rush, len: 66, vo: 'Восемь утра. Звонки, сообщения…' },
  { C: Notebook, len: 84, vo: '…заказы в тетради. Знакомо?' },
  { C: Turn, len: 36, vo: 'А если так?' },
  { C: Order, len: 150, vo: 'Клиент сам заказывает в Телеграме — в пару касаний.' },
  { C: CrmDesk, len: 160, vo: 'Заказ сразу попадает в CRM, а склад пересчитывается сам.' },
  { C: Notify, len: 84, vo: 'Клиент узнаёт о готовности — без звонка.' },
  { C: Tagline, len: 84, vo: 'Вы печёте. Остальное — в системе.' },
  { C: EndCard, len: 110, vo: 'Mini App и CRM для вашей пекарни. Напишите мне в Телеграм.' },
];

export const PROMO_FRAMES = SCENES.reduce((n, s) => n + s.len, 0);

// Optional tracks: put the files in public/ and switch these on.
const VOICE = false; // public/voice.mp3 — the owner's voice-over, read to the lines above
const MUSIC = false; // public/music.mp3 — a licensed track; it dips under the voice

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
      <Grain opacity={0.05} />
      {VOICE && <Audio src={staticFile('voice.mp3')} />}
      {MUSIC && <Audio src={staticFile('music.mp3')} volume={VOICE ? 0.25 : 0.6} />}
    </AbsoluteFill>
  );
};
