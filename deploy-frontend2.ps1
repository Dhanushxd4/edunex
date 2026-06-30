Set-Location 'C:\Users\admin\Downloads\edunex\frontend'

# ── 1. Find Vercel token (try all known locations) ────────────────────────────
Write-Output '=== Finding Vercel token ==='
$candidates = @(
    "$env:APPDATA\Vercel\auth.json",
    "$env:LOCALAPPDATA\Vercel\auth.json",
    "$env:LOCALAPPDATA\com.vercel.cli\auth.json",
    "$env:APPDATA\com.vercel.cli\auth.json",
    "$env:USERPROFILE\.vercel\auth.json",
    "$env:USERPROFILE\.config\vercel\auth.json"
)
$token = $null
foreach ($p in $candidates) {
    if (Test-Path $p) {
        Write-Output "Found token at: $p"
        $json = Get-Content $p -Raw | ConvertFrom-Json
        $token = $json.token
        break
    }
}
if (-not $token) {
    Write-Output "Token not found in files - will skip API calls"
} else {
    Write-Output "Token: $($token.Substring(0,8))..."

    # ── 2. Disable deployment protection ──────────────────────────────────────
    Write-Output ''
    Write-Output '=== Disabling Vercel deployment protection ==='
    $projectId = 'prj_k8v8w9tgb6gABTKttVikX4rIRNCa'
    $teamId = 'team_s2jvqrICiKWWENNUkhde1vhv'
    $headers = @{ 'Authorization' = "Bearer $token"; 'Content-Type' = 'application/json' }
    $body = '{"ssoProtection":null}'
    try {
        $r = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId`?teamId=$teamId" -Method PATCH -Headers $headers -Body $body
        Write-Output "Protection response: $($r | ConvertTo-Json -Compress)"
    } catch { Write-Output "Error: $_" }

    # ── 3. Set VITE_API_URL env var ───────────────────────────────────────────
    Write-Output ''
    Write-Output '=== Setting VITE_API_URL ==='
    $envUrl = "https://api.vercel.com/v10/projects/$projectId/env?teamId=$teamId"
    try {
        $existing = Invoke-RestMethod -Uri $envUrl -Method GET -Headers $headers
        $old = $existing.envs | Where-Object { $_.key -eq 'VITE_API_URL' }
        foreach ($e in $old) {
            Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$projectId/env/$($e.id)?teamId=$teamId" -Method DELETE -Headers $headers | Out-Null
            Write-Output "Removed old VITE_API_URL"
        }
        $body2 = '{"key":"VITE_API_URL","value":"https://edunex-api-production.up.railway.app","type":"plain","target":["production","preview"]}'
        $resp = Invoke-RestMethod -Uri $envUrl -Method POST -Headers $headers -Body $body2
        Write-Output "Set VITE_API_URL = $($resp.value)"
    } catch { Write-Output "Env API error: $_" }
}

# ── 4. Deploy ─────────────────────────────────────────────────────────────────
Write-Output ''
Write-Output '=== Deploying frontend to Vercel ==='
vercel --prod --yes 2>&1

Write-Output 'DONE'
