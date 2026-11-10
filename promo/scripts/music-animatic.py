"""A draft score for the brand-film animatic: 70 s, warm, with tension in act 2 and a release
at the finale. A placeholder for a licensed track; it only marks the emotional shape and
the cut points. Writes public/music-animatic.wav."""
import numpy as np
import wave

SR = 44100
DUR = 70.0
t = np.arange(int(SR * DUR)) / SR
out = np.zeros_like(t)


def env_between(a, b, fade_in=1.5, fade_out=1.5):
    e = np.zeros_like(t)
    m = (t >= a) & (t <= b)
    e[m] = 1
    ri = (t >= a) & (t < a + fade_in)
    e[ri] = (t[ri] - a) / fade_in
    ro = (t > b - fade_out) & (t <= b)
    e[ro] = (b - t[ro]) / fade_out
    return e


def tone(freq, amp, detune=0.0, harmonics=(1.0, 0.35, 0.12)):
    s = np.zeros_like(t)
    for k, h in enumerate(harmonics, start=1):
        s += h * np.sin(2 * np.pi * freq * k * t)
        if detune:
            s += h * np.sin(2 * np.pi * freq * (1 + detune) * k * t)
    return amp * s / sum(harmonics)


def note(freq, start, length, amp=0.2, attack=0.02, release=0.4):
    seg = (t >= start) & (t < start + length + release)
    tt = t[seg] - start
    e = np.minimum(tt / attack, 1.0)
    e *= np.where(tt > length, np.exp(-(tt - length) / (release / 3)), 1.0)
    s = np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(2 * np.pi * freq * 2 * tt) + 0.1 * np.sin(2 * np.pi * freq * 3 * tt)
    out[seg] += amp * e * s / 1.4


# Key: D minor warming to D major at the end.
D2, A2, F3, A3, D4, E4, F4, G4, A4, Bb3, Fs4, C5, Cs5 = 73.42, 110.0, 174.61, 220.0, 293.66, 329.63, 349.23, 392.0, 440.0, 233.08, 369.99, 523.25, 554.37

# Act 1 (0–12): a low drone and a slow, sparse melody — the bakery waking.
drone = tone(D2, 0.16, detune=0.003) + tone(A2, 0.07, detune=0.002)
out += drone * env_between(0, 70, fade_in=4, fade_out=3)
for i, (f, st) in enumerate([(A3, 2.5), (F3, 5.5), (D4, 8.0), (A3, 10.5)]):
    note(f, st, 2.0, amp=0.09, attack=0.6, release=1.2)

# Act 2 (12–22): tension — a repeated pulse that quickens, a minor second rubbing against it.
for k in range(60):
    st = 12 + k * 0.5 * (1 - 0.35 * min(1, k / 40))
    if st > 21.5:
        break
    amp = 0.07 + 0.09 * min(1, k / 30)
    note(D4, st, 0.12, amp=amp, attack=0.005, release=0.15)
rub = tone(E4, 0.05, detune=0.004) * env_between(14, 22, fade_in=3, fade_out=0.3)
out += rub + tone(Bb3, 0.06, detune=0.003) * env_between(16, 22, fade_in=3, fade_out=0.3)
# a swell to the cut
out += tone(A3, 0.12) * env_between(19.5, 22, fade_in=2.4, fade_out=0.1)

# Act 3 (22–45): the drop into calm — a soft pad and a gentle, confident pulse.
pad = tone(F3, 0.09, detune=0.002) + tone(A3, 0.07, detune=0.002) + tone(D4, 0.05, detune=0.002)
out += pad * env_between(22, 45, fade_in=0.4, fade_out=2)
for k in range(46):
    st = 22.5 + k * 0.5
    if st > 44.5:
        break
    if k % 4 == 0:
        note(D4, st, 0.2, amp=0.07, attack=0.01, release=0.3)
    elif k % 4 == 2:
        note(A3, st, 0.2, amp=0.05, attack=0.01, release=0.3)
for f, st in [(A4, 24), (F4, 27), (G4, 30), (A4, 33), (D4, 36), (F4, 39), (E4, 42)]:
    note(f, st, 1.6, amp=0.06, attack=0.3, release=0.9)

# Act 4 (45–58): warming, the pad opens, a slow build.
pad2 = tone(D4, 0.06, detune=0.002) + tone(F4, 0.05, detune=0.002) + tone(A4, 0.04, detune=0.002)
out += pad2 * env_between(45, 58.5, fade_in=3, fade_out=0.3)
for k in range(28):
    st = 45 + k * 0.5
    note(D4 if k % 2 == 0 else A3, st, 0.25, amp=0.05 + 0.04 * k / 28, attack=0.01, release=0.3)
out += tone(A3, 0.14) * env_between(55, 58.6, fade_in=3.4, fade_out=0.15)

# Act 5 (58.6–70): release — D major, wide and still.
rel = tone(D2, 0.14, detune=0.003) + tone(A2, 0.08) + tone(Fs4, 0.07, detune=0.002) + tone(A4, 0.06, detune=0.002) + tone(D4, 0.05)
out += rel * env_between(58.6, 70, fade_in=0.6, fade_out=4)
for f, st in [(Fs4, 60), (A4, 62.5), (D4, 65), (Cs5, 66.5), (A4, 68)]:
    note(f, st, 2.2, amp=0.07, attack=0.5, release=1.6)

# Soften: a touch of low-pass by averaging, then normalise.
k = 6
out = np.convolve(out, np.ones(k) / k, mode='same')
out = out / (np.max(np.abs(out)) + 1e-9) * 0.8
w = wave.open('public/music-animatic.wav', 'wb')
w.setnchannels(1)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes())
w.close()
print('ok', DUR)
