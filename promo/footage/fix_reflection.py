"""For a phone standing on a glossy counter: the green screen's reflection merges with the screen.
Rebuilds each quad's bottom edge from the phone's proportions, and writes a copy of the footage
with the leftover green (the reflection) turned dark and neutral.
usage: python3 fix_reflection.py in.mp4 track.json out.mp4 [aspect]"""
import json
import subprocess
import sys

import cv2
import numpy as np

src, track, out = sys.argv[1:4]
aspect = float(sys.argv[4]) if len(sys.argv) > 4 else 2.16
d = json.load(open(track))
quads = []
for q in d['quads']:
    tl, tr, br, bl = (np.array(p) for p in q)
    width = np.linalg.norm(tr - tl)
    down_l = (bl - tl) / np.linalg.norm(bl - tl)
    down_r = (br - tr) / np.linalg.norm(br - tr)
    quads.append([tl.tolist(), tr.tolist(), (tr + down_r * width * aspect).tolist(), (tl + down_l * width * aspect).tolist()])
d['quads'] = quads
json.dump(d, open(track, 'w'))

cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-', '-i', src, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'copy', out], stdin=subprocess.PIPE)
i = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    q = np.array(quads[min(i, len(quads) - 1)], np.int32)
    screen = np.zeros((h, w), np.uint8)
    cv2.fillConvexPoly(screen, q, 255)
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    green = cv2.inRange(hsv, (30, 30, 20), (95, 255, 255))
    spill = cv2.bitwise_and(green, cv2.bitwise_not(cv2.dilate(screen, np.ones((5, 5), np.uint8))))
    s = cv2.GaussianBlur(spill, (9, 9), 0).astype(np.float32)[..., None] / 255
    grey = cv2.cvtColor(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR).astype(np.float32) * 0.35
    enc.stdin.write((f * (1 - s) + grey * s).clip(0, 255).astype(np.uint8).tobytes())
    i += 1
enc.stdin.close()
enc.wait()
print('ok', i)
