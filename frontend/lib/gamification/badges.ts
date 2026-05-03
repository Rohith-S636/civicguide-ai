// ============================================================================
// BADGE DEFINITIONS (20 TOTAL)
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  condition: string;
  xpBonus: number;
}

export const BADGES: Record<string, Badge> = {
  // Beginner Badges
  first_vote: {
    id: "first_vote",
    name: "First Voice",
    description: "Ask your first question",
    icon: "🎤",
    color: "bg-blue-100",
    rarity: "common",
    condition: "Ask first question in chat",
    xpBonus: 20,
  },
  
  quiz_master: {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Score 100% on any quiz",
    icon: "🎯",
    color: "bg-yellow-100",
    rarity: "uncommon",
    condition: "Perfect score on quiz",
    xpBonus: 30,
  },
  
  polyglot: {
    id: "polyglot",
    name: "Polyglot",
    description: "Use 3 different languages",
    icon: "🌍",
    color: "bg-green-100",
    rarity: "uncommon",
    condition: "Switch to 3 languages",
    xpBonus: 25,
  },
  
  simulation_star: {
    id: "simulation_star",
    name: "Simulation Star",
    description: "Complete polling simulation",
    icon: "⭐",
    color: "bg-purple-100",
    rarity: "uncommon",
    condition: "Finish polling day simulation",
    xpBonus: 50,
  },
  
  constitution_guru: {
    id: "constitution_guru",
    name: "Constitution Guru",
    description: "Complete constitution quiz perfectly",
    icon: "📜",
    color: "bg-amber-100",
    rarity: "rare",
    condition: "100% on constitution quiz",
    xpBonus: 40,
  },
  
  // Engagement Badges
  news_hawk: {
    id: "news_hawk",
    name: "News Hawk",
    description: "Read 5 news articles",
    icon: "🦅",
    color: "bg-red-100",
    rarity: "common",
    condition: "Read 5 ECI news items",
    xpBonus: 15,
  },
  
  form_expert: {
    id: "form_expert",
    name: "Form Expert",
    description: "View 5 different election forms",
    icon: "📋",
    color: "bg-teal-100",
    rarity: "common",
    condition: "Access 5 different forms",
    xpBonus: 15,
  },
  
  flashcard_enthusiast: {
    id: "flashcard_enthusiast",
    name: "Flashcard Enthusiast",
    description: "Complete 10 flashcard sets",
    icon: "📚",
    color: "bg-indigo-100",
    rarity: "uncommon",
    condition: "Complete 10 flashcard sessions",
    xpBonus: 20,
  },
  
  blog_reader: {
    id: "blog_reader",
    name: "Blog Reader",
    description: "Read all 10 blog articles",
    icon: "📖",
    color: "bg-pink-100",
    rarity: "rare",
    condition: "Read all educational blogs",
    xpBonus: 35,
  },
  
  // Consistency Badges
  streak_7: {
    id: "streak_7",
    name: "On Fire",
    description: "7-day login streak",
    icon: "🔥",
    color: "bg-orange-100",
    rarity: "uncommon",
    condition: "Login 7 days straight",
    xpBonus: 25,
  },
  
  streak_30: {
    id: "streak_30",
    name: "Unstoppable",
    description: "30-day login streak",
    icon: "💪",
    color: "bg-red-100",
    rarity: "rare",
    condition: "Login 30 days straight",
    xpBonus: 100,
  },
  
  daily_voter: {
    id: "daily_voter",
    name: "Daily Voter",
    description: "Login for 100 days",
    icon: "📅",
    color: "bg-green-100",
    rarity: "epic",
    condition: "Login 100 times",
    xpBonus: 150,
  },
  
  // Social Badges
  social_voter: {
    id: "social_voter",
    name: "Social Voter",
    description: "Share a result with others",
    icon: "🤝",
    color: "bg-blue-100",
    rarity: "uncommon",
    condition: "Share quiz/simulation result",
    xpBonus: 20,
  },
  
  influencer: {
    id: "influencer",
    name: "Influencer",
    description: "Share 5 times",
    icon: "📢",
    color: "bg-cyan-100",
    rarity: "rare",
    condition: "Share 5 results",
    xpBonus: 50,
  },
  
  // Time-based Badges
  early_bird: {
    id: "early_bird",
    name: "Early Bird",
    description: "Login before 8 AM",
    icon: "🌅",
    color: "bg-yellow-100",
    rarity: "common",
    condition: "Login before 8:00 AM",
    xpBonus: 10,
  },
  
  night_owl: {
    id: "night_owl",
    name: "Night Owl",
    description: "Login after 10 PM",
    icon: "🦉",
    color: "bg-indigo-100",
    rarity: "common",
    condition: "Login after 10:00 PM",
    xpBonus: 10,
  },
  
  // Achievement Badges
  knowledge_seeker: {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Earn 1000 XP",
    icon: "🧠",
    color: "bg-purple-100",
    rarity: "rare",
    condition: "Accumulate 1000 XP",
    xpBonus: 50,
  },
  
  democracy_champion: {
    id: "democracy_champion",
    name: "Democracy Champion",
    description: "Reach Level 8",
    icon: "🏆",
    color: "bg-yellow-100",
    rarity: "epic",
    condition: "Achieve Level 8",
    xpBonus: 200,
  },
  
  civic_legend: {
    id: "civic_legend",
    name: "Civic Legend",
    description: "Reach Level 10",
    icon: "👑",
    color: "bg-yellow-200",
    rarity: "legendary",
    condition: "Achieve maximum Level 10",
    xpBonus: 500,
  },
  
  perfect_student: {
    id: "perfect_student",
    name: "Perfect Student",
    description: "Score 100% on 5 quizzes",
    icon: "💯",
    color: "bg-green-100",
    rarity: "epic",
    condition: "Perfect score on 5 quizzes",
    xpBonus: 75,
  },
};

export const getBadgeById = (badgeId: string): Badge | null => {
  return BADGES[badgeId] || null;
};

export const getAllBadges = (): Badge[] => {
  return Object.values(BADGES);
};

export const getBadgesByRarity = (rarity: Badge["rarity"]): Badge[] => {
  return Object.values(BADGES).filter((badge) => badge.rarity === rarity);
};

export const getRarityColor = (rarity: Badge["rarity"]): string => {
  switch (rarity) {
    case "common":
      return "text-gray-600";
    case "uncommon":
      return "text-green-600";
    case "rare":
      return "text-blue-600";
    case "epic":
      return "text-purple-600";
    case "legendary":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

export const getRarityBgColor = (rarity: Badge["rarity"]): string => {
  switch (rarity) {
    case "common":
      return "bg-gray-50 border-gray-200";
    case "uncommon":
      return "bg-green-50 border-green-200";
    case "rare":
      return "bg-blue-50 border-blue-200";
    case "epic":
      return "bg-purple-50 border-purple-200";
    case "legendary":
      return "bg-yellow-50 border-yellow-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};
