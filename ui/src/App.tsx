/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopInstitutionalBar } from './components/TopInstitutionalBar';
import { Navbar } from './components/Navbar';
import { WelcomePortal } from './components/WelcomePortal';
import { ChatView } from './components/ChatView';
import { Footer } from './components/Footer';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';
import { AppStateView, CategoryOption, ChatMessageItem } from './types';
import { INITIAL_CONVERSATION_DATA } from './data/initialConversation';

export default function App() {
  const [currentView, setCurrentView] = useState<AppStateView>('portal');
  const [studentName, setStudentName] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('All categories');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // Handle switching views from Navbar dropdown
  const handleStateChange = (newView: AppStateView) => {
    setCurrentView(newView);
    if (newView === 'empty') {
      setMessages([]);
    } else if (newView === 'conversation' && messages.length === 0) {
      setMessages(INITIAL_CONVERSATION_DATA);
    }
  };

  const handleStartSession = (name: string) => {
    setStudentName(name);
    setCurrentView('conversation');
    setMessages([]);
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentView('empty');
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: `Today, ${userTimestamp}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentView('conversation');
    setIsLoading(true);

    try {
      // Call real backend endpoint POST /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          category: selectedCategory,
          studentName: studentName || 'Huskies Student',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const botMessage: ChatMessageItem = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'I could not retrieve an answer at this moment. Please check with the Service Centre or IT Helpdesk.',
        timestamp: `Today, ${data.timestamp || userTimestamp}`,
        confidence: data.confidence || 0.95,
        sources: data.sources || [
          {
            title: "Saint Mary's University Academic Portal",
            url: "https://smu.ca",
            type: "Official Catalog",
          },
        ],
        suggestedFollowUps: data.suggestedFollowUps || [
          'How do I access Self-Service Banner?',
          'Where is the Patrick Power Library?',
        ],
        model: data.model,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      // Never invent an answer when the cloud RAG endpoint is unavailable.
      const fallbackBotMessage: ChatMessageItem = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: 'I could not connect to the SMU knowledge engine. Please try again shortly.',
        timestamp: `Today, ${userTimestamp}`,
        confidence: 0,
        sources: [],
      };
      setMessages((prev) => [...prev, fallbackBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode
          ? 'smu-glow-bg text-slate-100'
          : 'smu-glow-bg-light text-slate-800'
      }`}
    >
      {/* 1. Top Institutional Verification Bar */}
      <TopInstitutionalBar isDarkMode={isDarkMode} />

      {/* 2. Main Navigation Header with Hi ._. Askey branding & state controls */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleStateChange}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        studentName={studentName}
      />

      {/* 3. Main Body Content */}
      <main className="flex-grow flex flex-col items-center justify-start w-full">
        {currentView === 'portal' ? (
          <WelcomePortal
            onStartSession={handleStartSession}
            isDarkMode={isDarkMode}
          />
        ) : (
          <ChatView
            messages={currentView === 'empty' ? [] : messages}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onGoToLogin={() => setCurrentView('portal')}
            studentName={studentName}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* 4. Institutional Portal Footer */}
      <Footer isDarkMode={isDarkMode} onOpenHelp={() => setHelpModalOpen(true)} />

      {/* 5. Modals */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        isDarkMode={isDarkMode}
      />
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
