import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SANS, Tap } from '../ui';
import { Badge, clamp, easeInOut, Sfx, useTween } from '../kit';
import { NotebookPage } from '../scenes/Notebook';
import { ChatPhone } from '../scenes/Notify';
import { Laptop, LaptopScreen, lpx, LP, LP_Y, Phone, PhoneScreen, PH, PH_X, PH_Y, ppt } from './devices';

const HAND = 'Caveat, cursive';
const P = (x: number, y: number) => ({ x: ppt(x), y: ppt(y) });

/* ───────────── «Было»: pictures of the pain, drawn in the right column ───────────── */

/** An incoming call that nobody can take. */
export const CallArt: React.FC<{ who: string; sub: string; bubble?: string }> = ({ who, sub, bubble }) => {
  const frame = useCurrentFrame();
  const ring = (frame % 24) / 24;
  return (
    <>
      <Phone>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#4a3426, #1d130c)' }} />
        <div style={{ position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: SANS, color: '#fff' }}>
          <div style={{ fontSize: 22, opacity: 0.7 }}>Входящий вызов</div>
          <div style={{ fontSize: 44, fontWeight: 700, marginTop: 10 }}>{who}</div>
          <div style={{ fontSize: 22, opacity: 0.7, marginTop: 8 }}>{sub}</div>
        </div>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: PH.w / 2 - 60, top: 470, width: 120, height: 120, borderRadius: 60, border: '3px solid rgba(255,255,255,0.5)', transform: `scale(${1 + ((ring + i / 2) % 1) * 1.4})`, opacity: 1 - ((ring + i / 2) % 1) }} />
        ))}
        <div style={{ position: 'absolute', bottom: 120, left: 70, width: 92, height: 92, borderRadius: 46, background: '#FF3B30' }} />
        <div style={{ position: 'absolute', bottom: 120, right: 70, width: 92, height: 92, borderRadius: 46, background: '#34C759', transform: `rotate(${Math.sin(frame / 2) * 8}deg)` }} />
      </Phone>
      {bubble && (
        <div style={{ position: 'absolute', left: PH_X - 250, top: 300, padding: '22px 30px', borderRadius: '30px 30px 8px 30px', background: '#fff', boxShadow: '0 20px 40px rgba(60,30,10,0.15)', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, transform: `scale(${spring({ frame: frame - 14, fps: 30, config: { stiffness: 260, damping: 14 } })})`, transformOrigin: '100% 100%' }}>
          {bubble}
        </div>
      )}
      <Sfx at={2} name="buzz" volume={0.5} />
      <Sfx at={26} name="buzz" volume={0.5} />
    </>
  );
};

/** Lines of a phone call, the questions that have to be asked every time. */
export const DialogArt: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', left: 980, top: 230, width: 760, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {lines.map((l, i) => {
        const p = spring({ frame: frame - 6 - i * 12, fps, config: { stiffness: 240, damping: 16 } });
        const right = i % 2 === 1;
        return (
          <div key={i} style={{ alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: 560, padding: '22px 30px', borderRadius: right ? '30px 30px 8px 30px' : '30px 30px 30px 8px', background: right ? '#E9DFD2' : '#fff', boxShadow: '0 12px 30px rgba(60,30,10,0.1)', fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.ink, transform: `translateY(${(1 - p) * 30}px)`, opacity: p }}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** The paper order book, written as we watch. */
export const NotebookArt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: 'translate(1000px, -140px) scale(0.6)' }}>
      <NotebookPage frame={frame + 6} fps={fps} />
    </div>
  );
};

/** Sticky notes and scribbles: the things kept in the head. */
export const NotesArt: React.FC<{ notes: string[] }> = ({ notes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spots = [
    { x: 1000, y: 260, r: -5 },
    { x: 1360, y: 330, r: 4 },
    { x: 1130, y: 600, r: 3 },
    { x: 1460, y: 640, r: -4 },
  ];
  return (
    <>
      {notes.map((n, i) => {
        const p = spring({ frame: frame - 4 - i * 10, fps, config: { stiffness: 300, damping: 14 } });
        const s = spots[i % spots.length];
        return (
          <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: 330, minHeight: 200, padding: '30px 28px', background: i % 2 ? '#FFE9A8' : '#FFE16B', boxShadow: '0 18px 30px rgba(80,60,0,0.22)', fontFamily: HAND, fontSize: 52, lineHeight: 1.05, color: '#3a2a00', transform: `rotate(${s.r - (1 - p) * 20}deg) scale(${0.4 + p * 0.6})`, opacity: Math.min(1, p * 2) }}>
            {n}
          </div>
        );
      })}
      {notes.map((_, i) => (
        <Sfx key={i} at={4 + i * 10} name="slap" volume={0.5} />
      ))}
    </>
  );
};

/** End-of-day sums on paper, with question marks. */
export const SumsArt: React.FC<{ rows?: string[] }> = ({ rows = ['Касса — 296,3?', 'Тетрадь — 23 заказа', 'Доставка — 7 или 8?', 'Медовик — сколько ушло?', 'Итого: ???'] }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 1020, top: 200, width: 720, height: 700, background: '#FFFDF6', borderRadius: 12, boxShadow: '0 40px 80px rgba(60,30,10,0.22)', transform: 'rotate(2deg)', padding: '50px 60px', backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 70px, #cfdcea 70px, #cfdcea 72px)', backgroundPosition: '0 60px' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ fontFamily: HAND, fontSize: 54, lineHeight: '72px', color: i === rows.length - 1 ? '#C0392B' : '#26357A', clipPath: `inset(-20px ${(1 - interpolate(frame, [4 + i * 9, 14 + i * 9], [0, 1], clamp)) * 100}% -20px 0)` }}>
          {r}
        </div>
      ))}
      <Sfx at={4} name="pen" volume={0.4} />
      <Sfx at={22} name="pen" volume={0.4} />
    </div>
  );
};

/* ───────────── «Стало»: the real product doing the job ───────────── */

/** 01 — the customer adds three items in the Mini App; nobody picks up a phone. */
export const OrderArt: React.FC = () => {
  const frame = useCurrentFrame();
  const adds = [8, 46, 58];
  const count = adds.filter((t) => frame >= t).length;
  const changedAt = [...adds].reverse().find((t) => frame >= t) ?? 0;
  const scroll = useTween(20, 34);
  const drift = ppt(240);
  return (
    <Phone>
      <PhoneScreen name="m1-home" style={{ transform: `translateY(${-scroll * drift}px)`, opacity: 1 - scroll }} />
      <PhoneScreen name="m2-feed" style={{ transform: `translateY(${(1 - scroll) * drift}px)`, opacity: scroll }} />
      <Badge count={count} changedAt={changedAt} {...P(409, 87)} size={ppt(19)} />
      {frame >= 34 && <Badge count={count} changedAt={changedAt} {...P(398, 831)} size={ppt(17)} />}
      <Tap at={adds[0]} {...P(270, 748)} />
      <Tap at={adds[1]} {...P(191, 544)} />
      <Tap at={adds[2]} {...P(390, 545)} />
      {adds.map((t) => (
        <Sfx key={t} at={t} name="tap" volume={0.8} />
      ))}
    </Phone>
  );
};

/** 02 — the checkout already holds the name, the phone, the pickup time and the total. */
export const CheckoutArt: React.FC = () => {
  const frame = useCurrentFrame();
  const boxes = [
    { y: 183, h: 64, at: 10 }, // name
    { y: 255, h: 67, at: 24 }, // phone
    { y: 373, h: 65, at: 38 }, // pickup time
    { y: 590, h: 67, at: 52 }, // total
  ];
  return (
    <Phone>
      <PhoneScreen name="m5-checkout" />
      {boxes.map((b, i) => {
        const p = spring({ frame: frame - b.at, fps: 30, config: { stiffness: 260, damping: 16 } });
        return (
          <div key={i} style={{ position: 'absolute', left: ppt(12), top: ppt(b.y - 4), width: ppt(406), height: ppt(b.h + 8), borderRadius: ppt(16), border: `3px solid ${C.orange}`, boxShadow: '0 0 0 6px rgba(208,105,42,0.15)', opacity: p, transform: `scale(${1.08 - p * 0.08})` }}>
            <div style={{ position: 'absolute', right: -14, top: -14, width: 30, height: 30, borderRadius: 15, background: C.orange, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
          </div>
        );
      })}
      {boxes.map((b) => (
        <Sfx key={b.at} at={b.at} name="tick" volume={0.7} />
      ))}
    </Phone>
  );
};

/** A CRM-style toast pinned above the laptop. */
const Toast: React.FC<{ at: number; title: string; sub: string; until?: number }> = ({ at, title, sub, until = 999 }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - at, fps: 30, config: { stiffness: 240, damping: 18 } });
  const out = interpolate(frame, [until, until + 8], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', left: LP.x + LP.w - 560, top: LP_Y + 24, width: 540, padding: '22px 28px', borderRadius: 26, background: C.ink, color: C.cream, fontFamily: SANS, display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 30px 60px rgba(45,21,5,0.35)', transform: `translateY(${(1 - p) * -40}px)`, opacity: Math.min(p, out) }}>
      <div style={{ width: 18, height: 18, borderRadius: 9, background: '#3CCB7F', boxShadow: '0 0 0 7px rgba(60,203,127,0.25)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 23, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
};

/** 03 — order #1244 lands on the CRM board. */
export const BoardArt: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [26, 50], [0, 1], clamp));
  const ring = spring({ frame: frame - 44, fps: 30, config: { stiffness: 220, damping: 12 } });
  const pulse = 0.5 + 0.5 * Math.sin((frame - 44) / 4);
  return (
    <>
      <Laptop>
        <LaptopScreen name="d4-orders" t={t} fx={250} fy={720} zoom={1.9}>
          <div style={{ position: 'absolute', left: lpx(98), top: lpx(601), width: lpx(299), height: lpx(383), borderRadius: lpx(36), border: `${lpx(4)}px solid ${C.orange}`, boxShadow: `0 0 ${lpx(10 + pulse * 18)}px rgba(208,105,42,${0.35 + pulse * 0.3})`, opacity: ring }} />
        </LaptopScreen>
      </Laptop>
      <Toast at={8} title="Новый заказ №1244" sub="Аня · самовывоз 14:30 · 8.20 Б" />
      <Sfx at={8} name="chime" volume={0.7} />
    </>
  );
};

/** 04 — stock goes down by itself, item by item. */
export const StockArt: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [4, 26], [0, 1], clamp));
  const items = [
    { x: 461, y: 872, from: 14 },
    { x: 933, y: 872, from: 20 },
    { x: 1405, y: 866, from: 9 },
  ];
  return (
    <Laptop>
      <LaptopScreen name="d5-stock" t={t} fx={700} fy={830} zoom={2.2}>
        {items.map((s, i) => {
          const at = 34 + i * 12;
          const done = frame >= at;
          const fly = interpolate(frame, [at, at + 16], [0, 1], clamp);
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: lpx(s.x - 20), top: lpx(s.y - 13), width: lpx(40), height: lpx(26), background: '#fff', color: done ? C.orange : '#0E9F6E', fontFamily: SANS, fontWeight: 700, fontSize: lpx(17), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done ? s.from - 1 : s.from}</div>
              {done && fly < 1 && <div style={{ position: 'absolute', left: lpx(s.x + 16), top: lpx(s.y - 30) - fly * 14, fontFamily: SANS, fontWeight: 800, fontSize: lpx(16), color: '#E5484D', opacity: 1 - fly }}>−1</div>}
              <Sfx at={at} name="tick" volume={0.8} />
            </React.Fragment>
          );
        })}
      </LaptopScreen>
    </Laptop>
  );
};

/** 05 — the customer gets «готов» from the bot. */
export const ReadyArt: React.FC = () => (
  <div style={{ position: 'absolute', left: PH_X, top: PH_Y, width: 686, height: 1445, transformOrigin: '0 0', transform: `perspective(2400px) rotateY(-14deg) rotateX(5deg) scale(${(PH.w + PH.bezel * 2) / 686})` }}>
    <ChatPhone style={{ left: -(1080 - 686) / 2, top: -420 }} />
    <Sfx at={10} name="ding" volume={0.6} />
    <Sfx at={34} name="pop" volume={0.6} />
  </div>
);

/** 06 — the day's numbers on the dashboard, and the shift report arriving in Telegram. */
export const NumbersArt: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [6, 30], [0, 1], clamp));
  const doc = spring({ frame: frame - 70, fps: 30, config: { stiffness: 220, damping: 18 } });
  return (
    <>
      <Laptop>
        <LaptopScreen name="d1-dashboard" t={t} fx={460} fy={330} zoom={1.7} />
      </Laptop>
      <div style={{ position: 'absolute', left: LP.x + LP.w - 600, top: LP_Y + LP.h - 230, width: 580, padding: '24px 28px', borderRadius: 26, background: '#fff', boxShadow: '0 30px 60px rgba(45,21,5,0.25)', fontFamily: SANS, display: 'flex', gap: 22, alignItems: 'center', transform: `translateY(${(1 - doc) * 60}px)`, opacity: doc }}>
        <div style={{ width: 74, height: 74, borderRadius: 37, background: '#2AABEE', color: '#fff', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✈</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#8a96a3', letterSpacing: '0.05em' }}>TELEGRAM · ПЕКАРНЯ</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111', marginTop: 4 }}>📄 Отчёт смены 27.10.pdf</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#555', marginTop: 2 }}>29 заказов · выручка 345.70 · средний чек 11.92</div>
        </div>
      </div>
      <Sfx at={70} name="pop" volume={0.7} />
    </>
  );
};

/** 07 — order history → «Повторить заказ?» → the cart is filled again. */
export const RepeatArt: React.FC = () => {
  const frame = useCurrentFrame();
  const menu = frame >= 30;
  const toCart = useTween(66, 80);
  return (
    <Phone>
      <PhoneScreen name={menu ? 'm8-repeat' : 'm7-history'} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - toCart) * 100}%)` }}>
        <PhoneScreen name="m4-cart" />
      </div>
      <Tap at={24} {...P(379, 187)} />
      <Tap at={56} {...P(290, 231)} />
      <Sfx at={24} name="tap" volume={0.8} />
      <Sfx at={56} name="tap" volume={0.8} />
      <Sfx at={66} name="whoosh" volume={0.3} />
    </Phone>
  );
};

/** 08 — the till at the counter, then staff and roles with the shift log. */
export const StaffArt: React.FC = () => {
  const frame = useCurrentFrame();
  const second = frame >= 64;
  const t = easeInOut(interpolate(frame, [74, 96], [0, 1], clamp));
  const fade = interpolate(frame, [58, 70], [0, 1], clamp);
  return (
    <Laptop>
      <LaptopScreen name="d6-kassa" />
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>{second && <LaptopScreen name="d8-staff" t={t} fx={650} fy={360} zoom={1.25} />}</div>
    </Laptop>
  );
};

/* ───────────── CRM button → Telegram: the real flow, with the server's own texts ───────────── */

type Line = { t: string; b?: boolean };
type Msg = { lines: Line[]; time: string; at: number; goneAt?: number; out?: boolean; keyboard?: string[]; pressed?: { key: number; at: number } };

const RULE = '━━━━━━━━━━━━━━━━━━━━';
// server.ts → updateOrderStatusInternal, status «Принят»: the receipt, then the greeting.
// The order's content is stored by the bot as «◆ name xN — price Br» lines and sent as is.
const RECEIPT: Line[] = [
  { t: '🧾 ВАШ САМОВЫВОЗ №1244', b: true },
  { t: RULE },
  { t: '👤 Аня' },
  { t: '📞 +375 (33) 214-55-08' },
  { t: '📍 Самовывоз: ул. Ленина 74' },
  { t: RULE },
  { t: '🧺 Состав:', b: true },
  { t: '◆ Перепечи с Сыром x1 — 2.50 Br' },
  { t: '◆ Круассан Французский x1 — 3.50 Br' },
  { t: '◆ Пончик Глазированный x1 — 2.20 Br' },
  { t: RULE },
  { t: '💰 Итого: 8.2 р.', b: true },
];
const GREETING: Line[] = [{ t: '✅ Здравствуйте, Аня! 🥐', b: true }, { t: 'Ваш заказ №1244 принят и уже готовится.' }, { t: 'Мы уведомим вас о готовности.' }];
// Status «Готов», pickup: the greeting is deleted and this one is sent instead.
const READY: Line[] = [{ t: '🍞 Ваш заказ №1244 готов!', b: true }, { t: 'Ждём вас по адресу:' }, { t: '📍 г. Витебск, ул. Ленина 74' }];

/** The customer's Telegram chat with the bot, drawn at the phone's own screen size. */
const TgChat: React.FC<{ messages: Msg[] }> = ({ messages }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#DDE5D7', fontFamily: SANS }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(#7d9a6b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'rgba(250,250,250,0.97)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ position: 'absolute', top: 22, left: 44, fontWeight: 700, fontSize: 15 }}>14:02</div>
        <div style={{ position: 'absolute', top: 18, left: '50%', width: 110, height: 32, marginLeft: -55, borderRadius: 18, background: '#000' }} />
        <div style={{ position: 'absolute', top: 66, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#111' }}>Пекарня</div>
          <div style={{ fontSize: 13, color: '#8a96a3' }}>бот</div>
        </div>
        <div style={{ position: 'absolute', top: 62, right: 18, width: 42, height: 42, borderRadius: 21, background: 'linear-gradient(135deg,#E8B430,#C9A227)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>П</div>
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 80, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((m, i) => {
          if (frame < m.at) return null;
          const p = spring({ frame: frame - m.at, fps, config: { stiffness: 220, damping: 18 } });
          const gone = m.goneAt === undefined ? 0 : interpolate(frame, [m.goneAt, m.goneAt + 10], [0, 1], clamp);
          if (gone >= 1) return null;
          const press = m.pressed && frame >= m.pressed.at ? interpolate(frame, [m.pressed.at, m.pressed.at + 8], [0, 1], clamp) : 0;
          return (
            <div key={i} style={{ alignSelf: m.out ? 'flex-end' : 'flex-start', maxWidth: '88%', transform: `translateY(${(1 - p) * 24}px) scale(${(0.94 + p * 0.06) * (1 - gone * 0.2)})`, transformOrigin: m.out ? '100% 100%' : '0 100%', opacity: p * (1 - gone), maxHeight: 400 * (1 - gone) }}>
              <div style={{ padding: '10px 14px 7px', borderRadius: m.out ? '18px 18px 5px 18px' : '18px 18px 18px 5px', background: m.out ? '#E1F7CB' : '#fff', boxShadow: '0 1px 1px rgba(0,0,0,0.06)', fontSize: 14.5, lineHeight: 1.36, color: '#111' }}>
                {m.lines.map((l, j) => (
                  <div key={j} style={{ fontWeight: l.b ? 700 : 500, whiteSpace: m.out ? 'normal' : 'nowrap', letterSpacing: l.t === RULE ? '-0.12em' : 0, color: l.t === RULE ? '#9aa4ad' : undefined, minHeight: l.t ? undefined : 8 }}>{l.t}</div>
                ))}
                <div style={{ textAlign: 'right', fontSize: 11, color: m.out ? '#5fa35a' : '#8a96a3', marginTop: 2 }}>{m.time}{m.out ? ' ✓✓' : ''}</div>
              </div>
              {m.keyboard && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {m.keyboard.map((k, j) => (
                    <div key={j} style={{ flex: 1, padding: '7px 0', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#fff', background: m.pressed && m.pressed.key === j ? `rgba(42,171,238,${0.55 + press * 0.45})` : 'rgba(80,110,90,0.55)', transform: m.pressed && m.pressed.key === j ? `scale(${1 - Math.sin(press * Math.PI) * 0.08})` : undefined }}>{k}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, background: 'rgba(250,250,250,0.97)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ position: 'absolute', left: 50, right: 50, top: 12, height: 34, borderRadius: 17, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', fontSize: 14, color: '#9aa4ad', display: 'flex', alignItems: 'center', paddingLeft: 16 }}>Сообщение</div>
      </div>
    </div>
  );
};

/** A macOS arrow that glides to (x, y) on the CRM capture and clicks at `click`. */
const Cursor: React.FC<{ x: number; y: number; from: number; click: number; scale: number }> = ({ x, y, from, click, scale }) => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [from, click - 4], [0, 1], clamp));
  const cx = x + (1 - t) * 420;
  const cy = y + (1 - t) * 260;
  const press = frame >= click && frame < click + 5 ? 0.85 : 1;
  const ring = interpolate(frame, [click, click + 16], [0, 1], clamp);
  if (frame < from) return null;
  return (
    <div style={{ position: 'absolute', left: lpx(cx), top: lpx(cy), zIndex: 30 }}>
      {frame >= click && ring < 1 && <div style={{ position: 'absolute', left: -30 / scale, top: -30 / scale, width: 60 / scale, height: 60 / scale, borderRadius: '50%', border: `${3 / scale}px solid ${C.orange}`, transform: `scale(${0.4 + ring})`, opacity: 1 - ring }} />}
      <svg width={26 / scale} height={36 / scale} viewBox="0 0 26 36" style={{ transform: `scale(${press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}>
        <path d="M2 2 L2 28 L8.5 22 L13 33 L17.5 31 L13 20.5 L22 20.5 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// The #1244 card and its first button, in CRM capture pixels (see the capture script).
const CARD = { x: 100, y: 137, w: 294, h: 612 };
const BUTTON = { x: 192, y: 694 };

/** Laptop with the order card, zoomed in; the cursor presses a button and the card moves on. */
const CrmClick: React.FC<{ before: string; after: string; click: number }> = ({ before, after, click }) => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [4, 24], [0, 1], clamp));
  const zoom = 1.45;
  const s = 1 + (zoom - 1) * t;
  const flash = interpolate(frame, [click + 2, click + 8, click + 26], [0, 1, 0], clamp);
  return (
    <Laptop>
      <LaptopScreen name={frame >= click + 3 ? after : before} t={t} fx={CARD.x + CARD.w / 2 + 160} fy={CARD.y + CARD.h / 2 + 10} zoom={zoom}>
        <div style={{ position: 'absolute', left: lpx(CARD.x - 4), top: lpx(CARD.y - 4), width: lpx(CARD.w + 8), height: lpx(CARD.h + 8), borderRadius: lpx(36), border: `${3 / s}px solid ${C.orange}`, boxShadow: `0 0 ${24 / s}px rgba(208,105,42,0.5)`, opacity: flash }} />
        <Cursor x={BUTTON.x} y={BUTTON.y} from={8} click={click} scale={s} />
      </LaptopScreen>
    </Laptop>
  );
};

/** A smaller phone in front of the laptop, on the right: the customer's side of the same moment. */
const SidePhone: React.FC<{ at: number; focus: number; children: React.ReactNode }> = ({ at, focus, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { stiffness: 150, damping: 18 } });
  // Comes in small at the laptop's right, then steps forward when the messages land.
  const scale = 0.8 + 0.26 * focus;
  const x = 230 - 150 * focus + (1 - p) * 500;
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: `${PH_X + PH.w / 2}px 540px`, transform: `translate(${x}px, 0px) scale(${scale})`, opacity: Math.min(1, p * 1.6) }}>
      <Phone>{children}</Phone>
    </div>
  );
};

/** 03 — «Принять заказ» in the CRM; the bot sends the receipt and the greeting. */
/** Pushes the laptop back while the phone has the floor. */
const Back: React.FC<{ focus: number; children: React.ReactNode }> = ({ focus, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: 1 - 0.5 * focus, transform: `translateX(${-60 * focus}px) scale(${1 - 0.05 * focus})`, transformOrigin: '1300px 540px' }}>{children}</div>
);

export const AcceptArt: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = easeInOut(interpolate(frame, [46, 66], [0, 1], clamp));
  return (
  <>
    <Back focus={focus}>
      <CrmClick before="d9-accept-before" after="d9-accepted" click={34} />
    </Back>
    <SidePhone at={40} focus={focus}>
      <TgChat messages={[{ lines: RECEIPT, time: '14:02', at: 52 }, { lines: GREETING, time: '14:02', at: 76 }]} />
    </SidePhone>
    <Sfx at={34} name="tap" volume={0.9} />
    <Sfx at={52} name="pop" volume={0.7} />
    <Sfx at={76} name="pop" volume={0.7} />
  </>
  );
};

/** 05 — «Готово» in the CRM; the greeting is replaced by «готов». */
export const ReadyClickArt: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = easeInOut(interpolate(frame, [36, 54], [0, 1], clamp));
  return (
  <>
    <Back focus={focus}>
      <CrmClick before="d9-accepted" after="d10-ready" click={30} />
    </Back>
    <SidePhone at={0} focus={focus}>
      <TgChat
        messages={[
          { lines: RECEIPT, time: '14:02', at: -99 },
          { lines: GREETING, time: '14:02', at: -99, goneAt: 40 },
          { lines: READY, time: '14:21', at: 54 },
        ]}
      />
    </SidePhone>
    <Sfx at={30} name="tap" volume={0.9} />
    <Sfx at={54} name="ding" volume={0.6} />
  </>
  );
};


/* ───────────── New chapters: preorder, rating and review, reviews in the CRM, analytics, the till ───────────── */

/** 02 — the morning preorder: from the banner, two items, then pickup date and time. */
export const PreorderArt: React.FC = () => {
  const frame = useCurrentFrame();
  const open = useTween(14, 26);
  const added = frame >= 40;
  const toForm = useTween(66, 80);
  return (
    <Phone>
      <PhoneScreen name="m1-home" />
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - open) * 100}%)` }}>
        <PhoneScreen name={added ? 'm10-preorder-added' : 'm9-preorder'} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - toForm) * 100}%)` }}>
        <PhoneScreen name="m11-preorder-form" />
      </div>
      <Tap at={6} {...P(215, 461)} />
      <Tap at={32} {...P(268, 553)} />
      <Tap at={58} {...P(347, 857)} />
      {[6, 32, 58].map((t) => (
        <Sfx key={t} at={t} name="tap" volume={0.8} />
      ))}
    </Phone>
  );
};

// server.ts → sendRatingMessage and the review flow in the webhook handler.
const ISSUED: Line[] = [{ t: '✅ Ваш заказ №1244 выдан!', b: true }, { t: 'Спасибо, что выбрали нас!' }, { t: '' }, { t: '⭐ Оцените качество обслуживания:', b: true }];
const RATED: Line[] = [{ t: '⭐ Вы поставили оценку 5/5!' }, { t: '' }, { t: '💬 Напишите ваш отзыв', b: true }, { t: 'или отправьте /skip чтобы пропустить' }];
const REVIEW = 'Перепечи — просто огонь! И всё было готово ровно к 14:30, спасибо 🙌';
const THANKS: Line[] = [{ t: '🙏 Спасибо за отзыв!', b: true }, { t: 'Мы ценим ваше мнение.' }];

/** 07 — «Выдать клиенту» → the bot asks for stars → a review comes back. */
export const RatingArt: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = easeInOut(interpolate(frame, [36, 54], [0, 1], clamp));
  return (
    <>
      <Back focus={focus}>
        <CrmClick before="d10-ready" after="d11-issued" click={28} />
      </Back>
      <SidePhone at={0} focus={focus}>
        <TgChat
          messages={[
            { lines: READY, time: '14:21', at: -99 },
            { lines: ISSUED, time: '14:33', at: 40, goneAt: 84, keyboard: ['⭐ 1', '⭐ 2', '⭐ 3', '⭐ 4', '⭐ 5'], pressed: { key: 4, at: 74 } },
            { lines: RATED, time: '14:33', at: 90, goneAt: 132 },
            { lines: [{ t: REVIEW }], time: '14:34', at: 116, out: true },
            { lines: THANKS, time: '14:34', at: 136 },
          ]}
        />
      </SidePhone>
      <Sfx at={28} name="tap" volume={0.9} />
      <Sfx at={40} name="ding" volume={0.6} />
      <Sfx at={74} name="tap" volume={0.8} />
      <Sfx at={90} name="pop" volume={0.6} />
      <Sfx at={116} name="pop" volume={0.5} />
      <Sfx at={136} name="pop" volume={0.6} />
    </>
  );
};

/** 08 — the review in the CRM with an AI draft; one click and the reply goes to the customer. */
export const ReviewsArt: React.FC = () => {
  const frame = useCurrentFrame();
  const filled = frame >= 30;
  const t = easeInOut(interpolate(frame, [4, 22], [0, 1], clamp));
  const focus = easeInOut(interpolate(frame, [62, 80], [0, 1], clamp));
  return (
    <>
      <Back focus={focus}>
        <Laptop>
          <LaptopScreen name={filled ? 'r2-draft' : 'r1-review'} t={t} fx={1150} fy={640} zoom={1.6}>
            <Cursor x={1152} y={544} from={6} click={26} scale={1 + 0.6 * t} />
            {frame >= 36 && <Cursor x={1444} y={940} from={36} click={52} scale={1 + 0.6 * t} />}
          </LaptopScreen>
        </Laptop>
      </Back>
      <SidePhone at={56} focus={focus}>
        <TgChat
          messages={[
            { lines: THANKS, time: '14:34', at: -99 },
            { lines: [{ t: '💬 Ответ на ваш отзыв (заказ №1244):', b: true }, { t: '' }, { t: 'Аня, спасибо за тёплый отзыв! Рады,' }, { t: 'что перепечи понравились — ждём вас снова 🥐' }], time: '14:40', at: 66 },
          ]}
        />
      </SidePhone>
      <Sfx at={26} name="tap" volume={0.9} />
      <Sfx at={52} name="tap" volume={0.9} />
      <Sfx at={66} name="ding" volume={0.6} />
    </>
  );
};

/** The dashboard, then its charts: the first half of «Аналитика и сверка». */
const AnalyticsScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = easeInOut(interpolate(frame, [4, 24], [0, 1], clamp));
  const t2 = easeInOut(interpolate(frame, [40, 58], [0, 1], clamp));
  return frame >= 36 ? <LaptopScreen name="d2-dashboard-2" t={t2} fx={420} fy={300} zoom={1.45} /> : <LaptopScreen name="d1-dashboard" t={t1} fx={460} fy={330} zoom={1.6} />;
};

/** 11 — the till: type a regular's number and the name fills itself in. */
export const KassaArt: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut(interpolate(frame, [4, 22], [0, 1], clamp));
  const digits = '332145508';
  const typed = Math.max(0, Math.min(digits.length, Math.floor((frame - 24) / 3)));
  const done = typed >= digits.length;
  const mask = (d: string) => {
    let r = '+375(' + d.slice(0, 2);
    if (d.length > 2) r += ')-' + d.slice(2, 5);
    if (d.length > 5) r += '-' + d.slice(5, 7);
    if (d.length > 7) r += '-' + d.slice(7, 9);
    return r;
  };
  const ring = spring({ frame: frame - (24 + digits.length * 3 + 2), fps: 30, config: { stiffness: 220, damping: 12 } });
  // Phone and name inputs on the modal, in capture pixels.
  const TEL = { x: 532, y: 462, w: 448, h: 52 };
  const NAME = { x: 532, y: 366, w: 448, h: 52 };
  return (
    <Laptop>
      <LaptopScreen name={done ? 'k2-autofill' : 'k1-modal'} t={t} fx={756} fy={430} zoom={1.7}>
        {!done && typed > 0 && (
          <div style={{ position: 'absolute', left: lpx(TEL.x + 2), top: lpx(TEL.y + 2), width: lpx(TEL.w - 4), height: lpx(TEL.h - 4), borderRadius: lpx(16), background: '#fff', border: `${lpx(2)}px solid #34d399`, display: 'flex', alignItems: 'center', paddingLeft: lpx(20), fontFamily: SANS, fontSize: lpx(16), color: '#0f172a' }}>
            {mask(digits.slice(0, typed))}
            <span style={{ width: lpx(1.5), height: lpx(20), background: '#0f172a', marginLeft: lpx(1), opacity: Math.floor(frame / 8) % 2 }} />
          </div>
        )}
        {done && (
          <div style={{ position: 'absolute', left: lpx(NAME.x - 4), top: lpx(NAME.y - 4), width: lpx(NAME.w + 8), height: lpx(NAME.h + 8), borderRadius: lpx(20), border: `${lpx(3)}px solid ${C.orange}`, boxShadow: `0 0 ${lpx(16)}px rgba(208,105,42,0.5)`, opacity: ring, transform: `scale(${1.08 - ring * 0.08})` }} />
        )}
      </LaptopScreen>
      {Array.from({ length: digits.length }, (_, i) => (
        <Sfx key={i} at={24 + i * 3} name="tick" volume={0.35} />
      ))}
      <Sfx at={24 + digits.length * 3 + 2} name="chime" volume={0.6} />
    </Laptop>
  );
};

/**
 * 09 — analytics and closing the shift: the dashboard, then cash and terminal against the system,
 * the gap explained, «Закрыть смену», and the shift report in Telegram.
 */
export const AnalyticsArt: React.FC = () => {
  const OFF = 72; // the dashboard first, then the «Сверка» tab
  const frame = useCurrentFrame() - OFF;
  // Four real states of the «Сверка» tab; each one eases in from the whole page to its detail.
  const phase = frame < 34 ? 0 : frame < 82 ? 1 : frame < 120 ? 2 : 3;
  const starts = [4, 34, 82, 120];
  const t = easeInOut(interpolate(frame, [starts[phase], starts[phase] + 16], [phase === 0 ? 0 : 0.35, 1], clamp));
  const shots = [
    { name: 'c1-recon-input', fx: 590, fy: 440, zoom: 1.3 },
    { name: 'c2-recon-result', fx: 900, fy: 560, zoom: 1.55 },
    { name: 'c3-recon-reason', fx: 756, fy: 480, zoom: 1.5 },
    { name: 'c4-recon-closed', fx: 1050, fy: 640, zoom: 1.5 },
  ];
  const s = shots[phase];
  const scale = 1 + (s.zoom - 1) * t;
  // The card row that doesn't match, in capture pixels.
  const ROW = { x: 53, y: 612, w: 1406, h: 66 };
  const ring = spring({ frame: frame - 46, fps: 30, config: { stiffness: 220, damping: 14 } });
  const doc = spring({ frame: frame - 150, fps: 30, config: { stiffness: 220, damping: 18 } });
  return (
    <>
      <Laptop>
        {frame < 0 ? <AnalyticsScreen /> : (
        <LaptopScreen name={s.name} t={t} fx={s.fx} fy={s.fy} zoom={s.zoom}>
          {phase === 0 && <Cursor x={756} y={519} from={OFF + 6} click={OFF + 28} scale={scale} />}
          {phase === 1 && (
            <div style={{ position: 'absolute', left: lpx(ROW.x), top: lpx(ROW.y), width: lpx(ROW.w), height: lpx(ROW.h), borderRadius: lpx(14), border: `${lpx(3)}px solid ${C.orange}`, boxShadow: `0 0 ${lpx(18)}px rgba(208,105,42,0.45)`, opacity: ring, transform: `scale(${1.04 - ring * 0.04})` }} />
          )}
          {phase === 2 && <Cursor x={871} y={658} from={OFF + 88} click={OFF + 112} scale={scale} />}
          {phase === 3 && <Cursor x={1240} y={675} from={OFF + 124} click={OFF + 144} scale={scale} />}
        </LaptopScreen>
        )}
      </Laptop>
      <div style={{ position: 'absolute', left: LP.x + LP.w - 660, top: LP_Y + 30, width: 640, padding: '24px 28px', borderRadius: 26, background: '#fff', boxShadow: '0 30px 60px rgba(45,21,5,0.25)', fontFamily: SANS, display: 'flex', gap: 22, alignItems: 'center', transform: `translateY(${(1 - doc) * 60}px)`, opacity: doc }}>
        <div style={{ width: 74, height: 74, borderRadius: 37, background: '#2AABEE', color: '#fff', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✈</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#8a96a3', letterSpacing: '0.05em' }}>TELEGRAM · ПЕКАРНЯ</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111', marginTop: 4 }}>📄 Отчёт смены 27.10.pdf</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#555', marginTop: 2 }}>Сверка: карта −2.50 руб — возврат по терминалу</div>
        </div>
      </div>
      <Sfx at={36} name="whoosh" volume={0.3} />
      <Sfx at={OFF} name="whoosh" volume={0.3} />
      <Sfx at={OFF + 28} name="tap" volume={0.9} />
      <Sfx at={OFF + 46} name="pop" volume={0.5} />
      <Sfx at={OFF + 112} name="tap" volume={0.9} />
      <Sfx at={OFF + 144} name="tap" volume={0.9} />
      <Sfx at={OFF + 150} name="ding" volume={0.6} />
    </>
  );
};
