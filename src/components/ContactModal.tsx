import React, { useState } from 'react';
import { X, Copy, Check, Send, Mail, MapPin, Clock } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: 'Design & Engineering (Full-Stack)',
    budget: '$10k - $25k',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const email = 'alexanderdashcynskiy@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#f7f2ea] rounded-2xl p-7 sm:p-10 shadow-2xl border border-[#ded5c8] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#141312] transition-colors cursor-pointer"
          aria-label="Close Contact Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-semibold tracking-widest text-[#9c6a3b] uppercase">GET IN TOUCH</span>
          <span className="w-8 h-[1px] bg-[#9c6a3b]" />
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#141312] tracking-tight mb-2">
          Let's Talk.
        </h2>
        <p className="text-xs sm:text-sm text-[#5a5246] leading-relaxed mb-6">
          Have an upcoming project, redesign, or need a full-stack design engineer? Drop a line below or reach out directly.
        </p>

        {/* Quick Email Bar */}
        <div className="flex items-center justify-between p-3.5 bg-[#ede5d8] border border-[#ded5c6] rounded-xl mb-8">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#9c6a3b]" />
            <span className="text-xs sm:text-sm font-medium text-[#181615] select-all">
              {email}
            </span>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer text-[#181615]"
            title="Copy email to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#5e5549]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center bg-[#efe7da] rounded-xl border border-[#d6ccbc] animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#141312] mb-1">Message Received</h3>
            <p className="text-xs sm:text-sm text-[#544c42] mb-6">
              Thank you for reaching out! I typically respond within 12 hours with calendar availability.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#141312] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#9c6a3b] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#473f36] mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/90 border border-[#ded5c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9c6a3b] text-[#141312]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#473f36] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/90 border border-[#ded5c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9c6a3b] text-[#141312]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#473f36] mb-1.5">
                  Project Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/90 border border-[#ded5c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9c6a3b] text-[#141312]"
                >
                  <option>Design & Engineering (Full-Stack)</option>
                  <option>UX/UI Design & Prototyping</option>
                  <option>Web Application / SaaS Development</option>
                  <option>Interactive 3D WebGL Experience</option>
                  <option>Mobile App / Mini App</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#473f36] mb-1.5">
                  Estimated Budget
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/90 border border-[#ded5c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9c6a3b] text-[#141312]"
                >
                  <option>&lt; $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000 - $25,000</option>
                  <option>$25,000 - $50,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#473f36] mb-1.5">
                Project Overview & Timeline
              </label>
              <textarea
                rows={3}
                required
                placeholder="Briefly describe what you're building, target audience, and preferred kickoff date..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white/90 border border-[#ded5c6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9c6a3b] text-[#141312] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#6d6458]">
                ⚡ Response within 12 hours guaranteed
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#141312] text-white text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-[#9c6a3b] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Send Proposal</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
