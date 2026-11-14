import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, MONO, SANS, SERIF } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { Phone } from '../deck/devices';
import { MiniApp, ORDER } from '../oneorder/OneOrder';

/*
 * The 20-second mascot promo: a baker boy walks the viewer from «опять звонят?» to
 * «вы печёте, мы ведём заказы». Three colours from the bakery's own palette — cream, dark
 * brown ink and orange — big kinetic type with one italic accent word per line, and the
 * product shown second: cards, the Mini App on a phone, a live bento grid, a stamp.
 * The mascot clips are generated footage, cut out of their backdrop by footage/cutout_mascot.py.
 */

export const MASCOT_FRAMES = 630; // 21 s
const INK = C.ink;
const CREAM = C.cream;
const ORANGE = C.orange;

const S1 = 0; // the pain
const S2 = 125; // the question, on orange
const S3 = 235; // the Mini App
const S4 = 355; // the live grid, then the stamp
const STAMP = S4 + 112;
const S5 = 508; // you bake
const S6 = 568; // sign-off

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));
const useSpring = (at: number, stiffness = 200, damping = 22) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { stiffness, damping } });
};

/* ───────────── The mascot ───────────── */

/**
 * A clip of the boy in full colour, cut out of its backdrop (footage/cutout_mascot.py).
 * `x` is his centre, `bottom` where his chest is cut off, `h` his height.
 */
const Mascot: React.FC<{ clip: string; from: number; x: number; bottom?: number; h: number; at?: number; rate?: number }> = ({ clip, from, x, bottom = 0, h, at = 0, rate = 1 }) => {
  const frame = useCurrentFrame();
  const inP = useSpring(at, 160, 20);
  const bob = Math.sin(frame / 9) * 5;
  const w = h * 0.86;
  const vw = (h * 16) / 9;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, bottom: bottom - (1 - inP) * h * 0.5 + bob, width: w, height: h, overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile(`mascot/${clip}.webm`)} startFrom={Math.round(from * 30)} playbackRate={rate} muted transparent style={{ position: 'absolute', left: -(vw - w) / 2 - h * 0.012, top: 0, width: vw, height: h }} />
    </div>
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

/* ───────────── Scene 1: the pain ───────────── */

const CALLS = ['Можно заказать?', 'А на сколько?', 'Ну что, готово?', 'А медовик есть?'];
const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Hud label="01 — боль" color={INK} />
      <Mascot clip="tired" from={0.4} x={1330} h={1010} at={0} />
      <div style={{ position: 'absolute', left: 120, top: 210, width: 860 }}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: INK, opacity: 0.55, marginBottom: 26 }}>// пекарям</div>
        <Line words={['Опять', 'звонят']} at={8} size={112} />
        <div style={{ marginTop: 10, marginLeft: 50 }}>
          <Line words={[{ a: 'за заказом?' }]} at={22} size={112} underline />
        </div>
      </div>
      {/* The calls pile up as speech bubbles */}
      {CALLS.map((q, i) => {
        const p = spring({ frame: frame - 34 - i * 14, fps: 30, config: { stiffness: 240, damping: 18 } });
        const shake = Math.sin((frame + i * 7) / 2.2) * 2.5 * (frame % 34 < 16 ? 1 : 0);
        return (
          <div key={i} style={{ position: 'absolute', left: 120 + i * 185, top: 700 + (i % 2) * 92, padding: '16px 26px', borderRadius: 999, border: `2.5px solid ${INK}`, background: CREAM, fontFamily: MONO, fontSize: 26, color: INK, opacity: p, transform: `scale(${0.7 + p * 0.3}) translateX(${shake}px)`, transformOrigin: '0 50%', whiteSpace: 'nowrap' }}>
            <span style={{ color: ORANGE, marginRight: 12 }}>✆</span>
            {q}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────── Scene 2: the question, on orange ───────────── */

const PRODUCTS = [
  { img: 'croissant', name: 'Круассан', price: '3.50', n: '01' },
  { img: 'hachapuri', name: 'Перепечи', price: '2.50', n: '02' },
  { img: 'medovik', name: 'Медовик', price: '3.90', n: '03' },
];
const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = ease(frame, 0, 14);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {/* The orange floods in from where the boy stands */}
      <div style={{ position: 'absolute', left: 430 - 2600 * wipe, top: 900 - 2600 * wipe, width: 5200 * wipe, height: 5200 * wipe, borderRadius: '50%', background: ORANGE }} />
      <AbsoluteFill style={{ background: wipe >= 1 ? ORANGE : undefined }}>
        <Hud label="02 — а если" color={CREAM} />
        <Mascot clip="talk" from={4.3} x={430} h={860} at={0} />
        <div style={{ position: 'absolute', left: 800, top: 130 }}>
          <Line words={['А', 'если', 'заказы']} at={10} size={84} color={CREAM} accent={INK} />
          <Line words={['приходят', { a: 'сами?' }]} at={22} size={84} color={CREAM} accent={INK} underline />
        </div>
        {PRODUCTS.map((pr, i) => {
          const p = spring({ frame: frame - 30 - i * 9, fps: 30, config: { stiffness: 150, damping: 17 } });
          const float = Math.sin((frame + i * 20) / 16) * 7;
          return (
            <div key={i} style={{ position: 'absolute', left: 800 + i * 340, top: 420 + float, width: 310, height: 440, borderRadius: 30, background: CREAM, padding: 22, boxShadow: '0 30px 60px rgba(45,21,5,0.28)', opacity: Math.min(1, p * 1.5), transform: `translate(${(1 - p) * -(360 + i * 340)}px, ${(1 - p) * 200}px) scale(${0.3 + p * 0.7}) rotate(${(1 - p) * -18 + (i - 1) * 2}deg)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 17, color: INK, opacity: 0.55 }}>
                <span>// выпечка</span>
                <span>{pr.n}</span>
              </div>
              <Img src={staticFile(`img/${pr.img}.jpg`)} style={{ width: '100%', height: 230, objectFit: 'cover', borderRadius: 18, marginTop: 14 }} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: INK, marginTop: 18 }}>{pr.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: ORANGE, marginTop: 4 }}>{pr.price} руб</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── Scene 3: the Mini App ───────────── */

const Store: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <Hud label="03 — mini app" color={INK} />
    <div style={{ position: 'absolute', left: 120, top: 190, width: 1060 }}>
      <Line words={['Клиент', 'выбрал', 'в', 'Telegram', '—']} at={6} size={62} />
      <div style={{ marginTop: 14 }}>
        <Line words={['заказ', 'уже']} at={26} size={124} />
        <div style={{ marginLeft: 60 }}>
          <Line words={[{ a: 'у вас.' }]} at={36} size={124} underline />
        </div>
      </div>
    </div>
    <Mascot clip="talk" from={0.6} x={800} h={560} at={4} />
    <Phone>
      <Sequence from={-ORDER + 10} layout="none">
        <MiniApp />
      </Sequence>
    </Phone>
  </AbsoluteFill>
);

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
      <Hud label="04 — всё учтено" color={INK} />
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

      <Tile i={1} x={X[1]} y={110} w={440} h={440} label="пекарь">
        <Mascot clip="talk" from={2.2} x={196} bottom={-24} h={372} />
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

/* ───────────── Scene 5: you bake ───────────── */

const YouBake: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Hud label="05 — итог" color={CREAM} />
    <Mascot clip="wave" from={5.4} x={1420} h={900} at={0} />
    <div style={{ position: 'absolute', left: 120, top: 300 }}>
      <Line words={['Вы', { a: 'печёте.' }]} at={4} size={150} color={CREAM} accent={CREAM} />
      <div style={{ marginTop: 26 }}>
        <Line words={['Мы', 'ведём', { a: 'заказы.' }]} at={24} size={96} color="rgba(251,246,238,0.6)" accent="#F09A5B" />
      </div>
    </div>
  </AbsoluteFill>
);

/* ───────────── Scene 6: sign-off ───────────── */

const SignOff: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useSpring(26, 200, 18);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Mascot clip="joy" from={2.5} x={960} bottom={520} h={420} at={0} />
      {/* The wordmark covers the boy's chest: he peeks over it */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 500, height: 600, background: CREAM }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 190, lineHeight: 1, letterSpacing: '-0.03em', color: INK }}>Пекарня</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 36, color: INK, marginTop: 26, opacity: ease(frame, 12, 26) }}>
          Mini App + CRM, которые ведут заказы <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: ORANGE, fontSize: 44 }}>за вас.</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 44, opacity: btn, transform: `scale(${0.9 + 0.1 * btn})` }}>
          <span style={{ padding: '18px 40px', borderRadius: 999, background: ORANGE, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: 30, boxShadow: '0 12px 28px rgba(208,105,42,0.35)' }}>Показать на вашей пекарне</span>
          <span style={{ fontFamily: MONO, fontSize: 24, color: INK, opacity: 0.6 }}>15 минут</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 54, textAlign: 'center', fontFamily: MONO, fontSize: 19, color: INK, opacity: 0.45 }}>Alexander Dashcynskiy · дизайн и разработка</div>
    </AbsoluteFill>
  );
};

/* ───────────── The promo ───────────── */

export const MascotPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [MASCOT_FRAMES - 14, MASCOT_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Sequence from={S1} durationInFrames={S2 - S1}>
          <Pain />
        </Sequence>
        <Sequence from={S2} durationInFrames={S3 - S2}>
          <Question />
        </Sequence>
        <Sequence from={S3} durationInFrames={S4 - S3}>
          <Store />
        </Sequence>
        <Sequence from={S4} durationInFrames={S5 - S4}>
          <Grid />
        </Sequence>
        <Sequence from={STAMP} durationInFrames={S5 - STAMP}>
          <Stamp />
        </Sequence>
        <Sequence from={S5} durationInFrames={S6 - S5}>
          <YouBake />
        </Sequence>
        <Sequence from={S6}>
          <SignOff />
        </Sequence>
      </AbsoluteFill>

      {/* Sound: the calls, then only the product's small sounds over a quiet bed */}
      <Audio src={staticFile('music-deck.mp3')} volume={(f) => 0.22 * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [MASCOT_FRAMES - 30, MASCOT_FRAMES], [1, 0], clamp)} />
      {[0, 1].map((i) => (
        <Sequence key={i} from={30 + i * 20} durationInFrames={S2 - 30 - i * 20} layout="none">
          <Audio src={staticFile(`sfx/ring${i + 1}.wav`)} loop volume={(f) => 0.16 * interpolate(f + 30 + i * 20, [S2 - 24, S2 - 2], [1, 0], clamp)} />
        </Sequence>
      ))}
      {[34, 48, 62, 76].map((f) => (
        <Sfx key={f} at={f} name="pop" volume={0.35} />
      ))}
      <Sfx at={S2} name="whoosh" volume={0.5} />
      {[30, 39, 48].map((f) => (
        <Sfx key={f} at={S2 + f} name="pop" volume={0.45} />
      ))}
      <Sfx at={S3} name="whoosh" volume={0.3} />
      {[18, 56, 68].map((f) => (
        <Sfx key={f} at={S3 + f} name="tap" volume={0.6} />
      ))}
      <Sfx at={S4 + 30} name="tap" volume={0.8} />
      <Sfx at={S4 + 52} name="chime" volume={0.45} />
      <Sfx at={S4 + 54} name="ding" volume={0.4} />
      {[60, 80, 90].map((f) => (
        <Sfx key={f} at={S4 + f} name="tick" volume={0.5} />
      ))}
      <Sfx at={STAMP} name="whoosh" volume={0.7} />
      <Sfx at={STAMP + 8} name="hit" volume={0.7} />
      <Sfx at={S5} name="whoosh" volume={0.3} />
      <Sfx at={S6 + 26} name="pop" volume={0.5} />
    </AbsoluteFill>
  );
};
