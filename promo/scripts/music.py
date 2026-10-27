"""A warm, quiet music bed for the deck, synthesised so it carries no licence. Run: python3 scripts/music.py"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 84
BEAT = 60 / BPM
LENGTH = 86.0  # seconds; a little longer than the film
OUT = Path(__file__).resolve().parent.parent / 'public' / 'music-deck.wav'
rng = np.random.default_rng(3)


def hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def onepole(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


N = int(SR * LENGTH)
t = np.arange(N) / SR
mix = np.zeros((2, N))

# Fmaj9 – Am7 – Dm9 – Bbmaj7, one bar (4 beats) each, looped.
CHORDS = [[53, 60, 64, 67, 69], [57, 60, 64, 67, 71], [50, 57, 60, 64, 65], [46, 57, 62, 65, 69]]
BAR = 4 * BEAT

# Pad: detuned soft saws per chord, slow swell, low-passed.
for b in range(int(LENGTH / BAR) + 1):
    chord = CHORDS[b % 4]
    s, e = int(b * BAR * SR), min(N, int(((b + 1) * BAR + 0.8) * SR))
    if s >= N:
        break
    tt = np.arange(e - s) / SR
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (tt[-1] - tt) / 0.9 + 0.001)
    for n in chord[1:]:
        for side, det in ((0, -0.12), (1, 0.12)):
            f = hz(n) * 2 ** (det / 12)
            saw = 2 * ((tt * f) % 1) - 1
            mix[side, s:e] += saw * env * 0.05
mix[0] = onepole(mix[0], 900)
mix[1] = onepole(mix[1], 900)

# Bass: root on each bar, soft sine with a little second harmonic.
for b in range(int(LENGTH / BAR) + 1):
    root = CHORDS[b % 4][0] - 12
    s = int(b * BAR * SR)
    if s >= N:
        break
    tt = np.arange(min(N - s, int(BAR * SR))) / SR
    v = (np.sin(2 * np.pi * hz(root) * tt) + 0.2 * np.sin(4 * np.pi * hz(root) * tt)) * np.exp(-tt * 0.6) * np.minimum(1, tt / 0.03)
    mix[:, s:s + len(tt)] += v * 0.22

# Pluck: an eighth-note arpeggio of chord tones, an octave up, gentle and sparse.
step = BEAT / 2
for k in range(int(LENGTH / step)):
    if k % 8 in (3, 7) and rng.random() < 0.5:
        continue
    chord = CHORDS[int(k * step / BAR) % 4]
    n = chord[1:][[0, 2, 1, 3, 2, 4, 3, 2][k % 8] % 4] + 12
    s = int(k * step * SR)
    tt = np.arange(min(N - s, int(1.2 * SR))) / SR
    f = hz(n)
    v = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6)) * np.exp(-tt * 4.5) * np.minimum(1, tt / 0.004)
    pan = 0.5 + 0.35 * np.sin(k * 0.7)
    mix[0, s:s + len(tt)] += v * 0.07 * (1 - pan)
    mix[1, s:s + len(tt)] += v * 0.07 * pan

# Soft shaker on off-beats.
for k in range(int(LENGTH / step)):
    if k % 2 == 0:
        continue
    s = int(k * step * SR)
    tt = np.arange(min(N - s, int(0.08 * SR))) / SR
    nz = rng.standard_normal(len(tt))
    nz = nz - onepole(nz, 4000)
    mix[:, s:s + len(tt)] += nz * np.exp(-tt * 60) * 0.02

# Room: a short stereo echo for space.
for d, g in ((0.23, 0.25), (0.41, 0.15)):
    o = int(d * SR)
    mix[0, o:] += mix[1, :-o] * g
    mix[1, o:] += mix[0, :-o] * g

# Fade in and out.
fade = np.ones(N)
fade[: int(2 * SR)] = np.linspace(0, 1, int(2 * SR))
fade[-int(4 * SR):] = np.linspace(1, 0, int(4 * SR))
mix *= fade
mix /= np.max(np.abs(mix)) / 0.7
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(str(OUT), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('written', OUT)
