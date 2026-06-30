$paths = @(
    "$env:APPDATA\vercel\auth.json",
    "$env:APPDATA\vercel\credentials.json",
    "$env:LOCALAPPDATA\vercel\auth.json",
    "$env:LOCALAPPDATA\vercel\credentials.json",
    "$env:USERPROFILE\.vercel\auth.json",
    "$env:USERPROFILE\.config\vercel\auth.json"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Output ('FOUND: ' + $p)
        Get-Content $p
    }
}

# Also check vercel CLI global config
$v2 = "$env:APPDATA\com.vercel.cli\auth.json"
if (Test-Path $v2) { Write-Output ('FOUND2: ' + $v2); Get-Content $v2 }

# Try running vercel whoami
try {
    $who = vercel whoami 2>&1
    Write-Output ('WHOAMI: ' + $who)
} catch {
    Write-Output 'vercel CLI not found or not logged in'
}
Write-Output 'DONE'
