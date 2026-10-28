"""Tracks a green screen in a video: four corners per frame, smoothed, written as JSON.

The corners come from lines fitted to the green region's four edges, so rounded phone corners
and the tracking crosses don't pull them inwards.
usage: python3 track.py in.mp4 out.json [start_s end_s]
"""
import json
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
t0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
t1 = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9

cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))


def line_through(pts):
    vx, vy, x, y = cv2.fitLine(pts.astype(np.float32), cv2.DIST_HUBER, 0, 0.01, 0.01).flatten()
    return np.array([x, y]), np.array([vx, vy])


def intersect(l1, l2):
    (p, r), (q, s) = l1, l2
    m = np.array([r, -s]).T
    t = np.linalg.solve(m, q - p)
    return p + t[0] * r


def quad_from_hull(c):
    """For flat, steep quads (a phone lying on a table): a four-point polygon around the hull."""
    hull = cv2.convexHull(c)
    for eps in np.linspace(0.005, 0.1, 40):
        a = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(a) == 4:
            q = a[:, 0, :].astype(np.float64)
            # Order TL, TR, BR, BL around the centre, starting at the leftmost-top point.
            cen = q.mean(0)
            q = q[np.argsort(np.arctan2(q[:, 1] - cen[1], q[:, 0] - cen[0]))]
            start = np.argmin(q.sum(1))
            return np.roll(q, -start, axis=0)
    return None


def corners(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, (35, 70, 50), (90, 255, 255))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cs:
        return None
    c = max(cs, key=cv2.contourArea)
    if cv2.contourArea(c) < 2000:
        return None
    p = c[:, 0, :].astype(np.float64)
    # Rough corners: the extremes along the two diagonals (TL, TR, BR, BL).
    rough = [p[np.argmin(p.sum(1))], p[np.argmax(p[:, 0] - p[:, 1])], p[np.argmax(p.sum(1))], p[np.argmin(p[:, 0] - p[:, 1])]]
    lines = []
    for k in range(4):
        a, b = rough[k], rough[(k + 1) % 4]
        ab = b - a
        L = np.linalg.norm(ab)
        t = (p - a) @ ab / (L * L)
        d = np.abs((p - a) @ np.array([-ab[1], ab[0]]) / L)
        seg = p[(t > 0.15) & (t < 0.85) & (d < 0.12 * L)]
        if len(seg) < 10:
            return quad_from_hull(c)
        lines.append(line_through(seg))
    q = [intersect(lines[(k + 3) % 4], lines[k]) for k in range(4)]  # TL, TR, BR, BL
    return np.array(q)


frames = []
i = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    t = i / fps
    if t0 <= t < t1:
        q = corners(f)
        frames.append(None if q is None else q.tolist())
    i += 1

arr = np.array([np.full((4, 2), np.nan) if q is None else q for q in frames])
# Glare on the screen can break a frame's quad: drop any frame whose corners stray from the
# running median of their neighbours, and let the gap be filled from either side.
med = arr.copy()
for i in range(len(arr)):
    win = arr[max(0, i - 12):i + 13]
    med[i] = np.nanmedian(win, axis=0)
stray = np.nanmax(np.linalg.norm(arr - med, axis=2), axis=1) > 12
arr[stray] = np.nan
print('stray frames:', int(stray.sum()))
# Fill gaps, then smooth each coordinate with a short centred window.
for k in range(4):
    for d in range(2):
        v = arr[:, k, d]
        good = ~np.isnan(v)
        v[~good] = np.interp(np.flatnonzero(~good), np.flatnonzero(good), v[good])
        pad = np.pad(v, 3, mode='edge')
        arr[:, k, d] = np.convolve(pad, np.ones(7) / 7, mode='valid')

missing = sum(q is None for q in frames)
json.dump({'fps': fps, 'width': w, 'height': h, 'start': t0, 'quads': np.round(arr, 2).tolist()}, open(out, 'w'))
print(f'{src}: {len(frames)} frames, {missing} untracked, first {arr[0].round(1).tolist()}')
