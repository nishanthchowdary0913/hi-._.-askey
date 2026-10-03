import React from 'react';

interface FooterProps {
  isDarkMode?: boolean;
  onOpenHelp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode = true, onOpenHelp }) => {
  return (
    <footer
      className={`border-t text-xs py-4 px-4 sm:px-8 mt-auto transition-colors ${
        isDarkMode
          ? 'bg-[#040e1c] border-[#1E3A5F]/70 text-slate-400'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* University Address & Campus Identity */}
        <div>
          <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
            Saint Mary's University
          </span>{' '}
          • 923 Robie Street, Halifax, Nova Scotia, Canada B3H 3C3
        </div>

        {/* Links & Metadata */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <a
            href="https://smu.ca/about/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-slate-600">•</span>
          <a
            href="https://smu.ca/about/accessibility.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Accessibility
          </a>
          <span className="text-slate-600">•</span>
          <button
            onClick={onOpenHelp}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            IT Help Desk (902-496-8111)
          </button>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400">RAG Threshold: 0.82</span>
        </div>
      </div>
    </footer>
  );
};
