"""Data for the mascot's lip sync, written to src/mascot/:
  mouth.json      per source frame of each talking clip, how open the mouth is (0..1)
  mouth-pos.json  per source frame, where the mouth is (x, y in the clip's pixels)
  voice-env.json  the voice's loudness per 1/30 s (0..1)
usage: python3 lipsync_data.py voice.mp3 name=clip.mp4 [name=clip.mp4 ...]"""
import json
import subprocess
import sys

import cv2
import numpy as np

voice, clips = sys.argv[1], [a.split('=') for a in sys.argv[2:]]

def mouth_open(frame):
    """Dark pixels inside the lower part of the face. The face is found on every frame (the
    largest patch of skin, as a convex hull), so a tilting head does not move hair or the
    neck's shadow into the measurement."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    skin = cv2.inRange(hsv, (4, 40, 160), (24, 135, 255))  # the orange shirt is far more saturated
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(skin)
    if n < 2:
        return 0.0, None
    k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    pts = cv2.findNonZero((lab == k).astype(np.uint8))
    hull = cv2.convexHull(pts)
    x, y, w, h = cv2.boundingRect(hull)
    inside = np.zeros(frame.shape[:2], np.uint8)
    cv2.fillConvexPoly(inside, hull, 255)
    inside = cv2.erode(inside, np.ones((max(3, h // 12), max(3, h // 12)), np.uint8))
    inside[: y + int(h * 0.62)] = 0  # below the nose only
    inside[:, : x + int(w * 0.22)] = 0
    inside[:, x + int(w * 0.78):] = 0
    dark = (hsv[..., 2] < 125) & (inside > 0)
    ys, xs = np.nonzero(dark)
    centre = (float(xs.mean()), float(ys.mean())) if len(xs) > 12 else (x + w / 2, y + h * 0.8)
    return float(dark.sum()) / (h * h) * 1e4, centre


mouth, where = {}, {}
for name, src in clips:
    cap = cv2.VideoCapture(src)
    vals, pos = [], []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        o, c = mouth_open(f)
        vals.append(o)
        pos.append(c or pos[-1])
    v = np.array(vals)
    # Where the mouth is on each frame, smoothed: for clips whose mouth we move ourselves.
    pp = np.array(pos)
    for d in range(2):
        pp[:, d] = np.convolve(np.pad(pp[:, d], 4, mode='edge'), np.ones(9) / 9, mode='valid')
    where[name] = np.round(pp, 1).tolist()
    lo, hi = np.percentile(v, 4), np.percentile(v, 97)
    mouth[name] = np.round(np.clip((v - lo) / (hi - lo), 0, 1), 3).tolist()
    print(name, 'raw', round(float(v.min()), 1), round(float(np.median(v)), 1), round(float(v.max()), 1))
json.dump(mouth, open('src/mascot/mouth.json', 'w'))
json.dump(where, open('src/mascot/mouth-pos.json', 'w'))

pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', voice, '-ac', '1', '-ar', '48000', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
step = 48000 // 30
n = len(a) // step
rms = np.sqrt((a[: n * step].reshape(n, step) ** 2).mean(axis=1))
rms = np.convolve(rms, [0.25, 0.5, 0.25], mode='same')
env = np.clip(rms / np.percentile(rms, 95), 0, 1)
json.dump(np.round(env, 3).tolist(), open('src/mascot/voice-env.json', 'w'))
print({k: len(v) for k, v in mouth.items()}, 'voice frames', n)
