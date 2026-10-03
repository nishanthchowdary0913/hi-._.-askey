import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  Trash2,
  ChevronDown,
  Download,
  FileText,
  Code2,
  Check
} from 'lucide-react';
import { CategoryOption, ChatMessageItem } from '../types';
import { exportChatAsMarkdown, exportChatAsJSON } from '../utils/exportChat';

interface CategoryFilterBarProps {
  selectedCategory: CategoryOption;
  setSelectedCategory: (cat: CategoryOption) => void;
  onClearChat: () => void;
  onGoToLogin?: () => void;
  studentName?: string;
  messages?: ChatMessageItem[];
  isDarkMode?: boolean;
}

const CATEGORIES: CategoryOption[] = [
  'All categories',
  'Admissions & Tuition',
  'Courses & Registration',
  'Scholarships & Financial Aid',
  'Campus Life & Library',
  'IT & Banner Services',
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  setSelectedCategory,
  onClearChat,
  onGoToLogin,
  studentName = 'Alex',
  messages = [],
  isDarkMode = true,
}) => {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };
    if (downloadMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [downloadMenuOpen]);

  const handleExportMarkdown = () => {
    exportChatAsMarkdown(messages, studentName);
    setDownloadMenuOpen(false);
    setDownloadSuccess('MD');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportJSON = () => {
    exportChatAsJSON(messages, studentName);
    setDownloadMenuOpen(false);
    setDownloadSuccess('JSON');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div
      className={`w-full max-w-5xl mx-auto rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-2.5 sm:py-3 shadow-sm transition-all mb-4 ${
        isDarkMode
          ? 'bg-[#081a32]/80 border-[#1E3A5F]/80 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Filter Section */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-amber-400 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">FILTER BY CATEGORY:</span>
            <span className="xs:hidden">FILTER:</span>
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <select
              aria-label="Filter campus knowledge base by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryOption)}
              className={`w-full sm:w-auto appearance-none text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-1.5 border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                isDarkMode
                  ? 'bg-[#061325] border-[#1E3A5F] text-slate-100 hover:border-amber-400/60'
                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-amber-500'
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className={isDarkMode ? 'bg-[#061325] text-slate-100' : 'bg-white text-slate-800'}
                >
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Status & Action Section */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto text-xs">
          {/* Direct Login Page Shortcut */}
          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
              }`}
              title="Open the Login interface page to switch student or authenticate"
            >
              <span>🔐 Login Portal</span>
              <span className="font-mono text-[10px] opacity-75 hidden md:inline">
                ({studentName || 'Alex'})
              </span>
            </button>
          )}

          {/* Index Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
              isDarkMode
                ? 'bg-[#061325]/90 border-[#1E3A5F] text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-400">Index:</span>
            <span className="text-amber-400 font-bold">SMU-2024.3</span>
          </div>

          {/* Download Chat Dropdown Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => hasMessages && setDownloadMenuOpen(!downloadMenuOpen)}
              disabled={!hasMessages}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
                !hasMessages
                  ? isDarkMode
                    ? 'bg-[#061325]/50 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : downloadSuccess
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : isDarkMode
                  ? 'bg-blue-950/80 hover:bg-blue-900 border-blue-500/40 text-blue-200 hover:text-white cursor-pointer active:scale-95'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 cursor-pointer active:scale-95'
              }`}
              title={hasMessages ? 'Download and export conversation history' : 'No messages to export'}
              aria-label="Download Chat Conversation"
              aria-expanded={downloadMenuOpen}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Exported ({downloadSuccess})</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Chat</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {downloadMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-56 rounded-xl border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 ${
                  isDarkMode
                    ? 'bg-[#081a32] border-[#1E3A5F] text-slate-100'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                style={{
                  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))',
                }}
              >
                <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                  <p className="text-[11px] font-bold text-amber-300">Export Chat History</p>
                  <p className="text-[10px] text-slate-400">Save session notes for study</p>
                </div>

                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block font-semibold">Markdown (.md)</span>
                      <span className="block text-[10px] text-slate-400">Formatted study document</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    MD
                  </span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group mt-1"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block font-semibold">JSON (.json)</span>
                      <span className="block text-[10px] text-slate-400">Machine-readable data</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    JSON
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={onClearChat}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Clear current conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Clear chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
