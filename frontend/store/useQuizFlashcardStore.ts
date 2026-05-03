import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QuizDifficulty = 'beginner' | 'student' | 'exam';
export type QuizCategory = 'general_election' | 'constitution' | 'voting_process' | 'current_affairs' | 'state_elections';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  language: string;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  xpEarned: number;
  difficulty: QuizDifficulty;
  category: QuizCategory;
  language: string;
  startTime: number;
  endTime: number | null;
  status: 'in_progress' | 'completed';
}

interface QuizStore {
  // Session state
  currentSession: QuizSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeQuiz: (difficulty: QuizDifficulty, category: QuizCategory, language: string, questions: QuizQuestion[]) => void;
  answerQuestion: (questionId: string, selectedAnswer: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number };
  getScore: () => { correct: number; total: number };
  calculateXP: () => number;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      isLoading: false,
      error: null,

      initializeQuiz: (difficulty, category, language, questions) => {
        const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set({
          currentSession: {
            id: sessionId,
            questions,
            currentQuestionIndex: 0,
            answers: [],
            score: 0,
            xpEarned: 0,
            difficulty,
            category,
            language,
            startTime: Date.now(),
            endTime: null,
            status: 'in_progress',
          },
          error: null,
        });
      },

      answerQuestion: (questionId, selectedAnswer) => {
        set((state) => {
          if (!state.currentSession) return state;

          const question = state.currentSession.questions.find((q) => q.id === questionId);
          if (!question) return state;

          const isCorrect = question.correctAnswer === selectedAnswer;
          const newScore = state.currentSession.score + (isCorrect ? 1 : 0);

          return {
            currentSession: {
              ...state.currentSession,
              answers: [
                ...state.currentSession.answers,
                { questionId, selectedAnswer },
              ],
              score: newScore,
            },
          };
        });
      },

      nextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const nextIndex = state.currentSession.currentQuestionIndex + 1;
          
          if (nextIndex >= state.currentSession.questions.length) {
            return {
              currentSession: {
                ...state.currentSession,
                status: 'completed',
                endTime: Date.now(),
                xpEarned: get().calculateXP(),
              },
            };
          }

          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: nextIndex,
            },
          };
        });
      },

      previousQuestion: () => {
        set((state) => {
          if (!state.currentSession || state.currentSession.currentQuestionIndex === 0) {
            return state;
          }
          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: state.currentSession.currentQuestionIndex - 1,
            },
          };
        });
      },

      completeQuiz: () => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              status: 'completed',
              endTime: Date.now(),
              xpEarned: get().calculateXP(),
            },
          };
        });
      },

      resetQuiz: () => {
        set({ currentSession: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      getCurrentQuestion: () => {
        const session = get().currentSession;
        if (!session) return null;
        return session.questions[session.currentQuestionIndex] || null;
      },

      getProgress: () => {
        const session = get().currentSession;
        if (!session) return { current: 0, total: 0 };
        return {
          current: session.currentQuestionIndex + 1,
          total: session.questions.length,
        };
      },

      getScore: () => {
        const session = get().currentSession;
        if (!session) return { correct: 0, total: 0 };
        return {
          correct: session.score,
          total: session.questions.length,
        };
      },

      calculateXP: () => {
        const session = get().currentSession;
        if (!session) return 0;

        const baseXP = session.score * 10;
        const difficultyMultiplier =
          session.difficulty === 'exam' ? 1.5 : session.difficulty === 'student' ? 1.2 : 1;
        const speedBonus =
          session.endTime && session.startTime
            ? Math.max(0, 50 - Math.floor((session.endTime - session.startTime) / 1000))
            : 0;

        return Math.floor(baseXP * difficultyMultiplier + speedBonus);
      },
    }),
    {
      name: 'civic-quiz-store',
    }
  )
);

// ============================================================================
// FLASHCARD STORE
// ============================================================================

export interface Flashcard {
  id: string;
  category: 'terms' | 'processes' | 'articles' | 'people' | 'events';
  term: string;
  definition: string;
  example?: string;
  language: string;
}

export interface FlashcardSession {
  cards: Flashcard[];
  currentCardIndex: number;
  starredCards: string[];
  learnedCards: string[];
  studyMode: 'all' | 'starred' | 'not_learned';
  language: string;
}

interface FlashcardStore {
  // Session state
  currentSession: FlashcardSession | null;
  isFlipped: boolean;
  isShuffled: boolean;

  // Actions
  initializeFlashcards: (cards: Flashcard[], language: string) => void;
  nextCard: () => void;
  previousCard: () => void;
  shuffleCards: () => void;
  toggleFlip: () => void;
  toggleStar: (cardId: string) => void;
  toggleLearned: (cardId: string) => void;
  setStudyMode: (mode: 'all' | 'starred' | 'not_learned') => void;
  resetFlashcards: () => void;

  // Getters
  getCurrentCard: () => Flashcard | null;
  getVisibleCards: () => Flashcard[];
  getProgress: () => { current: number; total: number };
  getStatistics: () => { total: number; starred: number; learned: number };
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      isFlipped: false,
      isShuffled: false,

      initializeFlashcards: (cards, language) => {
        set({
          currentSession: {
            cards,
            currentCardIndex: 0,
            starredCards: [],
            learnedCards: [],
            studyMode: 'all',
            language,
          },
          isFlipped: false,
        });
      },

      nextCard: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const visibleCards = get().getVisibleCards();
          const nextIndex = Math.min(
            state.currentSession.currentCardIndex + 1,
            visibleCards.length - 1
          );
          return {
            currentSession: {
              ...state.currentSession,
              currentCardIndex: nextIndex,
            },
            isFlipped: false,
          };
        });
      },

      previousCard: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const previousIndex = Math.max(state.currentSession.currentCardIndex - 1, 0);
          return {
            currentSession: {
              ...state.currentSession,
              currentCardIndex: previousIndex,
            },
            isFlipped: false,
          };
        });
      },

      shuffleCards: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const visibleCards = get().getVisibleCards();
          const shuffled = [...visibleCards].sort(() => Math.random() - 0.5);

          return {
            currentSession: {
              ...state.currentSession,
              cards: shuffled,
              currentCardIndex: 0,
            },
            isFlipped: false,
            isShuffled: !state.isShuffled,
          };
        });
      },

      toggleFlip: () => {
        set((state) => ({
          isFlipped: !state.isFlipped,
        }));
      },

      toggleStar: (cardId) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              starredCards: state.currentSession.starredCards.includes(cardId)
                ? state.currentSession.starredCards.filter((id) => id !== cardId)
                : [...state.currentSession.starredCards, cardId],
            },
          };
        });
      },

      toggleLearned: (cardId) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              learnedCards: state.currentSession.learnedCards.includes(cardId)
                ? state.currentSession.learnedCards.filter((id) => id !== cardId)
                : [...state.currentSession.learnedCards, cardId],
            },
          };
        });
      },

      setStudyMode: (mode) => {
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                studyMode: mode,
                currentCardIndex: 0,
              }
            : null,
          isFlipped: false,
        }));
      },

      resetFlashcards: () => {
        set({
          currentSession: null,
          isFlipped: false,
          isShuffled: false,
        });
      },

      getCurrentCard: () => {
        const session = get().currentSession;
        if (!session) return null;
        const visibleCards = get().getVisibleCards();
        return visibleCards[session.currentCardIndex] || null;
      },

      getVisibleCards: () => {
        const session = get().currentSession;
        if (!session) return [];

        if (session.studyMode === 'starred') {
          return session.cards.filter((card) =>
            session.starredCards.includes(card.id)
          );
        }

        if (session.studyMode === 'not_learned') {
          return session.cards.filter(
            (card) => !session.learnedCards.includes(card.id)
          );
        }

        return session.cards;
      },

      getProgress: () => {
        const session = get().currentSession;
        if (!session) return { current: 0, total: 0 };
        const visibleCards = get().getVisibleCards();
        return {
          current: session.currentCardIndex + 1,
          total: visibleCards.length,
        };
      },

      getStatistics: () => {
        const session = get().currentSession;
        if (!session) return { total: 0, starred: 0, learned: 0 };
        return {
          total: session.cards.length,
          starred: session.starredCards.length,
          learned: session.learnedCards.length,
        };
      },
    }),
    {
      name: 'civic-flashcard-store',
    }
  )
);
