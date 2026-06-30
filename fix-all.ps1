Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

# ── 1. Find Vercel auth token ──────────────────────────────────────────────────
Write-Output '=== Finding Vercel token ==='
$tokenFile = "$env:APPDATA\Vercel\auth.json"
if (-not (Test-Path $tokenFile)) {
    $tokenFile = "$env:LOCALAPPDATA\com.vercel.cli\auth.json"
}
if (-not (Test-Path $tokenFile)) {
    $tokenFile = "$env:USERPROFILE\.vercel\auth.json"
}
Write-Output "Token file: $tokenFile"
$authJson = Get-Content $tokenFile -Raw | ConvertFrom-Json
$token = $authJson.token
Write-Output "Token found: $($token.Substring(0,8))..."

# ── 2. Disable deployment protection via Vercel API ───────────────────────────
Write-Output ''
Write-Output '=== Disabling deployment protection ==='
$projectId = 'prj_k8v8w9tgb6gABTKttVikX4rIRNCa'
$teamId = 'team_s2jvqrICiKWWENNUkhde1vhv'
$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type'  = 'application/json'
}
$body = '{"ssoProtection":null,"passwordProtection":null,"vercelAuthentication":{"deploymentType":"none"}}'
$url = "https://api.vercel.com/v9/projects/$projectId`?teamId=$teamId"
try {
    $resp = Invoke-RestMethod -Uri $url -Method PATCH -Headers $headers -Body $body
    Write-Output "Protection disabled: $($resp.name)"
} catch {
    Write-Output "Protection API error: $_"
    Write-Output "Trying alternate format..."
    $body2 = '{"deploymentExpiration":null,"ssoProtection":null}'
    try {
        $resp2 = Invoke-RestMethod -Uri $url -Method PATCH -Headers $headers -Body $body2
        Write-Output "Success (alt): $($resp2.name)"
    } catch {
        Write-Output "Alt also failed: $_"
    }
}

# ── 3. Set VITE_API_URL env var on Vercel ─────────────────────────────────────
Write-Output ''
Write-Output '=== Setting VITE_API_URL on Vercel ==='
$envUrl = 'https://api.vercel.com/v10/projects/' + $projectId + '/env?teamId=' + $teamId

# Remove existing VITE_API_URL if present
$existingEnvs = Invoke-RestMethod -Uri $envUrl -Method GET -Headers $headers
$existing = $existingEnvs.envs | Where-Object { $_.key -eq 'VITE_API_URL' }
if ($existing) {
    foreach ($e in $existing) {
        $delUrl = "https://api.vercel.com/v10/projects/$projectId/env/$($e.id)?teamId=$teamId"
        Invoke-RestMethod -Uri $delUrl -Method DELETE -Headers $headers | Out-Null
        Write-Output "Removed old VITE_API_URL (id: $($e.id))"
    }
}

# Add new VITE_API_URL for production + preview
$newEnvBody = @{
    key    = 'VITE_API_URL'
    value  = 'https://edunex-api-production.up.railway.app'
    type   = 'plain'
    target = @('production', 'preview')
} | ConvertTo-Json
$addResp = Invoke-RestMethod -Uri $envUrl -Method POST -Headers $headers -Body $newEnvBody
Write-Output "VITE_API_URL set: $($addResp.key) = $($addResp.value)"

# ── 4. Redeploy frontend with new env ─────────────────────────────────────────
Write-Output ''
Write-Output '=== Redeploying frontend ==='
vercel --prod --yes 2>&1

Write-Output 'DONE'
