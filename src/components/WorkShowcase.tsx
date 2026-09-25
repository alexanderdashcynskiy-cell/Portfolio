import React, { useState } from 'react';
import { Project } from '../types/portfolio';
import { PROJECTS } from '../data/portfolioData';
import { ArrowUpRight, ExternalLink, X, CheckCircle } from 'lucide-react';

interface WorkShowcaseProps {
  initialFilter?: string | null;
  onClose?: () => void;
  onOpenContact: () => void;
  isModal?: boolean;
}

export const WorkShowcase: React.FC<WorkShowcaseProps> = ({
  initialFilter,
  onClose,
  onOpenContact,
  isModal = false,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>(initialFilter || 'ALL');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const tags = ['ALL', 'UX/UI', 'WEB', 'APPS', 'MINI APPS', 'DASHBOARDS'];

  const filteredProjects = selectedTag === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) =>
        p.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()))
      );

  const content = (
    <div className="max-w-7xl mx-auto">
      {/* Header Contract */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold tracking-widest text-[#9c6a3b] uppercase">02 — PORTFOLIO</span>
            <span className="w-8 h-[1px] bg-[#9c6a3b]" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#141312] tracking-tight">
            Selected Works.
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Interactive Tag Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#141312] text-white shadow-sm'
                    : 'bg-[#dad1c4]/70 text-[#38332c] hover:bg-[#dad1c4] hover:text-[#141312]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/10 hover:bg-black/20 text-[#141312] transition-colors cursor-pointer"
              aria-label="Close Works Gallery"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveProject(project)}
              className="group relative bg-[#f1ece3] rounded-2xl p-7 sm:p-9 border border-[#dcd3c4] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              {/* Card Top Row: Number & Year */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#73685c] mb-6">
                  <span className="font-serif text-lg font-bold text-[#9c6a3b]">{project.number}</span>
                  <span className="tracking-widest uppercase">{project.year}</span>
                </div>

                {/* Title & Category */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#181615] group-hover:text-[#9c6a3b] transition-colors duration-300 mb-2">
                  {project.title}
                </h3>
                <p className="text-xs font-semibold tracking-wider text-[#635a4f] uppercase mb-4">
                  {project.category}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[#3c3630] mb-6">
                  {project.description}
                </p>

                {/* Key Metric Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e7dfd1] rounded-md text-xs font-medium text-[#2d2823] mb-6">
                  <CheckCircle className="w-3.5 h-3.5 text-[#9c6a3b]" />
                  <span>{project.metrics}</span>
                </div>
              </div>

              {/* Card Bottom Row: Tags & Action */}
              <div className="pt-6 border-t border-[#dfd6c7] flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[11px] font-medium text-[#6e6357] tracking-wider uppercase">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#141312] group-hover:text-[#9c6a3b] uppercase transition-colors">
                  <span>View Case</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA within Works */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#544d44] mb-4">
            Have a custom digital product in mind?
          </p>
          <button
            onClick={onOpenContact}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#141312] text-white text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-[#9c6a3b] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );

  return (
    <>
      {isModal ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-md p-4 sm:p-8 animate-in fade-in flex items-center justify-center">
          <div className="relative w-full max-w-6xl bg-[#ece6dc] rounded-2xl p-6 sm:p-10 shadow-2xl border border-[#ded5c8] max-h-[92vh] overflow-y-auto">
            {content}
          </div>
        </div>
      ) : (
        <section id="work-showcase" className="relative w-full py-20 px-6 sm:px-10 lg:px-16 bg-[#e6dfd4] border-t border-[#d8cfc0]">
          {content}
        </section>
      )}

      {/* Case Study Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#f7f2ea] rounded-2xl p-7 sm:p-10 shadow-2xl border border-[#ded5c8] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#141312] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-[#9c6a3b] tracking-widest uppercase">
              {activeProject.number} · {activeProject.category}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#141312] mt-1 mb-4">
              {activeProject.title}
            </h3>

            <p className="text-sm sm:text-base text-[#3c3731] leading-relaxed mb-6">
              {activeProject.description}
            </p>

            <div className="bg-[#ede5d8] rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold tracking-wider text-[#141312] uppercase mb-2">Key Deliverables</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4b433a]">
                {activeProject.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9c6a3b]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#dfd6c7]">
              <span className="text-xs font-semibold text-[#665e53]">Impact: {activeProject.metrics}</span>
              <button
                onClick={() => {
                  setActiveProject(null);
                  onOpenContact();
                }}
                className="px-5 py-2.5 bg-[#141312] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#9c6a3b] transition-colors cursor-pointer"
              >
                Inquire Similar Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
