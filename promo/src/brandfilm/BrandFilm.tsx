import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, SANS } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { PH, ppt } from '../deck/devices';
import { DayCrm, Evening, Note, OrderShot, push, Shot, Track } from '../footage/Film';
import { AnyaConfirm, CardIn, CardOut, Dawn, Finale, Words } from '../animatic/Animatic';
import v2 from '../footage/tracks/v2.json';
import v3b from '../footage/tracks/v3b.json';
import phoneTop from '../footage/tracks/phone-top.json';
import thumb from '../footage/tracks/thumb.json';
import breadOut from '../footage/tracks/bread-out.json';

/*
 * «Руки — для теста. Заказы — для системы.» — the brand film, first full cut.
 * Five acts on the generated footage: atmosphere, tension (the phone on the floured table
 * rings), transformation (Аня orders, the card flies into the CRM), relief (the same phone,
 * silent; the shift closes itself), finale. Graded together, letterboxed, with grain.
 */

export const BRAND_FRAMES = 2100; // 70 s
const X = 8; // frames each shot dissolves over the one before

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));

/* ───────────── Phone screens drawn on the footage ───────────── */

/** iOS incoming call, portrait, at phone-screen size (PH.w × PH.h). */
const CALLERS = [
  ['+375 (29) 614-22-07', 'Можно сделать заказ?'],
  ['+375 (33) 902-18-55', 'А на сколько можно?'],
  ['+375 (44) 771-03-61', 'Мой заказ приняли?'],
  ['+375 (29) 350-48-12', 'Ну что, готово?'],
  ['+375 (33) 447-90-26', 'А медовик ещё есть?'],
];
const CallScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(CALLERS.length - 1, Math.floor(frame / 36));
  const p = interpolate(frame - i * 36, [0, 8], [0, 1], clamp);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 3);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #2a2420 0%, #141110 100%)', fontFamily: SANS, color: '#fff', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: ppt(120), left: 0, right: 0, opacity: p }}>
        <div style={{ fontSize: ppt(20), color: 'rgba(255,255,255,0.65)' }}>Входящий вызов</div>
        <div style={{ fontSize: ppt(34), fontWeight: 700, marginTop: ppt(8), letterSpacing: '-0.01em' }}>{CALLERS[i][0]}</div>
        <div style={{ fontSize: ppt(26), fontWeight: 600, lineHeight: 1.25, color: '#FFC58F', marginTop: ppt(28), padding: `0 ${ppt(24)}px` }}>«{CALLERS[i][1]}»</div>
      </div>
      <div style={{ position: 'absolute', bottom: ppt(110), left: ppt(56), right: ppt(56), display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: ppt(70), height: ppt(70), borderRadius: '50%', background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ppt(30), transform: 'rotate(135deg)' }}>✆</div>
        <div style={{ width: ppt(70), height: ppt(70), borderRadius: '50%', background: '#34C759', boxShadow: `0 0 0 ${ppt(6 + pulse * 10)}px rgba(52,199,89,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ppt(30) }}>✆</div>
      </div>
    </div>
  );
};

/** iOS lock screen with one calm notification from the CRM. */
const LockScreen: React.FC<{ time: string; at: number; title: string; sub: string }> = ({ time, at, title, sub }) => {
  const frame = useCurrentFrame();
  const n = spring({ frame: frame - at, fps: 30, config: { stiffness: 170, damping: 22 } });
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 20%, #3a2a1e 0%, #120d0a 70%)', fontFamily: SANS, color: '#fff' }}>
      <div style={{ position: 'absolute', top: ppt(70), left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: ppt(14), color: 'rgba(255,255,255,0.7)' }}>вторник, 27 октября</div>
        <div style={{ fontSize: ppt(78), fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{time}</div>
      </div>
      <div style={{ position: 'absolute', top: ppt(250), left: ppt(14), right: ppt(14), padding: ppt(12), borderRadius: ppt(20), background: 'rgba(255,255,255,0.16)', display: 'flex', gap: ppt(10), opacity: n, transform: `translateY(${(1 - n) * ppt(20)}px) scale(${0.96 + 0.04 * n})` }}>
        <div style={{ width: ppt(36), height: ppt(36), borderRadius: ppt(9), background: '#FF7A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: ppt(16), flexShrink: 0 }}>П</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: ppt(12), color: 'rgba(255,255,255,0.65)' }}>
            <span>CRM · ПЕКАРНЯ</span>
            <span>сейчас</span>
          </div>
          <div style={{ fontSize: ppt(14), fontWeight: 700, marginTop: ppt(2) }}>{title}</div>
          <div style={{ fontSize: ppt(13), color: 'rgba(255,255,255,0.8)' }}>{sub}</div>
        </div>
      </div>
    </div>
  );
};

/** The confirm tap in close-up: checkout, the thumb presses, «Спасибо за заказ!». */
const ThumbScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const done = ease(frame, 20, 30);
  return (
    <>
      <Img src={staticFile('screens/m5-checkout.jpg')} style={{ position: 'absolute', inset: 0, width: PH.w, height: PH.h }} />
      <Img src={staticFile('screens/m6-receipt.jpg')} style={{ position: 'absolute', inset: 0, width: PH.w, height: PH.h, opacity: done, transform: `scale(${1.03 - done * 0.03})` }} />
    </>
  );
};

/* ───────────── Footage shots ───────────── */

/** A plain piece of footage, slowly pushed in, with its own grade. */
const Plate: React.FC<{ src: string; from?: number; rate?: number; len: number; push?: number; origin?: string; grade?: string }> = ({ src, from = 0, rate = 1, len, push: p = 0.06, origin = '50% 50%', grade }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} playbackRate={rate} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transformOrigin: origin, transform: `scale(${1 + p * (frame / len)})`, filter: grade }} />
    </AbsoluteFill>
  );
};

/** The older, brighter generations are pulled toward the new ones: warmer, a little darker. */
const MATCH = 'sepia(0.14) saturate(0.9) brightness(0.9) contrast(1.06)';

/* ───────────── Finishing: grade, letterbox, grain ───────────── */

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 8;
  return (
    <>
      {/* One shared look: warm highlights, deep but not crushed shadows */}
      <AbsoluteFill style={{ background: 'radial-gradient(130% 100% at 50% 45%, rgba(255,170,90,0.05) 0%, rgba(20,8,0,0.0) 45%, rgba(12,6,2,0.55) 100%)', mixBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,150,60,0.06), rgba(40,20,10,0.08))', mixBlendMode: 'soft-light' }} />
      {/* Film grain */}
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay' }}>
        <svg width="1920" height="1080">
          <filter id={`g${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="1920" height="1080" filter={`url(#g${seed})`} />
        </svg>
      </AbsoluteFill>
      {/* 2:1 letterbox */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: '#000' }} />
    </>
  );
};

/* ───────────── The cut ───────────── */

type Cut = { at: number; len: number; el: React.ReactNode };

// Act boundaries (the draft score is shaped to these): 12, 22, 45, 58.7 s.
const CUTS: Cut[] = [
  // Act 1 — atmosphere
  { at: 0, len: 120, el: <Dawn from={0} rate={0.5} dim={0.35} len={120} /> },
  { at: 120, len: 150, el: <Plate src="film/baker.mp4" from={0.5} len={150} push={0.05} /> },
  { at: 270, len: 90, el: <Plate src="film/oven.mp4" from={1.2} len={90} push={0.08} origin="35% 50%" /> },
  // Act 2 — tension
  {
    at: 360,
    len: 180,
    el: (
      <Shot src="film/phone-top-clean.mp4" cutout="film/phone-top-cutout.webm" track={phoneTop as Track} from={0} rate={1} cw={PH.w} ch={PH.h} radius={34} grow={1.03} cam={(f) => push(f, 0, 180, 1.75, 1170, 560)} screen={{ boxShadow: '0 0 0 30px #141110' }}>
        <CallScreen />
      </Shot>
    ),
  },
  { at: 540, len: 120, el: <Plate src="film/notebook.mp4" from={1} rate={0.8} len={120} push={0.07} origin="75% 40%" /> },
  // Act 3 — transformation
  { at: 660, len: 160, el: <div style={{ position: 'absolute', inset: 0, filter: MATCH }}><OrderShot /></div> },
  {
    at: 820,
    len: 65,
    el: (
      <>
        <Shot src="film/thumb-clean.mp4" cutout="film/thumb-cutout.webm" track={thumb as Track} from={0} rate={1} cw={PH.w} ch={PH.h} radius={34} grow={1.03}>
          <ThumbScreen />
        </Shot>
        <CardOut at={34} x0={720} y0={420} />
      </>
    ),
  },
  {
    at: 885,
    len: 260,
    el: (
      <>
        <div style={{ position: 'absolute', inset: 0, filter: MATCH }}>
          <Shot src="footage/v2.mp4" track={v2 as Track} from={0} rate={0.8} cw={1512} ch={982} radius={6} cam={(f) => push(f, 20, 70, 1.45, 812, 560, [230, 260, 1.12])}>
            <DayCrm />
          </Shot>
        </div>
        <CardIn len={30} />
        <Note at={150} until={250} icon="✈" head="TELEGRAM → АНЯ" title="🧾 Чек и «Заказ №1244 принят»" sub="Бот отправил сам, сразу после «Принять»" />
      </>
    ),
  },
  { at: 1145, len: 195, el: <div style={{ position: 'absolute', inset: 0, filter: MATCH }}><AnyaConfirm /></div> },
  // Act 4 — relief
  {
    at: 1340,
    len: 88,
    el: (
      <Shot src="film/bread-out-clean.mp4" track={breadOut as Track} from={0} rate={1} cw={PH.w} ch={PH.h} radius={30} grow={1.02} cam={(f) => push(f, 0, 88, 1.1, 700, 560)}>
        <LockScreen time="15:10" at={30} title="Новый заказ №1245 — принят" sub="Клиент получил чек и подтверждение" />
      </Shot>
    ),
  },
  {
    at: 1428,
    len: 132,
    el: (
      <Shot src="film/phone-top-clean.mp4" cutout="film/phone-top-cutout.webm" track={phoneTop as Track} from={5} rate={1} cw={PH.w} ch={PH.h} radius={34} grow={1.03} cam={(f) => push(f, 0, 132, 1.5, 1170, 560)} screen={{ boxShadow: '0 0 0 30px #120d0a' }}>
        <LockScreen time="16:42" at={40} title="Заказ №1246 — принят" sub="Предзаказ на завтра, 09:30" />
      </Shot>
    ),
  },
  {
    at: 1560,
    len: 200,
    el: (
      <div style={{ position: 'absolute', inset: 0, filter: MATCH }}>
        <Shot src="footage/v3.mp4" track={v3b as Track} from={10} rate={0.9} cw={1512} ch={982} radius={6} cam={(f) => push(f, 0, 40, 1.45, 690, 600)} screen={{ filter: 'brightness(0.9)' }}>
          <Evening />
        </Shot>
      </div>
    ),
  },
  // Act 5 — finale
  { at: 1760, len: 92, el: <Plate src="film/bread-break.mp4" len={92} push={0.05} /> },
  { at: 1852, len: 66, el: <Plate src="film/portrait.mp4" len={66} push={0.04} origin="40% 40%" /> },
  { at: 1918, len: BRAND_FRAMES - 1918, el: <Finale len={BRAND_FRAMES - 1918} contact="" /> },
];

/** Each shot's own sound (the generator's room tone, fire, flour), under the score. */
const AMBIENCE: { at: number; len: number; src: string; from: number; vol: number }[] = [
  { at: 120, len: 150, src: 'film/baker.mp4', from: 0.5, vol: 1.6 },
  { at: 270, len: 90, src: 'film/oven.mp4', from: 1.2, vol: 1.8 },
  { at: 360, len: 180, src: 'film/phone-top.mp4', from: 0, vol: 1.2 },
  { at: 540, len: 120, src: 'film/notebook.mp4', from: 1, vol: 1.2 },
  { at: 1428, len: 132, src: 'film/phone-top.mp4', from: 5, vol: 1.4 },
  { at: 1760, len: 92, src: 'film/bread-break.mp4', from: 0, vol: 2.2 },
  { at: 1852, len: 66, src: 'film/portrait.mp4', from: 0, vol: 1.4 },
];

export const BrandFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 24], [0, 1], clamp);
  const fadeOut = interpolate(frame, [BRAND_FRAMES - 40, BRAND_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
        {CUTS.map((c, i) => (
          <Sequence key={i} from={c.at} durationInFrames={c.len + (i < CUTS.length - 1 ? X : 0)}>
            <DissolveIn on={i > 0}>{c.el}</DissolveIn>
          </Sequence>
        ))}

        {/* Words: few, big, one at a time */}
        <Words at={30} until={100} size={30} code="05:40">
          <span style={{ fontWeight: 500, fontSize: 30, color: 'rgba(255,248,238,0.85)' }}>Пекарня просыпается.</span>
        </Words>
        <Words at={380} until={520} align="top" size={72}>
          8:00. Пекарня открылась.
          <br />
          <Accent color="#F3B27A">И телефон — тоже.</Accent>
        </Words>
        <Words at={680} until={810} size={62} align="top" code="14:02 · ЗАКАЗ №1244">
          Аня заказывает <Accent color="#F3B27A">сама.</Accent>
        </Words>
        <Words at={985} until={1130} size={68} code="14:03 · CRM">
          Одно нажатие — <Accent color="#F3B27A">и Аня уже знает.</Accent>
        </Words>
        <Words at={1440} until={1550} size={68} align="top" code="16:42">
          Заказы идут. <Accent color="#F3B27A">Руки — в тесте.</Accent>
        </Words>
        <Words at={1600} until={1740} size={68} code="21:00 · ЗАКРЫТИЕ СМЕНЫ">
          Смена закрыта <Accent color="#F3B27A">за минуту.</Accent>
        </Words>
      </AbsoluteFill>
      <Finish />

      {/* Sound */}
      <Audio src={staticFile('music-animatic.mp3')} volume={(f) => 0.75 * interpolate(f, [BRAND_FRAMES - 40, BRAND_FRAMES], [1, 0], clamp)} />
      {AMBIENCE.map((a, i) => (
        <Sequence key={i} from={a.at} durationInFrames={a.len} layout="none">
          <Audio src={staticFile(a.src)} startFrom={Math.round(a.from * 30)} volume={(f) => a.vol * Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [a.len - 8, a.len], [1, 0], clamp))} />
        </Sequence>
      ))}
      {/* The morning's calls: they start with the phone, pile up, and drop out at the turn */}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={366 + i * 30} durationInFrames={660 - 366 - i * 30} layout="none">
          <Audio src={staticFile(`sfx/ring${i + 1}.wav`)} loop volume={(f) => 0.24 * interpolate(f + 366 + i * 30, [630, 658], [1, 0], clamp)} />
        </Sequence>
      ))}
      <Sfx at={366} name="buzz" volume={0.5} />
      <Sfx at={840} name="tap" volume={0.8} />
      <Sfx at={854} name="chime" volume={0.4} />
      <Sfx at={854} name="whoosh" volume={0.4} />
      <Sfx at={885 + 30} name="pop" volume={0.6} />
      <Sfx at={885 + 120} name="tap" volume={0.8} />
      <Sfx at={885 + 150} name="ding" volume={0.45} />
      <Sfx at={1145 + 10} name="pop" volume={0.45} />
      <Sfx at={1145 + 48} name="pop" volume={0.45} />
      <Sfx at={1340 + 30} name="ding" volume={0.35} />
      <Sfx at={1428 + 40} name="ding" volume={0.3} />
      {[50, 142, 178].map((c) => (
        <Sfx key={c} at={1560 + c} name="tap" volume={0.6} />
      ))}
    </AbsoluteFill>
  );
};

const DissolveIn: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: on ? interpolate(frame, [0, X], [0, 1], clamp) : 1 }}>{children}</AbsoluteFill>;
};
