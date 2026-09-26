import React from 'react';
import { ArrowUpRight, Box, Lightbulb, Users } from 'lucide-react';

const u = (n: number) => `calc(${n} * var(--u))`;

const principles = [
  {
    number: '01',
    title: 'PRODUCT THINKING',
    text: 'I analyze the goal, users and context before starting the design.',
    Icon: Lightbulb,
  },
  {
    number: '02',
    title: 'UX FIRST',
    text: 'I create clear and intuitive user flows that solve real problems.',
    Icon: Users,
  },
  {
    number: '03',
    title: 'DESIGN + DEVELOPMENT',
    text: 'I can take an idea from concept to a working product — combining design and development.',
    Icon: Box,
  },
  {
    number: '04',
    title: 'ALWAYS LEARNING',
    text: 'I constantly develop my skills and explore new tools, approaches and opportunities.',
    Icon: ArrowUpRight,
  },
];

/** The third full-screen page, composed against the architectural portrait image. */
export const AboutPage: React.FC = () => (
  <section className="about-page font-hero-sans relative h-screen min-h-[640px] overflow-hidden text-[var(--hero-ink)]">
    <div className="about-copy" style={{ left: u(80), top: u(159) }}>
      <div className="flex items-center" style={{ gap: u(10) }}>
        <span className="font-bold leading-none" style={{ fontSize: u(15) }}>03 / ABOUT</span>
        <span className="h-px bg-black/70" style={{ width: u(22) }} />
      </div>

      <h1 className="about-title font-display uppercase" style={{ marginTop: u(39) }}>
        <span>I Design</span>
        <span className="text-[var(--hero-bronze)]">With</span>
        <span className="text-[var(--hero-bronze)]">Purpose.</span>
      </h1>

      <p className="about-intro" style={{ marginTop: u(22) }}>
        I’m a digital designer and developer focused on creating clear, useful and engaging digital products.
      </p>
    </div>

    <div className="about-principles" style={{ left: u(156), right: u(91), bottom: u(102) }}>
      {principles.map(({ number, title, text, Icon }, index) => (
        <article key={number} className="about-principle" style={{ paddingLeft: index ? u(57) : 0 }}>
          <div className="flex items-center" style={{ gap: u(15) }}>
            <span className="font-bold leading-none" style={{ fontSize: u(15) }}>{number}</span>
            <Icon strokeWidth={1.8} style={{ width: u(25), height: u(25) }} aria-hidden="true" />
            {index === 1 && <span className="h-px bg-black/45" style={{ width: u(43) }} />}
          </div>
          <h2 className="font-cormorant font-semibold" style={{ fontSize: u(20), marginTop: u(11) }}>{title}</h2>
          <p className="about-principle-copy" style={{ fontSize: u(15), marginTop: u(6) }}>{text}</p>
        </article>
      ))}
    </div>
  </section>
);
