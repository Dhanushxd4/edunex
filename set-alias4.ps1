Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
# Use the PUBLIC production alias as source (not the private deployment URL)
$src = 'frontend-chi-blush-72.vercel.app'

Write-Output '=== Remove old alias first ==='
vercel alias rm edunex-portal.vercel.app --yes 2>&1

Write-Output ''
Write-Output '=== Setting edunex-portal.vercel.app using public source ==='
vercel alias set $src edunex-portal.vercel.app 2>&1

Write-Output 'DONE'
