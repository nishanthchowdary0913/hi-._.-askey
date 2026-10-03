import React, { useState, useRef } from 'react';
import { ExternalLink, ShieldCheck, Globe, Calendar, ArrowUpRight } from 'lucide-react';
import { SourceReference } from '../types';

interface SourceLinkWithPreviewProps {
  source: SourceReference;
  isDarkMode?: boolean;
}

export const SourceLinkWithPreview: React.FC<SourceLinkWithPreviewProps> = ({
  source,
  isDarkMode = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  const fallbackThumbnail = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=480&q=80';
  const thumbnailSrc = !imgError && source.thumbnail ? source.thumbnail : fallbackThumbnail;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The clickable source chip */}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-150 group cursor-pointer ${
          isHovered
            ? isDarkMode
              ? 'bg-[#0f2d57] border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
              : 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
            : isDarkMode
            ? 'bg-[#061325] border-[#1E3A5F] text-slate-300 hover:text-amber-400 hover:border-amber-400/50'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-400'
        }`}
      >
        {/* Tiny favicon / university dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 group-hover:scale-125 transition-transform" />
        <span className="truncate max-w-[190px] sm:max-w-xs">{source.title}</span>
        <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-400 group-hover:text-amber-400 transition-colors" />
      </a>

      {/* Hover Preview Card Popup */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-72 sm:w-80 rounded-xl overflow-hidden border shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto"
          style={{
            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`border rounded-xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#081a32] border-amber-500/40 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {/* Header Thumbnail Image */}
            <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-900">
              <img
                src={thumbnailSrc}
                alt={`${source.title} thumbnail preview`}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081a32] via-transparent to-black/30" />

              {/* Source type badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{source.type || 'SMU Portal'}</span>
              </div>

              {/* Verified Domain Badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
                <Globe className="w-2.5 h-2.5" />
                <span>smu.ca</span>
              </div>
            </div>

            {/* Preview Card Details */}
            <div className="p-3 sm:p-3.5 space-y-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 text-amber-300">
                  {source.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {source.description || 'Verified official Saint Mary\'s University campus documentation, portal access, and institutional policies.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{source.lastUpdated || 'Current 2024-25'}</span>
                </span>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5"
                >
                  <span>Open Page</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
