# Deploy backend
Write-Output '=== Deploying backend ==='
Set-Location 'C:\Users\admin\Downloads\edunex\backend'
railway up --service edunex-api --environment production --detach 2>&1

Write-Output ''
Write-Output '=== Deploying frontend ==='
Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
vercel --prod --yes 2>&1

Write-Output 'ALL DONE'
