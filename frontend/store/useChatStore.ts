import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  language: string;
  xpEarned: number;
  questionsAsked: number;
  createdAt: Date;
  achievementsUnlocked: string[];
}

interface ChatStore {
  // Session data
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Language
  language: 'en' | 'hi' | 'te' | 'ta';
  
  // Typing indicator
  isTyping: boolean;
  
  // Actions
  initializeSession: () => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLanguage: (language: 'en' | 'hi' | 'te' | 'ta') => void;
  setTyping: (typing: boolean) => void;
  addXP: (amount: number) => void;
  incrementQuestions: () => void;
  unlockAchievement: (achievement: string) => void;
  clearChat: () => void;
  getSessionHistory: () => ChatMessage[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      isLoading: false,
      error: null,
      language: 'en',
      isTyping: false,

      initializeSession: () => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({
          currentSession: {
            id: sessionId,
            messages: [],
            language: get().language,
            xpEarned: 0,
            questionsAsked: 0,
            createdAt: new Date(),
            achievementsUnlocked: [],
          },
        });
      },

      addMessage: (message: ChatMessage) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              messages: [...state.currentSession.messages, message],
            },
          };
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLanguage: (language: 'en' | 'hi' | 'te' | 'ta') => {
        set({ language });
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      addXP: (amount: number) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              xpEarned: state.currentSession.xpEarned + amount,
            },
          };
        });
      },

      incrementQuestions: () => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              questionsAsked: state.currentSession.questionsAsked + 1,
            },
          };
        });
      },

      unlockAchievement: (achievement: string) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              achievementsUnlocked: [
                ...state.currentSession.achievementsUnlocked,
                achievement,
              ],
            },
          };
        });
      },

      clearChat: () => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              messages: [],
              questionsAsked: 0,
            },
          };
        });
      },

      getSessionHistory: () => {
        const session = get().currentSession;
        return session?.messages || [];
      },
    }),
    {
      name: 'civic-chat-store',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);
