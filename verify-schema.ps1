$ErrorActionPreference = "Continue"
Write-Host "Checking Supabase tables..." -ForegroundColor Cyan

# Check if tables exist
$result = supabase db query "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" --project-ref qjzfapbkieesjqwosmzb 2>&1
Write-Host "Tables in database:" -ForegroundColor Yellow
Write-Host $result

$expected = @('calls','exams','fees','marks','schools','students','teachers')
$missing = @()
foreach ($t in $expected) {
    if ($result -notmatch $t) {
        $missing += $t
        Write-Host "  MISSING: $t" -ForegroundColor Red
    } else {
        Write-Host "  OK: $t" -ForegroundColor Green
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Applying schema for missing tables..." -ForegroundColor Yellow
    Set-Location "C:\Users\admin\Downloads\edunex\backend"
    $sql = Get-Content "supabase-schema.sql" -Raw
    $result2 = supabase db query $sql --project-ref qjzfapbkieesjqwosmzb 2>&1
    Write-Host $result2
    Write-Host "Schema applied!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "All tables exist! Schema is OK." -ForegroundColor Green
}

Read-Host "Press Enter to close"
