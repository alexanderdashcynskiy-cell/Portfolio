import mouth from './mouth.json';
import env from './voice-env.json';
import mouthPos from './mouth-pos.json';

/*
 * Lip sync for the mascot. The generated clips already contain a talking mouth; we choose
 * which source frame to show on every frame of the film so that the mouth is open when the
 * voice is loud and closed when it is silent. The clip only ever moves forward, a little
 * slower or faster than real time, so the head and hands stay continuous.
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
 */
export const syncedFrames = (clip: string, fromSec: number, start: number, len: number) => {
  const key = `${clip}:${fromSec}:${start}:${len}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const open = (mouth as Record<string, number[]>)[clip];
  const last = open.length - 2;
  const at = (s: number) => open[Math.min(last, Math.round(s))];
  const out: number[] = [];
  let s = fromSec * SRC_FPS;
  for (let f = 0; f < len; f++) {
    out.push(Math.min(last, s));
    const level = voiceLevel(start + f);
    if (level < SILENT) {
      // Silence: run on until the mouth is shut, then hold.
      if (at(s) > 0.22) s += 1;
    } else {
      // Speech: take the step forward whose mouth best matches how loud the voice is.
      const want = Math.min(1, level * 1.15);
      let best = 0.8;
      let cost = Infinity;
      for (const step of [0.3, 0.8, 1.3, 2, 2.8]) {
        const c = Math.abs(at(s + step) - want) + 0.12 * Math.abs(step - 0.8);
        if (c < cost) {
          cost = c;
          best = step;
        }
      }
      s += best;
    }
  }
  cache.set(key, out);
  return out;
};

/**
 * For a clip where the boy sighs rather than talks: it plays straight through, and the film
 * stretches the mouth itself. Returns the source frame and where the mouth is on it.
 */
export const flapFrame = (clip: string, fromSec: number, frame: number) => {
  const pos = (mouthPos as Record<string, number[][]>)[clip];
  const src = Math.min(pos.length - 2, Math.max(0, fromSec * SRC_FPS + (frame * SRC_FPS) / FPS));
  const [x, y] = pos[Math.round(src)];
  return { src, x, y };
};
