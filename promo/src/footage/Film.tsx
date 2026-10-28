import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Accent, C, MONO, SANS } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';
import { PH, ppt } from '../deck/devices';
import { GREETING, ISSUED, RATED, READY, REVIEW, TgChat, THANKS } from '../deck/arts';
import { MiniApp, ORDER } from '../oneorder/OneOrder';
import v1 from './tracks/v1.json';
import v2 from './tracks/v2.json';
import v3a from './tracks/v3a.json';
import v3b from './tracks/v3b.json';
import v4 from './tracks/v4.json';

/*
 * «Один заказ» on generated bakery footage. Each green screen is tracked frame by frame
 * (footage/track.py); the product's real screens are warped onto it with a homography.
 */

type Track = { fps: number; width: number; height: number; start: number; quads: number[][][] };

// Shots, in frames.
const S1 = 0; // dough, the phone ringing
const S2 = 240; // Аня orders
const S3 = 450; // CRM by day: the order lands, «Принять»
const S4 = 750; // Аня's phone: «готов», stars, review
const S5 = 1000; // CRM: the reply, the day's revenue
const S6 = 1200; // evening: reconciliation, the shift closes
const S7 = 1470; // dawn: silence
export const FILM_FRAMES = 1730;

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const K = 1920 / 1280; // footage is 1280×720

/* ───────────── Tracking → CSS ───────────── */

const solve = (A: number[][], b: number[]) => {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
};

/** The CSS matrix that maps a w×h box onto the quad (TL, TR, BR, BL). */
const homography = (w: number, h: number, q: number[][]) => {
  const src = [[0, 0], [w, 0], [w, h], [0, h]];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const [a, bb, c, d, e, f, g, hh] = solve(A, b);
  return `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
};

/** The tracked quad at a video time, in output pixels, grown a hair to cover the green edge. */
const quadAt = (track: Track, t: number, grow: number) => {
  const x = (t - track.start) * track.fps;
  const i = Math.max(0, Math.min(track.quads.length - 1, Math.floor(x)));
  const j = Math.min(track.quads.length - 1, i + 1);
  const fr = Math.max(0, Math.min(1, x - i));
  const q = track.quads[i].map((p, k) => [lerp(p[0], track.quads[j][k][0], fr) * K, lerp(p[1], track.quads[j][k][1], fr) * K]);
  const cx = q.reduce((s, p) => s + p[0], 0) / 4;
  const cy = q.reduce((s, p) => s + p[1], 0) / 4;
  return q.map(([px, py]) => [cx + (px - cx) * grow, cy + (py - cy) * grow]);
};

type Cam = { z: number; cx: number; cy: number };

/**
 * One piece of footage with its screen replaced. `cam` pushes in on the frame: the point
 * (cx, cy) moves to the centre at zoom z.
 */
const Shot: React.FC<{
  src: string;
  track: Track;
  from: number;
  rate: number;
  cw: number;
  ch: number;
  radius?: number;
  cam?: (f: number) => Cam;
  screen?: React.CSSProperties;
  grow?: number;
  /** The same footage with the screen cut out (footage/masks.py), laid over the new screen. */
  cutout?: string;
  children: React.ReactNode;
}> = ({ src, track, from, rate, cw, ch, radius = 0, cam, screen, grow = 1.012, cutout, children }) => {
  const frame = useCurrentFrame();
  const t = from + (frame / 30) * rate;
  const q = quadAt(track, t, grow);
  const c = cam ? cam(frame) : { z: 1, cx: 960, cy: 540 };
  const tx = Math.min(0, Math.max(1920 - 1920 * c.z, 960 - c.cx * c.z));
  const ty = Math.min(0, Math.max(1080 - 1080 * c.z, 540 - c.cy * c.z));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${c.z})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} playbackRate={rate} muted style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }} />
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: cw, height: ch, transformOrigin: '0 0', transform: homography(cw, ch, q), borderRadius: radius, overflow: 'hidden', ...screen }}>
            {children}
            {/* A faint glass sheen so the screen sits in the room */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 40%, rgba(0,0,0,0.06))' }} />
          </div>
        </div>
        {cutout && <OffthreadVideo src={staticFile(cutout)} startFrom={Math.round(from * 30)} playbackRate={rate} muted transparent style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }} />}
      </div>
    </AbsoluteFill>
  );
};

const push = (f: number, a: number, b: number, z: number, cx: number, cy: number, back?: [number, number, number]) => {
  const t = ease(f, a, b);
  const o = back ? ease(f, back[0], back[1]) : 0;
  const zz = lerp(lerp(1, z, t), back ? back[2] : 1, o);
  return { z: zz, cx: lerp(960, cx, t), cy: lerp(540, cy, t) };
};

/* ───────────── Screens ───────────── */

/** The CRM at capture size (1512×982): screenshots on a schedule, an inner zoom, clicks. */
const Crm: React.FC<{
  shots: { at: number; name: string }[];
  zoom?: { at: number; fx: number; fy: number; z: number }[];
  clicks?: { at: number; x: number; y: number }[];
  children?: React.ReactNode;
}> = ({ shots, zoom = [{ at: 0, fx: 756, fy: 491, z: 1 }], clicks = [], children }) => {
  const frame = useCurrentFrame();
  let k = 0;
  for (let i = 0; i < shots.length; i++) if (frame >= shots[i].at) k = i;
  const fade = k === 0 ? 1 : interpolate(frame, [shots[k].at, shots[k].at + 6], [0, 1], clamp);
  let zk = 0;
  for (let i = 0; i < zoom.length; i++) if (frame >= zoom[i].at) zk = i;
  const zp = zoom[Math.max(0, zk - 1)];
  const zc = zoom[zk];
  const zt = zk === 0 ? 1 : ease(frame, zc.at, zc.at + 18);
  const z = lerp(zp.z, zc.z, zt);
  const fx = lerp(zp.fx, zc.fx, zt);
  const fy = lerp(zp.fy, zc.fy, zt);
  const tx = Math.min(0, Math.max(1512 - 1512 * z, 756 - fx * z));
  const ty = Math.min(0, Math.max(982 - 982 * z, 491 - fy * z));
  const img = (name: string, o = 1) => <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: 'absolute', inset: 0, width: 1512, height: 982, opacity: o }} />;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1512, height: 982, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
        {k > 0 && img(shots[k - 1].name)}
        {img(shots[k].name, fade)}
        {children}
        {clicks.map((c, i) => (
          <Pointer key={i} x={c.x} y={c.y} at={c.at} scale={z} />
        ))}
      </div>
    </div>
  );
};

/** A macOS arrow in capture pixels: glides in, clicks at `at`, then leaves. */
const Pointer: React.FC<{ x: number; y: number; at: number; scale: number }> = ({ x, y, at, scale }) => {
  const frame = useCurrentFrame();
  if (frame < at - 26 || frame > at + 22) return null;
  const t = ease(frame, at - 26, at - 4);
  const press = frame >= at && frame < at + 5 ? 0.85 : 1;
  const ring = interpolate(frame, [at, at + 16], [0, 1], clamp);
  const out = interpolate(frame, [at + 14, at + 22], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', left: x + (1 - t) * 380, top: y + (1 - t) * 240, opacity: out, zIndex: 30 }}>
      {frame >= at && <div style={{ position: 'absolute', left: -44 / scale, top: -44 / scale, width: 88 / scale, height: 88 / scale, borderRadius: '50%', border: `${4 / scale}px solid ${C.orange}`, transform: `scale(${0.4 + ring})`, opacity: 1 - ring }} />}
      <svg width={38 / scale} height={52 / scale} viewBox="0 0 26 36" style={{ transform: `scale(${press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}>
        <path d="M2 2 L2 28 L8.5 22 L13 33 L17.5 31 L13 20.5 L22 20.5 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** The ringing phone on the table: incoming calls, one after another. */
const CALL_QUOTES = ['Алло! Можно сделать заказ?', 'Как вас зовут? На сколько?', 'Мой заказ приняли?', 'Ну что, готово?', 'А медовик ещё есть?'];
const NUMBERS = ['+375 (29) 614-22-07', '+375 (33) 902-18-55', '+375 (44) 771-03-61', '+375 (29) 350-48-12', '+375 (33) 447-90-26'];
const IncomingCall: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(CALL_QUOTES.length - 1, Math.floor(frame / 44));
  const local = frame - i * 44;
  const p = interpolate(local, [0, 8], [0, 1], clamp);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 3);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#191c21', fontFamily: SANS, color: '#fff' }}>
      <div style={{ position: 'absolute', left: 78, top: 58, opacity: p }}>
        <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>Входящий вызов</div>
        <div style={{ fontSize: 58, fontWeight: 700, marginTop: 4, letterSpacing: '-0.01em' }}>{NUMBERS[i]}</div>
        <div style={{ fontSize: 38, fontWeight: 600, marginTop: 28, color: '#FFD9A8', maxWidth: 560 }}>«{CALL_QUOTES[i]}»</div>
      </div>
      <div style={{ position: 'absolute', right: 50, top: 84, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: '#34C759', boxShadow: `0 0 0 ${8 + pulse * 14}px rgba(52,199,89,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>✆</div>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, transform: 'rotate(135deg)' }}>✆</div>
      </div>
    </div>
  );
};

/** Аня's phone held sideways: the bot's chat in landscape, with the camera island on the left. */
const SideChat: React.FC<{ messages: React.ComponentProps<typeof TgChat>['messages'] }> = ({ messages }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <TgChat messages={messages} bare />
    <div style={{ position: 'absolute', left: 10, top: 101, width: 22, height: 84, borderRadius: 11, background: '#000' }} />
  </div>
);

/* ───────────── Words on the picture ───────────── */

/** The time, one plain sentence, and the call it replaced, struck out. */
const Caption: React.FC<{ from: number; to: number; time: string; title: React.ReactNode; calls?: { q: string; at: number }[]; dark?: boolean }> = ({ from, to, time, title, calls = [] }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 2) return null;
  const p = ease(frame, from + 2, from + 18);
  const out = ease(frame, to - 10, to + 2);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 90, width: 720, opacity: 1 - out, transform: `translateY(${-out * 20}px)` }}>
      <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F3B27A', opacity: p, textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{time}</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: 1.04, letterSpacing: '-0.035em', color: '#FFF8EE', marginTop: 14, textShadow: '0 6px 30px rgba(0,0,0,0.55)', clipPath: `inset(-20px -40px ${(1 - p) * 100}% -20px)`, transform: `translateY(${(1 - p) * 40}px)` }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        {calls.map((c, i) => {
          const inP = ease(frame, from + 14 + i * 6, from + 26 + i * 6);
          const strike = interpolate(frame, [c.at, c.at + 10], [0, 1], clamp);
          const ringing = frame < c.at;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap', opacity: inP, fontFamily: SANS, fontSize: 28, fontWeight: 600, color: '#FFF8EE' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: ringing ? C.orange : 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: ringing ? `0 0 0 ${4 + 5 * (0.5 + 0.5 * Math.sin(frame / 3))}px rgba(208,105,42,0.3)` : undefined }}>{ringing ? '✆' : '✓'}</div>
              <span style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)', opacity: 1 - 0.4 * strike, textDecorationLine: 'line-through', textDecorationThickness: 3, textDecorationColor: `rgba(240,154,91,${strike})` }}>«{c.q}»</span>
              <span style={{ fontFamily: MONO, fontSize: 20, color: '#F3B27A', opacity: strike, letterSpacing: '0.08em' }}>— БЕЗ ЗВОНКА</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** A message card pinned top right: Telegram, or the CRM's own figure. */
const Note: React.FC<{ at: number; until: number; icon: string; head: string; title: string; sub: string; color?: string }> = ({ at, until, icon, head, title, sub, color = '#2AABEE' }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - at, fps: 30, config: { stiffness: 170, damping: 20 } });
  const out = interpolate(frame, [until, until + 12], [1, 0], clamp);
  if (frame < at || frame > until + 12) return null;
  const o = Math.min(p, out);
  // A system banner on frosted glass: the room shows through it, so it sits in the picture.
  return (
    <div
      style={{
        position: 'absolute',
        right: 72,
        top: 64,
        width: 540,
        padding: '18px 22px',
        borderRadius: 24,
        background: 'rgba(28,20,14,0.38)',
        backdropFilter: 'blur(26px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: '0 18px 44px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)',
        fontFamily: SANS,
        color: '#FFF8EE',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        opacity: o,
        transform: `translateY(${(1 - p) * -28}px) scale(${0.97 + 0.03 * p})`,
        transformOrigin: '50% 0',
        filter: o < 0.98 ? `blur(${(1 - o) * 6}px)` : undefined,
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 12, background: color, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(255,248,238,0.6)' }}>
          <span>{head}</span>
          <span style={{ letterSpacing: 0 }}>сейчас</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{title}</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(255,248,238,0.78)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

/** Darkens the bottom left so the words read over any footage. */
const Shade: React.FC = () => <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(10,6,3,0.72) 0%, rgba(10,6,3,0.25) 38%, rgba(10,6,3,0) 60%)' }} />;

/* ───────────── The film ───────────── */

// The card's slot on the CRM board, in capture pixels.
const SLOT = { x: 100, y: 137, w: 294, h: 612 };
const BTN = { x: 192, y: 694 };

const Opening: React.FC = () => (
  <>
    <Shot src="footage/v1-clean.mp4" track={v1 as Track} from={0} rate={1} cw={860} ch={397} radius={60} grow={1.06} cutout="footage/v1-cutout.webm" cam={(f) => push(f, 0, 240, 1.18, 1000, 760)} screen={{ filter: 'brightness(0.95)', boxShadow: '0 0 0 160px #191c21' }}>
      <IncomingCall />
    </Shot>
  </>
);

const OpeningWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 20, fps, config: { stiffness: 120, damping: 20 } });
  const b = spring({ frame: frame - 70, fps, config: { stiffness: 120, damping: 20 } });
  const out = ease(frame, 220, 238);
  return (
    <div style={{ position: 'absolute', left: 110, top: 120, fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.06, letterSpacing: '-0.035em', color: '#FFF8EE', textShadow: '0 6px 30px rgba(0,0,0,0.5)', opacity: 1 - out }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>8:00. Пекарня открылась.</div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
        <Accent color="#F3B27A">И телефон — тоже.</Accent>
      </div>
    </div>
  );
};

/** Аня at the bakery's window, ordering in the Mini App on her own phone. */
const OrderShot: React.FC = () => (
  <Shot src="footage/v4-clean.mp4" cutout="footage/v4-cutout.webm" track={v4 as Track} from={0} rate={1} cw={PH.w} ch={PH.h} radius={34} grow={1.03} cam={(f) => push(f, 0, 200, 1.12, 900, 520)} screen={{ boxShadow: '0 0 0 40px #FEFDF9' }}>
    <Sequence from={-ORDER} layout="none">
      <MiniApp />
    </Sequence>
    {/* The captures have an island; this phone has a notch of its own, in the footage */}
    <div style={{ position: 'absolute', left: ppt(140), top: 0, width: ppt(150), height: ppt(48), background: '#FEFDF9' }} />
  </Shot>
);

const DayCrm: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = spring({ frame: frame - 34, fps: 30, config: { stiffness: 140, damping: 15 } });
  const glow = interpolate(frame, [44, 52, 80], [0, 1, 0], clamp);
  return (
    <Crm
      shots={[{ at: 0, name: 'd9-accept-before' }, { at: 123, name: 'd9-accepted' }]}
      zoom={[{ at: 0, fx: 756, fy: 491, z: 1 }, { at: 70, fx: SLOT.x + SLOT.w / 2 + 180, fy: SLOT.y + SLOT.h / 2 + 10, z: 1.5 }, { at: 220, fx: 756, fy: 491, z: 1 }]}
      clicks={[{ at: 120, ...BTN }]}
    >
      {/* Аня's order drops into its empty slot */}
      {frame < 123 && (
        <>
          <div style={{ position: 'absolute', left: SLOT.x - 8, top: SLOT.y - 8, width: SLOT.w + 16, height: SLOT.h + 16, background: '#FAF9F6' }} />
          <Img src={staticFile('3d/card1244.png')} style={{ position: 'absolute', left: SLOT.x, top: SLOT.y - (1 - drop) * 700, width: SLOT.w, height: SLOT.h, opacity: Math.min(1, drop * 2), borderRadius: 26, boxShadow: `0 ${30 * (1 - drop)}px ${50 * (1 - drop) + 6}px rgba(0,0,0,0.18)` }} />
        </>
      )}
      <div style={{ position: 'absolute', left: SLOT.x - 4, top: SLOT.y - 4, width: SLOT.w + 8, height: SLOT.h + 8, borderRadius: 30, border: `4px solid ${C.orange}`, boxShadow: '0 0 30px rgba(208,105,42,0.5)', opacity: glow }} />
    </Crm>
  );
};

const CHAT = [
  { lines: GREETING, time: '14:02', at: -99, goneAt: 14 },
  { lines: READY, time: '14:21', at: 22, goneAt: 150 },
  { lines: ISSUED, time: '14:33', at: 92, goneAt: 140, keyboard: ['⭐ 1', '⭐ 2', '⭐ 3', '⭐ 4', '⭐ 5'], pressed: { key: 4, at: 128 } },
  { lines: RATED, time: '14:33', at: 146, goneAt: 186 },
  { lines: [{ t: REVIEW }], time: '14:34', at: 170, out: true },
  { lines: THANKS, time: '14:34', at: 196 },
];

const ReplyAndRevenue: React.FC = () => (
  <Crm
    shots={[{ at: 0, name: 'r1-review' }, { at: 44, name: 'r2-draft' }, { at: 100, name: 'd1-dashboard' }, { at: 150, name: 'd2-dashboard-2' }]}
    zoom={[{ at: 0, fx: 1150, fy: 640, z: 1.45 }, { at: 100, fx: 520, fy: 360, z: 1.35 }]}
    clicks={[{ at: 40, x: 1152, y: 544 }, { at: 72, x: 1444, y: 940 }]}
  />
);

const Evening: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = spring({ frame: frame - 66, fps: 30, config: { stiffness: 220, damping: 14 } });
  return (
    <Crm
      shots={[{ at: 0, name: 'c1-recon-input' }, { at: 54, name: 'c2-recon-result' }, { at: 112, name: 'c3-recon-reason' }, { at: 148, name: 'c4-recon-closed' }]}
      zoom={[{ at: 0, fx: 640, fy: 440, z: 1.25 }, { at: 54, fx: 900, fy: 560, z: 1.45 }, { at: 112, fx: 756, fy: 480, z: 1.4 }, { at: 148, fx: 1050, fy: 640, z: 1.4 }]}
      clicks={[{ at: 50, x: 756, y: 519 }, { at: 142, x: 871, y: 658 }, { at: 178, x: 1240, y: 675 }]}
    >
      {frame >= 54 && frame < 112 && (
        <div style={{ position: 'absolute', left: 53, top: 612, width: 1406, height: 66, borderRadius: 14, border: `4px solid ${C.orange}`, boxShadow: '0 0 20px rgba(208,105,42,0.45)', opacity: ring }} />
      )}
    </Crm>
  );
};

const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = ease(frame, 0, 24);
  const a1 = spring({ frame: frame - 34, fps, config: { stiffness: 110, damping: 20 } });
  const a2 = spring({ frame: frame - 72, fps, config: { stiffness: 110, damping: 20 } });
  const a3 = ease(frame, 120, 140);
  return (
    <AbsoluteFill style={{ opacity: v, background: '#000' }}>
      <OffthreadVideo src={staticFile('video/dawn.mp4')} startFrom={30} playbackRate={0.6} volume={(f) => 2.2 * interpolate(f, [0, 40], [0, 1], clamp)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + 0.05 * (frame / 260)})` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 45%, rgba(20,10,4,0.3) 0%, rgba(20,10,4,0.85) 100%)' }} />
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

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [FILM_FRAMES - 30, FILM_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#000', opacity: fadeOut }}>
      <Sequence from={S1} durationInFrames={S2 - S1}>
        <Opening />
        <OpeningWords />
      </Sequence>

      <Sequence from={S2} durationInFrames={S3 - S2}>
        <OrderShot />
        <Shade />
      </Sequence>

      <Sequence from={S3} durationInFrames={S4 - S3}>
        <Shot src="footage/v2.mp4" track={v2 as Track} from={0} rate={0.8} cw={1512} ch={982} radius={6} cam={(f) => push(f, 20, 70, 1.45, 812, 560, [230, 290, 1.12])}>
          <DayCrm />
        </Shot>
        <Shade />
        <Note at={160} until={280} icon="✈" head="TELEGRAM → АНЯ" title="🧾 Чек и «Заказ №1244 принят»" sub="Бот отправил сам, сразу после «Принять»" />
      </Sequence>

      <Sequence from={S4} durationInFrames={S5 - S4}>
        <Shot src="footage/v3.mp4" track={v3a as Track} from={0} rate={1} cw={620} ch={286} radius={38} cam={(f) => push(f, 0, 40, 1.4, 760, 580)}>
          <SideChat messages={CHAT} />
        </Shot>
        <Shade />
      </Sequence>

      <Sequence from={S5} durationInFrames={S6 - S5}>
        <Shot src="footage/v2.mp4" track={v2 as Track} from={3} rate={0.9} cw={1512} ch={982} radius={6} cam={(f) => push(f, 0, 1, 1.45, 812, 540)}>
          <ReplyAndRevenue />
        </Shot>
        <Shade />
        <Note at={118} until={200} icon="+" color={C.orange} head="CRM · ВЫРУЧКА ЗА ДЕНЬ" title="+8.20 руб · заказ №1244" sub="Учтён в выручке, чеке и хитах дня" />
      </Sequence>

      <Sequence from={S6} durationInFrames={S7 - S6}>
        <Shot src="footage/v3.mp4" track={v3b as Track} from={10} rate={0.9} cw={1512} ch={982} radius={6} cam={(f) => push(f, 0, 40, 1.45, 690, 600, [210, 262, 1.1])} screen={{ filter: 'brightness(0.9)' }}>
          <Evening />
        </Shot>
        <Shade />
        <Note at={186} until={270} icon="✈" head="TELEGRAM · ПЕКАРНЯ" title="📄 Отчёт смены 27.10.pdf" sub="Сверка: карта −2.50 руб — возврат по терминалу" />
      </Sequence>

      <Sequence from={S7}>
        <Ending />
      </Sequence>

      {/* Words, on the film's own clock */}
      <Caption from={S2} to={S3} time="14:02 · заказ №1244" title={<>Аня заказывает <Accent color="#F3B27A">сама.</Accent></>} calls={[{ q: 'Алло! Можно сделать заказ?', at: S2 + 120 }, { q: 'Как вас зовут? На сколько?', at: S2 + 176 }]} />
      <Caption from={S3} to={S4} time="14:03 · CRM" title={<>«Принять» — и Аня <Accent color="#F3B27A">уже знает.</Accent></>} calls={[{ q: 'Мой заказ приняли?', at: S3 + 162 }]} />
      <Caption from={S4} to={S4 + 112} time="14:21 · готово" title={<>Готово — бот <Accent color="#F3B27A">напишет сам.</Accent></>} calls={[{ q: 'Ну что, готово?', at: S4 + 26 }]} />
      <Caption from={S4 + 112} to={S5} time="14:33 · выдан" title={<>Пять звёзд — <Accent color="#F3B27A">без напоминаний.</Accent></>} calls={[{ q: 'Вам всё понравилось?', at: S4 + 176 }]} />
      <Caption from={S5} to={S5 + 100} time="14:40 · отзыв" title={<>Ответ на отзыв — <Accent color="#F3B27A">в один клик.</Accent></>} />
      <Caption from={S5 + 100} to={S6} time="18:00 · выручка" title={<>Её 8.20 — <Accent color="#F3B27A">уже в выручке.</Accent></>} calls={[{ q: 'Сколько сегодня наторговали?', at: S5 + 124 }]} />
      <Caption from={S6} to={S7} time="21:00 · закрытие смены" title={<>Смена закрыта <Accent color="#F3B27A">за минуту.</Accent></>} calls={[{ q: 'Почему касса не сходится?', at: S6 + 150 }]} />

      {/* Sound: the morning rings, then only the product */}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={10 + i * 22} durationInFrames={S2 - 10 - i * 22} layout="none">
          <Audio src={staticFile(`sfx/ring${i + 1}.wav`)} loop volume={(f) => 0.32 * interpolate(f + 10 + i * 22, [S2 - 50, S2 - 4], [1, 0], clamp)} />
        </Sequence>
      ))}
      {[S2 + 120, S2 + 176, S3 + 162, S4 + 26, S4 + 176, S5 + 124, S6 + 150].map((at) => (
        <Sfx key={at} at={at} name="hangup" volume={0.25} />
      ))}
      {[S3 + 120, S5 + 40, S5 + 72, S6 + 50, S6 + 142, S6 + 178].map((at) => (
        <Sfx key={at} at={at} name="tap" volume={0.8} />
      ))}
      <Sfx at={S3 + 34} name="whoosh" volume={0.3} />
      <Sfx at={S3 + 46} name="pop" volume={0.6} />
      <Sfx at={S3 + 160} name="ding" volume={0.55} />
      <Sfx at={S4 + 22} name="ding" volume={0.55} />
      <Sfx at={S4 + 92} name="ding" volume={0.5} />
      <Sfx at={S4 + 128} name="tap" volume={0.7} />
      <Sfx at={S4 + 170} name="pop" volume={0.5} />
      <Sfx at={S4 + 196} name="pop" volume={0.5} />
      <Sfx at={S5 + 118} name="chime" volume={0.4} />
      <Sfx at={S6 + 186} name="ding" volume={0.55} />
      <Sequence from={S7 + 20} layout="none">
        <Audio src={staticFile('music-deck.mp3')} volume={(f) => 0.3 * interpolate(f, [0, 45], [0, 1], clamp) * interpolate(f, [FILM_FRAMES - S7 - 70, FILM_FRAMES - S7 - 30], [1, 0], clamp)} />
      </Sequence>
    </AbsoluteFill>
  );
};
