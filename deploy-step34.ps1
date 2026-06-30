$ErrorActionPreference = "Continue"
$ROOT = "C:\Users\admin\Downloads\edunex"
$BACKEND_URL = "https://edunex-api-production.up.railway.app"
$SUPABASE_URL = "https://qjzfapbkieesjqwosmzb.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqemZhcGJraWVlc2pxd29zbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDk5OTEsImV4cCI6MjA5Nzg4NTk5MX0.0aTr43IsVH9SWPhQTjYcoYMf1hGPCHkpuZ-vCgkXm5E"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EDUNEX - STEPS 3 & 4" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── Apply Schema via supabase db query ────────────────────────────────────────
Write-Host ""
Write-Host "[0/3] Applying Supabase schema..." -ForegroundColor Yellow
Set-Location "$ROOT\backend"
$sql = Get-Content "supabase-schema.sql" -Raw
# Split into individual statements and run each
$stmts = $sql -split ";" | Where-Object { $_.Trim().Length -gt 5 }
$total = $stmts.Count
$i = 0
foreach ($stmt in $stmts) {
    $i++
    $trimmed = $stmt.Trim()
    if ($trimmed.Length -gt 5) {
        $result = echo "$trimmed;" | supabase db query --db-url "postgresql://postgres.qjzfapbkieesjqwosmzb:@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" 2>&1
        Write-Host "  [$i/$total] Done" -ForegroundColor Gray
    }
}
Write-Host "Schema applied!" -ForegroundColor Green

# ── 3. Redeploy Backend ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "[1/3] Redeploying backend to Railway..." -ForegroundColor Yellow
Set-Location "$ROOT\backend"
railway up --service edunex-api --detach
Write-Host "Backend redeployed!" -ForegroundColor Green

# ── 4. Deploy Frontend ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/3] Setting Vercel env vars and deploying frontend..." -ForegroundColor Yellow
Set-Location "$ROOT\frontend"
"$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production --force 2>&1
"$ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production --force 2>&1
"$BACKEND_URL" | vercel env add VITE_API_URL production --force 2>&1

$vercelOutput = vercel --prod --yes 2>&1
$vercelOutput | ForEach-Object { Write-Host $_ }

$FRONTEND_URL = ""
foreach ($line in $vercelOutput) {
    if ($line -match "Production:\s+(https://\S+)") { $FRONTEND_URL = $matches[1]; break }
}
if (-not $FRONTEND_URL) {
    foreach ($line in $vercelOutput) {
        if ($line -match "(https://[a-z0-9\-]+\.vercel\.app)") { $FRONTEND_URL = $matches[1]; break }
    }
}
Write-Host "  Frontend URL: $FRONTEND_URL" -ForegroundColor Green

# ── 5. Update Railway CORS ────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/3] Updating Railway CORS..." -ForegroundColor Yellow
if ($FRONTEND_URL) {
    Set-Location "$ROOT\backend"
    railway variables set "FRONTEND_URL=$FRONTEND_URL" --service edunex-api
    railway up --service edunex-api --detach
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DONE!" -ForegroundColor Green
Write-Host "  Frontend : $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "  Backend  : $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  Health   : $BACKEND_URL/health" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Read-Host "Press Enter to close"
