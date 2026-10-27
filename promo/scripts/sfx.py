"""Synthesise the promo's sound effects, so none of them needs a licence. Run: python3 scripts/sfx.py"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / 'public' / 'sfx'
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack=0.005, release=0.1):
    e = np.ones(n)
    a, r = int(SR * attack), int(SR * release)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode='same')


def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) or 1) * gain
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# Phone vibration: a rough 170 Hz motor, pulsed.
x = t(0.42)
buzz = np.sign(np.sin(2 * np.pi * 170 * x)) * 0.6 + np.sin(2 * np.pi * 340 * x) * 0.3
buzz = lowpass(buzz, 9) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * x) ** 2)
save('buzz', buzz * env(len(x), 0.01, 0.06), 0.55)

# Notification: two soft bell partials, rising.
def bell(f, sec, decay):
    x = t(sec)
    return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 20)) * np.exp(-x * decay)

ding = np.concatenate([bell(1318, 0.09, 18), bell(1760, 0.5, 7)])
save('ding', ding * env(len(ding), 0.002, 0.05), 0.5)

# Tap: a short filtered click.
x = t(0.05)
tap = rng.standard_normal(len(x)) * np.exp(-x * 160) + np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 120) * 0.5
save('tap', lowpass(tap, 3), 0.45)

# Pen on paper: bursts of scratchy noise.
x = t(0.7)
pen = rng.standard_normal(len(x))
pen = pen - lowpass(pen, 30)
pen *= (np.sin(2 * np.pi * 7 * x) ** 2) * env(len(x), 0.02, 0.15)
save('pen', pen, 0.3)

# Page flip / whoosh: noise swept from low to high, swelling then gone.
x = t(0.45)
n = rng.standard_normal(len(x))
k = np.linspace(40, 4, len(x)).astype(int)
w = np.array([n[max(0, i - k[i]):i + 1].mean() for i in range(len(n))])
save('whoosh', w * np.sin(np.pi * x / x[-1]) ** 1.5, 0.6)

# Sticky note slap.
x = t(0.12)
slap = lowpass(rng.standard_normal(len(x)), 6) * np.exp(-x * 45) + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 40)
save('slap', slap, 0.6)

# New order in the CRM: a bright two-note chime.
chime = np.concatenate([bell(988, 0.12, 10), bell(1480, 0.7, 5)])
save('chime', chime * env(len(chime), 0.002, 0.08), 0.5)

# Counter tick.
x = t(0.03)
save('tick', np.sin(2 * np.pi * 3200 * x) * np.exp(-x * 200), 0.3)

# Incoming message: a soft rising pop.
x = t(0.18)
pop = np.sin(2 * np.pi * (500 + 900 * x / x[-1]) * x) * np.exp(-x * 18)
save('pop', pop * env(len(x), 0.003, 0.04), 0.5)

# Final hit: low warm thump with a shimmer tail.
x = t(1.4)
hit = np.sin(2 * np.pi * 70 * x) * np.exp(-x * 6) + 0.25 * bell(1046, 1.4, 3) + 0.15 * bell(1568, 1.4, 3.5)
save('hit', hit * env(len(x), 0.002, 0.3), 0.7)

print('written to', OUT)
