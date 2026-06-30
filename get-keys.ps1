$ErrorActionPreference = "Continue"
$OUT = "C:\Users\admin\Downloads\edunex\supabase-keys.txt"

Write-Host "Installing Supabase CLI..." -ForegroundColor Cyan
npm install -g supabase 2>&1 | Out-Null
Write-Host "Done." -ForegroundColor Green

Write-Host "Logging into Supabase (browser will open)..." -ForegroundColor Yellow
supabase login

Write-Host "Fetching API keys for project qjzfapbkieesjqwosmzb..." -ForegroundColor Yellow
$keys = supabase projects api-keys --project-ref qjzfapbkieesjqwosmzb 2>&1
Write-Host $keys -ForegroundColor Green
$keys | Out-File $OUT -Encoding utf8
Write-Host ""
Write-Host "Keys saved to: $OUT" -ForegroundColor Cyan
Read-Host "Press Enter to close"
