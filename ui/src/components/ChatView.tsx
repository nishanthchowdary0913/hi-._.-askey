import React, { useRef, useEffect } from 'react';
import { CategoryFilterBar } from './CategoryFilterBar';
import { EmptyState } from './EmptyState';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessageItem, CategoryOption } from '../types';
import { Loader2, ArrowDown } from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
  selectedCategory: CategoryOption;
  setSelectedCategory: (cat: CategoryOption) => void;
  onSendMessage: (query: string) => void;
  onClearChat: () => void;
  onGoToLogin?: () => void;
  studentName?: string;
  isDarkMode?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  selectedCategory,
  setSelectedCategory,
  onSendMessage,
  onClearChat,
  onGoToLogin,
  studentName,
  isDarkMode = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Filter messages if category is chosen (optional view filter)
  const displayedMessages = messages;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 flex-grow flex flex-col justify-between py-3 sm:py-6">
      {/* Category filter bar */}
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onClearChat={onClearChat}
        onGoToLogin={onGoToLogin}
        studentName={studentName}
        messages={displayedMessages}
        isDarkMode={isDarkMode}
      />

      {/* Messages or Empty State Container */}
      <div
        ref={containerRef}
        className={`flex-grow rounded-2xl border p-3 sm:p-6 mb-4 min-h-[460px] sm:min-h-[540px] flex flex-col shadow-xl backdrop-blur-md overflow-y-auto transition-colors ${
          isDarkMode
            ? 'bg-[#081a32]/60 border-[#1E3A5F]/70'
            : 'bg-white/80 border-slate-200'
        }`}
      >
        {displayedMessages.length === 0 ? (
          <EmptyState
            onSelectQuestion={onSendMessage}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="space-y-2 flex-grow">
            {displayedMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSelectFollowUp={onSendMessage}
                isDarkMode={isDarkMode}
              />
            ))}

            {/* Loading / RAG Retrieval State */}
            {isLoading && (
              <div className="flex flex-col my-4 max-w-2xl mr-auto px-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  </div>
                  <span className="text-xs font-semibold text-amber-400">
                    Hi ._. Askey!
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Querying Saint Mary's University Academic Catalog & Banner Records...
                  </span>
                </div>
                <div
                  className={`rounded-2xl border p-4 text-xs sm:text-sm shadow-md animate-pulse ${
                    isDarkMode
                      ? 'bg-[#091a32] border-[#1E3A5F] text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Searching verified SMU Halifax databases and synthesizing answer...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Dock */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
