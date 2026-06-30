Set-Location 'C:\Users\admin\Downloads\edunex\backend'
Write-Output '=== Deploying backend to Railway ==='
railway up --service edunex-api --environment production --detach 2>&1
Write-Output 'DONE'
