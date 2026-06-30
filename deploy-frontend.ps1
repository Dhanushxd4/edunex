Write-Output '=== Deploying frontend (vendor name cleanup) ==='
Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
vercel --prod --yes 2>&1
Write-Output 'DONE'
