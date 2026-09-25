import React, { useState } from 'react';
import { SERVICE_PHASES } from '../data/portfolioData';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  onOpenContact: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenContact }) => {
  const [openPhase, setOpenPhase] = useState<string>('design');

  return (
    <section id="services-section" className="relative w-full py-20 px-6 sm:px-10 lg:px-16 bg-[#eee8df] border-t border-[#dfd6c8]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold tracking-widest text-[#9c6a3b] uppercase">03 — SERVICES & METHOD</span>
          <span className="w-8 h-[1px] bg-[#9c6a3b]" />
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#141312] tracking-tight mb-12 sm:mb-16">
          The End-to-End Workflow.
        </h2>

        {/* 3 Step Phase Accordion / Cards */}
        <div className="flex flex-col gap-6">
          {SERVICE_PHASES.map((phase) => {
            const isOpen = openPhase === phase.id;
            return (
              <div
                key={phase.id}
                className={`transition-all duration-500 rounded-2xl border ${
                  isOpen
                    ? 'bg-[#f7f3ec] border-[#c8bea9] shadow-lg p-8 sm:p-10'
                    : 'bg-[#e4dcce]/60 border-[#d6ccbd] p-6 sm:p-8 hover:bg-[#e4dcce]'
                }`}
              >
                <div
                  onClick={() => setOpenPhase(isOpen ? '' : phase.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#9c6a3b]">
                      {phase.step}
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141312]">
                        {phase.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#665e53] font-medium mt-0.5">
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-black/5' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#141312]" />
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-8 pt-6 border-t border-[#dfd6c7] grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    <div>
                      <p className="text-sm leading-relaxed text-[#3b352f] mb-6">
                        {phase.description}
                      </p>
                      <h4 className="text-xs font-bold tracking-wider text-[#141312] uppercase mb-3">
                        Core Toolset & Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-3 py-1 bg-[#ebe3d5] text-[#2c2722] text-xs font-medium rounded-md"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-[#141312] uppercase mb-3">
                        Key Deliverables
                      </h4>
                      <ul className="space-y-2.5">
                        {phase.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#463f37]">
                            <Check className="w-4 h-4 text-[#9c6a3b] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={onOpenContact}
                        className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#9c6a3b] hover:text-[#7d5028] transition-colors"
                      >
                        <span>Inquire this stage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
