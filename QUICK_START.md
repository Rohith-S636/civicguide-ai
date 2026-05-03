# 🎮 Gamification Quick Start Guide

## 🚀 30-Minute Setup

### Step 1: Copy Files (5 min)

```bash
# Frontend components
cp -r frontend/components/gamification/
cp -r frontend/lib/gamification/
cp frontend/store/useGamificationStore.ts

# Backend
cp backend/routers/gamification.py
cp backend/utils/gamification.py
cp backend/lib/gamification/badges.py

# Update main app
# Edit backend/main.py to add gamification router ✓ (already done)
```

### Step 2: Install Dependencies (2 min)

All required packages already present in project:
- ✅ framer-motion 10.16.0
- ✅ zustand 4.4.0
- ✅ sonner 1.2.0
- ✅ lucide-react (icons)
- ✅ next-intl 2.20.0

### Step 3: Add to Dashboard (10 min)

```jsx
import { XPBar, Leaderboard, BadgesShowcase, StreakTracker } from "@/components/gamification";
import { useGamificationStore } from "@/store/useGamificationStore";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* XP Progress */}
      <XPBar showLabel={true} compact={false} />
      
      {/* Streak */}
      <StreakTracker currentStreak={7} longestStreak={15} />
      
      {/* Badges */}
      <BadgesShowcase maxDisplay={6} />
      
      {/* Leaderboard */}
      <Leaderboard itemsPerPage={10} />
    </div>
  );
}
```

### Step 4: Add Notifications (5 min)

In `app/layout.tsx`:
```jsx
import { XPNotificationToast } from "@/components/gamification";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <XPNotificationToast />
        {children}
      </body>
    </html>
  );
}
```

### Step 5: Award XP (8 min)

**In Quiz Page:**
```jsx
import { useGamificationStore } from "@/store/useGamificationStore";
import { calculateXPForQuiz } from "@/lib/gamification/xp-rules";

const handleQuizSubmit = async (score, total, difficulty) => {
  // Calculate XP
  const xp = calculateXPForQuiz(score, total, difficulty);
  
  // Award XP (shows notification automatically)
  useGamificationStore.getState().addXP(xp, "Quiz completed!");
  
  // Optional: Save to backend
  await fetch("/api/gamification/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, score, total, difficulty }),
  });
};
```

**In Chat Page:**
```jsx
const handleAskQuestion = () => {
  useGamificationStore.getState().addXP(5, "Question asked!");
};
```

---

## 📊 Level System at a Glance

```
Level 1   🟢 Naya Naagrik (New Citizen)          0 XP
Level 2   🟡 Sajag Matdaata (Aware Voter)       300 XP
Level 3   🟠 Chunav Sevak (Election Worker)     600 XP
Level 4   🔵 Lok Rakshak (People's Guardian)   1000 XP
Level 5   🟣 Loktantra Mitra (Democracy Friend) 1500 XP
Level 6   🌸 Samvidhan Gyaani (Constitution Expert) 2200 XP
Level 7   💙 Matdaan Adhikari (Voting Officer)  3000 XP
Level 8   💜 Chunav Vigyaani (Election Scholar) 4000 XP
Level 9   🔴 Loktantra Prahri (Democracy Sentinel) 5200 XP
Level 10  👑 Bharat Ka Neta (India's Leader)   6500 XP
```

---

## 🏆 Badge Quick Reference

### Easy Badges (Common)
- 🎤 First Voice - Ask 1 question
- 🦅 News Hawk - Read 5 articles
- 📋 Form Expert - View 5 forms
- 🌅 Early Bird - Login before 8 AM
- 🦉 Night Owl - Login after 10 PM

### Medium Badges (Uncommon)
- 🎯 Quiz Master - 100% on quiz
- 🌍 Polyglot - Use 3 languages
- ⭐ Simulation Star - Complete simulation
- 🔥 On Fire - 7-day streak
- 🤝 Social Voter - Share result

### Hard Badges (Rare)
- 📜 Constitution Guru - Perfect constitution quiz
- 💪 Unstoppable - 30-day streak
- 📢 Influencer - Share 5 times

### Very Hard (Epic)
- 📅 Daily Voter - 100 logins
- 🏆 Democracy Champion - Level 8

### Legendary (Max)
- 👑 Civic Legend - Level 10

---

## 💰 XP Table

| Activity | XP | Notes |
|----------|-----|-------|
| Ask question | +5 | Per question |
| Quiz answer | +10 | Per correct (multiply by difficulty) |
| Quiz 100% | +30 | Bonus on perfect score |
| Simulation | +50 | Complete polling day |
| Blog read | +5 | Per article |
| Flashcard set | +15 | Per completed set |
| Daily login | +10 | Once per day |
| First question | +20 | One-time bonus |

### Quiz Difficulty Multipliers
- **Beginner**: 1.0x (no bonus)
- **Student**: 1.5x (50% more)
- **Exam**: 2.0x (double)

---

## 🔌 API Reference

### Add XP
```
POST /api/gamification/xp/add
{
  "user_id": "user-123",
  "activity_type": "chat_question",
  "amount": 5
}
→ 200 OK
{
  "xp_gained": 5,
  "new_total_xp": 125,
  "new_level": 2,
  "badges_unlocked": ["first_vote"],
  "level_up": true
}
```

### Submit Quiz
```
POST /api/gamification/quiz/submit
{
  "user_id": "user-123",
  "topic": "general_election",
  "difficulty": "student",
  "score": 9,
  "total_questions": 10
}
→ 200 OK
{
  "xp_gained": 135,
  "bonuses_applied": ["perfect_quiz_bonus"],
  "new_total_xp": 500,
  "new_level": 2,
  "badges_unlocked": ["quiz_master"]
}
```

### Get Leaderboard
```
GET /api/gamification/leaderboard?limit=10&offset=0
→ 200 OK
{
  "entries": [
    {
      "rank": 1,
      "username": "meera_active",
      "xp": 2100,
      "level": 7,
      "badges_count": 3
    },
    ...
  ],
  "total_users": 150,
  "user_rank": { "rank": 15, "username": "...", ... }
}
```

### Get User Profile
```
GET /api/gamification/user/user-123/profile
→ 200 OK
{
  "user_id": "user-123",
  "xp": 1250,
  "level": 5,
  "badges": ["first_vote", "quiz_master", "news_hawk"],
  "stats": {
    "total_questions_asked": 23,
    "total_quizzes": 5,
    "current_streak": 7,
    ...
  }
}
```

---

## 🎨 Component Props Reference

### XPBar
```jsx
<XPBar
  showLabel={true}        // Show "XP to next level"
  compact={false}         // Compact mode
  animated={true}         // Enable animations
/>
```

### Leaderboard
```jsx
<Leaderboard
  users={leaderboardUsers}           // Array of users
  isLoading={false}                  // Loading state
  currentUsername="user123"          // Highlight user
  itemsPerPage={10}                  // Per page
  onPaginationChange={(page) => {}}  // Pagination callback
/>
```

### BadgesShowcase
```jsx
<BadgesShowcase
  compact={false}        // Show 3 or all
  maxDisplay={6}         // Max before "show all"
  showAllButton={true}   // Show expand button
/>
```

### StreakTracker
```jsx
<StreakTracker
  currentStreak={7}      // Current streak days
  longestStreak={15}     // Personal best
  showHistory={true}     // Show milestones
/>
```

### XPNotification
```jsx
<XPNotificationToast
  onBadgeUnlocked={(badgeId) => {
    // Handle badge unlock
  }}
/>
```

---

## 🎯 Zustand Store Quick Reference

```jsx
import { useXP, useBadges, useXPNotification } from "@/store/useGamificationStore";

// Get XP data
const { xp, level, progress, nextLevelXP } = useXP();

// Get badges
const { badges, addBadge, hasBadge } = useBadges();

// Get notification
const { show, xp, reason, dismiss } = useXPNotification();

// Direct store access
import { useGamificationStore } from "@/store/useGamificationStore";
const addXP = useGamificationStore((state) => state.addXP);
```

---

## 📱 Component Size Guide

### Desktop (1024px+)
- XPBar: Full width
- Leaderboard: Full width table
- BadgesShowcase: 3 columns grid
- StreakTracker: Full width card

### Tablet (768px-1023px)
- XPBar: Full width
- Leaderboard: Full width table
- BadgesShowcase: 2 columns grid
- StreakTracker: Full width card

### Mobile (< 768px)
- XPBar: Full width (compact padding)
- Leaderboard: Scrollable table
- BadgesShowcase: 1 column grid
- StreakTracker: Full width card

---

## 🔧 Troubleshooting

### Notifications not showing?
1. Ensure `XPNotificationToast` in root layout
2. Check Sonner installation
3. Verify `showXPNotification` state in store

### Leaderboard empty?
1. Ensure users have XP data
2. Check API endpoint returns data
3. Verify `users` prop passed correctly

### XP not updating?
1. Call `addXP()` from store
2. Verify Zustand store initialized
3. Check console for errors

### Badge unlock not working?
1. Verify badge unlock conditions
2. Check `user_stats` passed to function
3. Ensure badge ID exists in BADGES

---

## 🚨 Important Notes

1. **Zustand Store** uses localStorage - data persists across sessions
2. **XP Notifications** auto-dismiss after 2.5 seconds
3. **Level Colors** change dynamically based on level (1-10)
4. **Leaderboard** shows top 100 users by default
5. **Streak Tracking** requires daily login tracking on backend

---

## 📈 Performance Tips

1. **Lazy load components**:
   ```jsx
   const Leaderboard = dynamic(() => import("@/components/gamification/Leaderboard"));
   ```

2. **Memoize XP calculations**:
   ```jsx
   const xp = useMemo(() => calculateXPForQuiz(...), [score, difficulty]);
   ```

3. **Debounce store updates**:
   ```jsx
   const debouncedAddXP = useDebouncedCallback((xp, reason) => {
     addXP(xp, reason);
   }, 500);
   ```

---

## 🎓 Learning Resources

- **Framer Motion**: Animations and transitions
- **Zustand**: State management
- **Sonner**: Toast notifications
- **Next.js**: App routing and internationalization

---

## ✅ Deployment Checklist

- [ ] All 14 files copied to workspace
- [ ] Dependencies installed
- [ ] Components added to pages
- [ ] Notifications added to layout
- [ ] XP calculation integrated
- [ ] Backend router registered
- [ ] Database schema created
- [ ] Environment variables set
- [ ] All tests passing
- [ ] Ready to deploy!

---

## 🎉 You're Ready!

Everything is set up and ready to go. Start awarding XP to engage your users!

**Need help?** Check the detailed docs:
- `GAMIFICATION_SYSTEM.md` - Full documentation
- `GAMIFICATION_INTEGRATION.md` - Implementation guide
- `BUILD_SUMMARY.md` - Complete file listing

---

**Happy Gamifying! 🚀🇮🇳**
