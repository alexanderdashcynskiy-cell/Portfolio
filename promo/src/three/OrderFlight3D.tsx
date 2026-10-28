import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Accent, C, MONO, SANS } from '../ui';
import { clamp, easeInOut, Sfx } from '../kit';

/*
 * A test of the «Один заказ» film in real 3D: Аня's order leaves her phone as a card,
 * flies over the desk and lands in its slot on the CRM board. Devices are modelled here
 * from rounded boxes; the screens are the real captures.
 */
export const FLIGHT_FRAMES = 300;

const ease = (f: number, a: number, b: number) => easeInOut(interpolate(f, [a, b], [0, 1], clamp));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Tex = { phone: THREE.Texture; empty: THREE.Texture; board: THREE.Texture; card: THREE.Texture };
const TEX_SRC = { phone: 'screens/m6-receipt.jpg', empty: '3d/board-empty.jpg', board: 'screens/d9-accept-before.jpg', card: '3d/card1244.png' };

/**
 * All textures load before the canvas mounts: the canvas only redraws on a new frame, so a
 * texture that arrives later would never be drawn into the still.
 */
const useTextures = () => {
  const [tex, setTex] = useState<Tex | null>(null);
  const [handle] = useState(() => delayRender('3d textures'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const load = (src: string) =>
      new Promise<THREE.Texture>((res) =>
        loader.load(staticFile(src), (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          res(t);
        }),
      );
    Promise.all(Object.values(TEX_SRC).map(load)).then(([phone, empty, board, card]) => {
      setTex({ phone, empty, board, card });
      continueRender(handle);
    });
  }, [handle]);
  return tex;
};

/** A flat rounded rectangle with 0..1 UVs, for screens and the card face. */
const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 24);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
};

/* ───────────── Layout of the desk (world units ≈ decimetres) ───────────── */

const PHONE = { w: 0.715, h: 1.476, d: 0.078, r: 0.1 };
const PHONE_SCREEN = { w: 0.67, h: 0.67 * (2796 / 1290) };
// The phone leans back on a stand at the front left of the laptop.
const PHONE_POS = v3(-2.15, PHONE.h / 2 + 0.06, 1.15);
const PHONE_ROT = new THREE.Euler(-0.32, 0.38, 0, 'YXZ');

const LAP = { w: 3.1, d: 2.15, base: 0.07, lidH: 2.05, lidD: 0.035 };
const LAP_SCREEN = { w: 2.86, h: 2.86 * (982 / 1512) };
const LAP_POS = v3(0.55, 0, -0.2);
const LAP_YAW = -0.22;
const LID_OPEN = -0.3; // radians past vertical

// The card's slot on the board, in capture pixels (1512×982): {x100,y137,w294,h612}.
const SLOT = { u: (100 + 147) / 1512, v: (137 + 306) / 982, w: 294 / 1512 };

/** The lid's frame in world space: the screen sits on its front face. */
const lidMatrix = () => {
  const m = new THREE.Object3D();
  m.position.copy(LAP_POS);
  m.rotation.set(0, LAP_YAW, 0);
  const hinge = new THREE.Object3D();
  hinge.position.set(0, LAP.base, -LAP.d / 2);
  hinge.rotation.set(LID_OPEN, 0, 0);
  m.add(hinge);
  const screen = new THREE.Object3D();
  screen.position.set(0, LAP.lidH / 2, LAP.lidD / 2 + 0.002);
  hinge.add(screen);
  m.updateMatrixWorld(true);
  return screen;
};

const phoneMatrix = () => {
  const m = new THREE.Object3D();
  m.position.copy(PHONE_POS);
  m.rotation.copy(PHONE_ROT);
  const screen = new THREE.Object3D();
  screen.position.set(0, 0, PHONE.d / 2 + 0.002);
  m.add(screen);
  m.updateMatrixWorld(true);
  return screen;
};

/* ───────────── Pieces ───────────── */

const aluminium = new THREE.MeshPhysicalMaterial({ color: '#c8c6c3', metalness: 0.92, roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.4 });
const titanium = new THREE.MeshPhysicalMaterial({ color: '#3b3733', metalness: 0.85, roughness: 0.3, clearcoat: 0.6 });
const blackGlass = new THREE.MeshPhysicalMaterial({ color: '#060606', metalness: 0.2, roughness: 0.08, clearcoat: 1 });
const glassSheen = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.04, transparent: true, opacity: 0.07, clearcoat: 1 });

const Phone: React.FC<{ screen: THREE.Texture }> = ({ screen }) => {
  const body = useMemo(() => new RoundedBoxGeometry(PHONE.w, PHONE.h, PHONE.d, 8, PHONE.r), []);
  const front = useMemo(() => roundedRect(PHONE.w - 0.012, PHONE.h - 0.012, PHONE.r - 0.006), []);
  const disp = useMemo(() => roundedRect(PHONE_SCREEN.w, PHONE_SCREEN.h, 0.085), []);
  const island = useMemo(() => roundedRect(0.18, 0.052, 0.026), []);
  return (
    <group position={PHONE_POS} rotation={PHONE_ROT}>
      <mesh geometry={body} material={titanium} castShadow receiveShadow />
      <mesh geometry={front} material={blackGlass} position={[0, 0, PHONE.d / 2 + 0.0008]} />
      <mesh geometry={disp} position={[0, 0, PHONE.d / 2 + 0.0016]}>
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh geometry={island} position={[0, PHONE_SCREEN.h / 2 - 0.06, PHONE.d / 2 + 0.0022]}>
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh geometry={front} material={glassSheen} position={[0, 0, PHONE.d / 2 + 0.003]} />
      {/* The stand: a thin wedge behind the phone */}
      <mesh position={[0, -PHONE.h / 2 + 0.25, -0.22]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.36, 0.5, 0.025]} />
        <meshPhysicalMaterial color="#2a2522" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

const Laptop: React.FC<{ screen: THREE.Texture; under?: THREE.Texture; reveal: number; glow: number }> = ({ screen, under, reveal, glow }) => {
  const base = useMemo(() => new RoundedBoxGeometry(LAP.w, LAP.base, LAP.d, 6, 0.03), []);
  const lid = useMemo(() => new RoundedBoxGeometry(LAP.w, LAP.lidH, LAP.lidD, 6, 0.03), []);
  const bezel = useMemo(() => roundedRect(LAP.w - 0.03, LAP.lidH - 0.03, 0.07), []);
  const disp = useMemo(() => new THREE.PlaneGeometry(LAP_SCREEN.w, LAP_SCREEN.h), []);
  return (
    <group position={LAP_POS} rotation={[0, LAP_YAW, 0]}>
      <mesh geometry={base} material={aluminium} position={[0, LAP.base / 2, 0]} castShadow receiveShadow />
      {/* Keyboard well and trackpad */}
      <mesh position={[0, LAP.base + 0.001, -0.33]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 0.95]} />
        <meshPhysicalMaterial color="#1b1a19" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, LAP.base + 0.001, 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.72]} />
        <meshPhysicalMaterial color="#bdbbb8" roughness={0.25} metalness={0.85} />
      </mesh>
      <group position={[0, LAP.base, -LAP.d / 2]} rotation={[LID_OPEN, 0, 0]}>
        <mesh geometry={lid} material={aluminium} position={[0, LAP.lidH / 2, 0]} castShadow />
        <group position={[0, LAP.lidH / 2, LAP.lidD / 2]}>
          <mesh geometry={bezel} material={blackGlass} position={[0, 0, 0.001]} />
          {under && (
            <mesh geometry={disp} position={[0, 0.03, 0.0018]}>
              <meshBasicMaterial map={under} toneMapped={false} />
            </mesh>
          )}
          <mesh geometry={disp} position={[0, 0.03, 0.002]}>
            <meshBasicMaterial map={screen} toneMapped={false} transparent opacity={1 - reveal} />
          </mesh>
          {/* The slot lights up as the card lands */}
          <mesh position={[(SLOT.u - 0.5) * LAP_SCREEN.w, 0.03 + (0.5 - SLOT.v) * LAP_SCREEN.h, 0.0026]}>
            <planeGeometry args={[SLOT.w * LAP_SCREEN.w * 1.08, (612 / 982) * LAP_SCREEN.h * 1.04]} />
            <meshBasicMaterial color={C.orange} transparent opacity={0.28 * glow} toneMapped={false} />
          </mesh>
          <mesh geometry={bezel} material={glassSheen} position={[0, 0, 0.004]} />
        </group>
      </group>
    </group>
  );
};

/** The order card: a thin white slab with the CRM card as its face. */
const Card: React.FC<{ face: THREE.Texture; frame: number }> = ({ face, frame }) => {
  const from = useMemo(() => phoneMatrix(), []);
  const to = useMemo(() => lidMatrix(), []);
  const W = SLOT.w * LAP_SCREEN.w;
  const H = W * (1224 / 588);
  const slab = useMemo(() => new RoundedBoxGeometry(W, H, 0.014, 4, 0.03), [W, H]);
  const faceGeo = useMemo(() => roundedRect(W - 0.004, H - 0.004, 0.03), [W, H]);

  // 0 → on the phone screen, lifting off; 1 → in its slot on the laptop.
  const lift = ease(frame, 62, 92);
  const fly = ease(frame, 92, 196);
  const fade = interpolate(frame, [196, 210], [1, 0], clamp);
  if (frame < 56 || fade <= 0) return null;

  const start = from.localToWorld(v3(0, -0.12, 0));
  const startQ = from.getWorldQuaternion(new THREE.Quaternion());
  const startUp = v3(0, 0, 0.42).applyQuaternion(startQ);
  const a = start.clone().add(startUp.multiplyScalar(lift));
  const end = to.localToWorld(v3((SLOT.u - 0.5) * LAP_SCREEN.w, 0.03 + (0.5 - SLOT.v) * LAP_SCREEN.h, 0.01));
  const endQ = to.getWorldQuaternion(new THREE.Quaternion());
  // A high arc over the desk
  const mid = a.clone().lerp(end, 0.5).add(v3(0, 1.3, 0.6));
  const p = new THREE.QuadraticBezierCurve3(a, mid, end).getPoint(fly);
  const q = startQ.clone().slerp(endQ, ease(frame, 96, 186));
  // A little roll in the air
  const roll = new THREE.Quaternion().setFromAxisAngle(v3(0, 0, 1), Math.sin(fly * Math.PI) * -0.35);
  q.multiply(roll);
  const scale = lerp(0.62, 1, ease(frame, 80, 190)) * (frame < 62 ? interpolate(frame, [56, 62], [0.9, 1], clamp) : 1);
  return (
    <group position={p} quaternion={q} scale={scale}>
      <mesh geometry={slab} castShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} clearcoat={0.4} transparent opacity={fade} />
      </mesh>
      <mesh geometry={faceGeo} position={[0, 0, 0.0075]}>
        <meshBasicMaterial map={face} toneMapped={false} transparent opacity={fade} />
      </mesh>
    </group>
  );
};

/* ───────────── Camera, light and the scene ───────────── */

type Key = { at: number; pos: THREE.Vector3; look: THREE.Vector3; fov: number };
const phoneLook = () => phoneMatrix().localToWorld(v3(0, 0.05, 0));
const lapLook = () => lidMatrix().localToWorld(v3(0, 0.05, 0));

const Rig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera, scene, gl } = useThree();
  const keys = useMemo<Key[]>(() => {
    const pl = phoneLook();
    const ll = lapLook();
    const pN = v3(0, 0, 1).applyEuler(PHONE_ROT);
    const lN = v3(0, 0, 1).applyQuaternion(lidMatrix().getWorldQuaternion(new THREE.Quaternion()));
    return [
      { at: 0, pos: pl.clone().add(pN.clone().multiplyScalar(2.6)).add(v3(0.25, 0.2, 0)), look: pl, fov: 30 },
      { at: 60, pos: pl.clone().add(pN.clone().multiplyScalar(2.2)).add(v3(0.2, 0.15, 0)), look: pl, fov: 30 },
      { at: 150, pos: v3(-0.4, 3.1, 6.2), look: pl.clone().lerp(ll, 0.6).add(v3(0, 0.3, 0)), fov: 32 },
      { at: 215, pos: ll.clone().add(lN.clone().multiplyScalar(5.9)).add(v3(-0.6, 0.45, 0)), look: ll.clone().add(v3(-1.0, -0.05, 0)), fov: 30 },
      { at: 300, pos: ll.clone().add(lN.clone().multiplyScalar(5.4)).add(v3(-0.55, 0.35, 0)), look: ll.clone().add(v3(-1.15, -0.05, 0)), fov: 30 },
    ];
  }, []);

  // Built during render, not in an effect: the canvas draws once per frame, so the reflections
  // have to exist before that draw.
  const env = useMemo(() => new THREE.PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04).texture, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.6;

  let k = 0;
  for (let i = 0; i < keys.length; i++) if (frame >= keys[i].at) k = i;
  const a = keys[k];
  const b = keys[Math.min(k + 1, keys.length - 1)];
  const t = b === a ? 1 : easeInOut((frame - a.at) / (b.at - a.at));
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.copy(a.pos.clone().lerp(b.pos, t));
  cam.fov = lerp(a.fov, b.fov, t);
  cam.updateProjectionMatrix();
  cam.lookAt(a.look.clone().lerp(b.look, t));
  return null;
};

const Scene: React.FC<{ tex: Tex }> = ({ tex }) => {
  const frame = useCurrentFrame();
  // Morning light warming toward midday as the order travels.
  const warm = ease(frame, 40, 260);
  const key = new THREE.Color('#dfe8ff').lerp(new THREE.Color('#ffd9a8'), warm);
  const reveal = interpolate(frame, [194, 208], [0, 1], clamp);
  const glow = interpolate(frame, [196, 204, 240], [0, 1, 0], clamp);
  return (
    <>
      <Rig frame={frame} />
      <color attach="background" args={['#efe6da']} />
      <fog attach="fog" args={['#efe6da', 9, 22]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-5, 9, 6]}
        intensity={2.4}
        color={key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <pointLight position={[3, 3, 3]} intensity={6} color="#ffe2c0" distance={12} />
      {/* The desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#c9ad8a" roughness={0.7} clearcoat={0.2} clearcoatRoughness={0.5} />
      </mesh>
      <Phone screen={tex.phone} />
      <Laptop screen={tex.empty} under={tex.board} reveal={reveal} glow={glow} />
      <Card face={tex.card} frame={frame} />
    </>
  );
};

export const OrderFlight3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const k = spring({ frame: frame - 206, fps, config: { stiffness: 120, damping: 20 } });
  const tex = useTextures();
  const kick = interpolate(frame, [8, 24], [0, 1], clamp) * interpolate(frame, [70, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#efe6da' }}>
      {tex && (
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }} camera={{ fov: 30, position: [0, 3, 8], near: 0.05, far: 60 }}>
        <Scene tex={tex} />
      </ThreeCanvas>
      )}
      {/* A soft vignette, like a lens */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(60,35,15,0.28) 100%)' }} />
      <div style={{ position: 'absolute', left: 120, top: 110, fontFamily: MONO, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.orange, opacity: Math.max(kick, k) }}>
        14:02 · заказ №1244
      </div>
      <div style={{ position: 'absolute', left: 120, top: 160, width: 560, fontFamily: SANS, fontWeight: 800, fontSize: 76, lineHeight: 1.05, letterSpacing: '-0.035em', color: C.ink, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
        Заказ — <Accent>сам на доске.</Accent>
      </div>
      <Sfx at={62} name="whoosh" volume={0.35} />
      <Sfx at={198} name="pop" volume={0.7} />
      <Sfx at={206} name="chime" volume={0.4} />
    </AbsoluteFill>
  );
};
