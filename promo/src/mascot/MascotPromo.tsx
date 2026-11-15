import React from 'react';
import { AbsoluteFill, Audio, Freeze, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, MONO, SANS, SERIF, TapStyle } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { Phone } from '../deck/devices';
import { AcceptArt, GREETING, ISSUED, RATED, READY, TgChat } from '../deck/arts';
import { MiniApp, ORDER } from '../oneorder/OneOrder';
import timeline from './timeline.json';

/*
 * The mascot promo, about 49 seconds: a baker boy walks a bakery owner from «опять звонят?» to
 * «вы печёте, мы ведём заказы», and in between names the product — a Telegram Mini App for
 * customers and a CRM for the bakery — and shows what each does. Three colours from the
 * bakery's palette (cream, dark brown ink, orange), kinetic type with one italic accent word.
 *
 * The boy's four talking shots are Veo clips of him saying the same words as the voice-over
 * (ElevenLabs). Their own sound is dropped; each is re-timed so his mouth follows the voice,
 * and runs briskly between phrases: footage/plan_mascot.py plans the whole timeline
 * (src/mascot/timeline.json).
 */

const T = timeline as { cues: number[][]; clips: Record<string, { anchors: number[][]; rate: number }>; scenes: Record<string, number> };
const f30 = (s: number) => Math.round(s * 30);
const INK = C.ink;
const CREAM = C.cream;
const ORANGE = C.orange;

// Scene cuts, in frames, from the planned timeline (footage/plan_mascot.py).
const S1 = f30(T.scenes.pain);
const S2 = f30(T.scenes.idea);
const S3 = f30(T.scenes.meet);
const S4 = f30(T.scenes.store);
const S5 = f30(T.scenes.crm);
const S6 = f30(T.scenes.ready);
const S7 = f30(T.scenes.sums);
const S8 = f30(T.scenes.finale);
const S9 = f30(T.scenes.signoff);
export const MASCOT_FRAMES = f30(T.scenes.end);

/** The film frame at which the voice says the moment `v` (seconds into the voice file). */
const said = (v: number) => {
  const c = T.cues.find(([, a, b]) => v >= a && v <= b) ?? T.cues[0];
  return f30(c[0] + v - c[1]);
};
const STAMP = said(34.9) - 4; // lands on «автоматически»

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));
const useSpring = (at: number, stiffness = 200, damping = 22) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { stiffness, damping } });
};

/* ───────────── The boy, re-timed to the voice ───────────── */

/** Where in the clip to be at a film frame (seconds): the planned anchors, then on at the clip's brisk rate. */
const clipTime = (clip: string, frame: number) => {
  const { anchors, rate } = T.clips[clip];
  const t = frame / 30;
  const last = anchors[anchors.length - 1];
  let c: number;
  if (t <= anchors[0][0]) c = anchors[0][1];
  else if (t >= last[0]) c = last[1] + (t - last[0]) * rate;
  else {
    let i = 1;
    while (anchors[i][0] < t) i++;
    const [fa, ca] = anchors[i - 1];
    const [fb, cb] = anchors[i];
    c = fb === fa ? cb : ca + ((cb - ca) * (t - fa)) / (fb - fa);
  }
  return Math.max(0, Math.min(9.95, c));
};

/** A Veo clip shown frame by frame at the moment `clipTime` picks. `start` is the scene's first frame. */
const VeoClip: React.FC<{ clip: string; src: string; start: number; transparent?: boolean; style: React.CSSProperties }> = ({ clip, src, start, transparent, style }) => {
  const frame = useCurrentFrame();
  return (
    <Freeze frame={0}>
      <OffthreadVideo src={staticFile(src)} startFrom={Math.round(clipTime(clip, start + frame) * 30)} muted transparent={transparent} style={style} />
    </Freeze>
  );
};

/* ───────────── Type ───────────── */

type W = string | { a: string };

/** A line that assembles word by word; `{ a }` words are the italic accent. */
const Line: React.FC<{ words: W[]; at: number; step?: number; size: number; color?: string; accent?: string; underline?: boolean }> = ({ words, at, step = 4, size, color = INK, accent = ORANGE, underline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: size * 0.26, fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.035em', color }}>
      {words.map((w, i) => {
        const p = spring({ frame: frame - at - i * step, fps, config: { stiffness: 220, damping: 22 } });
        const isA = typeof w !== 'string';
        const u = interpolate(frame, [at + i * step + 8, at + i * step + 22], [0, 1], clamp);
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * size * 0.45}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined, ...(isA ? { fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: size * 1.22, color: accent, letterSpacing: '-0.02em' } : {}) }}>
            {isA ? (w as { a: string }).a : (w as string)}
            {isA && underline && <span style={{ position: 'absolute', left: '4%', bottom: -size * 0.08, height: Math.max(4, size * 0.045), width: `${u * 92}%`, borderRadius: 99, background: accent }} />}
          </span>
        );
      })}
    </div>
  );
};

/** Small technical labels in the corners, as on a storyboard. */
const Hud: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = `00:00:${String(Math.floor(frame / fps)).padStart(2, '0')}:${String(frame % fps).padStart(2, '0')}`;
  const st: React.CSSProperties = { position: 'absolute', top: 44, fontFamily: MONO, fontSize: 19, letterSpacing: '0.06em', color, opacity: 0.6 };
  return (
    <>
      <div style={{ ...st, left: 64 }}>// {label}</div>
      <div style={{ ...st, right: 64 }}>ПЕКАРНЯ · {tc}</div>
    </>
  );
};

/* ───────────── 01: the pain ───────────── */

const Pain: React.FC = () => (
  // The clip's own backdrop: a warm beige, lighter in the middle (sampled from its edges and
  // centre), continued over the whole frame so the shot has no visible edge.
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 1050px 640px at 1328px 600px, #F5EBD5 0%, #EBDDC4 62%, #DDCBB0 100%)' }}>
    <Hud label="01 — боль" color={INK} />
    {/* Kneading, then phones ring all around; on «руки в тесте» he shows his doughy hands. */}
    <VeoClip clip="pain" src="mascot/pain2.mp4" start={S1} style={{ position: 'absolute', left: 560, top: 216, width: 1536, height: 864, maskImage: 'linear-gradient(to right, transparent 0, #000 14%), linear-gradient(to bottom, transparent 0, #000 16%)', maskComposite: 'intersect', WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 14%), linear-gradient(to bottom, transparent 0, #000 16%)', WebkitMaskComposite: 'source-in' }} />
    <div style={{ position: 'absolute', left: 120, top: 300 }}>
      <div style={{ fontFamily: MONO, fontSize: 22, color: INK, opacity: 0.55, marginBottom: 22 }}>// пекарям</div>
      <Line words={['Опять', 'звонят']} at={said(0.31) - S1} size={84} />
      <div style={{ marginLeft: 30 }}>
        <Line words={[{ a: 'за заказом?' }]} at={said(0.85) - S1} size={84} underline />
      </div>
    </div>
  </AbsoluteFill>
);

/* ───────────── 02: the idea ───────────── */

const PRODUCTS = [
  { img: 'croissant', name: 'Круассан', price: '3.50', n: '01' },
  { img: 'hachapuri', name: 'Перепечи', price: '2.50', n: '02' },
  { img: 'medovik', name: 'Медовик', price: '3.90', n: '03' },
];
const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(frame, 0, 16);
  // He points right on «приходить сами»: the cards fly in there.
  const cardsAt = said(10.6) - S2;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <AbsoluteFill style={{ background: CREAM, clipPath: `circle(${open * 2300}px at 400px 620px)` }}>
        <VeoClip clip="idea" src="mascot/idea2.mp4" start={S2} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }} />
        <Hud label="02 — а если" color={INK} />
        <div style={{ position: 'absolute', left: 1180, top: 120 }}>
          <Line words={['А', 'если', 'заказы']} at={said(9.3) - S2} size={66} color={INK} accent={ORANGE} />
          <Line words={['приходят', { a: 'без звонков?' }]} at={said(10.2) - S2} size={66} color={INK} accent={ORANGE} underline />
        </div>
        {PRODUCTS.map((pr, i) => {
          const p = spring({ frame: frame - cardsAt - i * 7, fps: 30, config: { stiffness: 150, damping: 17 } });
          const float = Math.sin((frame + i * 20) / 16) * 6;
          return (
            <div key={i} style={{ position: 'absolute', left: 1180 + i * 228, top: 420 + float, width: 212, height: 300, borderRadius: 24, background: CREAM, padding: 14, boxShadow: '0 26px 50px rgba(45,21,5,0.28)', opacity: Math.min(1, p * 1.5), transform: `translate(${(1 - p) * -(160 + i * 228)}px, ${(1 - p) * 200}px) scale(${0.3 + p * 0.7}) rotate(${(1 - p) * -18 + (i - 1) * 2}deg)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 13, color: INK, opacity: 0.55 }}>
                <span>// выпечка</span>
                <span>{pr.n}</span>
              </div>
              <Img src={staticFile(`img/${pr.img}.jpg`)} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 14, marginTop: 10 }} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', color: INK, marginTop: 12 }}>{pr.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 17, color: ORANGE, marginTop: 2 }}>{pr.price} руб</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── 03: «Знакомьтесь» — what the product is ───────────── */

/** A card the boy points at: who it is for, what it is, what it does. */
const Offer: React.FC<{ at: number; x: number; tag: string; name: string; lines: string[]; dark?: boolean }> = ({ at, x, tag, name, lines, dark }) => {
  const p = useSpring(at, 170, 18);
  return (
    <div style={{ position: 'absolute', left: x, top: 120, width: 470, padding: '26px 30px 30px', borderRadius: 32, background: dark ? INK : '#fff', color: dark ? CREAM : INK, boxShadow: '0 30px 60px rgba(45,21,5,0.18)', fontFamily: SANS, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`, filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined }}>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.12em', color: ORANGE }}>{tag}</div>
      <div style={{ fontWeight: 800, fontSize: 50, letterSpacing: '-0.04em', lineHeight: 1.05, marginTop: 10 }}>{name}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 24, fontWeight: 500, marginTop: i ? 8 : 18, opacity: 0.8 }}>
          <span style={{ color: ORANGE, fontWeight: 800 }}>✓</span>
          {l}
        </div>
      ))}
    </div>
  );
};

const Meet: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <Hud label="03 — знакомьтесь" color={INK} />
    <VeoClip clip="meet" src="mascot/meet3.webm" start={S3} transparent style={{ position: 'absolute', left: 77, top: 86, width: 1766, height: 994 }} />
    {/* Each card lands on its name in the voice. */}
    <Offer at={said(12.96) - S3} x={70} tag="ДЛЯ КЛИЕНТОВ" name="Telegram Mini App" lines={['меню и корзина в Telegram', 'заказ за минуту', 'ничего не скачивать']} />
    <Offer at={said(14.43) - S3} x={1380} tag="ДЛЯ ПЕКАРНИ" name="CRM" lines={['все заказы в одном окне', 'склад и выручка', 'отзывы и сверка кассы']} dark />
  </AbsoluteFill>
);

/* ───────────── 04: the Mini App ───────────── */

const Step: React.FC<{ n: number; at: number; label: string }> = ({ n, at, label }) => {
  const p = useSpring(at, 220, 18);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -30}px)` }}>
      <div style={{ width: 52, height: 52, borderRadius: 26, background: p > 0.5 ? ORANGE : 'rgba(45,21,5,0.08)', color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: '-0.02em', color: INK }}>{label}</div>
    </div>
  );
};

const Store: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <Hud label="04 — telegram mini app" color={INK} />
    <div style={{ position: 'absolute', left: 120, top: 190, width: 900 }}>
      <Line words={['Клиент', 'заказывает']} at={6} size={74} />
      <Line words={['прямо', { a: 'в Telegram.' }]} at={16} size={74} underline />
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: INK, opacity: 0.6, marginTop: 30 }}>Ничего не нужно скачивать.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 56 }}>
        <Step n={1} at={30} label="Выбрал выпечку" />
        <Step n={2} at={124} label="Указал время" />
        <Step n={3} at={182} label="Заказ отправлен ✓" />
      </div>
    </div>
    <Phone>
      <TapStyle.Provider value="touch">
        <Sequence from={-ORDER - 10} layout="none">
          <MiniApp />
        </Sequence>
      </TapStyle.Provider>
    </Phone>
  </AbsoluteFill>
);

/* ───────────── 05: the CRM ───────────── */

const Crm: React.FC = () => {
  const frame = useCurrentFrame();
  const CLICK = said(24.7) - S5; // «одно нажатие»
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Hud label="05 — crm" color={INK} />
      {/* The deck's «Принять» shot: the laptop holds until the click lands on «одно нажатие». */}
      {frame < CLICK - 34 ? (
        <Freeze frame={0}>
          <AcceptArt />
        </Freeze>
      ) : (
        <Sequence from={CLICK - 34} layout="none">
          <AcceptArt />
        </Sequence>
      )}
      <div style={{ position: 'absolute', left: 120, top: 260, width: 680 }}>
        <Line words={['Заказ —']} at={6} size={74} />
        <Line words={['сразу', { a: 'в CRM.' }]} at={14} size={74} underline />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: INK, opacity: ease(frame, CLICK, CLICK + 16) * 0.65, marginTop: 34 }}>
          Одно нажатие «Принять» — и клиент
          <br />
          получил подтверждение и чек.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 06: the bot writes ───────────── */

const BOT = [
  { lines: GREETING, time: '14:02', at: -99, goneAt: 6 },
  { lines: READY, time: '14:21', at: 10, goneAt: 84 },
  { lines: ISSUED, time: '14:33', at: 88, goneAt: 124, keyboard: ['⭐ 1', '⭐ 2', '⭐ 3', '⭐ 4', '⭐ 5'], pressed: { key: 4, at: 116 } },
  { lines: RATED, time: '14:33', at: 126 },
];

const Bot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Hud label="06 — бот" color={INK} />
      <div style={{ position: 'absolute', left: 120, top: 260, width: 800 }}>
        <Line words={['Заказ', 'готов —']} at={4} size={74} />
        <Line words={['клиент', { a: 'уже знает.' }]} at={14} size={74} underline />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: INK, opacity: ease(frame, 86, 100) * 0.65, marginTop: 34 }}>Бот написал ему в Telegram, а после выдачи попросит оценку.</div>
      </div>
      <Phone>
        <TgChat messages={BOT} />
      </Phone>
    </AbsoluteFill>
  );
};

/* ───────────── Scene 4: the live grid ───────────── */

const TRAY = '#F1E9DD';
const Tile: React.FC<{ i: number; x: number; y: number; w: number; h: number; label: string; dark?: boolean; children: React.ReactNode }> = ({ i, x, y, w, h, label, dark, children }) => {
  const p = useSpring(4 + i * 3, 200, 24);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, padding: 10, borderRadius: 34, background: TRAY, opacity: Math.min(1, p * 1.3), transform: `scale(${0.94 + 0.06 * p})`, filter: p < 0.98 ? `blur(${(1 - p) * 14}px)` : undefined }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 26, background: dark ? INK : '#fff', color: dark ? CREAM : INK, boxShadow: '0 1px 2px rgba(45,21,5,0.05), 0 10px 28px rgba(45,21,5,0.07)', padding: 24, overflow: 'hidden', fontFamily: SANS }}>
        <div style={{ fontFamily: MONO, fontSize: 16, opacity: 0.5, marginBottom: 14 }}>// {label}</div>
        {children}
      </div>
    </div>
  );
};

const Tick: React.FC<{ on: number; size?: number }> = ({ on, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.32, background: on > 0.5 ? ORANGE : 'rgba(45,21,5,0.08)', color: '#fff', fontSize: size * 0.6, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + Math.sin(on * Math.PI) * 0.18})`, flexShrink: 0 }}>{on > 0.5 ? '✓' : ''}</div>
);

const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);
  // The order's button: idle → working → done.
  const state = frame < 34 ? 0 : frame < 52 ? 1 : 2;
  const revenue = 296.3 + 8.2 * ease(frame, 56, 80);
  const stock = frame < 60 ? 6 : 5;
  const stars = Math.floor(interpolate(frame, [58, 88], [0, 5], clamp));
  const toast = useSpring(54, 190, 20);
  const X = [70, 530, 990, 1450];
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Hud label="07 — всё учтено" color={INK} />
      <Tile i={0} x={X[0]} y={110} w={440} h={900} label="заказ">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ padding: '5px 14px', borderRadius: 12, background: '#FFE9D6', color: ORANGE, fontWeight: 800, fontSize: 26 }}># 1244</span>
          <span style={{ fontFamily: MONO, fontSize: 18, opacity: 0.5 }}>14:02</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginTop: 24 }}>Аня</div>
        <div style={{ fontFamily: MONO, fontSize: 19, opacity: 0.55, marginTop: 4 }}>самовывоз · к 14:30</div>
        <div style={{ height: 1, background: 'rgba(45,21,5,0.08)', margin: '26px 0 10px' }} />
        {[['Перепечи с сыром', '2.50'], ['Круассан', '3.50'], ['Пончик', '2.20']].map(([n, pr], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: 600, padding: '15px 0', borderBottom: '1px solid rgba(45,21,5,0.06)' }}>
            <span>{n}</span>
            <span style={{ fontFamily: MONO, opacity: 0.7 }}>{pr}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 30 }}>
          <span style={{ fontFamily: MONO, fontSize: 17, opacity: 0.5 }}>ИТОГО</span>
          <span style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-0.04em' }}>8.20</span>
        </div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 28, height: 84, borderRadius: 999, background: state === 1 ? INK : `linear-gradient(90deg, ${ORANGE}, #F09A4B)`, color: '#fff', fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${frame >= 30 && frame < 36 ? 0.95 : 1})`, boxShadow: state === 1 ? undefined : '0 10px 24px rgba(208,105,42,0.35)' }}>
          {state === 1 && <span style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', transform: `rotate(${frame * 22}deg)` }} />}
          {state === 0 ? 'Принять заказ' : state === 1 ? 'Принимаем' : '✓ Принят'}
        </div>
      </Tile>

      <Tile i={1} x={X[1]} y={110} w={440} h={440} label="заказов сегодня">
        <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: '-0.06em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginTop: 10 }}>{frame < 40 ? 22 : 23}</div>
        <div style={{ fontFamily: MONO, fontSize: 19, color: ORANGE, marginTop: 10, opacity: at(40, 50) }}>+1 · Mini App, без звонка</div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 30, fontSize: 22, fontWeight: 600, opacity: 0.55 }}>0 пропущенных звонков</div>
      </Tile>

      <Tile i={2} x={X[2]} y={110} w={440} h={440} label="выручка сегодня">
        <div style={{ fontWeight: 800, fontSize: 84, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', marginTop: 6 }}>{revenue.toFixed(2)}</div>
        <div style={{ fontFamily: MONO, fontSize: 19, color: ORANGE, opacity: at(60, 70) }}>+8.20 · заказ №1244</div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, height: 120, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          {[0.35, 0.5, 0.42, 0.7, 0.58, 0.82, 1].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * 100 * ease(frame, 10 + i * 3, 30 + i * 3)}%`, borderRadius: 10, background: i === 6 ? ORANGE : 'rgba(45,21,5,0.1)' }} />
          ))}
        </div>
      </Tile>

      <Tile i={3} x={X[3]} y={110} w={400} h={440} label="telegram → аня">
        <div style={{ opacity: toast, transform: `translateY(${(1 - toast) * 24}px)` }}>
          <div style={{ padding: '16px 18px', borderRadius: '22px 22px 22px 6px', background: TRAY, fontSize: 23, fontWeight: 600, lineHeight: 1.35 }}>
            ✅ Здравствуйте, Аня!
            <br />
            Ваш заказ №1244 принят.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, opacity: 0.45, marginTop: 8 }}>бот · сейчас</div>
        </div>
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, padding: '14px 18px', borderRadius: 18, border: `2px solid ${ORANGE}`, color: ORANGE, fontWeight: 700, fontSize: 22, opacity: at(74, 84) }}>🧾 Чек отправлен</div>
      </Tile>

      <Tile i={4} x={X[1]} y={570} w={440} h={440} label="склад">
        {[['Медовик', stock, 6], ['Круассан', frame < 60 ? 12 : 11, 12], ['Перепечи', frame < 60 ? 9 : 8, 9]].map(([n, v, max], i) => (
          <div key={i} style={{ marginTop: i ? 26 : 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: 700 }}>
              <span>{n}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: frame >= 60 && frame < 78 ? ORANGE : INK }}>{v}</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: 'rgba(45,21,5,0.08)', marginTop: 10 }}>
              <div style={{ height: '100%', width: `${((v as number) / (max as number)) * 100}%`, borderRadius: 99, background: i === 0 ? ORANGE : INK }} />
            </div>
          </div>
        ))}
      </Tile>

      <Tile i={5} x={X[2]} y={570} w={440} h={440} label="отзыв">
        <div style={{ fontSize: 54, letterSpacing: 6, color: ORANGE }}>
          {'★'.repeat(stars)}
          <span style={{ color: 'rgba(45,21,5,0.12)' }}>{'★'.repeat(5 - stars)}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 38, lineHeight: 1.2, marginTop: 22, opacity: at(84, 96) }}>«Перепечи — просто огонь!»</div>
        <div style={{ fontFamily: MONO, fontSize: 18, opacity: 0.5 * at(88, 98), marginTop: 14 }}>— Аня, заказ №1244</div>
      </Tile>

      <Tile i={6} x={X[3]} y={570} w={400} h={440} label="сверка кассы" dark>
        {[['Наличные', 80], ['Карта', 90]].map(([n, t], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30, fontWeight: 700, marginTop: i ? 22 : 10 }}>
            <span>{n}</span>
            <Tick on={at(t as number, (t as number) + 8)} size={38} />
          </div>
        ))}
        <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26, fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: '#F3A56B', opacity: at(98, 108) }}>Смена закрыта.</div>
      </Tile>
    </AbsoluteFill>
  );
};

/** The word that lands across the whole grid. */
const Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ease(frame, 0, 9);
  const settle = spring({ frame: frame - 8, fps: 30, config: { stiffness: 260, damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 2600, padding: '10px 0 40px', background: CREAM, borderTop: `10px solid ${ORANGE}`, borderBottom: `10px solid ${ORANGE}`, textAlign: 'center', transform: `rotate(-7deg) translateX(${(1 - p) * -2600}px) scale(${1.08 - settle * 0.08})`, filter: p < 1 ? `blur(${(1 - p) * 30}px)` : undefined, boxShadow: '0 40px 80px rgba(45,21,5,0.25)' }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 430, lineHeight: 1, letterSpacing: '-0.03em', color: ORANGE }}>Готово.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 08: you bake ───────────── */

/**
 * The finale clip has its own dark-brown backdrop, a little lighter behind him. The frame is
 * filled with the same brown, its light centred on wherever he stands, and the clip is
 * feathered into it.
 */
const BROWN = (x: number, y: number) => `radial-gradient(ellipse 900px 620px at ${x}px ${y}px, #523727 0%, #48301F 55%, #3F2A1B 100%)`;
const FEATHER = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)';

const YouBake: React.FC = () => (
  <AbsoluteFill style={{ background: BROWN(1520, 540) }}>
    <Hud label="08 — итог" color={CREAM} />
    <VeoClip clip="finale" src="mascot/finale3.mp4" start={S8} style={{ position: 'absolute', left: 560, top: 0, width: 1920, height: 1080, maskImage: FEATHER, WebkitMaskImage: FEATHER }} />
    <div style={{ position: 'absolute', left: 120, top: 330 }}>
      <Line words={['Вы', { a: 'печёте.' }]} at={10} size={140} color={CREAM} accent={CREAM} />
      <div style={{ marginTop: 26 }}>
        <Line words={['Мы', 'ведём', { a: 'заказы.' }]} at={said(36.98) - S8} size={92} color="rgba(251,246,238,0.65)" accent="#F09A5B" />
      </div>
    </div>
  </AbsoluteFill>
);

/* ───────────── 09: sign-off ───────────── */

const SignOff: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useSpring(20, 200, 18);
  return (
    <AbsoluteFill style={{ background: BROWN(960, 260) }}>
      {/* The same shot runs on: he winks over the wordmark. */}
      <VeoClip clip="finale" src="mascot/finale3.mp4" start={S9} style={{ position: 'absolute', left: 960 - 444, top: 20, width: 889, height: 500, maskImage: FEATHER, WebkitMaskImage: FEATHER }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 528, textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', color: '#F09A5B' }}>TELEGRAM MINI APP + CRM</div>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 130, lineHeight: 1.05, letterSpacing: '-0.03em', color: CREAM, marginTop: 4 }}>для пекарни</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 34, opacity: btn, transform: `scale(${0.9 + 0.1 * btn})` }}>
          <span style={{ padding: '18px 40px', borderRadius: 999, background: ORANGE, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 12px 28px rgba(0,0,0,0.3)' }}>Покажу на вашей пекарне</span>
          <span style={{ fontFamily: MONO, fontSize: 24, color: CREAM, opacity: 0.6 }}>15 минут</span>
        </div>
        <div style={{ marginTop: 30, fontFamily: SANS, fontSize: 28, fontWeight: 600, color: CREAM, opacity: ease(frame, 28, 40) }}>
          Александр · Telegram <span style={{ fontFamily: MONO, color: '#F09A5B' }}>+375 33 360-49-02</span> · <span style={{ fontFamily: MONO, color: '#F09A5B' }}>alexanderdashcynskiy@gmail.com</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: MONO, fontSize: 19, color: CREAM, opacity: 0.45 }}>Alexander Dashcynskiy · дизайн и разработка</div>
    </AbsoluteFill>
  );
};

/* ───────────── The promo ───────────── */

const speaking = (f: number) => T.cues.some(([at, a, b]) => f >= at * 30 - 6 && f <= (at + b - a) * 30 + 6);

export const MascotPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [MASCOT_FRAMES - 14, MASCOT_FRAMES], [1, 0], clamp);
  const scene = (from: number, to: number, el: React.ReactNode) => (
    <Sequence from={from} durationInFrames={to - from}>
      {el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {scene(S1, S2, <Pain />)}
        {scene(S2, S3, <Question />)}
        {scene(S3, S4, <Meet />)}
        {scene(S4, S5, <Store />)}
        {scene(S5, S6, <Crm />)}
        {scene(S6, S7, <Bot />)}
        {scene(S7, S8, <Grid />)}
        {scene(STAMP, S8, <Stamp />)}
        {scene(S8, S9, <YouBake />)}
        {scene(S9, MASCOT_FRAMES, <SignOff />)}
      </AbsoluteFill>

      {/* The voice, phrase by phrase, on its scenes */}
      {T.cues.map(([at, a, b], i) => (
        <Sequence key={`v${i}`} from={f30(at)} durationInFrames={f30(b - a) + 3} layout="none">
          <Audio src={staticFile('voice-mascot3.mp3')} startFrom={f30(a)} endAt={f30(b) + 3} volume={1.15} />
        </Sequence>
      ))}
      <Audio src={staticFile('music-deck.mp3')} volume={(f) => (speaking(f) ? 0.09 : 0.2) * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [MASCOT_FRAMES - 30, MASCOT_FRAMES], [1, 0], clamp)} />
      {/* The phones in scene 1 */}
      {[0, 1, 2].map((i) => (
        <Sequence key={i} from={10 + i * 18} durationInFrames={S2 - 10 - i * 18} layout="none">
          <Audio src={staticFile(`sfx/ring${i + 1}.wav`)} loop volume={(f) => (speaking(f + 10 + i * 18) ? 0.07 : 0.16) * interpolate(f + 10 + i * 18, [S2 - 24, S2 - 2], [1, 0], clamp)} />
        </Sequence>
      ))}
      <Sfx at={S2} name="whoosh" volume={0.5} />
      {[0, 7, 14].map((f) => (
        <Sfx key={f} at={said(10.6) + f} name="pop" volume={0.45} />
      ))}
      <Sfx at={S3} name="whoosh" volume={0.3} />
      <Sfx at={said(12.96)} name="pop" volume={0.5} />
      <Sfx at={said(14.43)} name="pop" volume={0.5} />
      <Sfx at={S4} name="whoosh" volume={0.3} />
      {[36, 48, 62, 102, 176].map((f) => (
        <Sfx key={f} at={S4 + f} name="tap" volume={0.55} />
      ))}
      <Sfx at={S4 + 182} name="chime" volume={0.4} />
      <Sfx at={S5} name="whoosh" volume={0.3} />
      <Sfx at={S6} name="whoosh" volume={0.3} />
      <Sfx at={S6 + 10} name="ding" volume={0.5} />
      <Sfx at={S6 + 88} name="ding" volume={0.45} />
      <Sfx at={S6 + 116} name="tap" volume={0.6} />
      <Sfx at={S7} name="whoosh" volume={0.3} />
      <Sfx at={S7 + 30} name="tap" volume={0.6} />
      <Sfx at={S7 + 52} name="chime" volume={0.4} />
      {[60, 80, 90].map((f) => (
        <Sfx key={f} at={S7 + f} name="tick" volume={0.45} />
      ))}
      <Sfx at={STAMP} name="whoosh" volume={0.7} />
      <Sfx at={STAMP + 8} name="hit" volume={0.7} />
      <Sfx at={S8} name="whoosh" volume={0.3} />
      <Sfx at={S9 + 20} name="pop" volume={0.5} />
    </AbsoluteFill>
  );
};
