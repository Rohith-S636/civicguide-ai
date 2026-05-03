// ============================================================================
// ZUSTAND GAMIFICATION STORE
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateLevel, calculateLevelProgress, calculateXPForNextLevel } from "@/lib/gamification/xp-rules";

export interface GamificationUser {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // ISO date string
  badges: string[]; // badge IDs
  totalQuizzesCompleted: number;
  totalQuestionsAsked: number;
  articlesRead: number;
  formsViewed: string[]; // form IDs
  blogsRead: string[]; // blog IDs
}

interface GamificationStore {
  // State
  user: GamificationUser | null;
  recentXPGains: Array<{ xp: number; reason: string; timestamp: number }>;
  unlockedBadges: Array<{ badgeId: string; unlockedAt: number }>;
  showXPNotification: boolean;
  lastNotificationXP: number;
  lastNotificationReason: string;

  // Actions
  setUser: (user: GamificationUser) => void;
  addXP: (amount: number, reason: string) => void;
  addBadge: (badgeId: string) => void;
  updateQuizzesCompleted: (count: number) => void;
  updateQuestionsAsked: (count: number) => void;
  addArticleRead: () => void;
  addFormViewed: (formId: string) => void;
  addBlogRead: (blogId: string) => void;
  updateStreak: (streak: number) => void;
  dismissXPNotification: () => void;
  resetStore: () => void;

  // Getters
  getCurrentLevel: () => number;
  getLevelProgress: () => number;
  getXPForNextLevel: () => number;
  getTotalXP: () => number;
  hasBadge: (badgeId: string) => boolean;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      recentXPGains: [],
      unlockedBadges: [],
      showXPNotification: false,
      lastNotificationXP: 0,
      lastNotificationReason: "",

      // Actions
      setUser: (user) => set({ user }),

      addXP: (amount, reason) =>
        set((state) => {
          if (!state.user) return state;

          const newXP = state.user.xp + amount;
          const newLevel = calculateLevel(newXP);

          // Track recent XP gains (keep last 10)
          const newRecentGains = [
            { xp: amount, reason, timestamp: Date.now() },
            ...state.recentXPGains.slice(0, 9),
          ];

          return {
            user: {
              ...state.user,
              xp: newXP,
              level: newLevel,
            },
            recentXPGains: newRecentGains,
            showXPNotification: true,
            lastNotificationXP: amount,
            lastNotificationReason: reason,
          };
        }),

      addBadge: (badgeId) =>
        set((state) => {
          if (!state.user) return state;

          // Check if badge already exists
          if (state.user.badges.includes(badgeId)) return state;

          return {
            user: {
              ...state.user,
              badges: [...state.user.badges, badgeId],
            },
            unlockedBadges: [
              { badgeId, unlockedAt: Date.now() },
              ...state.unlockedBadges.slice(0, 4), // Keep last 5
            ],
          };
        }),

      updateQuizzesCompleted: (count) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              totalQuizzesCompleted: count,
            },
          };
        }),

      updateQuestionsAsked: (count) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              totalQuestionsAsked: count,
            },
          };
        }),

      addArticleRead: () =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              articlesRead: state.user.articlesRead + 1,
            },
          };
        }),

      addFormViewed: (formId) =>
        set((state) => {
          if (!state.user) return state;

          // Avoid duplicates
          if (state.user.formsViewed.includes(formId)) return state;

          return {
            user: {
              ...state.user,
              formsViewed: [...state.user.formsViewed, formId],
            },
          };
        }),

      addBlogRead: (blogId) =>
        set((state) => {
          if (!state.user) return state;

          // Avoid duplicates
          if (state.user.blogsRead.includes(blogId)) return state;

          return {
            user: {
              ...state.user,
              blogsRead: [...state.user.blogsRead, blogId],
            },
          };
        }),

      updateStreak: (streak) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              streak,
            },
          };
        }),

      dismissXPNotification: () =>
        set({
          showXPNotification: false,
        }),

      resetStore: () =>
        set({
          user: null,
          recentXPGains: [],
          unlockedBadges: [],
          showXPNotification: false,
          lastNotificationXP: 0,
          lastNotificationReason: "",
        }),

      // Getters
      getCurrentLevel: () => {
        const { user } = get();
        return user?.level || 1;
      },

      getLevelProgress: () => {
        const { user } = get();
        if (!user) return 0;
        return calculateLevelProgress(user.xp);
      },

      getXPForNextLevel: () => {
        const { user } = get();
        if (!user) return 0;
        return calculateXPForNextLevel(user.xp);
      },

      getTotalXP: () => {
        const { user } = get();
        return user?.xp || 0;
      },

      hasBadge: (badgeId) => {
        const { user } = get();
        return user?.badges.includes(badgeId) || false;
      },
    }),
    {
      name: "gamification-store",
      partialize: (state) => ({
        user: state.user,
        unlockedBadges: state.unlockedBadges,
      }),
    }
  )
);

// Hooks for convenience
export const useXP = () => {
  const user = useGamificationStore((state) => state.user);
  const getTotalXP = useGamificationStore((state) => state.getTotalXP);
  const getCurrentLevel = useGamificationStore((state) => state.getCurrentLevel);
  const getLevelProgress = useGamificationStore((state) => state.getLevelProgress);
  const getXPForNextLevel = useGamificationStore((state) => state.getXPForNextLevel);

  return {
    xp: getTotalXP(),
    level: getCurrentLevel(),
    progress: getLevelProgress(),
    nextLevelXP: getXPForNextLevel(),
    user,
  };
};

export const useBadges = () => {
  const user = useGamificationStore((state) => state.user);
  const addBadge = useGamificationStore((state) => state.addBadge);
  const hasBadge = useGamificationStore((state) => state.hasBadge);

  return {
    badges: user?.badges || [],
    addBadge,
    hasBadge,
  };
};

export const useXPNotification = () => {
  const showXPNotification = useGamificationStore((state) => state.showXPNotification);
  const lastNotificationXP = useGamificationStore((state) => state.lastNotificationXP);
  const lastNotificationReason = useGamificationStore((state) => state.lastNotificationReason);
  const dismissXPNotification = useGamificationStore((state) => state.dismissXPNotification);

  return {
    show: showXPNotification,
    xp: lastNotificationXP,
    reason: lastNotificationReason,
    dismiss: dismissXPNotification,
  };
};
