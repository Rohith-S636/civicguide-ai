# 🎮 CivicGuide AI - Gamification System

Complete gamification system for engaging users with civic education through XP, levels, badges, and leaderboards.

## 📋 System Overview

### **XP & Levels**
- **10 Levels** with thresholds from 0 XP (Level 1) to 6500 XP (Level 10)
- **Hindi Level Titles** from नया नागरिक (New Citizen) to भारत का नेता (India's Leader)
- **Auto-level progression** based on XP accumulation
- **Real-time XP notifications** with Sonner toasts

### **XP Rules** 
| Activity | XP | Details |
|----------|-----|---------|
| Ask question | +5 | Chat engagement |
| Quiz answer (correct) | +10 | Base per answer |
| Quiz (100% score) | +30 | Perfect score bonus |
| Complete simulation | +50 | Polling simulation |
| Read blog/news | +5 | Educational content |
| Complete flashcard set | +15 | Learning milestone |
| Daily login | +10 | Consistency bonus |
| First question | +20 | First-time bonus |

**Difficulty Multipliers:**
- Beginner: 1.0x
- Student: 1.5x
- Exam: 2.0x

### **Badges** (20 Total)
#### Common (5)
- 🎤 First Voice - Ask first question
- 🦅 News Hawk - Read 5 articles
- 📋 Form Expert - View 5 forms
- 🌅 Early Bird - Login before 8 AM
- 🦉 Night Owl - Login after 10 PM

#### Uncommon (7)
- 🎯 Quiz Master - 100% on quiz
- 🌍 Polyglot - Use 3 languages
- ⭐ Simulation Star - Complete simulation
- 📚 Flashcard Enthusiast - Complete 10 sets
- 🔥 On Fire - 7-day streak
- 🤝 Social Voter - Share result
- 💯 Perfect Student - 100% on 5 quizzes (partial)

#### Rare (6)
- 📜 Constitution Guru - Perfect constitution quiz
- 📖 Blog Reader - Read all 10 blogs
- 💪 Unstoppable - 30-day streak
- 📢 Influencer - Share 5 times
- 🧠 Knowledge Seeker - Earn 1000 XP
- 👑 Civic Legend (partial)

#### Epic (3)
- 📅 Daily Voter - Login 100 times
- 🏆 Democracy Champion - Level 8
- 👑 Civic Legend (partial)

#### Legendary (1)
- 👑 Civic Legend - Level 10

---

## 🚀 Frontend Components

### 1. **XPBar** (`components/gamification/XPBar.tsx`)
Animated progress bar showing XP progression with level badge

**Props:**
```typescript
interface XPBarProps {
  showLabel?: boolean;      // Show "XP to next level"
  compact?: boolean;        // Compact vs full display
  animated?: boolean;       // Enable animations
}
```

**Features:**
- ✨ Framer Motion animations
- 🎨 Dynamic color based on level (Gray → Deep Pink)
- 🎉 Level-up celebration animation
- 📊 Progress bar with percentage
- 🏷️ Hindi level titles

**Usage:**
```jsx
import { XPBar } from "@/components/gamification";

export default function Dashboard() {
  return <XPBar showLabel={true} compact={false} />;
}
```

---

### 2. **Leaderboard** (`components/gamification/Leaderboard.tsx`)
Global leaderboard with ranking, XP, and badges

**Props:**
```typescript
interface LeaderboardProps {
  users?: LeaderboardUser[];
  isLoading?: boolean;
  currentUsername?: string;
  onPaginationChange?: (page: number) => void;
  itemsPerPage?: number;  // Default 10
}
```

**Features:**
- 🏆 Rank badges (🥇🥈🥉)
- 🎯 Current user highlighted in saffron
- 📄 Pagination (10 per page)
- 👤 User rank display outside top 10
- 🔀 Sortable by XP

**Usage:**
```jsx
import { Leaderboard } from "@/components/gamification";

export default function LeaderboardPage() {
  return (
    <Leaderboard
      users={leaderboardUsers}
      isLoading={isLoading}
      currentUsername="priya_voter"
      itemsPerPage={10}
    />
  );
}
```

---

### 3. **BadgesShowcase** (`components/gamification/BadgesShowcase.tsx`)
Display user badges with detail modal

**Props:**
```typescript
interface BadgesShowcaseProps {
  compact?: boolean;       // 3-badge preview
  maxDisplay?: number;     // Default 6
  showAllButton?: boolean;
}
```

**Features:**
- 🏆 Badge cards with rarity colors
- 📱 Compact mode for sidebars
- 🔍 Modal detail view
- ✨ Hover animations
- 🎨 Rarity-based styling (Gray → Yellow)

**Usage:**
```jsx
import { BadgesShowcase } from "@/components/gamification";

export default function UserProfile() {
  return <BadgesShowcase compact={false} maxDisplay={6} />;
}
```

---

### 4. **StreakTracker** (`components/gamification/StreakTracker.tsx`)
Login streak display with milestones

**Props:**
```typescript
interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  showHistory?: boolean;
}
```

**Features:**
- 🔥 Animated flame icon
- 📈 Progress bar toward 30 days
- 🎯 Milestone tracking (7, 14, 30 days)
- 💡 Streak tips
- 📊 History comparison

**Usage:**
```jsx
import { StreakTracker } from "@/components/gamification";

export default function Dashboard() {
  return (
    <StreakTracker
      currentStreak={7}
      longestStreak={15}
      showHistory={true}
    />
  );
}
```

---

### 5. **XPNotification** (`components/gamification/XPNotification.tsx`)
Toast notifications for XP gains and badge unlocks

**Components:**
- `XPNotificationToast` - Sonner-based
- `StandaloneXPNotification` - Framer Motion based

**Features:**
- 🎉 Automatic XP gain toasts
- 🏆 Badge unlock celebrations
- 📍 Configurable position
- ⏱️ Auto-dismiss after 2.5s
- 🎨 Dynamic emojis by activity type

**Usage:**
```jsx
import { XPNotificationToast } from "@/components/gamification";

export default function RootLayout() {
  return <XPNotificationToast onBadgeUnlocked={(id) => console.log(id)} />;
}
```

---

## 🎯 Zustand Store

### `useGamificationStore` (`store/useGamificationStore.ts`)

**State:**
```typescript
interface GamificationStore {
  user: GamificationUser | null;
  recentXPGains: Array<{ xp: number; reason: string; timestamp: number }>;
  unlockedBadges: Array<{ badgeId: string; unlockedAt: number }>;
  showXPNotification: boolean;
}
```

**Actions:**
```typescript
// Add XP and trigger notifications
addXP(amount: number, reason: string): void

// Unlock badge
addBadge(badgeId: string): void

// Track activities
updateQuizzesCompleted(count: number): void
updateQuestionsAsked(count: number): void
addArticleRead(): void
addFormViewed(formId: string): void
addBlogRead(blogId: string): void
updateStreak(streak: number): void

// Utility
dismissXPNotification(): void
resetStore(): void
```

**Convenience Hooks:**
```typescript
// XP data
const { xp, level, progress, nextLevelXP } = useXP();

// Badges
const { badges, addBadge, hasBadge } = useBadges();

// Notifications
const { show, xp, reason, dismiss } = useXPNotification();
```

**Usage:**
```jsx
import { useXP, useBadges } from "@/store/useGamificationStore";

export default function Component() {
  const { xp, level, progress } = useXP();
  const { badges } = useBadges();

  return (
    <div>
      <p>Level: {level}</p>
      <p>XP: {xp}</p>
      <p>Badges: {badges.length}</p>
    </div>
  );
}
```

---

## 📡 Backend Integration

### Constants (`lib/gamification/xp-rules.ts`)

```typescript
export const XP_RULES = {
  CHAT_QUESTION: 5,
  QUIZ_CORRECT_ANSWER: 10,
  SIMULATION_COMPLETE: 50,
  BLOG_READ: 5,
  FLASHCARD_SET_COMPLETE: 15,
  DAILY_LOGIN: 10,
  FIRST_QUESTION_BONUS: 20,
  PERFECT_QUIZ_BONUS: 30,
};

export const LEVEL_THRESHOLDS = {
  1: 0, 2: 300, 3: 600, 4: 1000, 5: 1500,
  6: 2200, 7: 3000, 8: 4000, 9: 5200, 10: 6500
};

export const LEVEL_TITLES = {
  1: { en: "New Citizen", hi: "नया नागरिक", ... },
  // ... 10 levels with multilingual titles
};
```

---

### Backend Utils (`backend/utils/gamification.py`)

**Key Functions:**
```python
def calculate_xp_for_quiz(
    correct_answers: int,
    total_questions: int,
    difficulty: str
) -> Tuple[int, List[str]]:
    """Calculate quiz XP with bonuses"""
    pass

def calculate_level_from_xp(xp: int) -> int:
    """Get current level from XP"""
    pass

def check_badge_unlocks(
    user_id: str,
    current_badges: List[str],
    user_stats: Dict,
    activity_type: XPActivityType
) -> List[str]:
    """Check and return newly unlocked badges"""
    pass

def calculate_streak(
    last_login_date: Optional[datetime],
    current_date: Optional[datetime],
    previous_streak: int
) -> Tuple[int, bool]:
    """Calculate login streak"""
    pass
```

---

### Backend API (`backend/routers/gamification.py`)

**Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/gamification/xp/add` | Add XP for activity |
| POST | `/api/gamification/quiz/submit` | Submit quiz results |
| GET | `/api/gamification/user/{user_id}/profile` | Get user profile |
| GET | `/api/gamification/leaderboard` | Get global leaderboard |
| POST | `/api/gamification/streak/update` | Update login streak |
| POST | `/api/gamification/badge/track` | Track activity |
| GET | `/api/gamification/badges/all` | Get all badges |

**Example: Add XP**
```python
POST /api/gamification/xp/add
{
  "user_id": "user-123",
  "activity_type": "chat_question",
  "amount": 5,
  "metadata": {"question_id": "q-456"}
}

Response:
{
  "xp_gained": 5,
  "new_total_xp": 125,
  "new_level": 2,
  "badges_unlocked": ["first_vote"],
  "level_up": true
}
```

---

## 🔌 Integration Examples

### Quiz Page Integration
```jsx
import { useGamificationStore } from "@/store/useGamificationStore";
import { calculateXPForQuiz } from "@/lib/gamification/xp-rules";

export default function QuizPage() {
  const addXP = useGamificationStore((state) => state.addXP);

  const handleQuizSubmit = (score: number, total: number, difficulty: string) => {
    const xp = calculateXPForQuiz(score, total, difficulty);
    addXP(xp, `${score}/${total} on ${difficulty} quiz`);
    
    // Save to backend
    fetch("/api/gamification/quiz/submit", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        score,
        total_questions: total,
        difficulty,
      }),
    });
  };

  return (/* quiz UI */);
}
```

### Chat Integration
```jsx
const handleAskQuestion = async (question: string) => {
  addXP(XP_RULES.CHAT_QUESTION, "Asked a question");
  
  // Send message
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: question }),
  });
};
```

### Dashboard Integration
```jsx
import { XPBar, Leaderboard, BadgesShowcase, StreakTracker } from "@/components/gamification";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <XPBar showLabel={true} />
      <StreakTracker currentStreak={7} longestStreak={15} />
      <BadgesShowcase maxDisplay={6} />
      <Leaderboard itemsPerPage={10} />
    </div>
  );
}
```

---

## 📁 File Structure

```
frontend/
├── components/gamification/
│   ├── index.ts                 # Barrel export
│   ├── XPBar.tsx               # Level badge + progress bar
│   ├── Leaderboard.tsx         # Global rankings
│   ├── BadgesShowcase.tsx      # Badge collection
│   ├── StreakTracker.tsx       # Streak visualization
│   └── XPNotification.tsx      # Toast notifications
├── lib/gamification/
│   ├── xp-rules.ts             # XP system constants
│   └── badges.ts               # Badge definitions
└── store/
    └── useGamificationStore.ts # Zustand store

backend/
├── routers/
│   └── gamification.py         # API endpoints
├── lib/gamification/
│   └── badges.py               # Backend badge definitions
└── utils/
    └── gamification.py         # XP calculations & logic
```

---

## 🎨 Theming & Styling

### Level Colors
```
Level 1:  Gray (#A0A0A0)
Level 2:  Brown (#8B7355)
Level 3:  Bronze (#CD7F32)
Level 4:  Silver (#C0C0C0)
Level 5:  Gold (#FFD700)
Level 6:  Hot Pink (#FF69B4)
Level 7:  Turquoise (#00CED1)
Level 8:  Purple (#9370DB)
Level 9:  Orange Red (#FF4500)
Level 10: Deep Pink (#FF1493)
```

### Badge Rarity Colors
- Common: Gray
- Uncommon: Green
- Rare: Blue
- Epic: Purple
- Legendary: Gold

### Civic Colors Integration
- Saffron (#FF9933) - Primary accent
- India Green (#138808) - Secondary accent
- Navy (#000080) - Text/dark accent

---

## 🚀 Deployment Checklist

- [ ] Create `/lib/gamification/` directory structure
- [ ] Create `/components/gamification/` directory structure
- [ ] Create `/store/useGamificationStore.ts`
- [ ] Create `/backend/utils/gamification.py`
- [ ] Create `/backend/lib/gamification/badges.py`
- [ ] Create `/backend/routers/gamification.py`
- [ ] Update `/backend/main.py` to include gamification router
- [ ] Install dependencies (framer-motion, lucide-react already present)
- [ ] Update Supabase schema to include gamification tables (xp, badges, streaks)
- [ ] Test XP calculation with sample quiz
- [ ] Test badge unlock logic
- [ ] Integrate into existing pages (quiz, chat, news)
- [ ] Deploy to Vercel (frontend) and hosting (backend)

---

## 📊 Database Schema (Supabase)

The schema.sql already includes tables for:
- `users` - XP, level, streak tracking
- `quiz_sessions` - Quiz XP calculation
- `chat_sessions` - Chat XP tracking
- `user_badges` - Badge unlock history
- Additional tables can be created for:
  - `xp_transactions` - Audit log
  - `badge_progress` - Track partial progress

---

## 🔧 Advanced Features (Future)

- 🎪 Battle Pass system with seasonal rewards
- 👥 Multiplayer challenges
- 🎁 Daily reward boxes
- 🏅 Leaderboard seasons
- 🎯 Achievement trees
- 🌍 Community events
- 💰 Virtual currency system
- 🎮 Mini-games for bonus XP

---

## 📝 License

MIT License - Part of CivicGuide AI Project

---

## 👥 Contributing

Contributions welcome! Please ensure:
- All components are fully typed with TypeScript
- Backend functions have docstrings
- XP calculations are clearly documented
- Badge unlock conditions are testable

---

**Build with ❤️ to make civic engagement fun and rewarding! 🇮🇳**
