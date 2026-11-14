"""Turns a mascot clip on a white background into a halftone print: round dots on a 45° grid,
bigger where the picture is darker. Writes two versions for blending in the film:
  <out>-ink.mp4    brown ink on white  (mix-blend-mode: multiply, for light and orange scenes)
  <out>-light.mp4  cream dots on black (mix-blend-mode: screen, for dark scenes)
usage: python3 halftone.py in.mp4 out_prefix [--light]
"""
import subprocess
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
W, H, CELL = 1920, 1080, 8.0
INK = np.array([5, 21, 45], np.float32)  # BGR of #2D1505
CREAM = np.array([238, 246, 251], np.float32)  # BGR of #FBF6EE

# The dot lattice is the same for every frame: for each pixel, its cell's centre and distance to it.
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
c, s = np.cos(np.pi / 4), np.sin(np.pi / 4)
u = (xs * c + ys * s) / CELL
v = (-xs * s + ys * c) / CELL
cu, cv_ = np.floor(u) + 0.5, np.floor(v) + 0.5
dist = np.hypot(u - cu, v - cv_) * CELL
cx = np.clip((cu * c - cv_ * s) * CELL, 0, W - 1).astype(np.float32)
cy = np.clip((cu * s + cv_ * c) * CELL, 0, H - 1).astype(np.float32)

cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)


def encoder(path):
    return subprocess.Popen(
        ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '21', '-pix_fmt', 'yuv420p', path],
        stdin=subprocess.PIPE,
    )


ink = encoder(f'{out}-ink.mp4')
light = encoder(f'{out}-light.mp4') if '--light' in sys.argv else None
n = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    big = cv2.resize(f, (W, H), interpolation=cv2.INTER_CUBIC)
    g = cv2.cvtColor(big, cv2.COLOR_BGR2GRAY).astype(np.float32)
    # The character's matte: everything the studio backdrop does not reach from the corners.
    # (The cream hat is almost the backdrop's colour, so a plain threshold would eat it.)
    backdrop = (cv2.GaussianBlur(big, (0, 0), 1.2).min(axis=2) > 229).astype(np.uint8) * 255
    flood = np.zeros((H + 2, W + 2), np.uint8)
    for seed in ((2, 2), (W - 3, 2), (2, H // 2), (W - 3, H // 2)):
        if backdrop[seed[1], seed[0]]:
            cv2.floodFill(backdrop, flood, seed, 128)
    matte = cv2.GaussianBlur((backdrop != 128).astype(np.float32), (0, 0), CELL * 0.3)
    # Tones: skin and the hat stay light, hair and the apron carry the weight.
    dark = (1 - np.clip((g - 45) / (225 - 45), 0, 1)) ** 1.25
    dark = cv2.GaussianBlur(np.maximum(dark, 0.07) * matte, (0, 0), CELL * 0.35)
    lit = cv2.GaussianBlur((1 - dark) * matte, (0, 0), CELL * 0.35)

    def dots(tone):
        at_centre = cv2.remap(tone, cx, cy, cv2.INTER_LINEAR)
        r = CELL * 0.76 * np.sqrt(at_centre)
        r[r < 0.9] = -1  # no speck where there is nothing to print: the backdrop stays clean
        return np.clip(r - dist + 0.5, 0, 1)[..., None]

    a = dots(dark)
    ink.stdin.write((255 * (1 - a) + INK * a).astype(np.uint8).tobytes())
    if light:
        light.stdin.write((CREAM * dots(lit)).astype(np.uint8).tobytes())
    n += 1
for e in (ink, light):
    if e:
        e.stdin.close()
        e.wait()
print(out, n, 'frames')
