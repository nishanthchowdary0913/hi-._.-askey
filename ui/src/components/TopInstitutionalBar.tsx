import React from 'react';
import { ExternalLink } from 'lucide-react';

interface TopInstitutionalBarProps {
  isDarkMode?: boolean;
}

export const TopInstitutionalBar: React.FC<TopInstitutionalBarProps> = ({ isDarkMode = true }) => {
  return (
    <aside
      className={`w-full border-b text-[11px] py-1.5 px-4 sm:px-8 transition-colors ${
        isDarkMode
          ? 'bg-[#040e1c] border-[#1E3A5F]/60 text-slate-400'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
      aria-label="Institutional Verification Bar"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: RAG verification badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`font-semibold tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
            Official Saint Mary's University Knowledge Base RAG Assistant
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            Powered by Verified Campus Catalog & Portal Data
          </span>
        </div>

        {/* Right: Location & Link */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto text-xs">
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
            Halifax, NS (AST)
          </span>
          <a
            className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium text-[11px]"
            href="https://smu.ca"
            rel="noopener noreferrer"
            target="_blank"
            title="Visit Saint Mary's University Official Site"
          >
            <span>smu.ca</span>
            <ExternalLink className="w-3 h-3 text-slate-400 hover:text-amber-400" />
          </a>
        </div>
      </div>
    </aside>
  );
};
