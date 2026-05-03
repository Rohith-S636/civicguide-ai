# ============================================================================
# GAMIFICATION INTEGRATION GUIDE
# ============================================================================

"""
This file shows how to integrate the gamification system into existing pages.

Key Integration Points:
1. Quiz Page - Award XP on quiz completion
2. Chat Page - Award XP on questions asked
3. News/Blog Pages - Award XP on reading
4. Dashboard - Display XP bar, badges, leaderboard
5. Forms Page - Track form views
"""

# ============================================================================
# FRONTEND INTEGRATION EXAMPLES
# ============================================================================

# 1. In Quiz Page (app/[locale]/quiz/page.tsx)
# ============================================================================
"""
"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { calculateXPForQuiz, XP_RULES } from "@/lib/gamification/xp-rules";

export default function QuizPage() {
  const addXP = useGamificationStore((state) => state.addXP);
  const updateQuizzesCompleted = useGamificationStore((state) => state.updateQuizzesCompleted);

  const handleQuizSubmit = async (score: number, total: number, difficulty: string) => {
    // Calculate XP using utility function
    const xpAmount = calculateXPForQuiz(score, total, difficulty);
    
    // Add XP with reason
    addXP(xpAmount, `${score}/${total} correct on ${difficulty} quiz`);
    
    // Update quiz count
    updateQuizzesCompleted(userQuizCount + 1);
    
    // Call backend to save XP to database
    const response = await fetch("/api/gamification/quiz/submit", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        topic: quizTopic,
        difficulty,
        score,
        total_questions: total,
      }),
    });
  };

  return (
    <div>
      {/* Quiz content */}
    </div>
  );
}
"""


# 2. In Chat Page (app/[locale]/chat/page.tsx)
# ============================================================================
"""
"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { XP_RULES } from "@/lib/gamification/xp-rules";

export default function ChatPage() {
  const addXP = useGamificationStore((state) => state.addXP);
  const updateQuestionsAsked = useGamificationStore((state) => state.updateQuestionsAsked);

  const handleAskQuestion = async (question: string) => {
    // Award XP for asking question
    addXP(XP_RULES.CHAT_QUESTION, "Asked a question in chat");
    
    // Update question count
    updateQuestionsAsked(userQuestionCount + 1);
    
    // Send question to backend
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: question }),
    });
  };

  return (
    <div>
      {/* Chat interface */}
    </div>
  );
}
"""


# 3. In Dashboard (app/[locale]/dashboard/page.tsx)
# ============================================================================
"""
"use client";

import { XPBar, Leaderboard, BadgesShowcase, StreakTracker } from "@/components/gamification";
import { useXP, useBadges } from "@/store/useGamificationStore";

export default function DashboardPage() {
  const { xp, level, progress } = useXP();
  const { badges } = useBadges();

  return (
    <div className="space-y-6 p-6">
      {/* XP Bar */}
      <XPBar showLabel={true} compact={false} animated={true} />
      
      {/* Streak Tracker */}
      <StreakTracker currentStreak={7} longestStreak={15} showHistory={true} />
      
      {/* Badges */}
      <BadgesShowcase compact={false} maxDisplay={6} showAllButton={true} />
      
      {/* Leaderboard */}
      <Leaderboard
        users={leaderboardUsers}
        isLoading={isLoading}
        currentUsername={username}
        itemsPerPage={10}
      />
    </div>
  );
}
"""


# 4. In App Root Layout (app/layout.tsx)
# ============================================================================
"""
"use client";

import { XPNotificationToast, StandaloneXPNotification } from "@/components/gamification";
import { useGamificationStore } from "@/store/useGamificationStore";

export default function RootLayout({ children }) {
  // Initialize gamification store
  const setUser = useGamificationStore((state) => state.setUser);

  useEffect(() => {
    // Load user gamification profile on app start
    const loadUserProfile = async () => {
      const response = await fetch(`/api/gamification/user/${userId}/profile`);
      const data = await response.json();
      
      setUser({
        userId: data.user_id,
        xp: data.xp,
        level: data.level,
        streak: data.stats.current_streak,
        lastActiveDate: new Date().toISOString(),
        badges: data.badges,
        // ... other fields
      });
    };

    loadUserProfile();
  }, []);

  return (
    <html>
      <body>
        {/* XP Notifications */}
        <XPNotificationToast onBadgeUnlocked={(badgeId) => {
          console.log("Badge unlocked:", badgeId);
        }} />
        
        {/* Or use standalone version */}
        {/* <StandaloneXPNotification position="top-right" /> */}
        
        {children}
      </body>
    </html>
  );
}
"""


# 5. In News/Blog Page (app/[locale]/news/page.tsx)
# ============================================================================
"""
"use client";

import { useGamificationStore } from "@/store/useGamificationStore";
import { XP_RULES } from "@/lib/gamification/xp-rules";

export default function NewsPage() {
  const addXP = useGamificationStore((state) => state.addXP);
  const addArticleRead = useGamificationStore((state) => state.addArticleRead);
  const addBlogRead = useGamificationStore((state) => state.addBlogRead);

  const handleArticleRead = (articleId: string, title: string) => {
    // Award XP for reading article
    addXP(XP_RULES.BLOG_READ, `Read article: ${title}`);
    
    // Track article read
    addArticleRead();
    addBlogRead(articleId);
  };

  return (
    <div>
      {articles.map((article) => (
        <article
          key={article.id}
          onClick={() => handleArticleRead(article.id, article.title)}
        >
          {/* Article content */}
        </article>
      ))}
    </div>
  );
}
"""


# 6. In Forms Page (app/[locale]/forms/page.tsx)
# ============================================================================
"""
"use client";

import { useGamificationStore } from "@/store/useGamificationStore";

export default function FormsPage() {
  const addFormViewed = useGamificationStore((state) => state.addFormViewed);

  const handleFormClick = (formId: string) => {
    // Track form view
    addFormViewed(formId);
    
    // Navigate to form details
    router.push(`/forms/${formId}`);
  };

  return (
    <div>
      {forms.map((form) => (
        <div key={form.id} onClick={() => handleFormClick(form.id)}>
          {form.name}
        </div>
      ))}
    </div>
  );
}
"""


# ============================================================================
# BACKEND INTEGRATION EXAMPLES
# ============================================================================

# 1. Update Quiz Router (/routers/quiz.py)
# ============================================================================
"""
from backend.utils.gamification import calculate_xp_for_quiz
from backend.routers.gamification import add_xp
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/submit")
async def submit_quiz(quiz_data: QuizSubmitRequest):
    user_id = quiz_data.user_id
    
    # Calculate XP
    xp_gained, bonuses = calculate_xp_for_quiz(
        correct_answers=quiz_data.score,
        total_questions=quiz_data.total_questions,
        difficulty=quiz_data.difficulty,
    )
    
    # Save to database
    session = await db.save_quiz_session(user_id, quiz_data)
    
    # Add XP (will also check badges)
    xp_response = await add_xp(
        XPGainRequest(
            user_id=user_id,
            activity_type="quiz_correct_answer",
            amount=xp_gained,
        )
    )
    
    return {
        "session_id": session.id,
        "xp_gained": xp_response.xp_gained,
        "new_level": xp_response.new_level,
        "badges_unlocked": xp_response.badges_unlocked,
    }
"""


# 2. Update Chat Router (/routers/chat.py)
# ============================================================================
"""
from backend.routers.gamification import add_xp
from backend.utils.gamification import XPActivityType

@router.post("/send")
async def send_message(message_data: ChatMessageRequest):
    user_id = message_data.user_id
    
    # Save message
    message = await db.save_message(user_id, message_data)
    
    # Award XP for asking question (if user message)
    if message_data.role == "user":
        xp_response = await add_xp(
            XPGainRequest(
                user_id=user_id,
                activity_type=XPActivityType.CHAT_QUESTION,
            )
        )
    
    return {"message_id": message.id}
"""


# 3. Update News Router (/routers/news.py)
# ============================================================================
"""
from backend.routers.gamification import track_activity

@router.get("/{article_id}")
async def get_article(article_id: str, user_id: str):
    article = await db.get_article(article_id)
    
    # Track that user read article
    if user_id:
        await track_activity(
            user_id=user_id,
            activity="read_blog",
            metadata={"article_id": article_id},
        )
    
    return article
"""


# ============================================================================
# KEY FEATURES SUMMARY
# ============================================================================

FEATURES = {
    "XP System": {
        "Chat Question": 5,
        "Quiz Correct Answer": 10,
        "Perfect Quiz Score": +30 bonus,
        "Simulation Complete": 50,
        "Blog Read": 5,
        "Flashcard Set": 15,
        "Daily Login": 10,
    },
    "Levels": {
        "Total": 10,
        "Max XP": 6500,
        "Level 1": "Naya Naagrik (New Citizen)",
        "Level 10": "Bharat Ka Neta (India's Leader)",
    },
    "Badges": {
        "Total": 20,
        "Types": [
            "First Voice - Ask first question",
            "Quiz Master - 100% on quiz",
            "On Fire - 7-day streak",
            "Democracy Champion - Level 8",
            "Civic Legend - Level 10",
        ],
    },
    "API Endpoints": {
        "POST /api/gamification/xp/add": "Add XP for activity",
        "POST /api/gamification/quiz/submit": "Submit quiz results",
        "GET /api/gamification/user/{user_id}/profile": "Get user profile",
        "GET /api/gamification/leaderboard": "Get global leaderboard",
        "POST /api/gamification/streak/update": "Update login streak",
        "POST /api/gamification/badge/track": "Track activity for badges",
    },
}
