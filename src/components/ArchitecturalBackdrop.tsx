import React, { useState, useEffect } from 'react';
import { GlassSphere3D } from './GlassSphere3D';

interface ArchitecturalBackdropProps {
  onSphereHover?: (hovered: boolean) => void;
  mousePos: { x: number; y: number };
}

export const ArchitecturalBackdrop: React.FC<ArchitecturalBackdropProps> = ({
  onSphereHover,
  mousePos,
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleWaterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev.slice(-4), newRipple]);
  };

  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 1800);
    return () => clearTimeout(timer);
  }, [ripples]);

  // Subtle parallax offsets
  const parallaxBgX = (mousePos.x - 0.5) * -12;
  const parallaxBgY = (mousePos.y - 0.5) * -8;
  const parallaxRockX = (mousePos.x - 0.5) * 8;
  const parallaxRockY = (mousePos.y - 0.5) * 6;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto bg-[#ece5db]">
      {/* 1. SKY & DISTANT MOUNTAIN HORIZON (Visible through oculus and right opening) */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[75%] transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxBgX * 1.5}px, ${parallaxBgY * 1.5}px, 0)`,
        }}
      >
        {/* Soft Sunny Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#b8cfe0] via-[#d6e3ec] to-[#f4ebe1]" />

        {/* Distant Mountain Ridges */}
        <svg
          className="absolute bottom-0 right-0 w-full h-[65%] opacity-70"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          {/* Back distant mountains */}
          <path
            d="M 150 400 L 320 220 L 460 280 L 620 180 L 780 250 L 910 160 L 1000 240 L 1000 400 Z"
            fill="#a6b7c4"
            opacity="0.5"
          />
          {/* Mid-range warm sunny peaks */}
          <path
            d="M 280 400 L 410 260 L 530 310 L 680 210 L 820 280 L 960 230 L 1000 290 L 1000 400 Z"
            fill="#9b8e83"
            opacity="0.6"
          />
          {/* Sunlit crags on mountains */}
          <path
            d="M 410 260 L 470 290 L 530 310 L 680 210 L 730 250 L 820 280 L 1000 400 Z"
            fill="#cfc5ba"
            opacity="0.4"
          />
        </svg>

        {/* Distant evergreen pine tree silhouettes */}
        <div className="absolute bottom-16 right-48 w-6 h-36 bg-[#4f4f3e] rounded-t-full opacity-60 blur-[0.6px]" />
        <div className="absolute bottom-14 right-56 w-5 h-28 bg-[#585945] rounded-t-full opacity-55 blur-[0.6px]" />
      </div>

      {/* 2. ARCHITECTURAL TRAVERTINE / LIMESTONE WALLS & OCULUS */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Left Curved Wall */}
        <div
          className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-r from-[#e8e1d6] via-[#eee7dd] to-[#f2ece3]"
          style={{
            transform: `translate3d(${parallaxBgX}px, ${parallaxBgY}px, 0)`,
          }}
        >
          {/* Architectural diagonal sunbeam & shadow casting (Exact match to photo) */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 1000">
            <defs>
              <linearGradient id="wallShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8c8276" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#9e9488" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#baafa3" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#fff9ef" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#fff2dc" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fff2dc" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Upper-left diagonal building shadow */}
            <polygon
              points="0,0 480,0 800,680 800,1000 0,1000"
              fill="url(#wallShadowGrad)"
            />

            {/* Sharp diagonal sunlight slat shadow (matching photo shadow bands) */}
            <polygon
              points="180,0 320,0 800,520 800,660"
              fill="#7a7065"
              fillOpacity="0.18"
            />
            <polygon
              points="380,0 510,0 800,380 800,490"
              fill="#7a7065"
              fillOpacity="0.15"
            />

            {/* Warm radiant sunlight highlight streak */}
            <polygon
              points="0,40 180,0 800,560 800,600 0,120"
              fill="url(#beamGrad)"
            />
          </svg>
        </div>

        {/* Sweeping Curved Oculus & Roof Structure (Top Center to Right) */}
        <svg
          className="absolute top-0 right-0 w-[62%] h-[55%] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${parallaxBgX * 0.8}px, ${parallaxBgY * 0.8}px, 0)`,
          }}
          viewBox="0 0 900 500"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="oculusRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7f2ea" />
              <stop offset="40%" stopColor="#ece4da" />
              <stop offset="70%" stopColor="#d9cfc2" />
              <stop offset="100%" stopColor="#b6aa9b" />
            </linearGradient>
            <linearGradient id="oculusInnerShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#584e44" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#84786a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d5ccbf" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Curved ceiling opening oculus */}
          <path
            d="M 0 0 C 180 80, 420 180, 780 220 C 860 228, 900 235, 900 240 L 900 0 Z"
            fill="url(#oculusRimGrad)"
          />
          {/* Inner curved bevel / rim */}
          <path
            d="M 50 0 C 220 90, 460 190, 800 230 L 780 250 C 440 210, 200 110, 30 0 Z"
            fill="url(#oculusInnerShadow)"
          />
          {/* Travertine marble slab textures & seams */}
          <path
            d="M 320 145 L 360 215 M 580 195 L 610 260 M 740 220 L 760 280"
            stroke="#9c8f80"
            strokeWidth="1.2"
            opacity="0.35"
          />
        </svg>

        {/* Right Wall Columns & Windows */}
        <div className="absolute top-[35%] right-0 w-[24%] h-[35%] border-l border-[#d3c7b8]/60 bg-gradient-to-r from-transparent to-[#e8e0d4]/50" />
      </div>

      {/* 3. ROCK PEDESTAL & HONED STONE BASE (Directly matching the photo) */}
      <div
        className="absolute bottom-[16%] right-[10%] w-[58%] max-w-[820px] h-[55%] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxRockX}px, ${parallaxRockY}px, 0)`,
        }}
      >
        {/* Honed Flat Marble Step / Base Plate */}
        <div className="absolute bottom-0 left-[12%] w-[82%] h-12 bg-gradient-to-r from-[#dcd4c8] via-[#ebe3d7] to-[#d6cbbb] shadow-[0_12px_24px_rgba(40,30,20,0.18)] rounded-xs border-t border-[#fbf7f1]/80">
          {/* Stone step front edge */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-b from-[#cfc5b6] to-[#b7ab9a] border-t border-black/10" />
          {/* Golden water reflection shimmer on step edge */}
          <div className="absolute bottom-0 left-10 w-48 h-2 bg-[#ffdd99]/30 blur-[2px] animate-glint" />
          <div className="absolute bottom-0 right-24 w-32 h-2 bg-[#ffe8b3]/25 blur-[2px] animate-glint" />
        </div>

        {/* Secondary Upper Chiseled Rock Tier */}
        <div className="absolute bottom-8 left-[18%] w-[68%] h-14 bg-gradient-to-b from-[#8f8274] via-[#756a5e] to-[#5a5046] rounded-xs shadow-md transform -skew-x-2">
          {/* Specular golden edge highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[#fdf2df] opacity-80" />
        </div>

        {/* Massive Rugged Natural Rock Pedestal (SVG vector with rich stone textures & chisel marks) */}
        <svg
          className="absolute bottom-10 left-[14%] w-[76%] h-[80%] drop-shadow-[0_20px_25px_rgba(30,25,18,0.35)]"
          viewBox="0 0 600 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rockSunlitGrad" x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#cfc2b2" />
              <stop offset="30%" stopColor="#9e9182" />
              <stop offset="65%" stopColor="#6e6356" />
              <stop offset="100%" stopColor="#453d34" />
            </linearGradient>
            <linearGradient id="rockShadowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#413931" />
              <stop offset="100%" stopColor="#2c2722" />
            </linearGradient>
            <radialGradient id="causticGlow" cx="45%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#ffea9f" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ffb84d" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#d97706" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Main rugged rock silhouette */}
          <path
            d="M 12 180 
               L 45 140 
               L 90 120 
               L 160 100 
               L 250 95 
               L 340 105 
               L 440 125 
               L 520 150 
               L 570 190 
               L 590 260 
               L 580 300 
               L 20 300 
               Z"
            fill="url(#rockSunlitGrad)"
          />

          {/* Shadowed underside facets */}
          <path
            d="M 12 180 L 110 240 L 260 250 L 420 255 L 590 260 L 580 300 L 20 300 Z"
            fill="url(#rockShadowGrad)"
            opacity="0.85"
          />

          {/* Sharp geological fracture lines & crevices */}
          <path
            d="M 90 120 L 140 180 L 180 230 M 250 95 L 270 160 L 320 220 M 340 105 L 390 170 L 450 210 M 440 125 L 480 190"
            stroke="#26211c"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 92 118 L 142 178 M 252 93 L 272 158 M 342 103 L 392 168"
            stroke="#f5ebe0"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Intense Golden Caustic Light Pool cast by the glass sphere onto rock surface */}
          <ellipse cx="270" cy="115" rx="140" ry="35" fill="url(#causticGlow)" />
          <ellipse cx="260" cy="112" rx="70" ry="16" fill="#fff9e6" opacity="0.9" />

          {/* Specular sun sparkle glints on the rock crest */}
          <circle cx="210" cy="102" r="3" fill="#ffffff" className="animate-glint" />
          <circle cx="310" cy="108" r="2.5" fill="#ffffff" className="animate-glint" />
          <circle cx="430" cy="126" r="2" fill="#ffe299" className="animate-glint" />
        </svg>

        {/* 4. THE INTERACTIVE 3D CRYSTAL GLASS SPHERE (Anchored directly on the rock) */}
        <div className="absolute -top-[18%] left-[24%] w-[58%] h-[115%] z-20 pointer-events-auto">
          <GlassSphere3D onHoverChange={onSphereHover} />
        </div>
      </div>

      {/* 5. DELICATE OLIVE TREE (On the far right, matching photo) */}
      <div
        className="absolute top-[14%] right-[-2%] w-[26%] h-[70%] pointer-events-none transition-transform duration-700 ease-out opacity-90"
        style={{
          transform: `translate3d(${parallaxBgX * 0.4}px, ${parallaxBgY * 0.4}px, 0)`,
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 400 700" preserveAspectRatio="none">
          <defs>
            <linearGradient id="branchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3d332a" />
              <stop offset="70%" stopColor="#5a4d3f" />
              <stop offset="100%" stopColor="#7a6b5a" />
            </linearGradient>
            <radialGradient id="leafSunlit" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#b4c28a" />
              <stop offset="50%" stopColor="#738250" />
              <stop offset="100%" stopColor="#434e2c" />
            </radialGradient>
          </defs>

          {/* Slender artistic tree branches */}
          <path
            d="M 380 700 C 370 540, 320 460, 260 380 C 220 320, 190 260, 140 180"
            stroke="url(#branchGrad)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 260 380 C 290 320, 330 260, 360 160"
            stroke="url(#branchGrad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 200 280 C 160 220, 120 180, 80 120"
            stroke="url(#branchGrad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 280 240 C 250 170, 220 110, 180 50"
            stroke="url(#branchGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sunlit olive leaves clusters */}
          {[
            { cx: 120, cy: 150, rx: 18, ry: 9, rot: 25 },
            { cx: 90, cy: 130, rx: 16, ry: 8, rot: -30 },
            { cx: 70, cy: 110, rx: 14, ry: 7, rot: 40 },
            { cx: 140, cy: 175, rx: 20, ry: 10, rot: -15 },
            { cx: 170, cy: 60, rx: 16, ry: 8, rot: 50 },
            { cx: 200, cy: 45, rx: 18, ry: 9, rot: -20 },
            { cx: 240, cy: 90, rx: 16, ry: 8, rot: 35 },
            { cx: 280, cy: 130, rx: 22, ry: 10, rot: -45 },
            { cx: 320, cy: 170, rx: 19, ry: 9, rot: 20 },
            { cx: 350, cy: 150, rx: 17, ry: 8, rot: -60 },
            { cx: 370, cy: 130, rx: 15, ry: 7, rot: 15 },
            { cx: 300, cy: 220, rx: 20, ry: 9, rot: 30 },
            { cx: 230, cy: 260, rx: 18, ry: 8, rot: -35 },
          ].map((leaf, idx) => (
            <ellipse
              key={idx}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.rx}
              ry={leaf.ry}
              transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
              fill="url(#leafSunlit)"
              className="transition-transform duration-500 hover:scale-125"
            />
          ))}
        </svg>
      </div>

      {/* 6. FOREGROUND WATER POOL & REFLECTIONS (Bottom 24% of screen) */}
      <div
        onClick={handleWaterClick}
        className="absolute bottom-0 inset-x-0 h-[24%] bg-gradient-to-t from-[#8f8272]/45 via-[#b3a695]/30 to-transparent cursor-pointer overflow-hidden z-10"
        title="Click anywhere on the water to create ripples"
      >
        {/* Wet marble tile floor seams under shallow water */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:160px_60px] opacity-40" />

        {/* Water Ripple Waves on Click */}
        {ripples.map((rip) => (
          <span
            key={rip.id}
            className="absolute rounded-full border border-white/60 pointer-events-none animate-ping"
            style={{
              left: rip.x - 30,
              top: rip.y - 30,
              width: 60,
              height: 60,
              animationDuration: '1.6s',
            }}
          />
        ))}

        {/* Foreground Emerging Rocks in Water (Matching photo bottom-left & center) */}
        {/* Left foreground rocks */}
        <div className="absolute bottom-3 left-[18%] w-24 h-12 bg-gradient-to-t from-[#362f29] to-[#6c6155] rounded-t-xl transform -rotate-3 shadow-lg border-t border-[#d8cdbf]/50">
          <div className="absolute -top-1 right-3 w-3 h-1.5 bg-white/80 rounded-full blur-[1px] animate-glint" />
          <div className="absolute top-1 left-2 w-2 h-1 bg-[#ffdf99] rounded-full blur-[0.5px] animate-glint" />
        </div>
        <div className="absolute bottom-1 left-[28%] w-16 h-8 bg-gradient-to-t from-[#3a322c] to-[#61564c] rounded-t-lg shadow border-t border-[#bfae9c]/40">
          <div className="absolute top-0 right-2 w-2 h-1 bg-white/90 rounded-full animate-glint" />
        </div>

        {/* Center foreground rocks */}
        <div className="absolute bottom-2 left-[44%] w-36 h-16 bg-gradient-to-t from-[#2c2621] to-[#716558] rounded-t-2xl shadow-xl border-t border-[#ece1d3]/60 transform rotate-1">
          <div className="absolute top-1 left-6 w-3 h-2 bg-white/95 rounded-full blur-[0.6px] animate-glint" />
          <div className="absolute top-2 right-8 w-2.5 h-1.5 bg-[#ffe3a6] rounded-full animate-glint" />
        </div>

        {/* Right foreground rocks */}
        <div className="absolute bottom-1 right-[22%] w-28 h-10 bg-gradient-to-t from-[#312a24] to-[#685d51] rounded-t-xl shadow border-t border-[#dfd4c5]/50">
          <div className="absolute top-0 left-4 w-2 h-1 bg-white/90 rounded-full animate-glint" />
        </div>

        {/* Golden Specular Caustic Glints on Water Surface (Matching photo sparkling ripples) */}
        {[
          { left: '22%', top: '40%', size: 'w-8 h-1', delay: '0s' },
          { left: '34%', top: '65%', size: 'w-12 h-1.5', delay: '0.8s' },
          { left: '48%', top: '30%', size: 'w-16 h-2', delay: '1.4s' },
          { left: '55%', top: '55%', size: 'w-20 h-2.5', delay: '0.3s' },
          { left: '68%', top: '45%', size: 'w-14 h-1.5', delay: '1.9s' },
          { left: '76%', top: '70%', size: 'w-10 h-1', delay: '1.1s' },
          { left: '84%', top: '35%', size: 'w-18 h-2', delay: '0.5s' },
          { left: '12%', top: '75%', size: 'w-10 h-1', delay: '1.6s' },
        ].map((glint, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r from-transparent via-[#fff5d6] to-transparent shadow-[0_0_8px_#ffd580] ${glint.size} animate-glint`}
            style={{
              left: glint.left,
              top: glint.top,
              animationDelay: glint.delay,
            }}
          />
        ))}

        {/* Reflected Golden Glow of the Sphere in the water */}
        <div className="absolute bottom-6 right-[34%] w-44 h-12 bg-radial from-[#ffca66]/40 via-[#d97706]/15 to-transparent blur-md" />
      </div>

      {/* 7. WARM SUNLIGHT VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-radial-[at_30%_20%] from-white/10 via-transparent to-black/15 pointer-events-none" />
    </div>
  );
};
