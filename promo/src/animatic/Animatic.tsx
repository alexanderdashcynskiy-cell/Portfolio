import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, MONO, SANS } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { PH, ppt } from '../deck/devices';
import { GREETING, RECEIPT, TgChat } from '../deck/arts';
import { DayCrm, Evening, IncomingCall, Note, OrderShot, push, Shade, Shot, Track } from '../footage/Film';
import v1 from '../footage/tracks/v1.json';
import v2 from '../footage/tracks/v2.json';
import v3b from '../footage/tracks/v3b.json';
import v4tail from '../footage/tracks/v4tail.json';

/*
 * The brand film, as an animatic: five acts cut to a draft score. Scenes that exist are the
 * real footage with the product on their screens; scenes still to be generated are marked
 * slates with the shot's description, so the rhythm and the story can be judged first.
 */

export const ANIMATIC_FRAMES = 2100; // 70 s

// Act boundaries, in frames.
const ACT2 = 360; // tension: the phone on the floured table
const ACT3 = 660; // transformation: Аня, the card, the CRM
const ACT4 = 1350; // relief: the baker works, the system answers
const ACT5 = 1760; // finale: bread, the baker, dawn

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));

/* ───────────── A slate for a scene that is still to be shot ───────────── */

const Slate: React.FC<{ n: number; kind: string; text: string; seconds: number; warm?: number }> = ({ n, kind, text, seconds, warm = 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { stiffness: 120, damping: 20 } });
  // A slow light drifting across, so the slate has a pulse like the footage around it.
  const x = 30 + 40 * Math.sin(frame / 90);
  const bg = `radial-gradient(70% 90% at ${x}% 60%, rgba(${120 + warm * 60},${70 + warm * 30},${30}, 0.55) 0%, rgba(14,9,6,1) 70%)`;
  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: 0.25, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
      <div style={{ position: 'absolute', left: 110, top: 90, display: 'flex', alignItems: 'center', gap: 18, fontFamily: MONO, fontSize: 22, letterSpacing: '0.16em', color: 'rgba(255,240,220,0.7)', opacity: inP }}>
        <span style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,200,140,0.5)', color: '#F3B27A' }}>НОВЫЙ КАДР</span>
        <span>СЦЕНА {String(n).padStart(2, '0')} · {kind} · {seconds} С</span>
      </div>
      <div style={{ position: 'absolute', left: 110, right: 110, top: '50%', transform: `translateY(-50%) translateY(${(1 - inP) * 20}px)`, opacity: inP, fontFamily: SANS, fontWeight: 600, fontSize: 48, lineHeight: 1.25, color: 'rgba(255,245,232,0.92)', maxWidth: 1200 }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── Words: one phrase at a time, big, with room to read ───────────── */

export const Words: React.FC<{ at: number; until: number; children: React.ReactNode; size?: number; align?: 'left' | 'center' | 'top'; code?: string }> = ({ at, until, children, size = 84, align = 'left', code }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > until + 14) return null;
  const p = ease(frame, at, at + 22);
  const out = ease(frame, until, until + 14);
  const base: React.CSSProperties = { position: 'absolute', fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.06, letterSpacing: '-0.035em', color: '#FFF8EE', textShadow: '0 8px 40px rgba(0,0,0,0.55)', opacity: Math.min(p, 1 - out), transform: `translateY(${(1 - p) * 24 - out * 16}px)` };
  const pos: React.CSSProperties = align === 'center' ? { left: 0, right: 0, top: '50%', textAlign: 'center', transform: `${base.transform} translateY(-50%)` } : align === 'top' ? { left: 110, top: 96, maxWidth: 580 } : { left: 110, bottom: 110, maxWidth: 1100 };
  return (
    <div style={{ ...base, ...pos }}>
      {code && <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 500, letterSpacing: '0.14em', color: '#F3B27A', marginBottom: 18 }}>{code}</div>}
      {children}
    </div>
  );
};

/* ───────────── Act 1: the bakery wakes ───────────── */

export const Dawn: React.FC<{ from: number; rate?: number; dim?: number; len: number }> = ({ from, rate = 0.6, dim = 0.5, len }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile('video/dawn.mp4')} startFrom={from} playbackRate={rate} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + 0.06 * (frame / len)})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, rgba(20,10,4,${dim * 0.5}) 0%, rgba(20,10,4,${Math.min(0.9, dim + 0.3)}) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ───────────── Act 3: the card leaves the phone ───────────── */

/** Аня's order lifts off her phone and flies out of the frame to the right. */
export const CardOut: React.FC<{ at: number; x0?: number; y0?: number }> = ({ at, x0 = 1010, y0 = 420 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = ease(frame, at, at + 34);
  const lift = ease(frame, at, at + 12);
  const x = x0 + t * 1300;
  const y = y0 - Math.sin(t * Math.PI) * 220 + t * 60;
  const s = 0.42 + lift * 0.28;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 294, height: 612, transform: `scale(${s}) rotate(${-4 + t * 18}deg)`, transformOrigin: '0 0', filter: `blur(${t * 2.5}px)`, zIndex: 50 }}>
      <Img src={staticFile('3d/card1244.png')} style={{ width: '100%', height: '100%', borderRadius: 26, boxShadow: `0 ${20 + lift * 30}px ${40 + lift * 40}px rgba(0,0,0,0.35)` }} />
    </div>
  );
};

/** …and arrives from the left in the CRM shot, into the empty slot. */
export const CardIn: React.FC<{ len: number }> = ({ len }) => {
  const frame = useCurrentFrame();
  if (frame > len) return null;
  const t = ease(frame, 0, len);
  const x = -300 + t * 1180;
  const y = 180 - Math.sin(t * Math.PI) * 160 + t * 120;
  const s = 0.7 - t * 0.3;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 294, height: 612, transform: `scale(${s}) rotate(${14 - t * 14}deg)`, transformOrigin: '0 0', filter: `blur(${(1 - t) * 2}px)`, opacity: 1 - ease(frame, len - 6, len), zIndex: 50 }}>
      <Img src={staticFile('3d/card1244.png')} style={{ width: '100%', height: '100%', borderRadius: 26, boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }} />
    </div>
  );
};

const CHAT_CONFIRM = [
  { lines: RECEIPT, time: '14:02', at: 10 },
  { lines: GREETING, time: '14:02', at: 48 },
];

export const AnyaConfirm: React.FC = () => (
  <Shot src="footage/v4-tail-clean.mp4" cutout="footage/v4-tail-cutout.webm" track={v4tail as Track} from={0} rate={1} cw={PH.w} ch={PH.h} radius={34} grow={1.03} cam={(f) => push(f, 0, 50, 1.28, 760, 560)} screen={{ boxShadow: '0 0 0 40px #F9F9F9' }}>
    <TgChat messages={CHAT_CONFIRM} />
    <div style={{ position: 'absolute', left: ppt(130), top: 0, width: ppt(170), height: ppt(58), background: '#F9F9F9' }} />
  </Shot>
);

/* ───────────── Act 4: the silent phone ───────────── */

const QuietPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 70, fps: 30, config: { stiffness: 160, damping: 20 } });
  return (
    <>
      <Slate n={8} kind="СРЕДНИЙ ПЛАН" text="Пекарь спокойно достаёт противень с хлебом. Рядом на прилавке лежит телефон экраном вверх. Он молчит." seconds={7} warm={0.8} />
      <div style={{ position: 'absolute', right: 120, top: 120, width: 560, padding: '18px 22px', borderRadius: 24, background: 'rgba(28,20,14,0.5)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.16)', color: '#FFF8EE', fontFamily: SANS, display: 'flex', gap: 16, alignItems: 'flex-start', opacity: p, transform: `translateY(${(1 - p) * -28}px)` }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: '#2AABEE', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✈</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,248,238,0.6)' }}>CRM · ПЕКАРНЯ · сейчас</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>Новый заказ №1245 — принят</div>
          <div style={{ fontSize: 20, color: 'rgba(255,248,238,0.78)', marginTop: 2 }}>Клиент получил чек и подтверждение</div>
        </div>
      </div>
    </>
  );
};

/* ───────────── Act 5 ───────────── */

export const Finale: React.FC<{ len: number; contact?: string }> = ({ len, contact = '[контакт]' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a1 = spring({ frame: frame - 20, fps, config: { stiffness: 100, damping: 20 } });
  const a2 = spring({ frame: frame - 60, fps, config: { stiffness: 100, damping: 20 } });
  const cta = ease(frame, 120, 140);
  return (
    <AbsoluteFill>
      <Dawn from={30} rate={0.5} dim={0.55} len={len} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1.08, letterSpacing: '-0.035em', color: C.cream, textShadow: '0 10px 40px rgba(0,0,0,0.45)', paddingBottom: 60 }}>
        <div style={{ opacity: a1, transform: `translateY(${(1 - a1) * 30}px)` }}>Руки — для теста.</div>
        <div style={{ opacity: a2, transform: `translateY(${(1 - a2) * 30}px)` }}>
          <Accent color="#F09A5B">Заказы — для системы.</Accent>
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', opacity: cta }}>
        <div style={{ display: 'inline-block', padding: '16px 36px', borderRadius: 999, border: '1.5px solid rgba(251,246,238,0.5)', fontFamily: SANS, fontSize: 28, fontWeight: 600, color: C.cream }}>
          Покажу на вашей пекарне за 15 минут{contact && <> · <span style={{ fontFamily: MONO, color: '#F3B27A' }}>{contact}</span></>}
        </div>
        <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 20, color: 'rgba(251,246,238,0.6)' }}>Mini App + CRM для пекарни · Alexander Dashcynskiy — дизайн и разработка</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── The animatic ───────────── */

export const Animatic: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [ANIMATIC_FRAMES - 40, ANIMATIC_FRAMES], [1, 0], clamp);
  const cut = (at: number, len: number, el: React.ReactNode, key: string) => (
    <Sequence key={key} from={at} durationInFrames={len}>
      {el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: '#000', opacity: fadeOut }}>
      {/* Act 1 — atmosphere: 0–12 s */}
      {cut(0, 130, <Dawn from={0} rate={0.55} dim={0.45} len={130} />, 'a1-1')}
      {cut(130, 80, <Slate n={2} kind="МАКРО" text="Руки пекаря сыплют муку на деревянный стол. Пыль муки в контровом свете, замедленно." seconds={3} warm={0.6} />, 'a1-2')}
      {cut(210, 80, <Slate n={3} kind="МАКРО" text="Руки месят тесто. Замедленно, видна фактура, тёплый боковой свет." seconds={3} warm={0.6} />, 'a1-3')}
      {cut(290, 70, <Slate n={4} kind="СРЕДНИЙ ПЛАН" text="Пекарь открывает печь. Пар и тёплый свет на лице, внутри хлеб." seconds={2} warm={0.9} />, 'a1-4')}
      <Words at={40} until={120} size={30} code="05:40">
        <span style={{ fontWeight: 500, fontSize: 30, color: 'rgba(255,248,238,0.8)' }}>Пекарня просыпается.</span>
      </Words>

      {/* Act 2 — tension: 12–22 s */}
      {cut(ACT2, 170, (
        <Shot src="footage/v1-clean.mp4" cutout="footage/v1-cutout.webm" track={v1 as Track} from={0} rate={1} cw={860} ch={397} radius={60} grow={1.06} cam={(f) => push(f, 0, 170, 1.2, 1000, 760)} screen={{ filter: 'brightness(0.95)', boxShadow: '0 0 0 160px #191c21' }}>
          <IncomingCall />
        </Shot>
      ), 'a2-1')}
      {cut(ACT2 + 170, 60, <Slate n={5} kind="КРУПНЫЙ ПЛАН" text="Руки в муке замирают над вибрирующим телефоном. Телефон лежит экраном вверх на столе." seconds={2} warm={0.4} />, 'a2-2')}
      {cut(ACT2 + 230, 70, <Slate n={6} kind="МАКРО" text="Старая тетрадь с зачёркнутыми заказами от руки. Мука на странице." seconds={2} warm={0.4} />, 'a2-3')}
      <Words at={ACT2 + 20} until={ACT2 + 150} align="top" size={76}>
        8:00. Пекарня открылась.
        <br />
        <Accent color="#F3B27A">И телефон — тоже.</Accent>
      </Words>

      {/* Act 3 — transformation: 22–45 s */}
      {cut(ACT3, 220, (
        <>
          <OrderShot />
          <CardOut at={200} />
        </>
      ), 'a3-1')}
      {cut(ACT3 + 220, 60, <Slate n={7} kind="МАКРО" text="Большой палец клиента нажимает на экран телефона. Витрина мягко размыта сзади." seconds={2} warm={0.7} />, 'a3-2')}
      {cut(ACT3 + 280, 260, (
        <>
          <Shot src="footage/v2.mp4" track={v2 as Track} from={0} rate={0.8} cw={1512} ch={982} radius={6} cam={(f) => push(f, 20, 70, 1.45, 812, 560, [230, 260, 1.12])}>
            <DayCrm />
          </Shot>
          <CardIn len={30} />
        </>
      ), 'a3-3')}
      {cut(ACT3 + 540, 150, <AnyaConfirm />, 'a3-4')}
      <Sequence from={ACT3} durationInFrames={ACT4 - ACT3} layout="none">
        <Shade />
      </Sequence>
      <Words at={ACT3 + 30} until={ACT3 + 200} size={62} align="top" code="14:02 · ЗАКАЗ №1244">
        Аня заказывает <Accent color="#F3B27A">сама.</Accent>
      </Words>
      <Words at={ACT3 + 300} until={ACT3 + 520} size={72} code="14:03 · CRM">
        Одно нажатие — <Accent color="#F3B27A">и Аня уже знает.</Accent>
      </Words>
      <Sequence from={ACT3 + 280} durationInFrames={260} layout="none">
        <Note at={150} until={250} icon="✈" head="TELEGRAM → АНЯ" title="🧾 Чек и «Заказ №1244 принят»" sub="Бот отправил сам, сразу после «Принять»" />
      </Sequence>

      {/* Act 4 — relief: 45–58.7 s */}
      {cut(ACT4, 210, <QuietPhone />, 'a4-1')}
      {cut(ACT4 + 210, ACT5 - ACT4 - 210, (
        <Shot src="footage/v3.mp4" track={v3b as Track} from={10} rate={0.9} cw={1512} ch={982} radius={6} cam={(f) => push(f, 0, 40, 1.45, 690, 600)} screen={{ filter: 'brightness(0.9)' }}>
          <Evening />
        </Shot>
      ), 'a4-2')}
      <Sequence from={ACT4 + 210} durationInFrames={ACT5 - ACT4 - 210} layout="none">
        <Shade />
      </Sequence>
      <Words at={ACT4 + 20} until={ACT4 + 190} size={72} code="15:10">
        Заказы идут. <Accent color="#F3B27A">Руки — в тесте.</Accent>
      </Words>
      <Words at={ACT4 + 230} until={ACT5 - 20} size={72} code="21:00 · ЗАКРЫТИЕ СМЕНЫ">
        Смена закрыта <Accent color="#F3B27A">за минуту.</Accent>
      </Words>

      {/* Act 5 — finale: 58.7–70 s */}
      {cut(ACT5, 80, <Slate n={9} kind="МАКРО" text="Руки разламывают свежий хлеб. Пар, хруст корочки, замедленно." seconds={3} warm={0.9} />, 'a5-1')}
      {cut(ACT5 + 80, 80, <Slate n={10} kind="ПОРТРЕТ" text="Пекарь мягко улыбается и возвращается к тесту. Утренний свет." seconds={3} warm={0.9} />, 'a5-2')}
      {cut(ACT5 + 160, ANIMATIC_FRAMES - ACT5 - 160, <Finale len={ANIMATIC_FRAMES - ACT5 - 160} />, 'a5-3')}

      {/* Sound: the draft score, the morning rings, the product */}
      <Audio src={staticFile('music-animatic.mp3')} volume={0.9} />
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={ACT2 + 6 + i * 26} durationInFrames={ACT3 - ACT2 - 6 - i * 26} layout="none">
          <Audio src={staticFile(`sfx/ring${i + 1}.wav`)} loop volume={(f) => 0.26 * interpolate(f + ACT2 + 6 + i * 26, [ACT3 - 40, ACT3 - 2], [1, 0], clamp)} />
        </Sequence>
      ))}
      <Sfx at={ACT3 + 200} name="whoosh" volume={0.4} />
      <Sfx at={ACT3 + 280 + 30} name="pop" volume={0.6} />
      <Sfx at={ACT3 + 280 + 120} name="tap" volume={0.8} />
      <Sfx at={ACT3 + 280 + 150} name="ding" volume={0.5} />
      <Sfx at={ACT3 + 540 + 10} name="pop" volume={0.5} />
      <Sfx at={ACT3 + 540 + 48} name="pop" volume={0.5} />
      <Sfx at={ACT4 + 70} name="ding" volume={0.4} />
      {[50, 142, 178].map((c) => (
        <Sfx key={c} at={ACT4 + 210 + c} name="tap" volume={0.7} />
      ))}
      <Sequence from={ACT5 + 160} layout="none">
        <OffthreadVideo src={staticFile('video/dawn.mp4')} startFrom={30} playbackRate={0.5} volume={(f) => 1.6 * interpolate(f, [0, 40], [0, 1], clamp)} style={{ width: 1, height: 1, opacity: 0 }} />
      </Sequence>

      {/* A frame counter for notes on the cut */}
      <div style={{ position: 'absolute', right: 40, bottom: 28, fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.45)' }}>
        АНИМАТИК · {String(Math.floor(frame / 30 / 60)).padStart(2, '0')}:{String(Math.floor((frame / 30) % 60)).padStart(2, '0')}
      </div>
    </AbsoluteFill>
  );
};
