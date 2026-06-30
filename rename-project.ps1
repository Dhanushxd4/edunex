Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

Write-Output '=== Current project info ==='
vercel project ls 2>&1 | Select-Object -First 10

Write-Output ''
Write-Output '=== Try renaming project ==='
# Rename via vercel.json then redeploy
$vcJson = Get-Content 'vercel.json' -Raw -ErrorAction SilentlyContinue
Write-Output "Current vercel.json: $vcJson"

Write-Output ''
Write-Output '=== Set alias using edunex-lms-portal ==='
vercel alias set 'frontend-chi-blush-72.vercel.app' 'edunex-lms-portal.vercel.app' 2>&1

Write-Output ''
Write-Output '=== Set alias using edunexlms ==='
vercel alias set 'frontend-chi-blush-72.vercel.app' 'edunexlms.vercel.app' 2>&1

Write-Output ''
Write-Output '=== Set alias using edunex-by-dhanush ==='
vercel alias set 'frontend-chi-blush-72.vercel.app' 'edunex-by-dhanush.vercel.app' 2>&1

Write-Output 'DONE'
