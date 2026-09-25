import React, { useState } from 'react';
import { ArrowRight, Menu, X, CheckCircle2 } from 'lucide-react';

interface NavigationProps {
  onOpenSection: (section: 'home' | 'about' | 'work' | 'services' | 'contact') => void;
  activeSection?: string;
}

const u = (n: number) => `calc(${n} * var(--u))`;

export const Navigation: React.FC<NavigationProps> = ({ onOpenSection, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'work', label: 'WORK' },
    { id: 'about', label: 'ABOUT' },
    { id: 'services', label: 'SERVICES' },
    { id: 'contact', label: 'CONTACT' },
  ] as const;

  return (
    <header
      className="font-hero-sans fixed top-0 inset-x-0 z-50 flex items-center justify-between pointer-events-none text-[var(--hero-ink)]"
      style={{ height: `max(72px, ${u(92)})`, paddingLeft: `max(20px, ${u(57)})`, paddingRight: `max(20px, ${u(58)})` }}
    >
      {/* LEFT: "A." + links */}
      <div className="flex items-center pointer-events-auto">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-hero-sans font-bold leading-none tracking-[-0.04em] transition-colors duration-300 hover:text-[var(--hero-bronze)] cursor-pointer"
          style={{ fontSize: `max(26px, ${u(36)})` }}
          aria-label="Alexander Dashcynskiy — Home"
        >
          A.
        </button>

        <nav
          className="hidden md:flex items-center"
          style={{ marginLeft: u(73), gap: u(47) }}
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onOpenSection(link.id)}
                className={`group relative py-1 font-normal tracking-[0.02em] uppercase transition-colors duration-300 cursor-pointer ${
                  isActive ? 'text-[var(--hero-bronze)]' : 'hover:text-[var(--hero-bronze)]'
                }`}
                style={{ fontSize: `max(11px, ${u(13.5)})` }}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-px bg-current transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT: status + LET'S TALK */}
      <div className="flex items-center pointer-events-auto" style={{ gap: u(40) }}>
        <div
          className="relative hidden sm:flex items-center cursor-pointer group"
          style={{ gap: u(16) }}
          onMouseEnter={() => setShowStatusTooltip(true)}
          onMouseLeave={() => setShowStatusTooltip(false)}
          onClick={() => onOpenSection('contact')}
        >
          <span
            className="rounded-full bg-[var(--hero-ink)] transition-colors duration-300 group-hover:bg-[var(--hero-bronze)]"
            style={{ width: `max(9px, ${u(13)})`, height: `max(9px, ${u(13)})` }}
          />
          <div
            className="flex flex-col uppercase leading-[1.25] tracking-[0.01em] transition-colors duration-300 group-hover:text-[var(--hero-bronze)]"
            style={{ fontSize: `max(10px, ${u(13.5)})` }}
          >
            <span>Available</span>
            <span>For new projects</span>
          </div>

          {showStatusTooltip && (
            <div className="absolute top-10 right-0 w-64 p-3.5 bg-white/95 backdrop-blur-md border border-[#e4dcce] shadow-xl rounded-xl text-left z-50">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#181716] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status: Booking Q4 2026</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#615a51]">
                Currently accepting select digital product design, web applications, and interactive consulting projects.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => onOpenSection('contact')}
          className="group inline-flex items-center justify-center bg-[var(--hero-ink)] text-white uppercase tracking-[0.02em] rounded-full transition-all duration-300 hover:bg-[var(--hero-bronze)] active:scale-95 cursor-pointer"
          style={{
            width: `max(128px, ${u(167)})`,
            height: `max(38px, ${u(44)})`,
            gap: u(12),
            fontSize: `max(11px, ${u(13.5)})`,
          }}
        >
          <span>Let’s talk</span>
          <ArrowRight
            className="transition-transform duration-300 group-hover:translate-x-1"
            style={{ width: `max(12px, ${u(14)})`, height: `max(12px, ${u(14)})` }}
            strokeWidth={1.75}
          />
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-[72px] inset-x-5 bg-[#f7f2ea]/95 backdrop-blur-xl border border-[#ded5c8] rounded-2xl shadow-2xl p-6 md:hidden pointer-events-auto">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onOpenSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm font-medium tracking-widest uppercase py-2 hover:text-[var(--hero-bronze)] border-b border-black/5 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
