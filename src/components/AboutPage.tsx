import React from 'react';
import { Box, Lightbulb, TrendingUp, Users } from 'lucide-react';

const principles = [
  {
    number: '01',
    title: 'PRODUCT THINKING',
    lines: ['I analyze the goal, users', 'and context before starting', 'the design.'],
    Icon: Lightbulb,
  },
  {
    number: '02',
    title: 'UX FIRST',
    lines: ['I create clear and intuitive', 'user flows that solve', 'real problems.'],
    Icon: Users,
  },
  {
    number: '03',
    title: 'DESIGN + DEVELOPMENT',
    lines: ['I can take an idea from concept', 'to a working product — combining', 'design and development.'],
    Icon: Box,
  },
  {
    number: '04',
    title: 'ALWAYS LEARNING',
    lines: ['I constantly develop my skills', 'and explore new tools, approaches', 'and opportunities.'],
    Icon: TrendingUp,
  },
];

/**
 * The third full-screen page. All content sits on a stage that is sized and centred
 * exactly like the backdrop image, so every element stays pinned to the scene.
 */
export const AboutPage: React.FC = () => (
  <section className="about-page font-hero-sans text-[var(--hero-ink)]">
    <div className="about-stage">
      <img src="/about.jpg" alt="" className="about-stage-scene" draggable={false} aria-hidden="true" />
      <div className="about-copy">
        <span className="about-eyebrow">03 / ABOUT</span>

        <h1 className="about-title font-display uppercase">
          <span>I Design</span>
          <span className="text-[var(--hero-bronze)]">With</span>
          <span className="text-[var(--hero-bronze)]">Purpose.</span>
        </h1>

        <p className="about-intro">
          I’m a digital designer and developer focused on creating clear, useful and engaging digital products.
        </p>
      </div>

      <div className="about-principles">
        {principles.map(({ number, title, lines, Icon }) => (
          <article key={number} className="about-principle">
            <div className="flex items-center">
              <span className="about-principle-number">{number}</span>
              <Icon className="about-principle-icon" strokeWidth={1.6} aria-hidden="true" />
              <span className="about-principle-dash" />
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
    </div>
  </section>
);
