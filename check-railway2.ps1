Set-Location 'C:\Users\admin\Downloads\edunex\backend'
Write-Output '=== All Railway variables ==='
railway variables --service edunex-api --environment production 2>&1
Write-Output 'DONE'
