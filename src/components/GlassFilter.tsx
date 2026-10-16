import React, { useEffect } from 'react';

/*
 * Glass refraction (adapted from React Bits' GlassSurface): an SVG displacement filter used
 * as a backdrop filter, so the scene bends at the edges of the glass panels like a thick lens,
 * with a slight chromatic split. Only Chromium-based browsers apply SVG filters to backdrops;
 * elsewhere the panels keep their frosted blur.
 */

// Displacement map: neutral grey in the middle, pushing toward the edges near the rim.
const MAP = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="x" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="rgb(0,0,0)"/><stop offset="0.16" stop-color="rgb(128,0,0)"/>
        <stop offset="0.84" stop-color="rgb(128,0,0)"/><stop offset="1" stop-color="rgb(255,0,0)"/>
      </linearGradient>
      <linearGradient id="y" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="rgb(0,0,0)"/><stop offset="0.16" stop-color="rgb(0,0,128)"/>
        <stop offset="0.84" stop-color="rgb(0,0,128)"/><stop offset="1" stop-color="rgb(0,0,255)"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#x)"/>
    <rect width="100" height="100" fill="url(#y)" style="mix-blend-mode:screen"/>
  </svg>`,
)}`;

const channel = (id: string, scale: number, keep: string) => (
  <>
    <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="B" result={`d${id}`} />
    <feColorMatrix in={`d${id}`} type="matrix" values={keep} result={id} />
  </>
);

export const GlassFilter: React.FC = () => {
  useEffect(() => {
    const ua = navigator.userAgent;
    const webkitOnly = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
    if (webkitOnly || /Firefox/.test(ua)) return;
    document.documentElement.classList.add('glass-refract');
    return () => document.documentElement.classList.remove('glass-refract');
  }, []);

  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id="glass-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={MAP} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        {channel('r', -54, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')}
        {channel('g', -46, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')}
        {channel('b', -38, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')}
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
};
