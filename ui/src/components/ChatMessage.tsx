import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap
} from 'lucide-react';
import { ChatMessageItem } from '../types';
import { SourceLinkWithPreview } from './SourceLinkWithPreview';

interface ChatMessageProps {
  message: ChatMessageItem;
  onSelectFollowUp?: (query: string) => void;
  isDarkMode?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectFollowUp,
  isDarkMode = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = message.content
      .replace(/[#*`_~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to render markdown-like text nicely
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3: ###
      if (line.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className={`text-base sm:text-lg font-bold mt-3 mb-1.5 ${
              isDarkMode ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 2: ##
      if (line.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className={`text-lg sm:text-xl font-bold mt-4 mb-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {line.replace('## ', '')}
          </h2>
        );
      }
      // List items starting with * or -
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc my-1 text-xs sm:text-sm leading-relaxed">
            {parseInlineMarkdown(itemText)}
          </li>
        );
      }
      // Numbered list item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal my-1 text-xs sm:text-sm leading-relaxed">
            {parseInlineMarkdown(numMatch[2])}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed my-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Parse bold and links
  const parseInlineMarkdown = (text: string) => {
    // Replace **bold**
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-blue-950/60 border border-blue-500/30 text-amber-300"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-medium inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </a>
        );
      }
      return part;
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end my-3 sm:my-4 max-w-2xl ml-auto px-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 pr-1">
          <span>You</span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 max-w-full text-xs sm:text-sm shadow-md leading-relaxed border ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#10305a] to-[#0a2344] text-slate-100 border-[#1E3A5F]'
              : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-blue-600'
          }`}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant / Bot message
  return (
    <div className="flex flex-col my-4 sm:my-6 max-w-3xl mr-auto w-full px-2">
      {/* Bot Header info */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-blue-900 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Hi ._. Askey!
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase font-semibold tracking-wider">
            Verified RAG
          </span>
          {message.confidence && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-3 h-3" />
              {Math.round(message.confidence * 100)}% Grounded
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-400">{message.timestamp}</span>
      </div>

      {/* Message Card */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-lg relative transition-all ${
          isDarkMode
            ? 'bg-[#091a32]/90 border-[#1E3A5F]/90 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800 shadow-md'
        }`}
      >
        {/* Content body */}
        <div className="space-y-1.5">
          {renderFormattedContent(message.content)}
        </div>

        {/* Sources citation section */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-700/40">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified SMU Institutional Sources ({message.sources.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <SourceLinkWithPreview
                  key={i}
                  source={src}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggested follow-ups */}
        {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && onSelectFollowUp && (
          <div className="mt-3.5 pt-3 border-t border-slate-700/40">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Related Campus Inquiries:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowUps.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectFollowUp(prompt)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all text-left ${
                    isDarkMode
                      ? 'bg-[#0c2447]/60 hover:bg-[#10305a] border-blue-500/30 hover:border-amber-400/60 text-blue-200 hover:text-amber-300'
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 hover:text-blue-950'
                  }`}
                >
                  “{prompt}” ➔
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Toolbar */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:text-amber-400 transition-colors flex items-center gap-1"
              title="Copy message to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleSpeak}
              className={`p-1 rounded transition-colors flex items-center gap-1 ${
                speaking ? 'text-amber-400 animate-pulse' : 'hover:text-amber-400'
              }`}
              title={speaking ? 'Stop speech' : 'Read aloud with Text-to-Speech'}
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{speaking ? 'Stop' : 'Listen'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] hidden sm:inline">Was this helpful?</span>
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1 rounded transition-colors ${
                feedback === 'up' ? 'text-emerald-400' : 'hover:text-emerald-400'
              }`}
              title="Helpful response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1 rounded transition-colors ${
                feedback === 'down' ? 'text-rose-400' : 'hover:text-rose-400'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
