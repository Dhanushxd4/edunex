Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

Write-Output '=== Current aliases ==='
vercel alias ls 2>&1

Write-Output ''
Write-Output '=== Trying edunex.vercel.app ==='
vercel alias set frontend-chi-blush-72.vercel.app edunex.vercel.app 2>&1

Write-Output ''
Write-Output '=== Trying edunex-lms.vercel.app ==='
vercel alias set frontend-chi-blush-72.vercel.app edunex-lms.vercel.app 2>&1

Write-Output ''
Write-Output '=== Trying edunexapp.vercel.app ==='
vercel alias set frontend-chi-blush-72.vercel.app edunexapp.vercel.app 2>&1

Write-Output 'DONE'
