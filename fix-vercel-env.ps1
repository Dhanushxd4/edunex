Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

Write-Output '=== Current Vercel env vars ==='
vercel env ls 2>&1

Write-Output ''
Write-Output '=== Setting VITE_API_URL for production ==='
# Non-interactive: pipe value into vercel env add
$val = 'https://edunex-api-production.up.railway.app'
echo $val | vercel env add VITE_API_URL production 2>&1

Write-Output ''
Write-Output '=== Setting VITE_API_URL for preview ==='
echo $val | vercel env add VITE_API_URL preview 2>&1

Write-Output 'DONE'
