"""Plans the mascot promo's timeline: where each phrase of the voice plays in the film, and, for
each Veo clip of the boy, which moment of the clip to show at each moment of the film.

Inside a phrase the clip follows the voice: each spoken chunk of the voice is paired with the
same words in the clip and aligned with DTW (align_veo.py's features), so the boy's mouth moves
with the syllables. Between phrases and around them the clip runs on at a brisk `rate`, which
also sets how long the film waits between phrases (his gestures need their time).

Writes src/mascot/timeline.json.
usage: python3 plan_mascot.py voice.wav clips_dir   (16 kHz mono wavs named after the clips)"""
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from align_veo import SR, dtw, features  # noqa: E402

voice_wav, clips_dir = sys.argv[1], sys.argv[2]
voice, _ = sf.read(voice_wav, dtype='float32')

# Spoken chunks as [voice start, voice end, clip start, clip end], from the two tracks' pauses
# and word timings. A chunk the clip never says may replay the words just before it, so his
# mouth keeps moving.
SHOTS = {
    'pain': {
        'rate': 1.35,
        'start': 1.0,  # clip time at the scene's first frame
        'chunks': [[0.31, 1.10, 3.07, 3.80], [1.74, 3.22, 4.08, 5.28], [3.94, 5.92, 7.95, 9.52]],
    },
    'idea': {'rate': 1.9, 'start': 0.1, 'chunks': [[8.10, 8.74, 4.68, 5.18], [9.17, 11.48, 5.58, 7.80]]},
    'meet': {
        'rate': 1.35,
        'start': 0.3,
        'chunks': [[11.82, 12.66, 1.17, 2.00], [12.96, 14.12, 2.25, 3.75], [14.43, 15.21, 4.29, 5.39], [15.47, 16.31, 5.63, 6.59]],
    },
    'finale': {'rate': 1.35, 'start': 0.8, 'chunks': [[35.87, 36.63, 1.30, 2.04], [36.98, 38.15, 3.35, 4.39]]},
}


def chunk_warp(clip_audio, v0, v1, c0, c1):
    """Dense [voice_s, clip_s] pairs for one chunk."""
    fa = features(voice[int(v0 * SR):int(v1 * SR)])[::2]
    fb = features(clip_audio[int(c0 * SR):int(c1 * SR)])[::2]
    p = np.array(dtw(fa, fb), float) * 0.02
    grid = np.arange(0, v1 - v0, 0.04)
    ct = np.interp(grid, p[:, 0], p[:, 1])
    ct = np.convolve(np.pad(ct, 2, mode='edge'), np.ones(5) / 5, mode='valid')
    # DTW holds a frame wherever the two speakers differ in pace, and a held frame reads as the
    # boy freezing. Keep the clip moving: its speed against the voice stays within 0.6–1.8×,
    # then the whole chunk is rescaled to end exactly on the chunk's last word.
    step = np.diff(ct, prepend=0.0)
    step[1:] = np.clip(step[1:], 0.6 * 0.04, 1.8 * 0.04)
    ct = np.cumsum(step) - step[0]
    ct *= (c1 - c0) / max(ct[-1], 1e-6)
    return [[v0 + g, c0 + c] for g, c in zip(grid, ct)] + [[v1, c1]]


def place(shot, scene_start):
    """Film anchors [film_s, clip_s] for a shot whose scene starts at `scene_start` (film s),
    and the voice cues [film_s, voice_a, voice_b] it plays."""
    s = SHOTS[shot]
    audio, _ = sf.read(os.path.join(clips_dir, f'{shot}.wav'), dtype='float32')
    rate = s['rate']
    anchors = [[scene_start, s['start']]]
    cues = []
    t, clip_t = scene_start, s['start']
    for k, (v0, v1, c0, c1) in enumerate(s['chunks']):
        if k == 0:
            # Run on at `rate` from the scene's start to the first word.
            t += max(0.0, c0 - clip_t) / rate
        else:
            # Between chunks: the voice's own pause, or longer if the clip's gesture needs it.
            pv1 = s['chunks'][k - 1][1]
            if c0 >= clip_t:
                t += max(v0 - pv1, (c0 - clip_t) / rate)
            else:
                # A replayed chunk: hold the last moment through the pause, then jump back.
                t += v0 - pv1
                anchors.append([round(t - 0.001, 3), round(clip_t, 3)])
        cues.append([round(t, 3), v0, v1])
        for v, c in chunk_warp(audio, v0, v1, c0, c1):
            anchors.append([round(t + (v - v0), 3), round(c, 3)])
        t += v1 - v0
        clip_t = c1
    return anchors, cues, t, clip_t, rate


timeline = {'cues': [], 'clips': {}}

# Scene 1 — pain.
a, cues, t, ct, rate = place('pain', 0.0)
timeline['clips']['pain'] = {'anchors': a, 'rate': rate}
timeline['cues'] += cues
s2 = round(t + (10.0 - ct) / rate * 0.8, 2)

# Scene 2 — the idea; the voice's sigh plays while he wipes his face.
a, cues, t, ct, rate = place('idea', s2)
timeline['clips']['idea'] = {'anchors': a, 'rate': rate}
timeline['cues'] += [[round(s2 + 1.6, 3), 7.25, 7.52]] + cues
s3 = round(t + 0.45, 2)

# Scene 3 — «Знакомьтесь».
a, cues, t, ct, rate = place('meet', s3)
timeline['clips']['meet'] = {'anchors': a, 'rate': rate}
timeline['cues'] += cues
s4 = round(t + 0.35, 2)

# Scenes 4–7 are voice over product screens: each phrase with a short breath around it.
over = [[16.55, 22.25], [22.46, 27.60], [27.80, 31.70], [31.87, 35.53]]
starts = []
t = s4
for v0, v1 in over:
    starts.append(round(t, 2))
    timeline['cues'].append([round(t + 0.2, 3), v0, v1])
    t += 0.2 + (v1 - v0) + 0.25
s8 = round(t, 2)

# Scene 8 — «Вы печёте…», running on into the sign-off where he winks.
a, cues, t, ct, rate = place('finale', s8)
timeline['clips']['finale'] = {'anchors': a, 'rate': rate}
timeline['cues'] += cues
s9 = round(t + 0.4, 2)
end = round(s9 + 3.4, 2)

timeline['scenes'] = {'pain': 0.0, 'idea': s2, 'meet': s3, 'store': starts[0], 'crm': starts[1], 'ready': starts[2], 'sums': starts[3], 'finale': s8, 'signoff': s9, 'end': end}
json.dump(timeline, open('src/mascot/timeline.json', 'w'))
print(json.dumps(timeline['scenes']))
print('cues', timeline['cues'])
