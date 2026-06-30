# Edunex Deployment - Continue from step 4 (Vercel)
$ErrorActionPreference = "Continue"
$ROOT = "C:\Users\admin\Downloads\edunex"
$BACKEND_URL = "https://edunex-api-production.up.railway.app"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  EDUNEX - CONTINUING DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Backend: $BACKEND_URL" -ForegroundColor Green
Write-Host ""

# ── 4. Vercel Login ───────────────────────────────────────────────────────────
Write-Host "[4/5] Logging into Vercel (browser will open)..." -ForegroundColor Yellow
Set-Location "$ROOT\frontend"
vercel login

# ── Deploy Frontend ───────────────────────────────────────────────────────────
Write-Host "Deploying frontend to Vercel..." -ForegroundColor Yellow
$vercelOutput = vercel --prod --yes 2>&1
$vercelOutput | ForEach-Object { Write-Host $_ }

# Extract the production URL automatically
$FRONTEND_URL = ""
foreach ($line in $vercelOutput) {
    if ($line -match "Production:\s+(https://\S+)") {
        $FRONTEND_URL = $matches[1]
        break
    }
}
if (-not $FRONTEND_URL) {
    foreach ($line in $vercelOutput) {
        if ($line -match "(https://[a-z0-9\-]+-[a-z0-9]+\.vercel\.app)") {
            $FRONTEND_URL = $matches[1]
            break
        }
    }
}

Write-Host ""
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor Green

# ── Set Vercel env vars ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "Setting Vercel environment variables..." -ForegroundColor Yellow
"https://khigogvcmtngskffnotj.supabase.co" | vercel env add VITE_SUPABASE_URL production --force
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaWdvZ3ZjbXRuZ3NrZmZub3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzE2ODYsImV4cCI6MjA5NDE0NzY4Nn0.F_DhZItRbbi8r2381VGIfQkIS2enQjiOs2dR9NhQJ0Y" | vercel env add VITE_SUPABASE_ANON_KEY production --force
$BACKEND_URL | vercel env add VITE_API_URL production --force
Write-Host "Env vars set. Redeploying with env vars..." -ForegroundColor Yellow
vercel --prod --yes

# ── 5. Update Railway CORS ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Updating Railway CORS with frontend URL..." -ForegroundColor Yellow
Set-Location "$ROOT\backend"
railway variables set "FRONTEND_URL=$FRONTEND_URL"
railway up --detach

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend : $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "  Backend  : $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  Health   : $BACKEND_URL/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Add Supabase service_role key to Railway:" -ForegroundColor Red
Write-Host "  railway variables set SUPABASE_SERVICE_KEY=<your_key>" -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter to close"
