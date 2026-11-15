"""Maps the voice-over onto Veo clips of the mascot saying the same words, so his mouth can
follow a different voice. For each phrase, mel spectra of the voice and of the clip's own
speech are aligned with dynamic time warping; the warp, smoothed and kept monotonic, says
which moment of the clip matches each moment of the voice.
Writes src/mascot/warp.json: { clip: [[voice_s, clip_s], ...] } at 25 points a second.
usage: python3 align_veo.py voice.wav clip=file.wav:v0:v1:c0:c1 ...   (16 kHz mono wavs)"""
import json
import sys

import numpy as np
import soundfile as sf

SR = 16000
HOP = 160  # 10 ms
WIN = 400


def mel_filterbank(n_mels=40, n_fft=512):
    hz = lambda m: 700 * (10 ** (m / 2595) - 1)
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    pts = hz(np.linspace(mel(60), mel(7600), n_mels + 2))
    bins = np.floor((n_fft + 1) * pts / SR).astype(int)
    fb = np.zeros((n_mels, n_fft // 2 + 1))
    for i in range(1, n_mels + 1):
        a, b, c = bins[i - 1], bins[i], bins[i + 1]
        fb[i - 1, a:b] = (np.arange(a, b) - a) / max(1, b - a)
        fb[i - 1, b:c] = (c - np.arange(b, c)) / max(1, c - b)
    return fb


FB = mel_filterbank()


def features(x):
    frames = np.lib.stride_tricks.sliding_window_view(x, WIN)[::HOP] * np.hanning(WIN)
    spec = np.abs(np.fft.rfft(frames, 512)) ** 2
    m = np.log(spec @ FB.T + 1e-8)
    d = np.diff(m, axis=0, prepend=m[:1])  # deltas carry the syllable rhythm across voices
    f = np.hstack([m, 2 * d])
    return (f - f.mean(0)) / (f.std(0) + 1e-6)


def dtw(a, b):
    n, m = len(a), len(b)
    cost = np.linalg.norm(a[:, None, :] - b[None, :, :], axis=2)
    acc = np.full((n + 1, m + 1), np.inf)
    acc[0, 0] = 0
    for i in range(1, n + 1):
        row = cost[i - 1]
        for j in range(1, m + 1):
            acc[i, j] = row[j - 1] + min(acc[i - 1, j - 1], acc[i - 1, j] + 0.3, acc[i, j - 1] + 0.3)
    i, j, path = n, m, []
    while i > 0 and j > 0:
        path.append((i - 1, j - 1))
        k = np.argmin([acc[i - 1, j - 1], acc[i - 1, j], acc[i, j - 1]])
        i, j = (i - 1, j - 1) if k == 0 else (i - 1, j) if k == 1 else (i, j - 1)
    return path[::-1]


def main():
    voice, _ = sf.read(sys.argv[1], dtype='float32')
    out = {}
    for spec in sys.argv[2:]:
        name, rest = spec.split('=')
        path_, v0, v1, c0, c1 = rest.split(':')
        v0, v1, c0, c1 = map(float, (v0, v1, c0, c1))
        clip, _ = sf.read(path_, dtype='float32')
        fa = features(voice[int(v0 * SR):int(v1 * SR)])
        fb = features(clip[int(c0 * SR):int(c1 * SR)])
        # Downsample to 20 ms steps so the plain-Python DTW stays quick.
        fa, fb = fa[::2], fb[::2]
        p = np.array(dtw(fa, fb), float) * 0.02
        vt, ct = p[:, 0] + v0, p[:, 1] + c0
        grid = np.arange(v0, v1, 0.04)
        ct_g = np.interp(grid, vt, ct)
        ct_g = np.convolve(np.pad(ct_g, 3, mode='edge'), np.ones(7) / 7, mode='valid')
        ct_g = np.maximum.accumulate(ct_g)
        out[name] = [[round(float(a), 3), round(float(b), 3)] for a, b in zip(grid, ct_g)]
        print(name, f'voice {v0}-{v1}s → clip {ct_g[0]:.2f}-{ct_g[-1]:.2f}s')
    json.dump(out, open('src/mascot/warp.json', 'w'))


if __name__ == '__main__':
    main()
