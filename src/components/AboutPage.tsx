import React from 'react';
import { Box, Lightbulb, TrendingUp, Users } from 'lucide-react';

/** One pixel of the 1536×1024 reference artwork, at the size the stage is shown. */
const c = (n: number) => `calc(${n} * var(--c))`;

const principles = [
  {
    number: '01',
    title: 'PRODUCT THINKING',
    lines: ['I analyze the goal, users', 'and context before starting', 'the design.'],
    Icon: Lightbulb,
    left: 156,
  },
  {
    number: '02',
    title: 'UX FIRST',
    lines: ['I create clear and intuitive', 'user flows that solve', 'real problems.'],
    Icon: Users,
    left: 507,
    dash: true,
  },
  {
    number: '03',
    title: 'DESIGN + DEVELOPMENT',
    lines: ['I can take an idea from concept', 'to a working product — combining', 'design and development.'],
    Icon: Box,
    left: 827,
  },
  {
    number: '04',
    title: 'ALWAYS LEARNING',
    lines: ['I constantly develop my skills', 'and explore new tools, approaches', 'and opportunities.'],
    Icon: TrendingUp,
    left: 1199,
  },
];
const dividers = [448, 776, 1141];

/**
 * The third full-screen page: the reference artwork covering the window, with every
 * element placed on it in artwork pixels as in the reference (see .about-stage).
 */
export const AboutPage: React.FC = () => (
  <section className="about-page font-hero-sans text-[var(--hero-ink)]">
    <div className="about-stage">
      <div className="about-copy">
        <span data-reveal className="about-eyebrow">03 / ABOUT</span>

        <h1 className="about-title font-display uppercase" style={{ marginLeft: c(19), marginTop: c(35) }}>
          <span data-reveal="line">I Design</span>
          <span data-reveal="line" className="text-[var(--hero-bronze)]">With</span>
          <span data-reveal="line" className="text-[var(--hero-bronze)]">Purpose.</span>
        </h1>

        <p data-reveal className="about-intro" style={{ marginLeft: c(20), marginTop: c(12) }}>
          I’m a digital designer and developer focused on creating clear, useful and engaging digital products.
        </p>
      </div>

      {dividers.map((x) => (
        <span key={x} data-reveal className="about-divider" style={{ left: c(x) }} aria-hidden="true" />
      ))}
      {principles.map(({ number, title, lines, Icon, left, dash }) => (
        <article key={number} data-reveal className="about-principle" style={{ left: c(left) }}>
          <div className="flex items-center">
            <span className="about-principle-number">{number}</span>
            <Icon className="about-principle-icon" strokeWidth={1.6} aria-hidden="true" />
            {dash && <span className="about-principle-dash" />}
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
