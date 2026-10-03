import React, { useState } from 'react';
import {
  User,
  ArrowRight,
  CheckCircle,
  Shield,
  Sparkles,
  BookOpen,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { Mascot3D } from './Mascot3D';

interface WelcomePortalProps {
  onStartSession: (name: string) => void;
  isDarkMode?: boolean;
}

export const WelcomePortal: React.FC<WelcomePortalProps> = ({
  onStartSession,
  isDarkMode = true,
}) => {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState<'idle' | 'duo' | 'verified'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (role === 'student' ? 'Huskies Student' : 'SMU Faculty');
    triggerSessionStart(finalName);
  };

  const handleGuest = () => {
    triggerSessionStart('Campus Guest');
  };

  const triggerSessionStart = (studentName: string) => {
    setIsAuthenticating(true);
    setAuthStage('duo');

    setTimeout(() => {
      setAuthStage('verified');
      setTimeout(() => {
        onStartSession(studentName);
      }, 700);
    }, 900);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Institutional Breadcrumb & Header */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-amber-300">
            Saint Mary's University • Enterprise Identity & Portal Authentication
          </h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
          Login Interface Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Left Column: Mascot 3D Showcase Card */}
        <section
          className="w-full flex flex-col justify-between"
          aria-label="3D Mascot Showcase"
        >
          <div
            className={`relative w-full h-full rounded-2xl border shadow-2xl p-5 sm:p-7 overflow-hidden flex flex-col items-center justify-between text-center min-h-[460px] sm:min-h-[580px] ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#0e2a4f]/70 via-[#0a1e38]/80 to-[#07172b]/95 border-amber-500/25 gold-glow-border text-slate-100'
                : 'bg-gradient-to-b from-blue-50/80 via-white to-slate-50 border-amber-500/30 shadow-blue-900/10 text-slate-900'
            }`}
          >
            {/* Ambient Background glows */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            {/* Top Status Bar in card */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Hi ._. Askey! Online
              </span>
              <span className="text-[11px] font-mono text-slate-400">SMU Campus AI</span>
            </div>

            {/* 3D Interactive Mascot Canvas */}
            <div className="relative w-full flex-grow flex items-center justify-center py-2">
              <Mascot3D />
            </div>

            {/* Bottom Card Label */}
            <div className="w-full pt-2 border-t border-white/5 z-10 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold tracking-wide uppercase text-[11px]">
                Interactive Campus Assistant
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Rotate with touch/mouse</span>
            </div>
          </div>
        </section>

        {/* Right Column: Authentication & Session Launch Card */}
        <section
          className="w-full flex flex-col justify-between"
          aria-label="Session Login Card"
        >
          <div
            className={`w-full h-full rounded-2xl border shadow-2xl p-6 sm:p-10 flex flex-col justify-center backdrop-blur-xl relative min-h-[460px] sm:min-h-[580px] ${
              isDarkMode
                ? 'bg-[#091a32]/95 border-[#1E3A5F]/90 text-slate-100 shadow-black/40'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <div className="max-w-md mx-auto w-full space-y-5">
              {/* Card Header */}
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Knowledge Base Assistant</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome to Hi ._. Askey!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                  Enter your SMU credentials or name to start chatting with your campus assistant.
                </p>
              </div>

              {/* Role Switcher Tabs (Student vs Faculty/Staff) */}
              <div className="p-1 rounded-xl bg-[#061325] border border-[#1E3A5F] grid grid-cols-2 gap-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'faculty'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Faculty / Staff</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="user-display-name"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    {role === 'student'
                      ? 'SMU Student ID (s-number) or Name'
                      : 'Faculty / Staff SMU Email or Name'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="user-display-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        role === 'student' ? 's1234567@smu.ca or Alex...' : 'firstname.lastname@smu.ca...'
                      }
                      disabled={isAuthenticating}
                      className={`block w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        isDarkMode
                          ? 'bg-[#061325]/90 border-[#1E3A5F] text-slate-100 placeholder-slate-500 focus:border-amber-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password / Passcode input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="user-password"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Campus Password
                    </label>
                    <span className="text-[11px] text-amber-400/80">Optional for demo</span>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isAuthenticating}
                      className={`block w-full pl-10 pr-10 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        isDarkMode
                          ? 'bg-[#061325]/90 border-[#1E3A5F] text-slate-100 placeholder-slate-500 focus:border-amber-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                      authStage === 'verified'
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                        : authStage === 'duo'
                        ? 'bg-amber-500/80 text-slate-950'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30'
                    }`}
                  >
                    {authStage === 'duo' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating with Duo MFA...</span>
                      </>
                    ) : authStage === 'verified' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        <span>Session Verified! Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Session</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Instant Guest / Skip */}
                <div className="pt-2 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-[#1E3A5F]/60">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Instant guest access enabled
                  </span>
                  <button
                    type="button"
                    onClick={handleGuest}
                    className="hover:text-amber-400 transition-colors text-slate-300 underline-offset-2 hover:underline cursor-pointer"
                  >
                    Skip & continue as Guest ➔
                  </button>
                </div>
              </form>

              {/* Quick links banner in card */}
              <div className="pt-2 border-t border-[#1E3A5F]/40">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Popular SMU Resources:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="https://smu.ca/banner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#061325]/60 hover:bg-[#0c2447] border border-[#1E3A5F] flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">Self-Service Banner</span>
                  </a>
                  <a
                    href="https://smu.ca/library"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#061325]/60 hover:bg-[#0c2447] border border-[#1E3A5F] flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">Patrick Power Library</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
