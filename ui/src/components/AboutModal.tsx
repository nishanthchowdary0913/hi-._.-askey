import React from 'react';
import { X, ShieldCheck, Database, Cpu, ExternalLink, School } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative overflow-hidden ${
          isDarkMode
            ? 'bg-[#091a32] border-[#1E3A5F] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-900 border border-amber-500/40 flex items-center justify-center">
            <School className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">About Hi ._. Askey!</h3>
            <p className="text-xs text-slate-400">
              Saint Mary's University Knowledge Base RAG Assistant
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-amber-400">Hi ._. Askey!</strong> is the official AI campus assistant designed to help Saint Mary's University students, faculty, and prospective applicants find verified information instantly.
          </p>

          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDarkMode ? 'bg-[#061325] border-[#1E3A5F]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-400">
              <Database className="w-4 h-4" />
              <span>Grounded Index: SMU-2024.3-Verified</span>
            </div>
            <p className="text-xs text-slate-400">
              Unlike generic chatbots, every answer is synthesized using Retrieval-Augmented Generation (RAG) directly from official SMU publications:
            </p>
            <ul className="text-xs list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li>Saint Mary's University Academic Calendar 2024-2025</li>
              <li>Self-Service Banner (Banner 9) registration documentation</li>
              <li>Patrick Power Library Novanet archive & course reserves</li>
              <li>Sobey School of Business and Faculty of Science advisories</li>
              <li>Service Centre MM108 fee schedules & transit U-Pass info</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Institutional Privacy Protected
            </span>
            <a
              href="https://smu.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Visit smu.ca</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
