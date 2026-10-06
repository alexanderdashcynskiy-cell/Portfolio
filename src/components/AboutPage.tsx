import React from 'react';
import { Box, Lightbulb, TrendingUp, Users } from 'lucide-react';

const u = (n: number) => `calc(${n} * var(--u))`;

type Section = 'home' | 'about' | 'work' | 'services' | 'contact';

const rail: { number: string; section: Section }[] = [
  { number: '01', section: 'home' },
  { number: '02', section: 'work' },
  { number: '03', section: 'about' },
  { number: '04', section: 'services' },
  { number: '05', section: 'contact' },
];
const railTops = [149, 209, 262, 313, 361];

const tags = ['UX/UI', 'WEB', 'APPS', 'MINI APPS', 'DASHBOARDS'];

const principles = [
  {
    number: '01',
    title: 'PRODUCT THINKING',
    lines: ['I analyze the goal, users', 'and context before starting', 'the design.'],
    Icon: Lightbulb,
    left: 179,
  },
  {
    number: '02',
    title: 'UX FIRST',
    lines: ['I create clear and intuitive', 'user flows that solve', 'real problems.'],
    Icon: Users,
    left: 522,
  },
  {
    number: '03',
    title: 'DESIGN + DEVELOPMENT',
    lines: ['I can take an idea from concept', 'to a working product — combining', 'design and development.'],
    Icon: Box,
    left: 843,
  },
  {
    number: '04',
    title: 'ALWAYS LEARNING',
    lines: ['I constantly develop my skills', 'and explore new tools, approaches', 'and opportunities.'],
    Icon: TrendingUp,
    left: 1196,
  },
];
const dividers = [458, 792, 1146];

interface AboutPageProps {
  onOpenSection: (section: Section) => void;
}

/** The third full-screen page, pixel-mapped to the 1536×1024 portrait reference. */
export const AboutPage: React.FC<AboutPageProps> = ({ onOpenSection }) => (
  <section className="about-page font-hero-sans relative h-screen min-h-[640px] overflow-hidden text-[var(--hero-ink)]">
    {/* Page index rail */}
    <nav className="about-rail" aria-label="Pages">
      {rail.map(({ number, section }, i) => {
        const active = section === 'about';
        return (
          <button
            key={number}
            onClick={() => onOpenSection(section)}
            className={`about-rail-item ${active ? 'is-active' : ''}`}
            style={{ left: u(65), top: u(railTops[i]) }}
            aria-current={active ? 'page' : undefined}
          >
            <span>{number}</span>
            {active && <span className="about-rail-dash" />}
          </button>
        );
      })}
    </nav>

    <div className="about-copy" style={{ left: u(178), top: u(141) }}>
      <span className="about-eyebrow">03 / ABOUT</span>

      <h1 className="about-title font-display uppercase" style={{ marginTop: u(36) }}>
        <span>I Design</span>
        <span className="text-[var(--hero-bronze)]">With</span>
        <span className="text-[var(--hero-bronze)]">Purpose.</span>
      </h1>

      <p className="about-intro" style={{ marginTop: u(16) }}>
        I’m a digital designer and developer focused on creating clear, useful and engaging digital products.
      </p>

      <ul className="about-tags" style={{ marginTop: u(36) }}>
        {tags.map((tag, i) => (
          <li key={tag}>
            {i > 0 && <span className="about-tag-dot" aria-hidden="true">·</span>}
            {tag}
          </li>
        ))}
      </ul>
    </div>

    <div className="about-principles">
      {dividers.map((x) => (
        <span key={x} className="about-divider" style={{ left: u(x) }} aria-hidden="true" />
      ))}
      {principles.map(({ number, title, lines, Icon, left }) => (
        <article key={number} className="about-principle" style={{ left: u(left) }}>
          <div className="flex items-center">
            <span className="about-principle-number">{number}</span>
            <Icon strokeWidth={1.6} style={{ width: u(25), height: u(25), marginLeft: u(19) }} aria-hidden="true" />
            <span className="h-px bg-black/45" style={{ width: u(28), marginLeft: u(12) }} />
          </div>
          <h2 className="about-principle-title font-display">{title}</h2>
          <p className="about-principle-copy">
            {lines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </p>
        </article>
      ))}
    </div>
  </section>
);
