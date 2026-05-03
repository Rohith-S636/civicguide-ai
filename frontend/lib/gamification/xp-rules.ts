// ============================================================================
// XP RULES & CONSTANTS
// ============================================================================

export const XP_RULES = {
  // Basic Activities
  CHAT_QUESTION: 5,           // Ask a question in chat
  QUIZ_CORRECT_ANSWER: 10,    // Per correct answer in quiz
  SIMULATION_COMPLETE: 50,    // Complete polling day simulation
  BLOG_READ: 5,               // Read a blog article
  FLASHCARD_SET_COMPLETE: 15, // Complete a flashcard set
  DAILY_LOGIN: 10,            // Daily login bonus

  // Bonuses
  FIRST_QUESTION_BONUS: 20,   // First ever question asked
  PERFECT_QUIZ_BONUS: 30,     // Score 100% on any quiz
  STREAK_BONUS: 5,            // Per day streak (multiplier)
  LANGUAGE_SWITCH_BONUS: 10,  // Try new language

  // Quiz Multipliers (by difficulty)
  QUIZ_BEGINNER_MULTIPLIER: 1.0,
  QUIZ_STUDENT_MULTIPLIER: 1.5,
  QUIZ_EXAM_MULTIPLIER: 2.0,
};

export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 300,
  3: 600,
  4: 1000,
  5: 1500,
  6: 2200,
  7: 3000,
  8: 4000,
  9: 5200,
  10: 6500,
};

export const LEVEL_TITLES = {
  1: { en: "New Citizen", hi: "नया नागरिक", te: "నూత్న నాగరికుడు", ta: "புதிய குடிமகன்" },
  2: { en: "Aware Voter", hi: "सजग मतदाता", te: "సజాగ ఓటర్", ta: "விழித்த வாக்காளர்" },
  3: { en: "Election Worker", hi: "चुनाव सेवक", te: "ఎన్నికల సేవક", ta: "தேர்தல் பணியாளர்" },
  4: { en: "People's Guardian", hi: "लोक रक्षक", te: "ప్రజల సంరక్షకుడు", ta: "மக்களின் பாதுகாப்பாளர்" },
  5: { en: "Democracy Friend", hi: "लोकतंत्र मित्र", te: "ప్రజాస్వామ్య స్నేహితుడు", ta: "ஜனநாயக நண்பன்" },
  6: { en: "Constitution Expert", hi: "संविधान ज्ञानी", te: "రాజ్యాంగ నిపుణుడు", ta: "அரசியலமைப்பு நிபுணர்" },
  7: { en: "Voting Officer", hi: "मतदान अधिकारी", te: "ఓటింగ్ అధికారి", ta: "வாக்களிப்பு அधিकாரி" },
  8: { en: "Election Scholar", hi: "चुनाव विज्ञानी", te: "ఎన్నికల విద్వాంసుడు", ta: "தேர்தல் அறிஞர்" },
  9: { en: "Democracy Sentinel", hi: "लोकतंत्र प्रहरी", te: "ప్రజాస్వామ్య సెంటినల్", ta: "ஜனநாயக பாதுகாவலன்" },
  10: { en: "India's Leader", hi: "भारत का नेता", te: "భారతదేశ నేతృత్వం", ta: "இந்தியாவின் தலைவன்" },
};

export const LEVEL_COLORS = {
  1: "#A0A0A0",   // Gray
  2: "#8B7355",   // Brown
  3: "#CD7F32",   // Bronze
  4: "#C0C0C0",   // Silver
  5: "#FFD700",   // Gold
  6: "#FF69B4",   // Hot Pink
  7: "#00CED1",   // Turquoise
  8: "#9370DB",   // Medium Purple
  9: "#FF4500",   // Orange Red
  10: "#FF1493",  // Deep Pink (Premium)
};

export const XP_TO_NEXT_LEVEL_THRESHOLDS = [
  300, 300, 400, 500, 700, 800, 800, 1000, 1200, 1300
];

export const calculateXPForQuiz = (
  score: number,
  totalQuestions: number,
  difficulty: "beginner" | "student" | "exam"
): number => {
  const correctAnswers = score;
  const baseXP = correctAnswers * XP_RULES.QUIZ_CORRECT_ANSWER;
  
  let multiplier = 1.0;
  switch (difficulty) {
    case "beginner":
      multiplier = XP_RULES.QUIZ_BEGINNER_MULTIPLIER;
      break;
    case "student":
      multiplier = XP_RULES.QUIZ_STUDENT_MULTIPLIER;
      break;
    case "exam":
      multiplier = XP_RULES.QUIZ_EXAM_MULTIPLIER;
      break;
  }
  
  const xp = Math.floor(baseXP * multiplier);
  return xp;
};

export const calculateLevel = (xp: number): number => {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xp >= LEVEL_THRESHOLDS[i as keyof typeof LEVEL_THRESHOLDS]) {
      level = i;
      break;
    }
  }
  return level;
};

export const calculateXPForNextLevel = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 10) return 0; // Max level reached
  
  const nextLevelThreshold = LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS];
  return Math.max(0, nextLevelThreshold - currentXP);
};

export const calculateLevelProgress = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 10) return 100; // Max level
  
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS];
  const nextLevelThreshold = LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS];
  
  const progress = ((currentXP - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
};
