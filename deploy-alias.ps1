Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
Write-Output '=== Deploying with new production alias ==='
vercel --prod --yes 2>&1
Write-Output 'DONE'
