import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GlassSphere3DProps {
  onHoverChange?: (isHovered: boolean) => void;
}

export const GlassSphere3D: React.FC<GlassSphere3DProps> = ({ onHoverChange }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Use refs to track hover & mouse without triggering re-runs of useEffect
  const isHoveredRef = useRef(false);
  const onHoverChangeRef = useRef(onHoverChange);
  onHoverChangeRef.current = onHoverChange;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;

      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      // Check if WebGL context can be created safely
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);

      const sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      // 2. Crystal Glass Sphere Geometry & Custom Optical Shader
      const sphereGeometry = new THREE.SphereGeometry(1.2, 48, 48);

      const glassMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uHover: { value: 0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uHover;

          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewPosition;

          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            // Fresnel rim reflection
            float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.6);

            // Sunlight specular glints
            vec3 lightDir = normalize(vec3(-0.6 + uMouse.x * 0.15, 0.7 - uMouse.y * 0.15, 0.8));
            vec3 halfVector = normalize(lightDir + viewDir);
            float spec = pow(max(dot(normal, halfVector), 0.0), 90.0) * 2.5;

            // Secondary rim
            float rimDot = max(dot(normal, normalize(vec3(0.8, 0.3, 0.4) + viewDir)), 0.0);
            float rimSpec = pow(rimDot, 40.0) * 0.8;

            // Signature horizontal golden beam (matching photo)
            float beamOffset = vPosition.y - vPosition.x * 0.06;
            float beamCore = smoothstep(0.12, 0.0, abs(beamOffset)) * 1.5;
            float beamGlow = smoothstep(0.4, 0.0, abs(beamOffset)) * 0.65;

            // Cross reflection line
            float crossLine = smoothstep(0.06, 0.0, abs(vPosition.y + vPosition.x * 0.3 + 0.1)) * 0.5;

            vec3 amberCore = vec3(1.0, 0.9, 0.6);
            vec3 amberGlow = vec3(0.88, 0.55, 0.22);
            vec3 beamColor = beamCore * amberCore + beamGlow * amberGlow + crossLine * vec3(0.9, 0.6, 0.3);

            // Mountain / landscape internal reflection gradient
            vec3 reflectGrad = mix(vec3(0.3, 0.27, 0.25), vec3(0.55, 0.5, 0.45), smoothstep(-0.6, 0.6, -vPosition.y));

            vec3 color = reflectGrad * 0.3 + vec3(0.95, 0.94, 0.92) * 0.12;
            color += beamColor * 1.15;
            color += vec3(1.0, 0.98, 0.94) * spec;
            color += vec3(0.95, 0.85, 0.7) * rimSpec;
            color += vec3(0.98, 0.95, 0.9) * fresnel * 0.8;
            color += vec3(0.8, 0.5, 0.2) * (uHover * 0.2);

            float alpha = clamp(0.35 + fresnel * 0.55 + beamGlow * 0.5 + spec * 0.4, 0.25, 0.95);
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
      });

      const sphereMesh = new THREE.Mesh(sphereGeometry, glassMaterial);
      sphereGroup.add(sphereMesh);

      // 3. Central Golden Hotspot Sprite
      const flareCanvas = document.createElement('canvas');
      flareCanvas.width = 64;
      flareCanvas.height = 64;
      const flareCtx = flareCanvas.getContext('2d');
      if (flareCtx) {
        const grad = flareCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grad.addColorStop(0, 'rgba(255, 252, 240, 1.0)');
        grad.addColorStop(0.2, 'rgba(255, 215, 120, 0.85)');
        grad.addColorStop(0.5, 'rgba(230, 130, 40, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        flareCtx.fillStyle = grad;
        flareCtx.fillRect(0, 0, 64, 64);
      }
      const flareTexture = new THREE.CanvasTexture(flareCanvas);
      const flareMaterial = new THREE.SpriteMaterial({
        map: flareTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.9,
      });
      const flareSprite = new THREE.Sprite(flareMaterial);
      flareSprite.scale.set(1.4, 0.6, 1);
      flareSprite.position.set(0.08, -0.04, 0.15);
      sphereGroup.add(flareSprite);

      // 4. Horizontal Anamorphic Ray
      const streakCanvas = document.createElement('canvas');
      streakCanvas.width = 128;
      streakCanvas.height = 16;
      const streakCtx = streakCanvas.getContext('2d');
      if (streakCtx) {
        const grad = streakCtx.createLinearGradient(0, 8, 128, 8);
        grad.addColorStop(0, 'rgba(255, 180, 50, 0)');
        grad.addColorStop(0.3, 'rgba(255, 220, 100, 0.6)');
        grad.addColorStop(0.5, 'rgba(255, 255, 240, 0.95)');
        grad.addColorStop(0.7, 'rgba(255, 220, 100, 0.6)');
        grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        streakCtx.fillStyle = grad;
        streakCtx.fillRect(0, 0, 128, 16);
      }
      const streakTexture = new THREE.CanvasTexture(streakCanvas);
      const streakMaterial = new THREE.SpriteMaterial({
        map: streakTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8,
      });
      const streakSprite = new THREE.Sprite(streakMaterial);
      streakSprite.scale.set(2.4, 0.16, 1);
      streakSprite.position.set(0, -0.02, 0.08);
      sphereGroup.add(streakSprite);

      // Mouse tracking state (without React state reruns)
      let targetMouseX = 0;
      let targetMouseY = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;
      let hoverFactor = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        targetMouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };

      const handleMouseEnter = () => {
        isHoveredRef.current = true;
        setIsHovered(true);
        onHoverChangeRef.current?.(true);
      };

      const handleMouseLeave = () => {
        isHoveredRef.current = false;
        setIsHovered(false);
        onHoverChangeRef.current?.(false);
        targetMouseX = 0;
        targetMouseY = 0;
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 400;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        currentMouseX += (targetMouseX - currentMouseX) * 0.08;
        currentMouseY += (targetMouseY - currentMouseY) * 0.08;

        const targetHover = isHoveredRef.current ? 1.0 : 0.0;
        hoverFactor += (targetHover - hoverFactor) * 0.1;

        sphereGroup.rotation.y = currentMouseX * 0.3 + Math.sin(elapsedTime * 0.4) * 0.04;
        sphereGroup.rotation.x = -currentMouseY * 0.2 + Math.cos(elapsedTime * 0.3) * 0.03;

        glassMaterial.uniforms.uTime.value = elapsedTime;
        glassMaterial.uniforms.uMouse.value.set(currentMouseX, currentMouseY);
        glassMaterial.uniforms.uHover.value = hoverFactor;

        const pulse = 1 + Math.sin(elapsedTime * 1.5) * 0.06 + hoverFactor * 0.15;
        flareSprite.scale.set(1.4 * pulse, 0.6 * pulse, 1);

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);

        sphereGeometry.dispose();
        glassMaterial.dispose();
        flareMaterial.dispose();
        flareTexture.dispose();
        streakMaterial.dispose();
        streakTexture.dispose();
        if (renderer) {
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch (e) {
      console.warn('WebGL not available or failed, falling back to CSS/SVG optical sphere', e);
      setWebGlSupported(false);
    }
  }, []); // Run ONLY once on mount!

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(false);
      }}
      className={`relative w-full h-full cursor-pointer select-none transition-transform duration-500 ease-out flex items-center justify-center ${
        isHovered ? 'scale-[1.03]' : 'scale-100'
      }`}
      title="Crystal Glass Sphere — Move cursor over to interact"
    >
      {/* Zero-Failure Photorealistic Optical Fallback (always ready or shown if WebGL unavailable) */}
      {!webGlSupported && (
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl">
          {/* Sphere Body with Fresnel Rim */}
          <div className="absolute inset-0 rounded-full bg-radial-[at_35%_25%] from-white/60 via-[#e0d6c8]/30 to-[#4a4035]/80 backdrop-blur-[2px] border border-white/70" />
          
          {/* Mountain & Courtyard Refraction Gradient */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#6b6256]/50 via-[#d8cfc0]/30 to-[#3e352b]/60" />

          {/* Horizontal Golden Anamorphic Beam */}
          <div className="absolute top-[48%] inset-x-0 h-4 bg-gradient-to-r from-transparent via-[#ffdd88] to-transparent shadow-[0_0_20px_#ff9900] transform -rotate-2" />
          <div className="absolute top-[50%] inset-x-4 h-1.5 bg-white shadow-[0_0_12px_#ffffff] transform -rotate-2" />

          {/* Central Bright Hotspot */}
          <div className="absolute top-[44%] left-[45%] w-10 h-10 rounded-full bg-white shadow-[0_0_30px_#ffcc44] blur-[2px]" />

          {/* Sun Specular Highlight */}
          <div className="absolute top-[18%] left-[24%] w-8 h-5 rounded-full bg-white blur-[1px] transform -rotate-20" />
          <div className="absolute top-[22%] left-[28%] w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </div>
  );
};
