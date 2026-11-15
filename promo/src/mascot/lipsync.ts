import mouth from './mouth.json';
import env from './voice-env.json';

/*
 * Lip sync for the mascot. The generated clips already contain a talking mouth; we choose
 * which source frame to show on every frame of the film so that the mouth is open when the
 * voice is loud and closed when it is silent. The clip only ever moves forward, so the head
 * and hands stay continuous.
 */

/** The voice file cut into phrases: [frame in the film, start s, end s]. */
export const VOICE: [number, number, number][] = [
  [12, 0.0, 3.55], // Опять звонят? У меня руки в тесте!
  [138, 4.15, 6.95], // А что, если заказы будут приходить сами?
  [245, 7.15, 10.2], // Клиент выбрал в Телеграме — заказ уже у вас.
  [385, 10.3, 13.1], // Заказ принят. Клиент в курсе. Всё учтено.
  [462, 13.15, 15.0], // Вот теперь — готово!
  [536, 15.4, 18.3], // Вы печёте. Мы ведём заказы.
];

const FPS = 30;
const SRC_FPS = 24;
const SILENT = 0.1;

/** The voice's loudness (0..1) on a frame of the film. */
export const voiceLevel = (frame: number) => {
  for (const [at, a, b] of VOICE) {
    if (frame >= at && frame < at + (b - a) * FPS) return (env as number[])[Math.round(a * FPS) + frame - at] ?? 0;
  }
  return 0;
};

const cache = new Map<string, number[]>();

/**
 * Source frames (at the clip's own 24 fps) for a mascot that appears at `start` in the film,
 * beginning `fromSec` into its clip, for `len` frames.
 *
 * The whole run is planned at once (a shortest path over «which source frame on which film
 * frame»): the clip may hold or move forward by up to three source frames per film frame, and
 * the plan minimises the gap between how open the mouth is and how loud the voice is about to
 * be, with a small price for leaving natural speed. Planning ahead is what lets the mouth be
 * open exactly on the loud syllables instead of trailing them.
 */
export const syncedFrames = (clip: string, fromSec: number, start: number, len: number) => {
  const key = `${clip}:${fromSec}:${start}:${len}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const open = (mouth as Record<string, number[]>)[clip];
  const H = 2; // states are half source frames
  const N = (open.length - 1) * H;
  const STEPS = [0, 1, 2, 3, 4, 5, 6];
  const cost: Float64Array[] = [];
  const back: Int8Array[] = [];
  const s0 = Math.min(N - 1, Math.round(fromSec * SRC_FPS * H));
  cost.push(new Float64Array(N).fill(Infinity));
  back.push(new Int8Array(N));
  cost[0][s0] = 0;
  for (let f = 1; f < len; f++) {
    const level = voiceLevel(start + f + 1); // the mouth leads the sound by a frame
    const silent = level < SILENT;
    const want = silent ? 0 : Math.min(1, level * 1.15);
    const c = new Float64Array(N).fill(Infinity);
    const b = new Int8Array(N);
    for (const st of STEPS) {
      const price = silent ? (st === 0 ? 0 : 0.05) : 0.04 * Math.abs(st - 1.6);
      for (let i = st; i < N; i++) {
        const v = cost[f - 1][i - st] + Math.abs(open[i >> 1] - want) + price;
        if (v < c[i]) {
          c[i] = v;
          b[i] = st;
        }
      }
    }
    cost.push(c);
    back.push(b);
  }
  let s = 0;
  for (let i = 1; i < N; i++) if (cost[len - 1][i] < cost[len - 1][s]) s = i;
  const out = new Array<number>(len);
  for (let f = len - 1; f >= 0; f--) {
    out[f] = s / H;
    s -= back[f][s];
  }
  cache.set(key, out);
  return out;
};
