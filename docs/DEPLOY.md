# 🚀 CivicGuide AI Deployment Guide

## 1. Supabase Setup (Database)
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** and run your schema (Tables: `users`, `xp_logs`, `election_queries`).
3. Under **Project Settings > API**, copy the `Project URL` and `service_role` key.
4. Enable **RLS (Row Level Security)** on all tables.

## 2. Render Deployment (Backend API)
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **New Web Service**.
3. Set **Root Directory** to `backend`.
4. Select the **Free Tier**.
5. Add the following Environment Variables:
   - `ANTHROPIC_API_KEY`: Your Claude API key.
   - `TAVILY_API_KEY`: For AI news searches.
   - `SUPABASE_URL`: From Step 1.
   - `SUPABASE_SERVICE_KEY`: From Step 1.
   - `CORS_ORIGINS`: `https://your-app-name.vercel.app`

## 3. Vercel Deployment (Frontend)
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render service URL (e.g., `https://civicguide-api.onrender.com`).
5. Click **Deploy**.

## 4. CI/CD (GitHub Actions)
The included `.github/workflows/deploy.yml` will automatically trigger:
- Linting and testing on every push.
- Automatic deployment to Vercel and Render on push to `main` branch.
