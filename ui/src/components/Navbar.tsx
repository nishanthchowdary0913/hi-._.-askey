import React, { useState } from 'react';
import {
  Shield,
  ExternalLink,
  Moon,
  Sun,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Info,
  Layers
} from 'lucide-react';
import { AppStateView } from '../types';

interface NavbarProps {
  currentView: AppStateView;
  setCurrentView: (view: AppStateView) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  studentName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  isDarkMode,
  setIsDarkMode,
  onOpenAbout,
  onOpenHelp,
  studentName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDarkMode
          ? 'bg-[#081a32]/90 border-[#1E3A5F]/70 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Mascot Logo Badge - User instruction: replace SMU college bot with "Hi ._. Askey" */}
        <div
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
          onClick={() => setCurrentView('portal')}
          title="Return to Welcome Portal"
        >
          {/* University Shield Icon Container */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-blue-900/40 to-slate-900 border border-amber-500/40 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:border-amber-400 transition-colors">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:scale-105 transition-transform" />
            </div>
            {/* Live Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#081a32] rounded-full shadow-sm" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight flex items-center gap-1.5">
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  Hi ._. Askey!
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded uppercase font-semibold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                  OFFICIAL AI
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block truncate">
              Ask questions about Saint Mary's University
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links & Controls */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs sm:text-sm font-medium">
          {/* Prominent Dual View Tabs: Login Portal vs Chat Assistant */}
          <div className="flex items-center p-1 rounded-xl bg-[#061325] border border-[#1E3A5F]">
            <button
              onClick={() => setCurrentView('portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'portal'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-white/5'
              }`}
              title="Open the Login & Authentication Portal with 3D Mascot"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Login Portal</span>
            </button>

            <button
              onClick={() => setCurrentView('conversation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView !== 'portal'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-blue-300 hover:bg-white/5'
              }`}
              title="Open the RAG Chat Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Assistant</span>
            </button>
          </div>

          <button
            onClick={onOpenAbout}
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 px-1 py-1"
          >
            <Info className="w-3.5 h-3.5 opacity-80" />
            <span>About</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 px-1 py-1"
          >
            <HelpCircle className="w-3.5 h-3.5 opacity-80" />
            <span>Help</span>
          </button>

          <a
            href="https://smu.ca/banner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 px-1 py-1"
          >
            <span>Student Portal</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* State Switcher Dropdown (From Image 1) */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[#061325] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
              <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <select
                aria-label="Application state selector"
                value={
                  currentView === 'portal'
                    ? 'portal'
                    : currentView === 'empty'
                    ? 'empty'
                    : 'conversation'
                }
                onChange={(e) => setCurrentView(e.target.value as AppStateView)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="conversation" className="bg-[#091a32] text-slate-200">
                  State: Full Conversation Flow
                </option>
                <option value="empty" className="bg-[#091a32] text-slate-200">
                  State: Empty / Suggestions
                </option>
                <option value="portal" className="bg-[#091a32] text-slate-200">
                  State: Welcome / Login Portal
                </option>
              </select>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-[#061325]/80 hover:bg-[#0c2447] border border-[#1E3A5F] text-slate-300 hover:text-amber-400 transition-colors"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </nav>

        {/* Tablet & Mobile Right Action Group */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick Chat/Portal shortcut button */}
          <button
            onClick={() => setCurrentView(currentView === 'portal' ? 'conversation' : 'portal')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              currentView === 'portal'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
            }`}
          >
            {currentView === 'portal' ? (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat View</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Login Portal</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg bg-[#061325] border border-[#1E3A5F] text-slate-300"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#061325] border border-[#1E3A5F] text-slate-200 hover:text-amber-400"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1E3A5F]/70 bg-[#07172c]/98 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView('portal');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentView === 'portal'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>Welcome Portal & 3D Mascot</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => {
                setCurrentView('conversation');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentView === 'conversation'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>Full Conversation Flow</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => {
                setCurrentView('empty');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentView === 'empty'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>Empty State / Suggested Questions</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/50 space-y-1">
            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>About Hi ._. Askey & RAG</span>
            </button>

            <button
              onClick={() => {
                onOpenHelp();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>IT Helpdesk & Student Contacts</span>
            </button>

            <a
              href="https://smu.ca/banner"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 flex items-center justify-between"
            >
              <span>Self-Service Banner</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {studentName && (
            <div className="pt-2 border-t border-slate-700/50 text-xs text-slate-400 flex items-center justify-between">
              <span>Active Student: <strong className="text-slate-200">{studentName}</strong></span>
              <span className="text-emerald-400 font-mono">Duo MFA Verified</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
