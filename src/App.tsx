/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { HeroContent } from './components/HeroContent';
import { WorkShowcase } from './components/WorkShowcase';
import { DigitalWorlds } from './components/DigitalWorlds';
import { ServicesSection } from './components/ServicesSection';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { CustomCursor } from './components/CustomCursor';
import { ArrowUp } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [workFilter, setWorkFilter] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroLayerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroLayerRef.current) {
        const fade = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.75)));
        heroLayerRef.current.style.opacity = String(1 - fade);
      }
      setShowBackToTop(window.scrollY > window.innerHeight * 1.8);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [isWorksModalOpen, setIsWorksModalOpen] = useState(false);

  const handleOpenSection = (section: 'home' | 'about' | 'work' | 'services' | 'contact') => {
    setActiveSection(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (section === 'about') {
      setIsAboutOpen(true);
    } else if (section === 'contact') {
      setIsContactOpen(true);
    } else if (section === 'work') {
      scrollToWorks();
    } else if (section === 'services') {
      const el = document.getElementById('services-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const y = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const scrollToWorks = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAllWorks = (filter: string | null = null) => {
    setWorkFilter(filter);
    setIsWorksModalOpen(true);
  };

  const handleTagClick = (tag: string) => openAllWorks(tag);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#ece6dc] text-[#141312] selection:bg-[#9c6a3b] selection:text-white">
      {/* Custom magnetic follower cursor */}
      <CustomCursor />

      {/* FIXED TOP NAVIGATION BAR (Exact 3-Zone Contract) */}
      <Navigation
        onOpenSection={handleOpenSection}
        activeSection={activeSection}
      />

      {/* ONE FIXED BACKDROP for the whole site; the sphere layer dissolves as the hero scrolls away */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <img src="/worlds/bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <img
          ref={heroLayerRef}
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover will-change-[opacity]"
          draggable={false}
        />
      </div>

      {/* HERO FIRST PAGE — reproduces the reference artwork */}
      <main className="relative">
        <HeroContent onExploreClick={scrollToWorks} onTagClick={handleTagClick} />
      </main>

      {/* PAGE 2 ONWARD: one fixed backdrop, only the content blocks scroll over it */}
      <div className="relative">

        {/* SECOND SECTION: Digital Worlds carousel */}
        <DigitalWorlds onOpenContact={() => setIsContactOpen(true)} />

        {/* THIRD SECTION: Services & End-to-End Workflow */}
        <ServicesSection onOpenContact={() => setIsContactOpen(true)} />

        {/* FOOTER */}
        <footer className="py-12 px-6 sm:px-10 lg:px-16 relative bg-[#f4ece2]/75 backdrop-blur-md border-t border-white/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#6e6457]">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-[#141312]">A.</span>
            <span>© 2026 Alexander Dashcynskiy. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 font-medium tracking-wider uppercase text-[#3a352e]">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#9c6a3b] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={scrollToWorks}
              className="hover:text-[#9c6a3b] transition-colors cursor-pointer"
            >
              Works
            </button>
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-[#9c6a3b] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <a
              href="mailto:alexanderdashcynskiy@gmail.com"
              className="hover:text-[#9c6a3b] transition-colors"
            >
              Email
            </a>
          </div>
        </footer>
      </div>

      {/* Back to Top floating button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-[#141312] text-white rounded-full shadow-xl hover:bg-[#9c6a3b] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Interactive Works Fullscreen Modal (for direct instant access on WORK / EXPLORE clicks) */}
      {isWorksModalOpen && (
        <WorkShowcase
          isModal={true}
          initialFilter={workFilter}
          onClose={() => setIsWorksModalOpen(false)}
          onOpenContact={() => {
            setIsWorksModalOpen(false);
            setIsContactOpen(true);
          }}
        />
      )}

      {/* Interactive About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Interactive Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
