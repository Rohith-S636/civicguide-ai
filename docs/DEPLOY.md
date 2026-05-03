# CivicGuide AI - Deployment Guide

## Backend Deployment

### Using Heroku
1. Install Heroku CLI
2. Create Procfile in backend/:
```
web: gunicorn main:app
```

3. Deploy:
```bash
heroku create civicguide-api
git push heroku main
```

### Using Docker
Create `Dockerfile` in backend/:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t civicguide-api .
docker run -p 8000:8000 civicguide-api
```

## Frontend Deployment

### Using Vercel
```bash
npm install -g vercel
vercel deploy
```

### Using Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

## Environment Variables

Set the following environment variables in your deployment platform:

**Backend:**
- ANTHROPIC_API_KEY
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- TAVILY_API_KEY

**Frontend:**
- NEXT_PUBLIC_API_URL (your deployed backend URL)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Database

Ensure Supabase project is configured and accessible from both frontend and backend.

## Monitoring

Set up monitoring for:
- API response times
- Error rates
- User activity
- Database usage
