# CivicGuide AI - Complete Deployment Configuration

## 🎯 Overview

This document summarizes all deployment and backend configuration files created for CivicGuide AI using:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)  
- **Database**: Supabase (free tier)
- **AI**: Google Gemini 1.5 Flash (free tier)
- **News**: Tavily API (free tier)
- **CI/CD**: GitHub Actions (free)

**Total Cost: $0/month** on free tiers (no credit card required)

---

## 📁 Configuration Files Created

### 1. **frontend/vercel.json**
✅ **Status**: Complete

**Features:**
- Environment variables for API URL and Supabase
- API rewrites to backend (/api/* → Render)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Mumbai (bom1) region for lower latency in India
- Clean URLs enabled

**Setup**: Add to Vercel dashboard:
```
Environment Variables:
  NEXT_PUBLIC_API_URL = https://civicguide-api.onrender.com
  NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
```

---

### 2. **backend/render.yaml**
✅ **Status**: Complete

**Configuration:**
- Service name: `civicguide-api`
- Region: Singapore (closest to India)
- Python environment
- Free tier (750 hours/month)
- Health check: `/health`
- Auto-deploy on push to main
- Workers: 1 (for free tier)

**Environment Variables (set in Render dashboard):**
```yaml
GOOGLE_API_KEY=AIzaSy...            (secret)
GEMINI_MODEL=gemini-1.5-flash       (public)
GEMINI_PRO_MODEL=gemini-1.5-pro     (public)
SUPABASE_URL=https://xxxx...        (secret)
SUPABASE_SERVICE_KEY=eyJhbGc...     (secret)
SUPABASE_ANON_KEY=eyJhbGc...        (secret)
TAVILY_API_KEY=tvly-...             (secret)
FRONTEND_URL=https://civicguide-ai.vercel.app
ENVIRONMENT=production
```

---

### 3. **backend/Procfile**
✅ **Status**: Complete

```
web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
```

Specifies single worker for free tier optimization.

---

### 4. **backend/requirements.txt**
✅ **Status**: Complete - Fully Pinned

**Key Dependencies:**
```
FastAPI==0.110.3                          (async web framework)
google-generativeai==0.7.2                (Gemini SDK)
langchain-google-genai==1.0.7             (LangChain integration)
langchain==0.2.6                          (agent framework)
supabase==2.5.0                           (database)
tavily-python==0.3.3                      (news search)
tenacity==8.3.0                           (retry logic)
slowapi==0.1.9                            (rate limiting)
```

**Removed:**
- anthropic (Claude SDK - no longer needed)
- langchain-anthropic

---

### 5. **backend/.env.example**
✅ **Status**: Complete

**Template for local development:**
```bash
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
GEMINI_PRO_MODEL=gemini-1.5-pro
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
TAVILY_API_KEY=tvly-...
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

---

### 6. **frontend/.env.example**
✅ **Status**: Complete

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_NAME=CivicGuide AI
NEXT_PUBLIC_ECI_URL=https://eci.gov.in
```

---

### 7. **backend/main.py**
✅ **Status**: Enhanced

**New Features:**
- Lifespan context logging (startup/shutdown)
- CORS origins from environment
- Rate limiting: 30 requests/minute (configurable)
- Health endpoint with Gemini model info
- `/api/credit-status` endpoint
- Production mode disables API docs
- Proper error handling

**Key Endpoints:**
```
GET  /health                          → Health check + model info
GET  /api/credit-status              → API usage status
GET  /api/elections                  → Upcoming elections
POST /api/chat                       → Chat endpoint
POST /api/chat/stream                → Streaming chat
... (other routers included)
```

---

### 8. **backend/utils/gemini.py**
✅ **Status**: Complete (470+ lines)

**Main Components:**

#### CreditManager Class
- Tracks monthly API requests
- Auto-resets on 1st of month at 00:00 UTC
- Persistent storage in `/tmp/gemini_credits.json`
- Status levels: Good (0-79%), Warning (80-99%), Over (100%+)

#### Async Functions
- `generate_chat_response()` - Main chat with history
- `stream_chat_response()` - Server-Sent Events
- `generate_quiz_json()` - Quiz with JSON output
- `summarize_news()` - News summarization
- `translate_text()` - Multi-language support

#### Models
- `get_flash_model()` → Gemini 1.5 Flash (speed)
- `get_pro_model()` → Gemini 1.5 Pro (reasoning)

#### Safety Settings
- BLOCK_ONLY_HIGH for hate speech
- BLOCK_MEDIUM_AND_ABOVE for sexual/dangerous content

#### Error Handling
- Tenacity retry with exponential backoff (3 attempts)
- Detailed error messages
- Fallback mechanisms

---

### 9. **backend/routers/chat.py** (NEW: chat_new.py)
✅ **Status**: Complete (200+ lines)

**Two Endpoints:**

#### POST /api/chat (Non-streaming)
```json
Request: {
  "message": "How do I register to vote?",
  "language": "en",
  "session_id": "user-123",
  "history": [...],
  "use_agent": true
}

Response: {
  "reply": "To register...",
  "xp_earned": 5,
  "references": ["https://eci.gov.in"],
  "credit_status": {...},
  "session_id": "user-123"
}
```

#### POST /api/chat/stream (Streaming SSE)
```
data: {"delta": "To register"}
data: {"delta": " to vote,"}
...
data: {"done": true, "xp": 5}
```

**Features:**
- Conversation history support
- XP gamification
- Background task logging
- Rate limiting per user
- Language support (5 locales)

---

### 10. **backend/agents/election_agent.py** (NEW: election_agent_new.py)
✅ **Status**: Complete (350+ lines)

**LangChain ReAct Agent with 6 Tools:**

1. **get_election_info()** - Knowledge base search
2. **get_form_info()** - Form 6/7/8 details
3. **get_election_timeline()** - Upcoming elections
4. **search_eci_news()** - ECI news (Tavily)
5. **get_voter_registration_steps()** - Registration guide
6. **translate_civic_text()** - Multi-language support

**Agent Features:**
- ReAct prompt for reasoning
- Max 5 iterations (prevents loops)
- Error handling for parsing
- Gamification (5-10 XP per response)
- References: ECI links + helpline

**Example Query:**
```
User: "How do I register to vote in Maharashtra?"
Agent Flow:
  1. Thought: User needs voter registration info for specific state
  2. Action: get_voter_registration_steps(state="Maharashtra")
  3. Observation: [returns step-by-step guide]
  4. Action: get_election_timeline(state="Maharashtra")
  5. Observation: [returns upcoming elections]
  6. Final Answer: [combined, relevant response]
```

---

### 11. **.github/workflows/deploy.yml**
✅ **Status**: Complete (CI/CD Pipeline)

**4 Jobs:**

#### 1️⃣ frontend-check
- npm install, lint, TypeScript check, build
- Runs on: PR and pushes

#### 2️⃣ backend-check
- pip install, ruff lint, import check
- Runs on: PR and pushes

#### 3️⃣ deploy-frontend (on push to main)
- Deploys to Vercel
- Uses amondnet/vercel-action

#### 4️⃣ deploy-backend (on push to main)
- Triggers Render deploy hook
- Waits for health check (/health)
- Retries up to 30 times (60 seconds total)

**Required GitHub Secrets:**
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_URL
SUPABASE_ANON_KEY
RENDER_DEPLOY_HOOK_URL
```

---

## 🚀 Deployment Steps

### Step 1: Prepare API Keys
```bash
# Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy (starts with AIzaSy...)

# Supabase
1. Go to https://supabase.com/dashboard
2. Create project or use existing
3. Copy SUPABASE_URL, SERVICE_KEY, ANON_KEY

# Tavily
1. Go to https://tavily.com/
2. Create account, get API key

# GitHub
1. Generate personal access token
2. Create repo secrets for deployment keys
```

### Step 2: Configure Render Backend
```bash
# In Render Dashboard:
1. Connect GitHub repository
2. Create new Web Service from repo
3. Set Python 3.11 + environment
4. Add environment variables (from above)
5. Set build command: pip install -r requirements.txt
6. Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
7. Copy deploy hook URL
```

### Step 3: Configure Vercel Frontend
```bash
# In Vercel Dashboard:
1. Connect GitHub repository
2. Select frontend/ as root directory
3. Add environment variables:
   - NEXT_PUBLIC_API_URL: https://civicguide-api.onrender.com
   - NEXT_PUBLIC_SUPABASE_URL: [from Supabase]
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: [from Supabase]
4. Deploy
```

### Step 4: Add GitHub Secrets
```bash
# In GitHub > Settings > Secrets and variables:
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
RENDER_DEPLOY_HOOK_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

### Step 5: Test Deployment
```bash
# Test backend health
curl https://civicguide-api.onrender.com/health

# Expected response:
{
  "status": "ok",
  "ai_provider": "Google Gemini",
  "model": "gemini-1.5-flash",
  "environment": "production",
  "api_configured": true
}

# Test credit status
curl https://civicguide-api.onrender.com/api/credit-status

# Test frontend
Open https://civicguide-ai.vercel.app in browser
```

---

## 💰 Cost Analysis

### Free Tier Summary

| Service | Limit | Cost |
|---------|-------|------|
| Vercel Frontend | Unlimited builds | $0 |
| Render Backend | 750 hours/month | $0 |
| Supabase DB | 500 MB + 2 GB transfer | $0 |
| Google Gemini | 1,500 req/day, 1M tokens/min | $0 |
| Tavily News | 1,000 searches/month | $0 |
| GitHub Actions | 2,000 minutes/month | $0 |
| **Total** | Enough for small-medium projects | **$0** |

### Upgrade Path (when needed)
- Render: $7/month → $65/month
- Supabase: $25/month (Pro tier)
- Gemini: $20/month (higher limits)
- Tavily: $99/month (higher limits)

---

## 📊 Traffic Estimates

### Daily Free Tier Usage
```
Gemini: 60 requests/minute = 86,400 requests/day (more than enough)
Tavily: 1,000 searches/month = 33 searches/day (reasonable)
Database: 500 MB storage (plenty for civic data)
```

### When to Upgrade
```
Gemini: When needing >86K daily requests or real-time translation
Render: When backend CPU exceeds 100% (scale up workers)
Supabase: When database exceeds 500 MB
```

---

## 🔒 Security Features

### Implemented
- ✅ CORS with specific origins
- ✅ Rate limiting (30 req/min)
- ✅ Security headers (X-Content-Type-Options, etc.)
- ✅ Health checks for uptime
- ✅ Error handling (no stack traces in production)
- ✅ API key rotation support

### Recommended
- [ ] Add JWT authentication
- [ ] Implement database row-level security
- [ ] Set up monitoring alerts
- [ ] Enable audit logging
- [ ] Add bot detection

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check logs
render logs backend

# Common issues:
1. Missing GOOGLE_API_KEY → Set in Render env vars
2. Port already in use → Render handles automatically
3. Module not found → pip install -r requirements.txt
```

### API returns 429 (Rate Limited)
```bash
# You're over 30 req/minute
# Wait a minute or reduce request frequency
# Check /api/credit-status for Gemini limits
```

### Chat returns "over limit"
```bash
# Gemini free tier limit (60 req/min) reached
# Wait until next UTC hour or next month
# Check /tmp/gemini_credits.json for details
```

### Frontend can't reach backend
```bash
# Check NEXT_PUBLIC_API_URL in Vercel env vars
# Should be: https://civicguide-api.onrender.com
# Check CORS in backend/main.py
```

---

## 📝 Monitoring Checklist

Daily:
- [ ] Check `/health` endpoint
- [ ] Monitor error logs
- [ ] Verify chat responses are working

Weekly:
- [ ] Check `/api/credit-status` for usage
- [ ] Review GitHub Actions logs
- [ ] Monitor response times

Monthly:
- [ ] Verify credits reset on 1st
- [ ] Review database storage
- [ ] Check deployment costs

---

## 🎓 Next Steps

1. **Get API Keys** (15 min)
   - Gemini: https://makersuite.google.com/app/apikey
   - Supabase: https://supabase.com/dashboard
   - Tavily: https://tavily.com/

2. **Deploy Backend** (10 min)
   - Connect to Render
   - Set environment variables
   - Deploy from main branch

3. **Deploy Frontend** (10 min)
   - Connect to Vercel
   - Set environment variables
   - Deploy from main branch

4. **Test APIs** (5 min)
   - Test /health endpoint
   - Test /api/chat endpoint
   - Test frontend UI

5. **Monitor** (ongoing)
   - Check credit usage
   - Monitor error logs
   - Scale as needed

---

## 📞 Support

- **ECI Official**: https://eci.gov.in
- **Voters Portal**: https://voters.eci.gov.in
- **ECI Helpline**: 1950 (India)
- **Gemini Docs**: https://ai.google.dev/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Deployment Configuration Complete! 🚀**

All files are production-ready with:
- ✅ Error handling
- ✅ Rate limiting
- ✅ Monitoring hooks
- ✅ Graceful degradation
- ✅ Zero subscription costs

Ready to serve Indian voters! 🇮🇳
