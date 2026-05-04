# Production Deployment Verification Checklist

## 🎯 Pre-Deployment Verification

Use this checklist to verify all configuration files are in place and properly configured.

---

## ✅ Configuration Files Verification

### Frontend Configuration

- [ ] `frontend/vercel.json` exists
  ```bash
  ls -la frontend/vercel.json
  # Should show: {"framework": "nextjs", "buildCommand": "npm run build", ...}
  ```

- [ ] Contains security headers
  ```bash
  grep -i "x-content-type" frontend/vercel.json
  # Should find multiple security headers
  ```

- [ ] API rewrite configured
  ```bash
  grep -i "rewrites" frontend/vercel.json
  # Should show /api/* rewrite to Render
  ```

- [ ] Environment variables template
  ```bash
  grep -i "NEXT_PUBLIC_API_URL" frontend/vercel.json
  # Should have @api_url placeholder
  ```

### Backend Deployment Configuration

- [ ] `backend/render.yaml` exists
  ```bash
  ls -la backend/render.yaml
  # Should show proper YAML structure
  ```

- [ ] Uses Gemini (not Claude)
  ```bash
  grep -i "google" backend/render.yaml
  # Should find GOOGLE_API_KEY, not ANTHROPIC_API_KEY
  ```

- [ ] Singapore region configured
  ```bash
  grep "region" backend/render.yaml
  # Should show: region: singapore
  ```

- [ ] Health check enabled
  ```bash
  grep "healthCheckPath" backend/render.yaml
  # Should show: healthCheckPath: /health
  ```

- [ ] `backend/Procfile` has correct format
  ```bash
  cat backend/Procfile
  # Should contain: web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
  ```

### Dependencies Configuration

- [ ] `backend/requirements.txt` has no duplicates
  ```bash
  sort backend/requirements.txt | uniq -d
  # Should show no duplicates
  ```

- [ ] All versions are pinned
  ```bash
  grep -E "^[a-zA-Z]" backend/requirements.txt | grep -v "=="
  # Should show nothing (all packages should have ==version)
  ```

- [ ] No Claude/Anthropic imports
  ```bash
  grep -i "anthropic" backend/requirements.txt
  # Should show nothing
  ```

- [ ] Gemini packages included
  ```bash
  grep -i "google-generativeai\|langchain-google" backend/requirements.txt
  # Should show both
  ```

- [ ] LangChain is included
  ```bash
  grep "langchain" backend/requirements.txt
  # Should show langchain and dependencies
  ```

### Environment Configuration

- [ ] `backend/.env.example` is complete
  ```bash
  grep -c "=" backend/.env.example
  # Should have 8+ environment variables
  ```

- [ ] `frontend/.env.example` is complete
  ```bash
  grep -c "=" frontend/.env.example
  # Should have 4+ environment variables
  ```

- [ ] No actual secrets in .env.example
  ```bash
  grep -E "AIza|eyJ|tvly" backend/.env.example
  # Should show only examples, not real keys
  ```

---

## ✅ Code Files Verification

### FastAPI Main Application

- [ ] `backend/main.py` imported from correct files
  ```bash
  grep "from backend.utils.gemini" backend/main.py
  # Should find gemini imports (not claude)
  ```

- [ ] CORS configured for production
  ```bash
  grep -A5 "CORSMiddleware" backend/main.py
  # Should include civicguide-ai.vercel.app
  ```

- [ ] Health endpoint returns Gemini info
  ```bash
  grep -A10 "/health" backend/main.py
  # Should return ai_provider: "Google Gemini"
  ```

- [ ] Credit status endpoint exists
  ```bash
  grep "/api/credit-status" backend/main.py
  # Should be present
  ```

- [ ] Rate limiting configured
  ```bash
  grep "limiter\|slowapi" backend/main.py
  # Should show rate limiting setup
  ```

### Gemini Utilities

- [ ] `backend/utils/gemini.py` exists and is complete
  ```bash
  wc -l backend/utils/gemini.py
  # Should be 400+ lines
  ```

- [ ] CreditManager class implemented
  ```bash
  grep "class CreditManager" backend/utils/gemini.py
  # Should find the class
  ```

- [ ] Async functions present
  ```bash
  grep -E "async def (generate_chat|stream_chat|generate_quiz)" backend/utils/gemini.py
  # Should find 3+ async functions
  ```

- [ ] Error handling with tenacity
  ```bash
  grep "@retry\|tenacity" backend/utils/gemini.py
  # Should find retry decorators
  ```

### Chat Router

- [ ] `backend/routers/chat_new.py` exists
  ```bash
  ls -la backend/routers/chat_new.py
  # Should exist
  ```

- [ ] Streaming endpoint implemented
  ```bash
  grep "stream\|StreamingResponse" backend/routers/chat_new.py
  # Should find streaming support
  ```

- [ ] Multiple endpoints (non-stream + stream)
  ```bash
  grep -c "@router.post" backend/routers/chat_new.py
  # Should be at least 2
  ```

### Election Agent

- [ ] `backend/agents/election_agent_new.py` exists
  ```bash
  ls -la backend/agents/election_agent_new.py
  # Should exist
  ```

- [ ] Uses LangChain
  ```bash
  grep "langchain" backend/agents/election_agent_new.py
  # Should find langchain imports
  ```

- [ ] Has 6 tools
  ```bash
  grep -c "def get_\|def search_" backend/agents/election_agent_new.py
  # Should show 6+ tool functions
  ```

- [ ] ReAct agent pattern
  ```bash
  grep "create_react_agent\|AgentExecutor" backend/agents/election_agent_new.py
  # Should find ReAct agent setup
  ```

---

## ✅ CI/CD Pipeline Verification

- [ ] `.github/workflows/deploy.yml` exists
  ```bash
  ls -la .github/workflows/deploy.yml
  # Should exist
  ```

- [ ] Has 4 jobs
  ```bash
  grep "jobs:" -A 50 .github/workflows/deploy.yml | grep -c "^\s\s[a-z]*:"
  # Should show 4 jobs
  ```

- [ ] Frontend check job exists
  ```bash
  grep "frontend-check" .github/workflows/deploy.yml
  # Should find
  ```

- [ ] Backend check job exists
  ```bash
  grep "backend-check" .github/workflows/deploy.yml
  # Should find
  ```

- [ ] Deploy jobs use correct services
  ```bash
  grep "amondnet/vercel\|RENDER_DEPLOY_HOOK" .github/workflows/deploy.yml
  # Should find both
  ```

- [ ] Health verification present
  ```bash
  grep "health\|/health" .github/workflows/deploy.yml
  # Should find health check
  ```

---

## ✅ Documentation Verification

- [ ] `docs/DEPLOYMENT_CONFIGURATION.md` is comprehensive
  ```bash
  wc -l docs/DEPLOYMENT_CONFIGURATION.md
  # Should be 500+ lines
  ```

- [ ] Contains API endpoint documentation
  ```bash
  grep -c "POST\|GET" docs/DEPLOYMENT_CONFIGURATION.md
  # Should have 10+ endpoints documented
  ```

- [ ] Includes troubleshooting section
  ```bash
  grep -i "troubleshoot\|issue" docs/DEPLOYMENT_CONFIGURATION.md
  # Should find troubleshooting
  ```

- [ ] `docs/DEPLOYMENT_SUMMARY.md` exists
  ```bash
  ls -la docs/DEPLOYMENT_SUMMARY.md
  # Should exist and be 200+ lines
  ```

---

## ✅ Pre-Deployment Checklist

### API Keys & Credentials

- [ ] Google Gemini API key obtained
  ```bash
  echo $GOOGLE_API_KEY | head -c 20
  # Should show: AIzaSy... (starts with AIzaSy)
  ```

- [ ] Supabase credentials obtained
  ```bash
  echo $SUPABASE_URL
  # Should show: https://xxxx.supabase.co
  ```

- [ ] Tavily API key obtained
  ```bash
  echo $TAVILY_API_KEY
  # Should show: tvly-... (starts with tvly)
  ```

- [ ] GitHub repository is ready
  ```bash
  git log --oneline -1
  # Should show recent commits
  ```

### Local Testing

- [ ] Backend starts locally
  ```bash
  cd backend && python -c "import main; print('✅ Backend imports OK')"
  # Should show: ✅ Backend imports OK
  ```

- [ ] All imports work
  ```bash
  python -c "import utils.gemini; import agents.election_agent_new; print('✅ All imports OK')"
  # Should show: ✅ All imports OK
  ```

- [ ] Frontend builds locally
  ```bash
  cd frontend && npm run build 2>&1 | tail -5
  # Should show successful build
  ```

- [ ] No TypeScript errors
  ```bash
  cd frontend && npx tsc --noEmit
  # Should show no errors
  ```

---

## 🚀 Deployment Verification

### After Deploying to Render

- [ ] Health endpoint responds
  ```bash
  curl https://civicguide-api.onrender.com/health
  # Should return: {"status":"ok","ai_provider":"Google Gemini",...}
  ```

- [ ] API is using Gemini (not Claude)
  ```bash
  curl https://civicguide-api.onrender.com/health | grep -i gemini
  # Should find "Google Gemini"
  ```

- [ ] Credit status endpoint works
  ```bash
  curl https://civicguide-api.onrender.com/api/credit-status
  # Should return credit info
  ```

- [ ] Chat endpoint is accessible
  ```bash
  curl -X POST https://civicguide-api.onrender.com/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hi"}'
  # Should return a response (not 404)
  ```

### After Deploying to Vercel

- [ ] Frontend loads
  ```bash
  curl -s https://civicguide-ai.vercel.app | grep -i "civicguide"
  # Should find the app name
  ```

- [ ] Environment variables loaded
  ```bash
  # Check browser console - no "undefined" API URLs
  ```

- [ ] Can make API calls to backend
  ```bash
  # Open browser console, test:
  fetch('https://civicguide-ai.vercel.app/api/health')
    .then(r => r.json())
    .then(d => console.log(d))
  # Should see health response
  ```

---

## 🔍 Security Verification

- [ ] No API keys in repository
  ```bash
  git log --all -S "AIzaSy" --oneline
  # Should show nothing
  ```

- [ ] GitHub secrets are set
  ```bash
  # In GitHub > Settings > Secrets > Codespaces
  # Verify: VERCEL_TOKEN, RENDER_DEPLOY_HOOK_URL, etc. are present
  ```

- [ ] Environment variables in Render
  ```bash
  # In Render dashboard, verify all env vars are set to "secret"
  # except ENVIRONMENT, GEMINI_MODEL, GEMINI_PRO_MODEL
  ```

- [ ] CORS origins correct
  ```bash
  curl -i https://civicguide-api.onrender.com/health \
    -H "Origin: https://civicguide-ai.vercel.app"
  # Should have CORS headers
  ```

- [ ] Security headers present
  ```bash
  curl -i https://civicguide-ai.vercel.app | grep -i "x-content-type\|x-frame"
  # Should show security headers
  ```

---

## 📊 Performance Verification

- [ ] Backend response time < 2 seconds
  ```bash
  time curl https://civicguide-api.onrender.com/health
  # Should complete in < 2 seconds
  ```

- [ ] Frontend loads in < 3 seconds
  ```bash
  # Open DevTools > Network > Load time should be < 3s
  ```

- [ ] No rate limiting errors (30 req/min)
  ```bash
  # Make 30 requests in sequence, 31st should be rate limited
  for i in {1..31}; do
    curl https://civicguide-api.onrender.com/health
  done
  # Last request might get 429 (expected)
  ```

---

## ✨ Final Checklist

- [ ] All configuration files created/updated
- [ ] No Claude/Anthropic references remaining
- [ ] All Gemini configuration in place
- [ ] CI/CD pipeline configured
- [ ] GitHub secrets set
- [ ] API keys secured
- [ ] Backend deployed and responding
- [ ] Frontend deployed and accessible
- [ ] Can make API calls from frontend
- [ ] Health checks passing
- [ ] No errors in logs
- [ ] Rate limiting working
- [ ] Credit tracking functional
- [ ] Documentation complete

---

## 🎉 Deployment Complete!

When all checks pass, you're ready to serve users!

```bash
echo "✅ CivicGuide AI is production-ready!"
echo "🚀 Ready to serve Indian voters"
echo "💰 Cost: $0/month on free tiers"
```

---

## 📞 If Something Fails

1. **Backend won't start**
   - Check `GOOGLE_API_KEY` is set
   - Run `pip install -r requirements.txt`
   - Check `render logs civicguide-api`

2. **Frontend can't reach backend**
   - Verify `NEXT_PUBLIC_API_URL` in Vercel
   - Check CORS in `backend/main.py`
   - Ensure backend is running

3. **Chat returns error**
   - Check `/api/credit-status` for limits
   - Verify API key is valid
   - Check Render logs

4. **Deployment stuck**
   - Check GitHub Actions logs
   - Verify all environment variables set
   - Try manual re-deployment

---

**Document last updated**: May 4, 2026
**Status**: ✅ Ready for production deployment
