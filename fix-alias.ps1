Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

Write-Output '=== List deployments ==='
vercel ls 2>&1 | Select-Object -First 20

Write-Output ''
Write-Output '=== Remove wrong alias ==='
vercel alias rm edunexapp.vercel.app --yes 2>&1

Write-Output ''
Write-Output '=== Get latest deployment URL ==='
$deployments = vercel ls --json 2>&1
Write-Output $deployments

Write-Output 'DONE'
