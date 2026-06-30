# Edunex Deployment Script
# Right-click this file and choose "Run with PowerShell"

$ErrorActionPreference = "Continue"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EDUNEX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Install CLIs ──────────────────────────────────────────────────────────
Write-Host "[1/5] Installing Railway and Vercel CLIs..." -ForegroundColor Yellow
npm install -g @railway/cli vercel
Write-Host "CLIs installed." -ForegroundColor Green

# ── 2. Deploy Backend to Railway ─────────────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Logging into Railway (browser will open)..." -ForegroundColor Yellow
Set-Location "$ROOT\backend"
railway login

Write-Host "Initialising Railway project..." -ForegroundColor Yellow
railway init --name "edunex-api"

Write-Host "Uploading backend code..." -ForegroundColor Yellow
railway up --detach

Write-Host "Generating public domain..." -ForegroundColor Yellow
railway domain

# ── 3. Set Railway env vars ───────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Setting Railway environment variables..." -ForegroundColor Yellow

$lines = Get-Content "$ROOT\backend\.env"
foreach ($line in $lines) {
    if ($line -match "^[A-Z_]+=.+") {
        $key = ($line -split "=", 2)[0].Trim()
        $val = ($line -split "=", 2)[1].Trim()
        if ($val -and $val -notmatch "^your_" -and $val -ne "http://localhost:3000") {
            Write-Host "  Setting $key" -ForegroundColor Gray
            railway variables set "$key=$val"
        }
    }
}

Write-Host "Railway env vars set." -ForegroundColor Green
Write-Host ""
Write-Host ">>> Copy your Railway backend URL from above (e.g. https://edunex-api-xxx.up.railway.app)" -ForegroundColor Magenta
$BACKEND_URL = Read-Host "Paste your Railway backend URL here"

# ── 4. Deploy Frontend to Vercel ─────────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Logging into Vercel (browser will open)..." -ForegroundColor Yellow
Set-Location "$ROOT\frontend"
vercel login

Write-Host "Deploying frontend..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host ""
Write-Host ">>> Copy your Vercel frontend URL from above (e.g. https://edunex-xxx.vercel.app)" -ForegroundColor Magenta
$FRONTEND_URL = Read-Host "Paste your Vercel frontend URL here"

Write-Host "Setting Vercel environment variables..." -ForegroundColor Yellow
"https://khigogvcmtngskffnotj.supabase.co" | vercel env add VITE_SUPABASE_URL production --force
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaWdvZ3ZjbXRuZ3NrZmZub3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzE2ODYsImV4cCI6MjA5NDE0NzY4Nn0.F_DhZItRbbi8r2381VGIfQkIS2enQjiOs2dR9NhQJ0Y" | vercel env add VITE_SUPABASE_ANON_KEY production --force
$BACKEND_URL | vercel env add VITE_API_URL production --force

Write-Host "Redeploying frontend with env vars..." -ForegroundColor Yellow
vercel --prod --yes

# ── 5. Link frontend URL back to Railway ─────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Updating backend CORS with frontend URL..." -ForegroundColor Yellow
Set-Location "$ROOT\backend"
railway variables set "FRONTEND_URL=$FRONTEND_URL"
railway up --detach

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend : $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "  Backend  : $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  Health   : $BACKEND_URL/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Add your Supabase service_role key to Railway:" -ForegroundColor Red
Write-Host "  1. Go to supabase.com > Project Settings > API > service_role" -ForegroundColor Red
Write-Host "  2. Run: railway variables set SUPABASE_SERVICE_KEY=<your_key>" -ForegroundColor Red
Write-Host ""

Set-Location $ROOT
Read-Host "Press Enter to close"
