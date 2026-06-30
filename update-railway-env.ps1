Set-Location 'C:\Users\admin\Downloads\edunex\backend'
Write-Output '=== Updating FRONTEND_URL on Railway ==='
railway variables set FRONTEND_URL='https://edunex-dhanush.vercel.app' --service edunex-api --environment production 2>&1
Write-Output 'DONE'
