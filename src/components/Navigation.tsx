import React, { useState } from 'react';
import { ArrowRight, Menu, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavigationProps {
  onOpenSection: (section: 'about' | 'work' | 'services' | 'contact') => void;
  activeSection?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenSection, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  const navLinks = [
    { id: 'about', label: 'ABOUT' },
    { id: 'work', label: 'WORK' },
    { id: 'services', label: 'SERVICES' },
    { id: 'contact', label: 'CONTACT' },
  ] as const;

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between pointer-events-none">
      {/* LEFT ZONE: Brand "A." + Navigation Links */}
      <div className="flex items-center gap-10 sm:gap-14 lg:gap-20 pointer-events-auto">
        {/* Brand Mark "A." */}
        <button
          onClick={() => onOpenSection('about')}
          className="group relative flex items-center text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#141312] transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-none"
          title="Alexander Dashcynskiy — Portfolio"
          aria-label="Alexander Dashcynskiy Home"
        >
          <span className="transition-colors duration-300 group-hover:text-[#9c6a3b]">A.</span>
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#9c6a3b] transition-all duration-300 group-hover:w-full" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onOpenSection(link.id)}
                className={`group relative py-1 text-xs lg:text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer focus-visible:outline-none ${
                  isActive
                    ? 'text-[#9c6a3b] font-semibold'
                    : 'text-[#262422]/85 hover:text-[#111111]'
                }`}
              >
                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[#9c6a3b]">
                  {link.label}
                </span>
                {/* Smooth Animated Underline */}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-[#9c6a3b] transition-all duration-300 ease-out ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* RIGHT ZONE: Availability Status & "LET'S TALK →" CTA */}
      <div className="flex items-center gap-6 sm:gap-8 lg:gap-10 pointer-events-auto">
        {/* Status Indicator: ● AVAILABLE FOR NEW PROJECTS */}
        <div
          className="relative hidden sm:flex items-center gap-3 cursor-pointer group"
          onMouseEnter={() => setShowStatusTooltip(true)}
          onMouseLeave={() => setShowStatusTooltip(false)}
          onClick={() => onOpenSection('contact')}
          title="Click to get in touch"
        >
          {/* Pulsing Solid Dot */}
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#111111] opacity-75 animate-ping duration-1000" />
            <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#111111] group-hover:bg-[#9c6a3b] transition-colors duration-300" />
          </div>

          {/* Two-line text matching photo */}
          <div className="flex flex-col text-[10px] lg:text-[11px] font-semibold tracking-[0.18em] leading-tight text-[#22201e] uppercase transition-colors duration-300 group-hover:text-[#9c6a3b]">
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">AVAILABLE</span>
            <span className="text-[#55504a] font-medium tracking-[0.14em] group-hover:text-[#9c6a3b] transition-transform duration-300 group-hover:translate-x-0.5">
              FOR NEW PROJECTS
            </span>
          </div>

          {/* Interactive Availability Tooltip Card */}
          {showStatusTooltip && (
            <div className="absolute top-10 right-0 w-64 p-3.5 bg-white/95 backdrop-blur-md border border-[#e4dcce] shadow-xl rounded-xl text-left z-50 transform transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#181716] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status: Booking Q4 2026</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#615a51]">
                Currently accepting select digital product design, web applications, and interactive consulting projects.
              </p>
              <div className="mt-2 text-[10px] text-[#9c6a3b] font-medium tracking-wide">
                Average reply time: under 12 hours →
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA Pill Button: "LET'S TALK →" */}
        <button
          onClick={() => onOpenSection('contact')}
          className="group relative inline-flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 bg-[#111111] text-white text-xs sm:text-[13px] font-medium tracking-[0.14em] uppercase rounded-full shadow-md transition-all duration-300 ease-out hover:bg-[#222222] hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#9c6a3b] focus-visible:outline-none"
        >
          {/* Subtle button surface glow */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative inline-block transition-transform duration-300 group-hover:translate-x-0.5">
            LET'S TALK
          </span>
          <ArrowRight className="relative w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-black/5 text-[#141312] hover:bg-black/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 inset-x-6 bg-[#f7f2ea]/95 backdrop-blur-xl border border-[#ded5c8] rounded-2xl shadow-2xl p-6 md:hidden pointer-events-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onOpenSection(link.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm font-semibold tracking-widest uppercase py-2 text-[#181716] hover:text-[#9c6a3b] border-b border-black/5 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex items-center justify-between text-xs text-[#666056]">
              <span>Status: Available for projects</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
