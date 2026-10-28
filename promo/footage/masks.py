"""Cuts a green screen out of footage, for laying the footage over a replaced screen.

The matte is the screen only (bright, saturated green), filled and slightly grown; any green
left outside it (reflections on the phone's edge) is turned to neutral grey. Writes clean.mp4
(the despilled footage) and cutout.webm (the same with the screen transparent).
usage: python3 masks.py in.mp4 clean.mp4 cutout.webm
"""
import subprocess
import sys

import cv2
import numpy as np

src, clean, cutout = sys.argv[1], sys.argv[2], sys.argv[3]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
enc = subprocess.Popen(
    ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', clean],
    stdin=subprocess.PIPE,
)
alpha_enc = subprocess.Popen(
    ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '6M', '-auto-alt-ref', '0', cutout],
    stdin=subprocess.PIPE,
)
i = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (35, 70, 50), (90, 255, 255))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    if n > 1:
        k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        m = np.where(lab == k, 255, 0).astype(np.uint8)
        cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(m, cs, -1, 255, -1)
    m = cv2.dilate(m, np.ones((9, 9), np.uint8))
    # Spill: greenish pixels outside the screen become neutral and a touch darker.
    spill = cv2.inRange(hsv, (30, 25, 15), (95, 255, 255))
    spill = cv2.bitwise_and(spill, cv2.bitwise_not(m))
    spill = cv2.GaussianBlur(spill, (7, 7), 0).astype(np.float32) / 255
    grey = cv2.cvtColor(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR).astype(np.float32) * 0.8
    out_f = f.astype(np.float32) * (1 - spill[..., None]) + grey * spill[..., None]
    out_u8 = out_f.clip(0, 255).astype(np.uint8)
    enc.stdin.write(out_u8.tobytes())
    soft = cv2.GaussianBlur(m, (11, 11), 0)
    alpha_enc.stdin.write(np.dstack([out_u8, 255 - soft]).tobytes())
    i += 1
enc.stdin.close()
enc.wait()
alpha_enc.stdin.close()
alpha_enc.wait()
print(i, 'frames')
