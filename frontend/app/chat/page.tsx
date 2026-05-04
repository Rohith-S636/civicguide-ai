'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Send,
  Mic,
  Settings,
  Trash2,
  ChevronDown,
  Clock,
  Zap,
  Volume2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  Menu,
  X,
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useChatStore, ChatMessage } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

interface SpeechRecognitionResultLike {
  readonly transcript: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstanceLike {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
}

interface SpeechRecognitionWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike;
  SpeechRecognition?: new () => SpeechRecognitionInstanceLike;
}

// Language configuration with flags
const LANGUAGE_CONFIG = {
  en: { flag: '🇮🇳', label: 'English', code: 'en' },
  hi: { flag: '🇮🇳', label: 'हिंदी', code: 'hi' },
  te: { flag: '🇮🇳', label: 'తెలుగు', code: 'te' },
  ta: { flag: '🇮🇳', label: 'தமிழ்', code: 'ta' },
} as const;

// Suggested questions based on language
const SUGGESTED_QUESTIONS = {
  en: [
    'How do I register to vote?',
    'What is Form 6?',
    'How does VVPAT work?',
    'What are election model codes?',
  ],
  hi: [
    'मुझे वोट के लिए पंजीकरण कैसे करें?',
    'फॉर्म 6 क्या है?',
    'VVPAT कैसे काम करता है?',
    'चुनाव मॉडल कोड क्या हैं?',
  ],
  te: [
    'నేను ఓటు కోసం ఎలా నమోదు చేయాలి?',
    'ఫారం 6 ఏమిటి?',
    'VVPAT ఎలా పనిచేస్తుంది?',
    'ఎన్నికల మోడల్ కోడ్‌లు ఏమిటి?',
  ],
  ta: [
    'நான் வாக்களிப்புக்கு எவ்வாறு பதிவு செய்ய வேண்டும்?',
    'Form 6 என்றால் என்ன?',
    'VVPAT எவ்வாறு செயல்படுகிறது?',
    'தேர்தல் மாடல் குறியீடுகள் என்ன?',
  ],
} as const;

// Message component with markdown support
const MessageBubble: React.FC<{
  message: ChatMessage;
  onCopy?: () => void;
}> = ({ message, onCopy }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-civic flex items-center justify-center text-white font-bold text-sm">
          CG
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-xs md:max-w-md lg:max-w-lg`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-gradient-civic text-white rounded-br-none'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-2 last:mb-0" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-2 last:mb-0" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-india-green" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) => (
                    <code
                      className={
                        inline
                          ? 'bg-gray-100 px-2 py-0.5 rounded text-navy font-mono text-xs'
                          : 'block bg-gray-100 p-2 rounded mb-2 overflow-x-auto font-mono text-xs'
                      }
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-saffron hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message metadata and actions */}
        <div className="flex items-center justify-between gap-2 px-2 text-xs text-gray-500">
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && (
            <button
              onClick={onCopy}
              className="hover:text-gray-700 transition-colors"
              title="Copy message"
              aria-label="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-civic flex items-center justify-center text-white font-bold text-sm">
        CG
      </div>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-gray-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

// Language selector component
const LanguageSelector: React.FC<{
  value: 'en' | 'hi' | 'te' | 'ta';
  onChange: (lang: 'en' | 'hi' | 'te' | 'ta') => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 hover:border-saffron hover:bg-gradient-civic-light transition-colors flex items-center justify-between gap-2 text-sm font-medium"
      >
        <span>
          {LANGUAGE_CONFIG[value].flag} {LANGUAGE_CONFIG[value].label}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-civic-lg z-50"
          >
            {(Object.entries(LANGUAGE_CONFIG) as Array<[string, typeof LANGUAGE_CONFIG[keyof typeof LANGUAGE_CONFIG]]>).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onChange(key as 'en' | 'hi' | 'te' | 'ta');
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gradient-civic-light transition-colors flex items-center gap-2 text-sm ${
                    value === key
                      ? 'bg-gradient-civic-light text-saffron font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span>{config.flag}</span>
                  <span>{config.label}</span>
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Suggested questions component
const SuggestedQuestions: React.FC<{
  language: 'en' | 'hi' | 'te' | 'ta';
  onSelect: (question: string) => void;
}> = ({ language, onSelect }) => {
  const questions = SUGGESTED_QUESTIONS[language];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Popular Questions
      </p>
      <div className="space-y-2">
        {questions.map((question, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(question)}
            className="w-full text-left p-3 rounded-lg bg-gradient-civic-light hover:bg-gradient-civic border border-gray-200 hover:border-saffron transition-all group"
          >
            <p className="text-xs text-gray-700 group-hover:text-gray-900 font-medium leading-relaxed">
              {question}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Main Chat Page
export default function ChatPage() {
  const t = useTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Chat store
  const {
    currentSession,
    isLoading,
    error,
    language,
    isTyping,
    initializeSession,
    addMessage,
    setLoading,
    setError,
    setLanguage,
    setTyping,
    addXP,
    incrementQuestions,
    unlockAchievement,
    clearChat,
  } = useChatStore();

  // Auth store
  const { user } = useAuthStore();

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [rapidMessageTimestamps, setRapidMessageTimestamps] = useState<number[]>([]);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      initializeSession();
    }
  }, [currentSession, initializeSession]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isTyping]);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCooldownUntil(null);
      setRateLimitMessage(null);
      setRapidMessageTimestamps([]);
    }, Math.max(0, cooldownUntil - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [cooldownUntil]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 500);
    setInputValue(value);
    setCharacterCount(value.length);
  };

  // Copy message to clipboard
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  // Voice input handler
  const handleVoiceInput = useCallback(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.language = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.loading('Listening...');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i].transcript;
      }
      if (transcript) {
        setInputValue(transcript);
        setCharacterCount(transcript.length);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  }, [language]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentSession) {
      return;
    }

    const now = Date.now();
    const recentRapidMessages = rapidMessageTimestamps.filter((timestamp) => now - timestamp < 30000);

    if (cooldownUntil && now < cooldownUntil) {
      setRateLimitMessage('Please wait a moment before sending another message.');
      toast.error('Please wait a moment before sending another message.');
      return;
    }

    if (recentRapidMessages.length >= 3) {
      const nextCooldown = now + 30000;
      setCooldownUntil(nextCooldown);
      setRateLimitMessage('Please wait 30 seconds before sending another message.');
      toast.error('Please wait 30 seconds before sending another message.');
      return;
    }

    setRapidMessageTimestamps([...recentRapidMessages, now]);
    setRateLimitMessage(null);

    const messageContent = inputValue.trim();
    setInputValue('');
    setCharacterCount(0);

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      language,
    };

    addMessage(userMessage);
    incrementQuestions();

    // Check for first question achievement
    if (currentSession.messages.length === 0) {
      unlockAchievement('first_question');
      toast.success('🎉 Achievement Unlocked: First Question!');
    }

    // Show XP toast
    toast.success('+5 XP for asking a question', {
      icon: <Zap className="w-4 h-4" />,
    });
    addXP(5);

    // Show typing indicator
    setLoading(true);
    setTyping(true);

    try {
      // Prepare request data
      const requestData = {
        message: messageContent,
        language,
        session_id: currentSession.id,
        history: currentSession.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Call API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      // Handle streaming response
      let aiContent = '';

      // For browser-based streaming
      if (response.data instanceof ReadableStream) {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          aiContent += chunk;
        }
      } else {
        // Fallback for non-streaming responses
        aiContent = response.data.response || response.data.message || 'Response received';
      }

      setTyping(false);

      // Add AI message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'ai',
        content: aiContent,
        timestamp: new Date(),
        language,
      };

      addMessage(aiMessage);

      // Add bonus XP for receiving response
      addXP(2);
      toast.success('+2 XP for learning', {
        icon: <Zap className="w-4 h-4" />,
      });

      setError(null);
    } catch (err: unknown) {
      setTyping(false);
      const errorMessage =
        axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message || 'Failed to get response. Please try again.'
          : err instanceof Error
          ? err.message
          : 'Failed to get response. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }

    // Focus input
    inputRef.current?.focus();
  };

  // Handle suggested question click
  const handleSuggestedQuestionClick = (question: string) => {
    setInputValue(question);
    setCharacterCount(question.length);
    inputRef.current?.focus();
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: 'en' | 'hi' | 'te' | 'ta') => {
    setLanguage(newLanguage);
  };

  // Handle clear chat
  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearChat();
      toast.success('Chat cleared');
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-saffron" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white overflow-hidden">
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-civic rounded-lg flex items-center justify-center text-white font-bold">
                  CG
                </div>
                CivicGuide AI Chat
              </h1>
              <p className="text-sm text-gray-600">Ask questions about elections and civics</p>
            </div>

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isMobileSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {currentSession.messages.length === 0 && !isTyping ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex items-center justify-center text-center"
            >
              <div>
                <div className="w-20 h-20 bg-gradient-civic-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-saffron" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Start Your Civic Learning Journey
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-6">
                  Ask anything about elections, voting, the Indian Constitution, or civic participation.
                  Our AI is here to help you become an informed citizen.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>💡 Tips:</p>
                  <ul className="space-y-1 text-left inline-block">
                    <li>• Ask about voter registration processes</li>
                    <li>• Understand electoral forms</li>
                    <li>• Learn about voting technology</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {currentSession.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={() => handleCopyMessage(message.content)}
                />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>

              {/* Error state */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Character counter and actions */}
            <div className="flex items-center justify-between text-xs text-gray-500 gap-3 flex-wrap">
              <span>
                {characterCount} / 500 characters
              </span>
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            {rateLimitMessage && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                {rateLimitMessage}
              </p>
            )}

            {/* Input and buttons */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Ask about elections, voting, or civics in ${LANGUAGE_CONFIG[language].label}...`}
                  disabled={isLoading || Boolean(rateLimitMessage)}
                  aria-label="Ask CivicGuide AI a question"
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Voice button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceInput}
                disabled={isLoading || isListening || Boolean(rateLimitMessage)}
                className={`p-3 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Voice input"
                aria-label="Voice input"
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </motion.button>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || Boolean(rateLimitMessage)}
                className="p-3 rounded-lg bg-gradient-civic text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-civic-md"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <Send className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: 'calc(100% + 10px)' }}
        animate={{ x: isMobileSidebarOpen ? 0 : 'calc(100% + 10px)' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-gradient-civic-light border-l border-gray-200 p-6 overflow-y-auto lg:static lg:translate-x-0 z-40"
      >
        <div className="space-y-6">
          {/* XP Display */}
          <Card className="bg-gradient-civic text-white border-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold opacity-90">Session XP</span>
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-3xl font-bold">{currentSession.xpEarned}</div>
              <p className="text-xs opacity-75 mt-2">
                {currentSession.questionsAsked} questions asked
              </p>
            </div>
          </Card>

          {/* Language Selector */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Language
            </p>
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>

          {/* Suggested Questions */}
          <SuggestedQuestions
            language={language}
            onSelect={handleSuggestedQuestionClick}
          />

          {/* Achievements */}
          {currentSession.achievementsUnlocked.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Achievements
              </p>
              <div className="space-y-2">
                {currentSession.achievementsUnlocked.map((achievement) => (
                  <motion.div
                    key={achievement}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gold/30 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-india-green flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700">
                      {achievement === 'first_question' && 'First Question!'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-4">
              <div className="flex gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-navy">Tip</p>
                  <p className="text-xs text-navy/80 leading-relaxed">
                    Use the microphone button to ask questions by voice in your preferred language.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Help Links */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <Link
              href="/learn"
              className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-center bg-white border border-gray-200 hover:border-saffron hover:bg-gradient-civic-light transition-all"
            >
              Learning Resources
            </Link>
            <Link
              href="/community/news"
              className="block w-full px-3 py-2 rounded-lg text-sm font-medium text-center bg-saffron text-white hover:bg-orange-600 transition-colors"
            >
              Latest News
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
