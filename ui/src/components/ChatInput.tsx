import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isDarkMode?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isDarkMode = true,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-CA';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 500);
    setText(val);

    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border p-2.5 sm:p-3 shadow-xl transition-all duration-200 relative ${
          isDarkMode
            ? 'bg-[#081a32]/95 border-[#1E3A5F] focus-within:border-amber-400/80 shadow-black/40'
            : 'bg-white border-slate-300 focus-within:border-blue-500 shadow-slate-200'
        }`}
      >
        <div className="flex items-end gap-2">
          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about Saint Mary's University..."
            disabled={isLoading}
            className={`w-full bg-transparent resize-none text-xs sm:text-sm px-2 py-1.5 focus:outline-none max-h-32 transition-colors ${
              isDarkMode
                ? 'text-slate-100 placeholder-slate-400'
                : 'text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Action Buttons: Mic & Send */}
          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            {/* Mic Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                  : isDarkMode
                  ? 'text-slate-400 hover:text-amber-400 hover:bg-white/5'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                !text.trim() || isLoading
                  ? isDarkMode
                    ? 'bg-[#0f2b52] text-slate-500 cursor-not-allowed border border-[#1E3A5F]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info from Image 1 */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1 border-t border-slate-700/20 mt-1">
          <div className="flex items-center gap-2 truncate">
            <span className="hidden sm:inline">
              Press <kbd className="font-mono bg-white/5 px-1 py-0.5 rounded border border-white/10">Enter ↵</kbd> to send, <kbd className="font-mono bg-white/5 px-1 py-0.5 rounded border border-white/10">Shift+Enter</kbd> for newline
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="font-mono text-slate-400 text-[10px]">Endpoint: POST /api/chat</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 flex-shrink-0 ml-2">
            {text.length}/500 chars
          </div>
        </div>
      </form>
    </div>
  );
};
