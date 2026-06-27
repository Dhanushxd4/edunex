# Edunex LMS — Full Stack E-Learning Platform

**Frontend:** Next.js 14 → Vercel (free)  
**Backend:** Express.js + Prisma → Railway (free)  
**Database:** PostgreSQL (Railway, free)

## Quick Deploy (5 minutes)

### Windows
```
Double-click DEPLOY.bat
```

### Mac / Linux
```bash
bash DEPLOY.sh
```

---

## Manual Deploy

### Backend (Railway)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Upload `edunex-api/` folder
3. Add PostgreSQL plugin
4. Set environment variables:
   - `JWT_SECRET` = any long random string
   - `CORS_ORIGIN` = your Vercel URL (set after frontend deploy)
   - `YOUTUBE_API_KEY` = from https://console.cloud.google.com
5. Railway auto-runs `prisma migrate deploy && npm start`

### Frontend (Vercel)
1. Go to https://vercel.com → New Project → Upload `edunex/` folder
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway API URL
3. Click Deploy

### Seed Sample Data
```bash
cd edunex-api
railway run npm run db:seed
```

---

## Free-Tier APIs Used

| Service | Usage | Free Tier |
|---------|-------|-----------|
| Railway | Backend + PostgreSQL | $5 credit/month |
| Vercel | Next.js Frontend | 100GB bandwidth |
| YouTube Data API v3 | Course videos | 10,000 units/day |

---

## Features
- User auth (register/login/JWT)
- Course catalog with search & filters
- YouTube video player
- Progress tracking per lesson
- Quiz system with scoring
- Student dashboard
- Course reviews & ratings
- Instructor course management
- Mobile responsive
