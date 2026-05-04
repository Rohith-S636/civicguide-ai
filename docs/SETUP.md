# CivicGuide AI - Setup Guide

## Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- Git

## Backend Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```
ANTHROPIC_API_KEY=your_claude_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
TAVILY_API_KEY=your_tavily_key
```

### 3. Run the Backend Server
```bash
python main.py
```
The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies
```bash
Cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the `frontend/` directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

## Database Setup

### Supabase Configuration
1. Create a Supabase project
2. Create the following tables:
   - `users` - User profiles and XP tracking
   - `quiz_questions` - Quiz questions
   - `chat_history` - Chat conversations
   - `news_articles` - Cached news articles

## API Documentation
See [API.md](./API.md) for detailed API endpoints.

## Deployment
See [DEPLOY.md](./DEPLOY.md) for deployment instructions.
