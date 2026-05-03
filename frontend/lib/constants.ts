export const CIVIC_COLORS = {
  saffron: '#FF9933',
  green: '#138808',
  navy: '#000080',
  light: '#F5F5F5',
  dark: '#1a1a1a',
} as const;

export const CIVIC_GRADIENTS = {
  main: 'from-saffron via-green to-navy',
  light: 'from-orange-100 via-green-100 to-blue-100',
} as const;

export const LEARNING_PATHS = {
  beginner: ['Constitution Explorer', 'Quick Quiz', 'Flashcards'],
  intermediate: ['Polling Simulation', 'Advanced Quiz', 'Election Forms'],
  advanced: ['Campaign Strategy', 'In-depth Analysis', 'Community Discussions'],
} as const;

export const DIFFICULTY_LEVELS = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700', xp: 50 },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700', xp: 100 },
  hard: { label: 'Hard', color: 'bg-red-100 text-red-700', xp: 200 },
} as const;

export const XP_REWARDS = {
  firstQuiz: 50,
  weeklyStreak: 500,
  constitutionComplete: 200,
  communityPost: 100,
  correctAnswer: 10,
} as const;

export const BADGE_DEFINITIONS = {
  quickLearner: {
    name: 'Quick Learner',
    icon: '⚡',
    requirement: 'Complete 5 quizzes in one day',
  },
  quizMaster: {
    name: 'Quiz Master',
    icon: '🧠',
    requirement: 'Score 90% or above on 10 quizzes',
  },
  constitutionExpert: {
    name: 'Constitution Expert',
    icon: '📜',
    requirement: 'Complete all Constitution chapters',
  },
  communityChampion: {
    name: 'Community Champion',
    icon: '👑',
    requirement: 'Make 50 contributions to discussions',
  },
  civicHero: {
    name: 'Civic Hero',
    icon: '🦸',
    requirement: 'Reach level 10',
  },
} as const;
