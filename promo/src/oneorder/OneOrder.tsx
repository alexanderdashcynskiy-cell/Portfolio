import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, MONO, SANS, Tap } from '../ui';
import { Badge, clamp, easeInOut, Sfx } from '../kit';
import { Laptop, lpx, LP, LP_Y, PhoneScreen, ppt, PH, PH_X, PH_Y } from '../deck/devices';
import { Back, BUTTON, CARD, Cursor, GREETING, ISSUED, RATED, READY, RECEIPT, REVIEW, SidePhone, TgChat, THANKS } from '../deck/arts';

/*
 * «Один заказ»: one take that follows Аня's order №1244 from her phone to the closing of the
 * shift. The phone keeps ringing from the first frame; every step of the order hangs up one of
 * those calls, until the bakery is quiet.
 */

// Beats, in frames.
export const ORDER = 165;
const ACCEPT = 415;
const READY_AT = 615;
const RATING = 765;
const REPLY = 975;
const NUMBERS = 1125;
const RECON = 1255;
const END = 1495;
export const ONE_ORDER_FRAMES = 1765;

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ───────────── The calls ───────────── */

const CALLS = [
  { q: '«Алло! Можно сделать заказ?»', end: ORDER + 112 },
  { q: '«Как вас зовут? На сколько?»', end: ORDER + 170 },
  { q: '«Мой заказ приняли?»', end: ACCEPT + 92 },
  { q: '«Ну что, готово?»', end: READY_AT + 56 },
  { q: '«Вам всё понравилось?»', end: RATING + 120 },
  // The evening calls come in at their own time, already in the list.
  { q: '«Сколько сегодня наторговали?»', end: NUMBERS + 70, at: NUMBERS + 10 },
  { q: '«Почему касса не сходится?»', end: RECON + 160, at: RECON + 10 },
] as { q: string; end: number; at?: number }[];
const RING_AT = (i: number) => CALLS[i].at ?? 10 + i * 16;
const MORNING = CALLS.filter((c) => c.at === undefined).length;
// Where each call sits in the dark opening, before it settles into the list.
const SCATTER = [
  [1060, 170], [1300, 350], [1000, 530], [1260, 710], [1040, 880], [120, 0], [120, 0],
];
const LIST_Y = 610;
const ROW = 50;

const Rings: React.FC = () => (
  <>
    {CALLS.slice(0, MORNING).map((c, i) => {
      const from = RING_AT(i);
      const stop = ORDER - 4;
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={stop - from} layout="none">
            <Audio
              src={staticFile(`sfx/ring${(i % 4) + 1}.wav`)}
              loop
              volume={(f) => 0.3 * interpolate(f + from, [ORDER - 50, stop], [1, 0], clamp)}
            />
          </Sequence>
        </React.Fragment>
      );
    })}
    {CALLS.map((c) => (
      <Sfx key={c.end} at={c.end} name="hangup" volume={0.25} />
    ))}
    {/* An evening call only buzzes once: no more ringing after the morning. */}
    {CALLS.filter((c) => c.at !== undefined).map((c) => (
      <Sfx key={c.at} at={c.at as number} name="buzz" volume={0.3} />
    ))}
  </>
);

/** One call: a ringing card in the dark opening, then a line in the list that gets struck out. */
const Call: React.FC<{ i: number; morph: number }> = ({ i, morph }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = CALLS[i];
  const inP = spring({ frame: frame - RING_AT(i), fps, config: { stiffness: 220, damping: 16 } });
  const shake = morph < 1 ? Math.sin(frame * 2.2 + i) * 3 * (1 - morph) * ((frame - RING_AT(i)) % 40 < 18 ? 1 : 0) : 0;
  const strike = interpolate(frame, [c.end, c.end + 10], [0, 1], clamp);
  const ringing = frame < c.end;
  const pulse = ringing ? 0.5 + 0.5 * Math.sin(frame / 3) : 0;
  const m = c.at !== undefined ? 1 : morph;
  const left = lerp(SCATTER[i][0], 120, m) + shake;
  const top = lerp(SCATTER[i][1], LIST_Y + i * ROW, m);
  const w = lerp(600, 660, m);
  const h = lerp(96, ROW - 6, m);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: w,
        height: h,
        display: 'flex',
        alignItems: 'center',
        gap: lerp(22, 16, m),
        padding: `0 ${lerp(26, 0, m)}px`,
        borderRadius: lerp(26, 0, m),
        background: `rgba(38,28,22,${0.92 * (1 - m)})`,
        boxShadow: m < 1 ? `0 20px 50px rgba(0,0,0,${0.5 * (1 - m)})` : undefined,
        opacity: inP,
        transform: `scale(${0.85 + 0.15 * inP})`,
        transformOrigin: '0 50%',
      }}
    >
      <div
        style={{
          width: lerp(52, 30, m),
          height: lerp(52, 30, m),
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ringing ? (m < 0.5 ? '#34C759' : C.orange) : 'rgba(45,21,5,0.12)',
          boxShadow: ringing ? `0 0 0 ${4 + pulse * 6}px ${m < 0.5 ? 'rgba(52,199,89,0.25)' : 'rgba(208,105,42,0.2)'}` : undefined,
          color: '#fff',
          fontSize: lerp(26, 15, m),
        }}
      >
        {ringing ? '✆' : <span style={{ color: 'rgba(45,21,5,0.5)' }}>✓</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        {m < 0.6 && <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 600, color: 'rgba(251,246,238,0.55)', opacity: 1 - m / 0.6 }}>Входящий вызов</div>}
        <div
          style={{
            fontFamily: SANS,
            fontWeight: lerp(700, 600, m),
            fontSize: lerp(30, 24, m),
            whiteSpace: 'nowrap',
            color: m < 0.5 ? C.cream : C.ink,
            opacity: ringing ? 1 : 1 - 0.55 * strike,
            textDecorationLine: 'line-through',
            textDecorationThickness: 3,
            textDecorationColor: `rgba(208,105,42,${strike})`,
          }}
        >
          {c.q}
        </div>
      </div>
    </div>
  );
};

/* ───────────── The left column: the time, one plain sentence, what it replaced ───────────── */

const BEATS = [
  { at: ORDER, end: ACCEPT, time: '14:02 · заказ №1244', title: <>Аня заказывает <Accent>сама.</Accent></>, sub: 'В Telegram: меню, корзина, время к 14:30. Имя и телефон — уже в заказе.' },
  { at: ACCEPT, end: READY_AT, time: '14:03 · CRM', title: <>«Принять» — и Аня <Accent>уже знает.</Accent></>, sub: 'Заказ встал в CRM. Бот сам отправил чек и подтверждение.' },
  { at: READY_AT, end: RATING, time: '14:21 · готово', title: <>Готово — бот <Accent>напишет сам.</Accent></>, sub: 'Одна кнопка в CRM — и клиент получает сообщение с адресом.' },
  { at: RATING, end: REPLY, time: '14:33 · выдан', title: <>Пять звёзд — <Accent>без напоминаний.</Accent></>, sub: 'После выдачи бот сам просит оценку и отзыв.' },
  { at: REPLY, end: NUMBERS, time: '14:40 · отзыв', title: <>Ответ — <Accent>в один клик.</Accent></>, sub: 'Отзыв уже в CRM, черновик ответа готовит ИИ. Яндекс Карты и Google — подключаются.' },
  { at: NUMBERS, end: RECON, time: '18:00 · выручка', title: <>Её 8.20 — <Accent>уже в выручке.</Accent></>, sub: 'Выручка, средний чек, пиковые часы и хиты считаются сами.' },
  { at: RECON, end: END, time: '21:00 · закрытие смены', title: <>Смена закрыта <Accent>за минуту.</Accent></>, sub: 'Сверка наличных и карты, причина расхождения — и отчёт смены в Telegram.' },
];

const Column: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {BEATS.map((b, i) => {
        const p = ease(frame, b.at + 4, b.at + 20);
        const out = ease(frame, b.end - 10, b.end + 2);
        if (frame < b.at || frame > b.end + 2) return null;
        const reveal = (q: number): React.CSSProperties => ({ clipPath: `inset(-10px -40px ${(1 - q) * 100}% -10px)`, transform: `translateY(${(1 - q) * 50 - out * 30}px)` });
        return (
          <div key={i} style={{ position: 'absolute', left: 120, top: 200, width: 680, opacity: 1 - out }}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.orange, opacity: p }}>{b.time}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1.05, letterSpacing: '-0.035em', color: C.ink, marginTop: 22, ...reveal(p) }}>{b.title}</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, lineHeight: 1.42, color: '#6F5440', marginTop: 24, opacity: ease(frame, b.at + 14, b.at + 28), transform: `translateY(${-out * 30}px)` }}>{b.sub}</div>
          </div>
        );
      })}
    </>
  );
};

/* ───────────── The laptop: one CRM screen, one camera ───────────── */

type Shot = { at: number; fx: number; fy: number; z: number };
const R = RECON;
const CAM: Shot[] = [
  { at: 0, fx: 756, fy: 491, z: 1 },
  { at: ACCEPT + 8, fx: CARD.x + CARD.w / 2 + 160, fy: CARD.y + CARD.h / 2 + 10, z: 1.45 },
  { at: REPLY, fx: 756, fy: 491, z: 1 },
  { at: REPLY + 18, fx: 1150, fy: 640, z: 1.6 },
  { at: NUMBERS, fx: 756, fy: 491, z: 1 },
  { at: NUMBERS + 18, fx: 460, fy: 330, z: 1.5 },
  { at: NUMBERS + 62, fx: 420, fy: 300, z: 1.4 },
  { at: R, fx: 756, fy: 491, z: 1 },
  { at: R + 16, fx: 590, fy: 440, z: 1.3 },
  { at: R + 44, fx: 900, fy: 560, z: 1.55 },
  { at: R + 92, fx: 756, fy: 480, z: 1.5 },
  { at: R + 128, fx: 1050, fy: 640, z: 1.5 },
];
const SCREENS: { at: number; name: string }[] = [
  { at: 0, name: 'd9-accept-before' },
  { at: ACCEPT + 43, name: 'd9-accepted' },
  { at: READY_AT + 33, name: 'd10-ready' },
  { at: RATING + 31, name: 'd11-issued' },
  { at: REPLY + 8, name: 'r1-review' },
  { at: REPLY + 48, name: 'r2-draft' },
  { at: NUMBERS + 8, name: 'd1-dashboard' },
  { at: NUMBERS + 58, name: 'd2-dashboard-2' },
  { at: R + 8, name: 'c1-recon-input' },
  { at: R + 40, name: 'c2-recon-result' },
  { at: R + 90, name: 'c3-recon-reason' },
  { at: R + 124, name: 'c4-recon-closed' },
];
// Clicks on the CRM, in capture pixels: [frame, x, y].
const CLICKS: [number, number, number][] = [
  [ACCEPT + 40, BUTTON.x, BUTTON.y],
  [READY_AT + 30, BUTTON.x, BUTTON.y],
  [RATING + 28, BUTTON.x, BUTTON.y],
  [REPLY + 44, 1152, 544],
  [REPLY + 70, 1444, 940],
  [R + 36, 756, 519],
  [R + 118, 871, 658],
  [R + 150, 1240, 675],
];

const camAt = (f: number) => {
  let k = 0;
  for (let i = 0; i < CAM.length; i++) if (f >= CAM[i].at) k = i;
  const prev = CAM[Math.max(0, k - 1)];
  const cur = CAM[k];
  const t = k === 0 ? 1 : ease(f, cur.at, cur.at + 18);
  return { fx: lerp(prev.fx, cur.fx, t), fy: lerp(prev.fy, cur.fy, t), z: lerp(prev.z, cur.z, t) };
};

const CrmView: React.FC = () => {
  const frame = useCurrentFrame();
  const { fx, fy, z } = camAt(frame);
  const cl = (v: number, min: number) => Math.min(0, Math.max(min, v));
  const tx = cl(LP.w / 2 - lpx(fx) * z, LP.w - LP.w * z);
  const ty = cl(LP.h / 2 - lpx(fy) * z, LP.h - LP.h * z);
  let k = 0;
  for (let i = 0; i < SCREENS.length; i++) if (frame >= SCREENS[i].at) k = i;
  const fade = interpolate(frame, [SCREENS[k].at, SCREENS[k].at + 6], [0, 1], clamp);
  // Until Аня's order lands, her slot on the board is empty.
  const landed = interpolate(frame, [ACCEPT - 6, ACCEPT + 2], [0, 1], clamp);
  const flash = interpolate(frame, [ACCEPT, ACCEPT + 6, ACCEPT + 30], [0, 1, 0], clamp);
  const ring = spring({ frame: frame - (R + 52), fps: 30, config: { stiffness: 220, damping: 14 } });
  const img = (name: string, o = 1) => <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: o }} />;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: LP.w, height: LP.h, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
      {k > 0 && img(SCREENS[k - 1].name)}
      {img(SCREENS[k].name, fade)}
      {landed < 1 && (
        <div style={{ position: 'absolute', left: lpx(CARD.x - 8), top: lpx(CARD.y - 8), width: lpx(CARD.w + 16), height: lpx(CARD.h + 16), background: '#FAF9F6', opacity: 1 - landed }} />
      )}
      <div style={{ position: 'absolute', left: lpx(CARD.x - 4), top: lpx(CARD.y - 4), width: lpx(CARD.w + 8), height: lpx(CARD.h + 8), borderRadius: lpx(36), border: `${3 / z}px solid ${C.orange}`, boxShadow: `0 0 ${24 / z}px rgba(208,105,42,0.5)`, opacity: flash }} />
      {frame >= R + 40 && frame < R + 90 && (
        <div style={{ position: 'absolute', left: lpx(53), top: lpx(612), width: lpx(1406), height: lpx(66), borderRadius: lpx(14), border: `${lpx(3)}px solid ${C.orange}`, boxShadow: `0 0 ${lpx(18)}px rgba(208,105,42,0.45)`, opacity: ring, transform: `scale(${1.04 - ring * 0.04})` }} />
      )}
      {CLICKS.map(([at, x, y], i) => (
        <Sequence key={i} from={at - 24} durationInFrames={40} layout="none">
          <Cursor x={x} y={y} from={0} click={24} scale={z} />
        </Sequence>
      ))}
    </div>
  );
};

/* ───────────── The phone: the Mini App, then the bot's chat ───────────── */

const P = (x: number, y: number) => ({ x: ppt(x), y: ppt(y) });
const o = (n: number) => ORDER + n;

export const MiniApp: React.FC = () => {
  const frame = useCurrentFrame();
  const adds = [o(8), o(46), o(58)];
  const count = adds.filter((t) => frame >= t).length;
  const changedAt = [...adds].reverse().find((t) => frame >= t) ?? 0;
  const scroll = ease(frame, o(20), o(34));
  const cart = ease(frame, o(76), o(90));
  const checkout = ease(frame, o(116), o(130));
  const done = ease(frame, o(192), o(206));
  const drift = ppt(240);
  const boxes = [
    { y: 183, h: 64, at: o(134) },
    { y: 255, h: 67, at: o(146) },
    { y: 373, h: 65, at: o(158) },
    { y: 590, h: 67, at: o(170) },
  ];
  return (
    <>
      <PhoneScreen name="m1-home" style={{ transform: `translateY(${-scroll * drift}px)`, opacity: 1 - scroll }} />
      <PhoneScreen name="m2-feed" style={{ transform: `translateY(${(1 - scroll) * drift}px)`, opacity: scroll }} />
      {cart < 1 && <Badge count={count} changedAt={changedAt} {...P(409, 87)} size={ppt(19)} />}
      {frame >= o(34) && cart < 1 && <Badge count={count} changedAt={changedAt} {...P(398, 831)} size={ppt(17)} />}
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - cart) * 100}%)` }}>
        <PhoneScreen name="m4-cart" />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - checkout) * 100}%)` }}>
        <PhoneScreen name="m5-checkout" />
        {boxes.map((b, i) => {
          const p = spring({ frame: frame - b.at, fps: 30, config: { stiffness: 260, damping: 16 } });
          return <div key={i} style={{ position: 'absolute', left: ppt(12), top: ppt(b.y - 4), width: ppt(406), height: ppt(b.h + 8), borderRadius: ppt(16), border: `3px solid ${C.orange}`, boxShadow: '0 0 0 6px rgba(208,105,42,0.15)', opacity: p * (1 - done), transform: `scale(${1.08 - p * 0.08})` }} />;
        })}
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: done, transform: `scale(${1.04 - done * 0.04})` }}>
        <PhoneScreen name="m6-receipt" />
      </div>
      <Tap at={o(8)} {...P(270, 748)} />
      <Tap at={o(46)} {...P(191, 544)} />
      <Tap at={o(58)} {...P(390, 545)} />
      <Tap at={o(72)} {...P(360, 860)} />
      <Tap at={o(112)} {...P(331, 862)} />
      <Tap at={o(186)} {...P(215, 702)} />
      {[8, 46, 58, 72, 112, 186].map((t) => (
        <Sfx key={t} at={o(t)} name="tap" volume={0.8} />
      ))}
      {boxes.map((b) => (
        <Sfx key={b.at} at={b.at} name="tick" volume={0.6} />
      ))}
      <Sfx at={o(196)} name="chime" volume={0.5} />
    </>
  );
};

// The bot's messages, in frames from ACCEPT (the chat is a sequence that starts there).
const a = (f: number) => f - ACCEPT;
const CHAT = [
  { lines: RECEIPT, time: '14:02', at: a(ACCEPT + 66), goneAt: a(RATING + 30) },
  { lines: GREETING, time: '14:02', at: a(ACCEPT + 90), goneAt: a(READY_AT + 40) },
  { lines: READY, time: '14:21', at: a(READY_AT + 54), goneAt: a(REPLY + 60) },
  { lines: ISSUED, time: '14:33', at: a(RATING + 40), goneAt: a(RATING + 84), keyboard: ['⭐ 1', '⭐ 2', '⭐ 3', '⭐ 4', '⭐ 5'], pressed: { key: 4, at: a(RATING + 74) } },
  { lines: RATED, time: '14:33', at: a(RATING + 90), goneAt: a(RATING + 132) },
  { lines: [{ t: REVIEW }], time: '14:34', at: a(RATING + 116), out: true },
  { lines: THANKS, time: '14:34', at: a(RATING + 136) },
  { lines: [{ t: '💬 Ответ на ваш отзыв (заказ №1244):', b: true }, { t: '' }, { t: 'Аня, спасибо за тёплый отзыв! Рады,' }, { t: 'что перепечи понравились — ждём вас снова 🥐' }], time: '14:40', at: a(REPLY + 94) },
];
const CHAT_SFX: [number, string][] = [
  [ACCEPT + 66, 'pop'], [ACCEPT + 90, 'pop'], [READY_AT + 54, 'ding'], [RATING + 40, 'ding'], [RATING + 74, 'tap'], [RATING + 90, 'pop'], [RATING + 116, 'pop'], [RATING + 136, 'pop'], [REPLY + 94, 'ding'],
];

const PhoneSide: React.FC<{ focus: number }> = ({ focus }) => {
  const frame = useCurrentFrame();
  const chat = ease(frame, ACCEPT + 46, ACCEPT + 58);
  const gone = ease(frame, NUMBERS, NUMBERS + 22);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${gone * 700}px)`, opacity: 1 - gone }}>
      <SidePhone at={ORDER} focus={focus}>
        <MiniApp />
        <div style={{ position: 'absolute', inset: 0, opacity: chat, transform: `translateY(${(1 - chat) * 30}px)` }}>
          <Sequence from={ACCEPT} layout="none">
            <TgChat messages={CHAT} />
          </Sequence>
        </div>
      </SidePhone>
    </div>
  );
};

/** Which device has the floor: 1 = the phone steps forward, 0 = the laptop. */
const FOCUS: [number, number][] = [
  [0, 1],
  [ORDER + 205, 0],
  [ACCEPT + 56, 1],
  [READY_AT, 0],
  [READY_AT + 44, 1],
  [RATING, 0],
  [RATING + 38, 1],
  [REPLY, 0],
  [REPLY + 84, 1],
  [NUMBERS, 0],
];
const focusAt = (f: number) => {
  let k = 0;
  for (let i = 0; i < FOCUS.length; i++) if (f >= FOCUS[i][0]) k = i;
  if (k === 0) return FOCUS[0][1];
  return lerp(FOCUS[k - 1][1], FOCUS[k][1], ease(f, FOCUS[k][0], FOCUS[k][0] + 18));
};

/** Аня's order leaves the phone as a card and lands in its slot on the CRM board. */
const Flight: React.FC = () => {
  const frame = useCurrentFrame();
  const from = ORDER + 200;
  const to = ACCEPT;
  if (frame < from || frame > to + 4) return null;
  const t = ease(frame, from + 4, to - 2);
  const w = lpx(CARD.w);
  const h = lpx(CARD.h);
  const x = lerp(1430, LP.x + lpx(CARD.x), t);
  const y = lerp(300, LP_Y + lpx(CARD.y), t) - Math.sin(t * Math.PI) * 140;
  const s = lerp(0.62, 1, t);
  const op = Math.min(interpolate(frame, [from, from + 6], [0, 1], clamp), interpolate(frame, [to - 2, to + 4], [1, 0], clamp));
  const row = (l: string, r: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#334', marginTop: 6 }}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${s}) rotate(${(1 - t) * -6}deg)`, transformOrigin: '0 0', opacity: op, borderRadius: 18, background: '#fff', boxShadow: `0 ${30 * (1 - t) + 6}px ${60 * (1 - t) + 14}px rgba(45,21,5,0.3)`, padding: 14, fontFamily: SANS, zIndex: 50 }}>
      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, background: '#D1FAE5', color: '#047857', fontWeight: 800, fontSize: 17 }}># 1244</div>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', marginTop: 14 }}>ЗАКАЗЧИК</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>АНЯ</div>
      <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>+375 (33) 214-55-08</div>
      <div style={{ height: 1, background: '#eef0f3', margin: '12px 0' }} />
      {row('Перепечи с Сыром', '2.50')}
      {row('Круассан Французский', '3.50')}
      {row('Пончик Глазированный', '2.20')}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
        <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em' }}>ИТОГО</span>
        <span>8.20 руб</span>
      </div>
      <div style={{ marginTop: 18, padding: '9px 0', borderRadius: 12, background: '#059669', color: '#fff', fontSize: 11, fontWeight: 800, textAlign: 'center', letterSpacing: '0.08em' }}>✅ ПРИНЯТЬ ЗАКАЗ</div>
    </div>
  );
};

/** A note pinned over the laptop: a Telegram message or the CRM's own figure. */
const Note: React.FC<{ at: number; until?: number; icon: string; head: string; title: string; sub: string; color?: string }> = ({ at, until = 99999, icon, head, title, sub, color = '#2AABEE' }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - at, fps: 30, config: { stiffness: 220, damping: 18 } });
  const out = interpolate(frame, [until, until + 10], [1, 0], clamp);
  if (frame < at) return null;
  return (
    <div style={{ position: 'absolute', left: LP.x + LP.w - 660, top: LP_Y + 30, width: 640, padding: '24px 28px', borderRadius: 26, background: '#fff', boxShadow: '0 30px 60px rgba(45,21,5,0.25)', fontFamily: SANS, display: 'flex', gap: 22, alignItems: 'center', transform: `translateY(${(1 - p) * -50}px)`, opacity: Math.min(p, out), zIndex: 40 }}>
      <div style={{ width: 74, height: 74, borderRadius: 37, background: color, color: '#fff', fontSize: 34, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#8a96a3', letterSpacing: '0.05em' }}>{head}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#111', marginTop: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: '#555', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

/* ───────────── The film ───────────── */

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(120% 100% at 70% 40%, #FBF6EE 0%, #F3EADF 60%, #EADDCD 100%)' }} />
);

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame: frame - 10, fps, config: { stiffness: 120, damping: 20 } });
  const l2 = spring({ frame: frame - 52, fps, config: { stiffness: 120, damping: 20 } });
  const out = ease(frame, 118, 140);
  return (
    <div style={{ position: 'absolute', left: 120, top: 380, fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.08, letterSpacing: '-0.035em', color: C.cream, opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 30}px)` }}>8:00. Пекарня<br />открылась.</div>
      <div style={{ opacity: l2, transform: `translateY(${(1 - l2) * 30}px)`, marginTop: 20 }}>
        <Accent color="#F09A5B">И телефон — тоже.</Accent>
      </div>
    </div>
  );
};

const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = ease(frame, END + 6, END + 40);
  const a1 = spring({ frame: frame - (END + 44), fps, config: { stiffness: 110, damping: 20 } });
  const a2 = spring({ frame: frame - (END + 82), fps, config: { stiffness: 110, damping: 20 } });
  const a3 = ease(frame, END + 130, END + 150);
  if (frame < END) return null;
  const local = frame - END;
  return (
    <AbsoluteFill style={{ opacity: v }}>
      <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
        <Sequence from={END} layout="none">
          <OffthreadVideo src={staticFile('video/dawn.mp4')} startFrom={30} playbackRate={0.6} volume={(f) => 2.2 * interpolate(f, [0, 40], [0, 1], clamp)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + 0.05 * (local / 270)})` }} />
        </Sequence>
        <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 45%, rgba(20,10,4,0.3) 0%, rgba(20,10,4,0.85) 100%)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 120, lineHeight: 1.08, letterSpacing: '-0.035em', color: C.cream, textShadow: '0 10px 40px rgba(0,0,0,0.45)' }}>
        <div style={{ opacity: a1, transform: `translateY(${(1 - a1) * 30}px)` }}>Тишина.</div>
        <div style={{ opacity: a2, transform: `translateY(${(1 - a2) * 30}px)` }}>
          <Accent color="#F09A5B">Можно печь.</Accent>
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 24, color: 'rgba(251,246,238,0.75)', opacity: a3 }}>
        Mini App + CRM для пекарни · Alexander Dashcynskiy — дизайн и разработка
      </div>
    </AbsoluteFill>
  );
};

export const OneOrder: React.FC = () => {
  const frame = useCurrentFrame();
  const morph = ease(frame, 130, 172);
  const stage = ease(frame, 128, 160);
  const stageOut = ease(frame, END, END + 30);
  const focus = focusAt(frame);
  const fadeOut = interpolate(frame, [ONE_ORDER_FRAMES - 30, ONE_ORDER_FRAMES], [1, 0], clamp);
  const allQuiet = ease(frame, RECON + 175, END - 10);
  return (
    <AbsoluteFill style={{ background: '#0d0805', opacity: fadeOut }}>
      <AbsoluteFill style={{ opacity: stage * (1 - stageOut) }}>
        <Backdrop />
        <Back focus={focus}>
          <Laptop>
            <CrmView />
          </Laptop>
        </Back>
        <PhoneSide focus={focus} />
        <Flight />
        <Note at={NUMBERS + 40} until={RECON - 6} icon="+" color={C.orange} head="CRM · ВЫРУЧКА ЗА ДЕНЬ" title="+8.20 руб · заказ №1244" sub="Учтён в выручке, чеке и хитах дня" />
        <Note at={R + 158} icon="✈" head="TELEGRAM · ПЕКАРНЯ" title="📄 Отчёт смены 27.10.pdf" sub="Сверка: карта −2.50 руб — возврат по терминалу" />
        <Column />
      </AbsoluteFill>
      <Opening />
      <div style={{ position: 'absolute', inset: 0, opacity: (1 - stageOut) * (1 - allQuiet * 0.0) }}>
        {CALLS.map((_, i) => (
          <Call key={i} i={i} morph={morph} />
        ))}
      </div>
      <Ending />
      <Rings />
      <Sfx at={ORDER + 204} name="whoosh" volume={0.35} />
      <Sfx at={ACCEPT} name="pop" volume={0.6} />
      {CLICKS.map(([at]) => (
        <Sfx key={at} at={at} name="tap" volume={0.9} />
      ))}
      {CHAT_SFX.map(([at, n]) => (
        <Sfx key={at} at={at} name={n} volume={0.6} />
      ))}
      <Sfx at={R + 52} name="pop" volume={0.5} />
      <Sfx at={R + 158} name="ding" volume={0.6} />
      <Sequence from={END + 30} layout="none">
        <Audio src={staticFile('music-deck.mp3')} volume={(f) => 0.3 * interpolate(f, [0, 45], [0, 1], clamp) * interpolate(f, [ONE_ORDER_FRAMES - END - 70, ONE_ORDER_FRAMES - END - 30], [1, 0], clamp)} />
      </Sequence>
    </AbsoluteFill>
  );
};
