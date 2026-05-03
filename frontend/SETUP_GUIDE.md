# CivicGuide AI - Next.js 14 Frontend Setup Guide

## 🎨 Project Overview

A modern, fully responsive Next.js 14 application for civic education about Indian elections. Features AI-powered learning, multilingual support, and a stunning civic-themed UI.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- React Query (data fetching)
- next-intl (internationalization)
- Framer Motion (animations)
- Sonner (toast notifications)
- Axios (HTTP client)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or higher
- npm 9+ or yarn 4+

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API endpoints
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js 14 App Router
│   ├── [locale]/                 # Locale dynamic segment (en, hi, te, ta)
│   │   ├── (dashboard)/          # Route group - Dashboard
│   │   │   └── page.tsx          # Home page
│   │   ├── (learn)/              # Route group - Learning
│   │   │   ├── page.tsx
│   │   │   ├── quiz/
│   │   │   ├── constitution/
│   │   │   ├── simulation/
│   │   │   └── flashcards/
│   │   ├── (community)/          # Route group - Community
│   │   │   ├── page.tsx
│   │   │   ├── news/
│   │   │   └── blogs/
│   │   ├── (profile)/            # Route group - User Profile
│   │   │   └── page.tsx
│   │   ├── chat/                 # AI Chat route
│   │   ├── layout.tsx            # Locale layout wrapper
│   │   └── not-found.tsx         # 404 page
│   ├── layout.tsx                # Root layout with sidebar & fonts
│   ├── globals.css               # Global styles & CSS variables
│   ├── icon.tsx                  # Favicon (optional)
│
├── components/
│   ├── PageWrapper.tsx           # Reusable page layout with breadcrumbs
│   └── ui/                       # shadcn/ui components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Skeleton.tsx
│
├── lib/
│   ├── api.ts                    # Axios API client with interceptors
│   ├── constants.ts              # App constants & configurations
│   ├── mockData.ts               # Development mock data
│   └── utils.ts                  # Utility functions (cn, formatDate, etc.)
│
├── hooks/
│   ├── useApi.ts                 # React Query hooks for API calls
│   └── useNotification.ts        # Toast notification hook
│
├── store/                        # Zustand stores
│   ├── useAuthStore.ts           # Authentication state
│   └── useUIStore.ts             # UI state (sidebar, theme)
│
├── messages/                     # i18n translation files
│   ├── en.json
│   ├── hi.json
│   ├── te.json
│   └── ta.json
│
├── public/                       # Static assets
├── middleware.ts                 # next-intl middleware
├── i18n.ts                       # next-intl configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # Dependencies
├── README.md                     # This file
└── .env.example                  # Environment variables template
```

## 🎨 Civic Color Scheme

The application uses India's national colors for a cohesive civic theme:

```css
--saffron: #FF9933      /* Primary - Energy, courage */
--india-green: #138808  /* Secondary - Growth, vitality */
--navy: #000080         /* Accent - Stability, trust */
--civic-light: #F5F5F5  /* Background - Clean, accessible */
```

Tailwind config includes custom gradients:
- `bg-gradient-civic` - Full civic tricolor gradient
- `bg-gradient-civic-light` - Lighter civic gradient for backgrounds

## 🌍 Multilingual Support (next-intl)

The app supports 4 languages with automatic font selection:

- **English** (en) - Default
- **Hindi** (hi) - Devanagari script
- **Tamil** (ta) - Tamil script
- **Telugu** (te) - Telugu script

### Adding Translations

Edit `messages/[locale].json`:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "learn": "Learn"
  }
}
```

Usage in components:

```typescript
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations();
  return <h1>{t('nav.dashboard')}</h1>;
}
```

## 🧩 Key Components

### PageWrapper
Reusable layout component with breadcrumbs, title, and civic-themed header.

```typescript
<PageWrapper
  title="Learn"
  description="Choose your learning path"
  breadcrumbs={[{ label: 'Learn', href: '/learn' }]}
  headerAction={<Button>Start Quiz</Button>}
>
  {children}
</PageWrapper>
```

### Button Component
Multiple variants with civic theme support:

```typescript
<Button variant="default">Primary (Saffron)</Button>
<Button variant="secondary">Secondary (Green)</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Card Component
Flexible card containers:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>{children}</CardContent>
</Card>
```

## 🔌 API Integration

All API calls use the centralized `apiClient`:

```typescript
import { api } from '@/lib/api';

// Chat
await api.chat.sendMessage('Hello');

// Quiz
await api.quiz.generateQuiz('Elections', 'medium');

// News
await api.news.getLatest(10);

// User
await api.user.getProfile();
```

### React Query Hooks

```typescript
import { useApiQuery, usePostMutation } from '@/hooks/useApi';

// Fetch data
const { data, isLoading } = useApiQuery(['profile'], '/api/users/profile');

// Mutations
const { mutate } = usePostMutation('/api/quiz/answer');
```

## 💾 State Management (Zustand)

### Auth Store

```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { user, setUser, logout } = useAuthStore();
```

### UI Store

```typescript
import { useUIStore } from '@/store/useUIStore';

const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
```

## 🎯 Route Groups

Route groups organize related routes without affecting the URL:

- `(dashboard)` → `/` (main dashboard)
- `(learn)` → `/learn/*` (learning modules)
- `(community)` → `/community/*` (community features)
- `(profile)` → `/profile` (user profile)

## 📝 Styling System

### Global CSS Variables

Defined in `globals.css` for theming:

```css
:root {
  --primary: 16 100% 50%;        /* Saffron */
  --secondary: 104 53% 48%;      /* Green */
  --saffron: #FF9933;
  --india-green: #138808;
  --navy: #000080;
}
```

### Tailwind Custom Utilities

- Civic shadows: `shadow-civic-sm`, `shadow-civic-md`, `shadow-civic-lg`
- Civic backgrounds: `bg-gradient-civic`, `bg-gradient-civic-light`
- Custom fonts: `font-sans` (Inter), `font-noto` (Noto Sans)

## 🔐 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🏗️ Build & Deployment

### Build Production Bundle

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

### Deploy to Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t civicguide-frontend .
docker run -p 3000:3000 civicguide-frontend
```

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Sidebar is hidden on mobile, use hamburger menu or bottom navigation.

## 🚀 Performance Optimization

- **Image Optimization**: Next.js Image component with remotePatterns
- **Code Splitting**: Automatic via App Router
- **Font Optimization**: Google Fonts with `next/font`
- **Lazy Loading**: Dynamic imports for heavy components
- **API Caching**: React Query with custom config

## 🛠️ Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type checking with TypeScript
```

## 📚 Additional Features

### Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner';

toast.success('Quiz completed!');
toast.error('Please try again');
toast.info('New feature available');
```

### Custom Hooks

```typescript
// Notifications
const { success, error } = useNotification();

// API calls
const { data, isLoading } = useApiQuery(key, url);
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create Pull Request

## 📄 License

MIT License - See LICENSE file in root

## 🆘 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

### Build fails on Vercel

Check environment variables are set in Vercel dashboard matching `.env.local`.

## 📞 Support

For issues or questions:
1. Check existing issues in repository
2. Review documentation in `/docs`
3. Contact development team

---

**Happy Coding! 🇮🇳**
