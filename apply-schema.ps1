$ErrorActionPreference = "Continue"
$ROOT = "C:\Users\admin\Downloads\edunex"
$REF = "qjzfapbkieesjqwosmzb"

Write-Host "Applying Supabase schema via Management API..." -ForegroundColor Cyan

Set-Location "$ROOT\backend"

# Link project (uses CLI PAT auth, no DB password needed for --linked queries)
Write-Host "Linking project..." -ForegroundColor Yellow
$linkResult = supabase link --project-ref $REF 2>&1
Write-Host $linkResult

# Apply full schema file using --linked (Management API)
Write-Host ""
Write-Host "Applying schema file via Management API..." -ForegroundColor Yellow
$queryResult = supabase db query -f "supabase-schema.sql" --linked 2>&1
Write-Host $queryResult

# Verify tables
Write-Host ""
Write-Host "Verifying tables..." -ForegroundColor Yellow
$verify = supabase db query "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" --linked 2>&1
Write-Host $verify -ForegroundColor Cyan

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to close"
