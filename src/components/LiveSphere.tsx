import React, { useEffect, useRef, useState } from 'react';

/*
 * The glass sphere on the first page, rendered live over a clean plate of the scene.
 *
 * The scene image (without the sphere) is drawn full-frame exactly like an `object-cover`
 * backdrop; inside the sphere a fragment shader acts as a ball lens: it shows the terrace
 * inverted and magnified, with chromatic fringes at the rim, a Fresnel reflection, the sun's
 * specular glint and a focused caustic on the rock. Pointer movement (or a slow drift on
 * touch screens) shifts the view through the glass and moves the light.
 *
 * If WebGL is unavailable, nothing is drawn and the original photograph shows through.
 */

// Sphere in the 1536×1024 artwork, measured from the original render.
const IMG_W = 1536;
const IMG_H = 1024;
const CENTER = [1016, 535];
const RADIUS = 226;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas size, device px
uniform vec2 uOff;      // artwork origin on canvas, device px
uniform float uScale;   // device px per artwork px
uniform vec2 uCenter;   // sphere centre, artwork px
uniform float uRadius;  // sphere radius, artwork px
uniform vec2 uLight;    // -1..1, pointer-driven
uniform float uTime;

vec3 tex(vec2 p) {
  vec2 uv = clamp(p / vec2(${IMG_W}.0, ${IMG_H}.0), vec2(0.001), vec2(0.999));
  return texture2D(uTex, uv).rgb;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 ip = (px - uOff) / uScale;          // artwork px
  vec3 col = tex(ip);

  vec2 d = (ip - uCenter) / uRadius;       // sphere-local, unit disc
  float r2 = dot(d, d);
  float r = sqrt(r2);

  // Light: the sun sits low on the right; the pointer swings it a little.
  vec3 L = normalize(vec3(0.62 + uLight.x * 0.28, 0.30 - uLight.y * 0.22, 0.72));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));

  // ---- Outside the glass: contact shadow and the caustic it focuses onto the rock ----
  if (r > 1.0) {
    vec2 s = (ip - (uCenter + vec2(-0.04, 0.97) * uRadius)) / (uRadius * vec2(0.62, 0.1));
    col *= 1.0 - 0.28 * exp(-dot(s, s) * 1.6);

    vec2 cc = uCenter + vec2(-0.78 - uLight.x * 0.12, 0.86 + uLight.y * 0.03) * uRadius;
    vec2 q = (ip - cc) / (uRadius * vec2(0.34, 0.075));
    float shimmer = 0.75 + 0.25 * noise(ip * 0.06 + vec2(uTime * 0.35, -uTime * 0.2));
    float caustic = exp(-dot(q, q) * 1.4) * shimmer;
    float core = exp(-dot(q, q) * 6.0);
    col += vec3(1.0, 0.86, 0.62) * (caustic * 0.42 + core * 0.35);
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  // ---- Inside: a ball lens ----
  float z = sqrt(max(0.0, 1.0 - r2));
  vec3 n = vec3(d.x, -d.y, z);

  // Inverted, magnified view of what lies behind, sliding against the pointer (parallax).
  vec2 par = vec2(uLight.x, uLight.y * 0.6) * 0.22;
  float k = 0.85 + 0.42 * r2;
  vec2 dir = -d * k + par;
  float ca = 0.018 * r2;                    // chromatic fringe toward the rim
  vec3 refr;
  refr.r = tex(uCenter + dir * (1.0 + ca) * uRadius * 1.35).r;
  refr.g = tex(uCenter + dir * uRadius * 1.35).g;
  refr.b = tex(uCenter + dir * (1.0 - ca) * uRadius * 1.35).b;
  refr = refr * 1.04 + 0.02;

  // Fresnel reflection of the bright sky and wall around it.
  vec2 rdir = d * (1.6 + 0.4 * r2) + vec2(0.0, -0.55) - par * 0.6;
  vec3 refl = tex(uCenter + rdir * uRadius) * 1.12;
  float fres = pow(1.0 - z, 2.6);
  vec3 glass = mix(refr, refl, clamp(fres * 0.85, 0.0, 0.85));

  // Soft darkening toward the rim and a fine bright edge.
  glass *= mix(1.0, 0.8, smoothstep(0.78, 1.0, r));
  glass += vec3(1.0, 0.95, 0.88) * smoothstep(0.955, 0.99, r) * (1.0 - smoothstep(0.99, 1.0, r)) * 0.45;

  // Specular glint of the sun, and its refracted twin low on the opposite side.
  float spec = pow(max(dot(n, H), 0.0), 220.0) * 2.2 + pow(max(dot(n, H), 0.0), 28.0) * 0.12;
  vec3 H2 = normalize(vec3(-H.x, -H.y, H.z));
  float inner = pow(max(dot(n, H2), 0.0), 60.0) * 0.55;
  glass += vec3(1.0, 0.93, 0.8) * (spec + inner);

  // A faint star on the main glint.
  vec2 gp = vec2(H.x, -H.y) / max(H.z, 0.2) * 0.62;
  vec2 g = d - gp;
  float star = exp(-abs(g.y) * 140.0) * exp(-abs(g.x) * 9.0) + exp(-abs(g.x) * 140.0) * exp(-abs(g.y) * 9.0);
  glass += vec3(1.0, 0.9, 0.75) * star * 0.35;

  // Anti-aliased edge, about one device pixel wide.
  float aa = 1.2 / (uRadius * uScale);
  float a = 1.0 - smoothstep(1.0 - aa, 1.0, r);
  gl_FragColor = vec4(mix(col, glass, a), 1.0);
}
`;

interface LiveSphereProps {
  active: boolean;
}

export const LiveSphere: React.FC<LiveSphereProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const [ready, setReady] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
      return sh;
    };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    } catch {
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = U('uRes'), uOff = U('uOff'), uScale = U('uScale'), uCenter = U('uCenter');
    const uRadius = U('uRadius'), uLight = U('uLight'), uTime = U('uTime');
    gl.uniform2f(uCenter, CENTER[0], CENTER[1]);
    gl.uniform1f(uRadius, RADIUS);

    const texture = gl.createTexture();
    let loaded = false;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      loaded = true;
    };
    img.src = '/hero-clean.jpg';

    // Size the canvas to the window, at most 2 device px per CSS px.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const s = Math.max(canvas.width / IMG_W, canvas.height / IMG_H);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uScale, s);
      gl.uniform2f(uOff, (canvas.width - IMG_W * s) / 2, (canvas.height - IMG_H * s) / 2);
    };
    resize();
    window.addEventListener('resize', resize);

    // Pointer position eases the light and the view through the glass.
    const target = { x: 0, y: 0 };
    const light = { x: 0, y: 0 };
    let lastMove = -1e9;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let shown = false;
    let lastT = performance.now();
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, t - lastT);
      lastT = t;
      if (!loaded || (!activeRef.current && shown)) return;
      // Without a pointer (touch screens, or a still mouse) the light drifts slowly on its own.
      const idle = t - lastMove > 4000;
      const tx = idle && !reduce ? Math.sin(t / 5200) * 0.55 : target.x;
      const ty = idle && !reduce ? Math.sin(t / 7300 + 1.3) * 0.35 : target.y;
      const ease = 1 - Math.exp(-dt / (idle ? 900 : 380));
      light.x += (tx - light.x) * ease;
      light.y += (ty - light.y) * ease;
      gl.uniform2f(uLight, light.x, light.y);
      gl.uniform1f(uTime, reduce ? 0 : t / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!shown) {
        shown = true;
        setReady(true);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full transition-opacity duration-500"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden="true"
    />
  );
};
