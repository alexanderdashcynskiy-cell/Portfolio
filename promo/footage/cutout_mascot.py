"""Cuts the mascot out of its studio backdrop: a VP9 clip with an alpha channel, in full colour.
The matte is everything the near-white backdrop does not reach from the frame's edges, so the
cream hat survives; it is pulled in a pixel and feathered so no white fringe is left.
usage: python3 cutout_mascot.py in.mp4 out.webm"""
import subprocess
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
enc = subprocess.Popen(
    ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '3M', '-auto-alt-ref', '0', out],
    stdin=subprocess.PIPE,
)
n = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    backdrop = (cv2.GaussianBlur(f, (0, 0), 1.0).min(axis=2) > 229).astype(np.uint8) * 255
    flood = np.zeros((H + 2, W + 2), np.uint8)
    for seed in ((2, 2), (W - 3, 2), (2, H // 2), (W - 3, H // 2)):
        if backdrop[seed[1], seed[0]]:
            cv2.floodFill(backdrop, flood, seed, 128)
    matte = (backdrop != 128).astype(np.uint8) * 255
    matte = cv2.erode(matte, np.ones((3, 3), np.uint8))
    matte = cv2.GaussianBlur(matte, (0, 0), 1.1)
    enc.stdin.write(np.dstack([f, matte]).tobytes())
    n += 1
enc.stdin.close()
enc.wait()
print(out, n, 'frames')
