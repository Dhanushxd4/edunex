Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
# Latest Ready deployment is the source
$src = 'frontend-kppmjj3f5-dhanushxd4s-projects.vercel.app'

Write-Output '=== Setting edunexapp.vercel.app ==='
vercel alias set $src edunexapp.vercel.app 2>&1

Write-Output 'DONE'
