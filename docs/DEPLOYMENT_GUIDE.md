# 🚀 CivicGuide AI - Deployment Configuration Guide

**Last Updated**: May 6, 2026  
**Status**: Ready for Production Deployment

---

## Overview

This guide details the complete deployment setup for CivicGuide AI, including:
- Backend deployment on Render
- Frontend deployment on Vercel  
- Database setup on Supabase
- CI/CD pipeline with GitHub Actions
- Monitoring and health checks

---

## 📋 Prerequisites

### Required Services
- ✅ Render account (backend hosting)
- ✅ Vercel account (frontend hosting)
- ✅ Supabase account (database)
- ✅ GitHub repository
- ✅ Google Gemini API key
- ✅ Tavily API key (optional)

### Required Environment Variables

#### Backend (Render)
```
ENVIRONMENT=production
GOOGLE_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
TAVILY_API_KEY=<your-tavily-api-key>
FRONTEND_URL=https://civicguide-ai.vercel.app
```

#### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://civicguide-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the main branch
5. Configure:
   - **Name**: `civicguide-api`
   - **Environment**: Python 3.11
   - **Region**: Singapore (for India)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1`
   - **Root Directory**: `backend`

### Step 2: Configure Environment Variables

In Render dashboard:
1. Go to Environment
2. Add all variables from "Backend (Render)" section above
3. Click "Save"

### Step 3: Verify Deployment

```bash
# Check service status
curl https://civicguide-api.onrender.com/health

# Expected response:
# {
#   "status": "ok",
#   "ai_provider": "Google Gemini",
#   "environment": "production",
#   "services": {
#     "gemini": "✓",
#     "supabase": "✓"
#   }
# }
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `frontend` directory as root

### Step 2: Configure Environment Variables

1. In Vercel Project Settings → Environment Variables
2. Add all variables from "Frontend (Vercel)" section
3. Apply to Production

### Step 3: Configure Build Settings

1. **Framework**: Next.js
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`

### Step 4: Deploy

Vercel will auto-deploy on every push to main branch.

---

## 📊 Database Setup (Supabase)

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and API keys

### Step 2: Initialize Schema

```bash
# Connect to Supabase
psql "postgresql://postgres:[password]@[host]:[port]/postgres"

# Run schema setup
\i database/schema.sql
```

### Step 3: Configure RLS Policies

All RLS policies are included in `schema.sql`. Verify:
```sql
-- Check policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Workflows

#### Backend Workflow (`.github/workflows/backend.yml`)
- **Triggers**: Push/PR to main on backend changes
- **Jobs**:
  - ✓ Test (pytest, coverage)
  - ✓ Security scan (bandit, safety)
  - ✓ Deploy to Render (main branch only)
  - ✓ Health check

#### Frontend Workflow (`.github/workflows/frontend.yml`)
- **Triggers**: Push/PR to main on frontend changes
- **Jobs**:
  - ✓ Build & Test (ESLint, TypeScript, Next.js build)
  - ✓ Security scan (npm audit, Snyk)
  - ✓ Deploy to Vercel (main branch only)
  - ✓ Deployment verification

### Setup GitHub Secrets

Add these to your GitHub repository settings under Secrets:

```
RENDER_SERVICE_ID=<your-render-service-id>
RENDER_API_KEY=<your-render-api-key>
VERCEL_TOKEN=<your-vercel-token>
GOOGLE_API_KEY=<your-gemini-api-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## ✅ Deployment Verification Checklist

### Backend Health Checks

```bash
# 1. Health endpoint
curl -v https://civicguide-api.onrender.com/health

# 2. Check API response
curl -X POST https://civicguide-api.onrender.com/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'

# 3. Check rate limiting
for i in {1..35}; do 
  curl https://civicguide-api.onrender.com/health -w "\nStatus: %{http_code}\n"
done
```

### Frontend Health Checks

```bash
# 1. Check site loads
curl -v https://civicguide-ai.vercel.app/

# 2. Check security headers
curl -I https://civicguide-ai.vercel.app/ | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"

# 3. Check API connectivity
# Navigate to https://civicguide-ai.vercel.app and check browser console for errors
```

### Database Health Checks

```sql
-- Check user table
SELECT COUNT(*) FROM public.users;

-- Check quiz sessions
SELECT COUNT(*) FROM public.quiz_sessions;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

---

## 🚨 Deployment Issues & Solutions

### Issue: Backend deployment timeout
**Solution**: 
- Check Procfile is correct
- Ensure all dependencies in requirements.txt
- Increase deployment timeout in Render settings

### Issue: CORS errors in frontend
**Solution**:
- Verify `FRONTEND_URL` env var matches deployment URL
- Check Vercel domain is added to CORS origins
- Restart backend service

### Issue: Database connection failed
**Solution**:
- Verify SUPABASE_URL and keys are correct
- Check VPC/firewall settings allow connection
- Test with `psql` directly

### Issue: API keys not working
**Solution**:
- Confirm keys are not expired
- Verify keys have correct permissions
- Check keys are set in environment variables

---

## 📈 Monitoring & Logs

### View Backend Logs (Render)

```bash
# SSH into Render
# Or view logs in Render dashboard:
# https://dashboard.render.com/services/civicguide-api/logs
```

### View Frontend Logs (Vercel)

```
https://vercel.com/dashboard/[username]/civicguide-ai/logs
```

### Monitor API Performance

```bash
# Track response times
curl -w "@curl-format.txt" -o /dev/null -s https://civicguide-api.onrender.com/health

# Test under load (using Apache Bench)
ab -n 1000 -c 100 https://civicguide-api.onrender.com/health
```

---

## 🔐 Security Checklist

- ✅ CORS properly configured (production-only origins)
- ✅ HTTPS enforced (Render + Vercel default)
- ✅ Security headers set (X-Frame-Options, CSP, etc.)
- ✅ Rate limiting enabled (30/minute)
- ✅ Input validation implemented
- ✅ Auth tokens stored securely (sessionStorage)
- ✅ CSRF protection enabled
- ✅ SQL injection prevention (Supabase prepared statements)
- ✅ Environment variables not exposed
- ✅ Dependencies scanned for vulnerabilities

---

## 📝 Manual Deployment (if CI/CD fails)

### Backend

```bash
# Build and push to Render
cd backend
git push origin main
# Render will auto-deploy

# Or manual push:
render deploy --service-id srv-xyz
```

### Frontend

```bash
# Build and push to Vercel
cd frontend
npm run build
vercel deploy --prod --token $VERCEL_TOKEN
```

---

## 🔗 Important Links

- **Frontend**: https://civicguide-ai.vercel.app
- **Backend API**: https://civicguide-api.onrender.com
- **API Docs**: https://civicguide-api.onrender.com/docs (dev only)
- **Health Check**: https://civicguide-api.onrender.com/health
- **Database**: https://supabase.com/dashboard/

---

## 📞 Support & Rollback

### Quick Rollback (Render)

```
Render Dashboard → Deployments → Select Previous Version → Activate
```

### Quick Rollback (Vercel)

```
Vercel Dashboard → Deployments → Select Previous → Promote
```

---

**Last Verified**: May 6, 2026  
**Next Review**: After each major deployment

