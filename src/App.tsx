/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ArchitecturalBackdrop } from './components/ArchitecturalBackdrop';
import { HeroContent } from './components/HeroContent';
import { WorkShowcase } from './components/WorkShowcase';
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
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Mouse position tracker for scene parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [isWorksModalOpen, setIsWorksModalOpen] = useState(false);

  const handleOpenSection = (section: 'about' | 'work' | 'services' | 'contact') => {
    setActiveSection(section);
    if (section === 'about') {
      setIsAboutOpen(true);
    } else if (section === 'contact') {
      setIsContactOpen(true);
    } else if (section === 'work') {
      setIsWorksModalOpen(true);
      const el = document.getElementById('work-showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const y = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
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
    setIsWorksModalOpen(true);
    const el = document.getElementById('work-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const y = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleTagClick = (tag: string) => {
    setWorkFilter(tag);
    setIsWorksModalOpen(true);
    scrollToWorks();
  };

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

      {/* HERO FIRST PAGE (Exact replica of user's photo) */}
      <main className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between">
        {/* Layer 0: The Architectural Courtyard, 3D Glass Sphere, and Water Reflections */}
        <ArchitecturalBackdrop
          mousePos={mousePos}
          onSphereHover={(hovered) => {
            // Optional state tracking
          }}
        />

        {/* Layer 1: Left-aligned Typography, Headings, Tags, and CTAs */}
        <HeroContent
          onExploreClick={scrollToWorks}
          onTagClick={handleTagClick}
        />
      </main>

      {/* SECOND SECTION: Selected Works Showcase */}
      <WorkShowcase
        initialFilter={workFilter}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* THIRD SECTION: Services & End-to-End Workflow */}
      <ServicesSection
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* FOOTER */}
      <footer className="py-12 px-6 sm:px-10 lg:px-16 bg-[#e3dcce] border-t border-[#d8cfc0] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#6e6457]">
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
