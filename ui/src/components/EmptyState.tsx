import React from 'react';
import {
  GraduationCap,
  KeyRound,
  BookOpen,
  CircleDollarSign,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SUGGESTED_QUESTIONS_LIST } from '../data/initialConversation';

interface EmptyStateProps {
  onSelectQuestion: (question: string) => void;
  isDarkMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectQuestion,
  isDarkMode = true,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'key':
        return <KeyRound className="w-4 h-4 text-amber-400" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'dollar':
        return <CircleDollarSign className="w-4 h-4 text-amber-400" />;
      case 'pin':
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 max-w-3xl mx-auto px-2">
      {/* Icon Badge */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0c264a] to-[#061325] border border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-500/10 mb-5 relative group">
        <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B2341] animate-pulse" />
      </div>

      {/* Main Heading */}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-2.5 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}
      >
        How can I help you today?
      </h2>

      <p
        className={`text-sm sm:text-base text-center max-w-lg mb-8 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        Ask about courses, admissions, scholarships, student services, the library, and more.
      </p>

      {/* Suggested Questions Section */}
      <div className="w-full">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3 px-1">
          <span>SUGGESTED QUESTIONS</span>
          <span className="text-amber-400">CLICK TO ASK INSTANTLY</span>
        </div>

        {/* 2-column or stacked grid matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {SUGGESTED_QUESTIONS_LIST.slice(0, 4).map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(item.title)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3 transition-all duration-150 group cursor-pointer ${
                isDarkMode
                  ? 'bg-[#091a32]/80 hover:bg-[#0e274b] border-[#1E3A5F]/90 hover:border-amber-400/60 shadow-md'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400 shadow-sm'
              }`}
            >
              <div
                className={`p-2 rounded-lg border mt-0.5 flex-shrink-0 transition-colors ${
                  isDarkMode
                    ? 'bg-[#061325] border-[#1E3A5F] group-hover:border-amber-400/50'
                    : 'bg-slate-100 border-slate-200 group-hover:border-amber-400'
                }`}
              >
                {getIcon(item.icon)}
              </div>
              <div className="min-w-0">
                <span
                  className={`text-xs sm:text-sm font-medium leading-snug line-clamp-2 ${
                    isDarkMode
                      ? 'text-slate-200 group-hover:text-amber-300'
                      : 'text-slate-800 group-hover:text-amber-700'
                  }`}
                >
                  “{item.title}”
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">
                  {item.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 5th wide question card matching Image 1 layout */}
        {SUGGESTED_QUESTIONS_LIST[4] && (
          <button
            onClick={() => onSelectQuestion(SUGGESTED_QUESTIONS_LIST[4].title)}
            className={`w-full p-3.5 sm:p-4 rounded-xl border text-left flex items-center gap-3 transition-all duration-150 group cursor-pointer ${
              isDarkMode
                ? 'bg-[#091a32]/80 hover:bg-[#0e274b] border-[#1E3A5F]/90 hover:border-amber-400/60 shadow-md'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400 shadow-sm'
            }`}
          >
            <div
              className={`p-2 rounded-lg border flex-shrink-0 transition-colors ${
                isDarkMode
                  ? 'bg-[#061325] border-[#1E3A5F] group-hover:border-amber-400/50'
                  : 'bg-slate-100 border-slate-200 group-hover:border-amber-400'
              }`}
            >
              {getIcon(SUGGESTED_QUESTIONS_LIST[4].icon)}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isDarkMode
                    ? 'text-slate-200 group-hover:text-amber-300'
                    : 'text-slate-800 group-hover:text-amber-700'
                }`}
              >
                “{SUGGESTED_QUESTIONS_LIST[4].title}”
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {SUGGESTED_QUESTIONS_LIST[4].category}
            </span>
          </button>
        )}

        {/* Grounded Citation Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400 text-center">
          <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Grounded responses only. Answers cite official Saint Mary's University documentation.
          </span>
        </div>
      </div>
    </div>
  );
};
