import React from 'react';
import { X, Award, CheckCircle, Code, Palette, Globe, ArrowRight } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#f7f2ea] rounded-2xl p-7 sm:p-10 shadow-2xl border border-[#ded5c8] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#141312] transition-colors cursor-pointer"
          aria-label="Close About Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold tracking-widest text-[#9c6a3b] uppercase">ABOUT THE DESIGNER</span>
          <span className="w-8 h-[1px] bg-[#9c6a3b]" />
        </div>
        
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#141312] tracking-tight mb-2">
          Alexander Dashcynskiy.
        </h2>
        <p className="text-sm font-semibold tracking-wider text-[#6b6255] uppercase mb-6">
          Digital Product Designer & Creative Frontend Engineer
        </p>

        {/* Bio */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#3c362f] mb-8">
          <p>
            I specialize in crafting distinctive, high-conversion digital products where surgical UX design meets robust frontend architecture. I don't stop at mockups — I design in systems and ship production code that performs effortlessly.
          </p>
          <p>
            Over the past 8 years, I've partnered with venture-backed startups and international brands to take concepts from a blank canvas to high-retention web applications, interactive 3D experiences, and high-velocity SaaS platforms.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#ede5d8] p-5 rounded-xl border border-[#ded5c6]">
            <Palette className="w-5 h-5 text-[#9c6a3b] mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141312] mb-1">Visual & UX</h3>
            <p className="text-xs text-[#52493f]">Figma design systems, spatial layouts, typography, micro-interactions.</p>
          </div>
          <div className="bg-[#ede5d8] p-5 rounded-xl border border-[#ded5c6]">
            <Code className="w-5 h-5 text-[#9c6a3b] mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141312] mb-1">Frontend Engineering</h3>
            <p className="text-xs text-[#52493f]">React 19, TypeScript, Tailwind CSS, Three.js, Next.js, WebGL.</p>
          </div>
          <div className="bg-[#ede5d8] p-5 rounded-xl border border-[#ded5c6]">
            <Globe className="w-5 h-5 text-[#9c6a3b] mb-2" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141312] mb-1">Production Quality</h3>
            <p className="text-xs text-[#52493f]">Core Web Vitals 99+, responsive geometry, accessibility WCAG AA.</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 px-6 bg-[#ebe2d4] rounded-xl mb-8 text-center">
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#141312]">8+</div>
            <div className="text-[11px] font-semibold text-[#6e6357] uppercase tracking-wider">Years Experience</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#9c6a3b]">40+</div>
            <div className="text-[11px] font-semibold text-[#6e6357] uppercase tracking-wider">Products Shipped</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#141312]">100%</div>
            <div className="text-[11px] font-semibold text-[#6e6357] uppercase tracking-wider">On-Time Delivery</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ded5c7]">
          <span className="text-xs font-medium text-[#6e6357]">
            Based in Central Europe · Working with clients globally
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#141312] text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-[#9c6a3b] transition-colors cursor-pointer"
          >
            <span>Let's collaborate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
