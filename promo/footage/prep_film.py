"""Cuts the generated footage into the brand film's shots, in public/film/.

usage: python3 prep_film.py baker.mp4 phone_top.mp4 reel.mov
  baker.mp4      the baker at the table (sieve, kneading)
  phone_top.mp4  the phone from above on the floured table, green screen
  reel.mov       a reel of six shots: oven, notebook, thumb, bread out, bread break, portrait

Slow shots are stretched with motion interpolation (their sound with atempo); the notebook's
handwriting is pushed out of focus so only the pencil stays sharp.
"""
import os
import subprocess
import sys

import cv2
import numpy as np

baker, phone_top, reel = sys.argv[1:4]
OUT = 'public/film'
os.makedirs(OUT, exist_ok=True)


def ff(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], check=True)


def cut(src, name, start, end, slow=1.0):
    """A segment of `src`; slow < 1 stretches it smoothly."""
    v = 'setpts=PTS-STARTPTS'
    a = 'asetpts=PTS-STARTPTS'
    if slow != 1.0:
        v += f',setpts=PTS/{slow},minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1'
        a += f',atempo={slow}'
    ff('-ss', str(start), '-to', str(end), '-i', src, '-vf', v, '-af', a, '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', f'{OUT}/{name}.mp4')


# The reel's shots, by its cuts (6.75, 16.71, 18.54, 20.71, 23.13, 25.46 s), a frame inside each edge.
cut(reel, 'oven', 0.05, 6.70)
cut(reel, 'notebook-raw', 6.80, 16.66)
cut(reel, 'thumb', 16.75, 18.50, slow=0.8)
cut(reel, 'bread-out', 18.58, 20.66, slow=0.7)
cut(reel, 'bread-break', 20.75, 23.08, slow=0.75)
cut(reel, 'portrait', 23.17, 25.42)
cut(baker, 'baker', 0.0, 10.0)
cut(phone_top, 'phone-top', 0.0, 10.0)

# Notebook: everything out of focus except a band along the pencil.
src = f'{OUT}/notebook-raw.mp4'
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
mask = np.zeros((h, w), np.float32)
# the pencil runs from about (900, 450) up to the right edge at (1280, 210)
cv2.line(mask, (int(w * 0.70), int(h * 0.64)), (w, int(h * 0.27)), 1.0, int(h * 0.10))
mask = cv2.GaussianBlur(mask, (0, 0), h * 0.06)
mask = (mask / mask.max())[..., None]
tmp = f'{OUT}/notebook-video.mp4'
enc = subprocess.Popen(
    ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', tmp],
    stdin=subprocess.PIPE,
)
while True:
    ok, f = cap.read()
    if not ok:
        break
    soft = cv2.GaussianBlur(f, (0, 0), 9)
    enc.stdin.write((f * mask + soft * (1 - mask)).astype(np.uint8).tobytes())
enc.stdin.close()
enc.wait()
ff('-i', tmp, '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', f'{OUT}/notebook.mp4')
os.remove(tmp)
os.remove(src)
print('ok')
