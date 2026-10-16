import React from 'react';

/*
 * Living light on the photographed glass sphere of page 1. The sphere itself stays the
 * original render; over it, clipped to its disc, a soft specular glint drifts slowly
 * (and leans toward the pointer), and the warm caustic it focuses onto the rock shimmers.
 * Leaving page 1, the sphere flares as light sweeps across it (see index.css).
 * Positions are artwork pixels of the 1536×1024 hero, mapped like its object-cover image.
 */
export const SphereLight: React.FC = () => (
  <div className="sphere-light" aria-hidden="true">
    <div className="sphere-disc">
      <div className="sphere-lean">
        <span className="sphere-glint" />
        <span className="sphere-glint sphere-glint-low" />
      </div>
      <span className="sphere-sweep" />
      <span className="sphere-flare" />
    </div>
    <span className="sphere-caustic" />
  </div>
);
