$base = 'https://edunex-api-production.up.railway.app'

# Get JWT token
$loginBody = '{"email":"superadmin@edunex.in","password":"Edunex@2024"}'
$loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing -TimeoutSec 15
$jwt = ($loginResp.Content | ConvertFrom-Json).data.token
if ($jwt -and $jwt.Length -gt 20) {
    Write-Output "JWT: OK ($($jwt.Substring(0,20))...)"
} else {
    Write-Output "JWT: FAILED"
}
$h = @{Authorization="Bearer $jwt"}

function Test-EP {
    param($label, $url, $method='GET', $body=$null, [bool]$useAuth=$true)
    try {
        $params = @{Uri=$url; Method=$method; UseBasicParsing=$true; TimeoutSec=15}
        if ($useAuth) { $params.Headers = $h }
        if ($body) { $params.Body = $body; $params.ContentType = 'application/json' }
        $r = Invoke-WebRequest @params
        $preview = $r.Content.Substring(0, [Math]::Min(100, $r.Content.Length)) -replace "`n",' '
        Write-Output "  [OK $($r.StatusCode)] $label | $preview"
    } catch {
        $code = $null
        try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
        $body2 = ''
        try {
            $s = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($s)
            $body2 = $reader.ReadToEnd().Substring(0, [Math]::Min(100, $reader.ReadToEnd().Length))
        } catch {}
        Write-Output "  [FAIL $code] $label"
    }
}

Write-Output ""
Write-Output "===== EDUNEX FULL FEATURE AUDIT ====="
Write-Output ""

Write-Output "[ BACKEND HEALTH ]"
Test-EP -label "Health check" -url "$base/health" -useAuth $false

Write-Output ""
Write-Output "[ AUTH ]"
Test-EP -label "Login superadmin" -url "$base/api/auth/login" -method POST -body '{"email":"superadmin@edunex.in","password":"Edunex@2024"}' -useAuth $false
Test-EP -label "Login wrong password" -url "$base/api/auth/login" -method POST -body '{"email":"superadmin@edunex.in","password":"wrong"}' -useAuth $false

Write-Output ""
Write-Output "[ DASHBOARD ]"
Test-EP -label "Dashboard stats" -url "$base/api/dashboard"

Write-Output ""
Write-Output "[ STUDENTS ]"
Test-EP -label "List students" -url "$base/api/students"
Test-EP -label "Students paginated" -url "$base/api/students?page=1&limit=5"

Write-Output ""
Write-Output "[ TEACHERS ]"
Test-EP -label "List teachers" -url "$base/api/teachers"

Write-Output ""
Write-Output "[ FEES ]"
Test-EP -label "List fees" -url "$base/api/fees"

Write-Output ""
Write-Output "[ BUS / TRANSPORT ]"
Test-EP -label "List bus routes" -url "$base/api/bus"

Write-Output ""
Write-Output "[ ENQUIRIES ]"
Test-EP -label "List enquiries" -url "$base/api/enquiries"

Write-Output ""
Write-Output "[ PARENT PORTAL ]"
Test-EP -label "Parent login bad OTP" -url "$base/api/parents/login" -method POST -body '{"phone":"9999999999","otp":"000000"}' -useAuth $false

Write-Output ""
Write-Output "[ VOICE AGENT ]"
Test-EP -label "TwiML endpoint" -url "$base/api/calls/voice-agent-twiml?student=Test&type=general&school=Edunex" -useAuth $false

Write-Output ""
Write-Output "===== DONE ====="
