Set-Location 'C:\Users\admin\Downloads\edunex\backend'
Write-Output '=== Railway variables (FRONTEND_URL) ==='
railway variables get FRONTEND_URL --service edunex-api --environment production 2>&1
Write-Output 'DONE'
