import React from 'react';
import { ArrowRight, BarChart3, Copy, Smartphone, SquareTerminal } from 'lucide-react';
import { TECH_STACK } from './TechIcons';

/** One pixel of the 1536×1024 artwork, at the size the stage is shown (see .about-stage). */
const c = (n: number) => `calc(${n} * var(--c))`;

const services = [
  {
    number: '01',
    title: 'UI/UX DESIGN',
    lines: ['Clean, intuitive and modern', 'interfaces focused on real', 'user needs.'],
    Icon: Copy,
  },
  {
    number: '02',
    title: 'WEB DEVELOPMENT',
    lines: ['Fast, responsive and scalable', 'websites and web applications.'],
    Icon: SquareTerminal,
  },
  {
    number: '03',
    title: 'APPS & MINI APPS',
    lines: ['Mobile applications and', 'Telegram Mini Apps with a focus', 'on usability and performance.'],
    Icon: Smartphone,
  },
  {
    number: '04',
    title: 'DASHBOARDS & TOOLS',
    lines: ['Functional dashboards and', 'internal tools to simplify work', 'and improve results.'],
    Icon: BarChart3,
  },
];

// Centres of the tech items and the dividers between them, in artwork pixels.
const STACK_X = [349, 432, 515, 603, 695, 787, 889, 987, 1083, 1203, 1289, 1369];
const DIVIDER_X = [145, 300, 392, 474, 558, 651, 740, 834, 944, 1033, 1147, 1246, 1329];

interface ServicesPageProps {
  onOpenContact: () => void;
}

/** The fourth full-screen page, laid out on the same stage as the about page. */
export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenContact }) => (
  <section className="services-page about-page font-hero-sans text-[var(--hero-ink)]">
    <div className="about-stage">
      <div className="services-copy">
        <span data-reveal className="page-eyebrow">04 / SERVICES</span>

        <h1 className="services-title font-display uppercase">
          <span data-reveal="line">Ideas</span>
          <span data-reveal="line">Into</span>
          <span data-reveal="line" className="text-[var(--hero-bronze)]">Products.</span>
        </h1>

        <p data-reveal className="services-intro">
          I design and build digital products using a modern, AI-assisted workflow — from concept to launch.
        </p>

        <button data-reveal onClick={onOpenContact} className="services-cta group">
          <span>Let’s discuss your project</span>
          <ArrowRight className="services-cta-arrow" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>

      <div className="services-grid">
        {services.map(({ number, title, lines, Icon }) => (
          <article key={number} data-reveal className="services-card glass">
            <span className="services-card-number">{number}</span>
            <Icon className="services-card-icon" strokeWidth={1.5} aria-hidden="true" />
            <span className="services-card-rule" aria-hidden="true" />
            <h2 className="services-card-title font-display">{title}</h2>
            <p className="services-card-copy">
              {lines.map((line) => (
                <span key={line}>{line} </span>
              ))}
            </p>
            <button onClick={onOpenContact} className="services-card-arrow" aria-label={`Discuss ${title.toLowerCase()}`}>
              <ArrowRight strokeWidth={1.8} />
            </button>
          </article>
        ))}
      </div>

      <div data-reveal className="services-stack glass">
        <span className="services-stack-label">Tech stack</span>
        {DIVIDER_X.map((x) => (
          <span key={x} className="services-stack-divider" style={{ left: c(x - 92) }} aria-hidden="true" />
        ))}
        <ul>
          {TECH_STACK.map(({ label, Icon }, i) => (
            <li key={label} className="services-stack-item" style={{ left: c(STACK_X[i] - 92) }}>
              <Icon className="services-stack-icon" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
