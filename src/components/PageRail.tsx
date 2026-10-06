import React from 'react';

interface PageRailProps {
  page: number;
  labels: string[];
  light?: boolean;
  onSelect: (page: number) => void;
}

/** A quiet page indicator on the right edge: one tick per page, the current one drawn out. */
export const PageRail: React.FC<PageRailProps> = ({ page, labels, light = false, onSelect }) => (
  <nav className={`page-rail font-hero-sans ${light ? 'is-light' : ''}`} aria-label="Pages">
    {labels.map((label, i) => (
      <button
        key={label}
        onClick={() => onSelect(i)}
        className={`page-rail-item ${i === page ? 'is-active' : ''}`}
        aria-label={`${String(i + 1).padStart(2, '0')} ${label}`}
        aria-current={i === page ? 'page' : undefined}
      >
        <span className="page-rail-number">{String(i + 1).padStart(2, '0')}</span>
        <span className="page-rail-tick" />
      </button>
    ))}
  </nav>
);
