# CivicGuide AI - Frontend

A Next.js 14 application for AI-powered civic education about Indian elections.

## Features

- 🎨 **Civic-themed UI** with saffron, green, and navy color scheme
- 🌍 **Multilingual Support** - English, Hindi, Tamil, Telugu
- 🧠 **Interactive Learning** - Quizzes, flashcards, simulations
- 📚 **Constitution Explorer** - Learn about Indian Constitution
- 💬 **AI Chat** - Talk to the election AI assistant
- 🏆 **Gamification** - XP, levels, badges, leaderboards
- 📱 **Responsive Design** - Mobile, tablet, desktop
- ⚡ **Modern Stack** - Next.js 14, Tailwind, shadcn/ui, Zustand

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Query**: React Query
- **Animations**: Framer Motion
- **i18n**: next-intl
- **Fonts**: Inter, Noto Sans (multilingual)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── [locale]/          # Locale wrapper
│   ├── (dashboard)/       # Dashboard route group
│   ├── (learn)/           # Learning route group
│   ├── (community)/       # Community route group
│   ├── (profile)/         # Profile route group
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   └── PageWrapper.tsx    # Reusable page wrapper
├── lib/
│   ├── api.ts            # API client
│   └── utils.ts          # Utility functions
├── store/                 # Zustand stores
├── hooks/                 # Custom hooks
├── messages/              # i18n translations
├── public/                # Static assets
└── middleware.ts          # Next-intl middleware
```

## Key Features

### 1. Route Groups
- **(dashboard)** - Main landing and stats
- **(learn)** - Quiz, flashcards, constitution, simulation
- **(community)** - News, blogs, discussions
- **(profile)** - User profile, badges, achievements

### 2. Multilingual
- Automatic locale detection
- 4 languages: English, Hindi, Tamil, Telugu
- Locale-specific fonts for proper rendering

### 3. Civic Color Scheme
- Saffron (#FF9933) - Primary
- India Green (#138808) - Secondary
- Navy (#000080) - Accent
- Custom Tailwind config with civic gradients

### 4. Components
- **PageWrapper** - Consistent page layout with breadcrumbs
- **Card** - Reusable card component
- **Button** - Multiple variants (primary, secondary, ghost, outline)
- All built on shadcn/ui foundations

## API Integration

All API calls are managed through `@/lib/api.ts`:

```typescript
// Example usage
import { api } from '@/lib/api';

// Send chat message
const response = await api.chat.sendMessage('Hello');

// Generate quiz
const quiz = await api.quiz.generateQuiz('Elections', 'medium');

// Get user profile
const profile = await api.user.getProfile();
```

## State Management

Using Zustand for global state:

```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { user, setUser, logout } = useAuthStore();
```

## Styling

### Tailwind Config
Customized with civic theme colors and animations.

### CSS Variables
Global CSS variables defined in `globals.css` for easy theming.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

### Docker

```bash
docker build -t civicguide-frontend .
docker run -p 3000:3000 civicguide-frontend
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit and push
4. Create a Pull Request

## License

MIT License - See LICENSE file
