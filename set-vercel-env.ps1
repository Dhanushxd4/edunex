Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

Write-Output '=== Current env vars ==='
vercel env ls 2>&1

Write-Output ''
Write-Output '=== Removing old VITE_API_URL (if any) ==='
vercel env rm VITE_API_URL production --yes 2>&1
vercel env rm VITE_API_URL preview --yes 2>&1

Write-Output ''
Write-Output '=== Adding VITE_API_URL for production ==='
# Pipe the value — vercel env add reads from stdin
'https://edunex-api-production.up.railway.app' | vercel env add VITE_API_URL production 2>&1

Write-Output ''
Write-Output '=== Adding VITE_API_URL for preview ==='
'https://edunex-api-production.up.railway.app' | vercel env add VITE_API_URL preview 2>&1

Write-Output ''
Write-Output '=== Final env list ==='
vercel env ls 2>&1

Write-Output 'DONE'
