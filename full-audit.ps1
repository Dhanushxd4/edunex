$base = 'https://edunex-api-production.up.railway.app'
$frontend = 'https://frontend-chi-blush-72.vercel.app'

# Get JWT token
$loginBody = '{"email":"superadmin@edunex.in","password":"Edunex@2024"}'
$loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing -TimeoutSec 15
$jwt = ($loginResp.Content | ConvertFrom-Json).token
Write-Output "JWT: $(if($jwt){'OK'}else{'FAILED'})"

$h = @{Authorization="Bearer $jwt"}

function Test-Endpoint($label, $url, $method='GET', $body=$null, $headers=$h, $expectCode=200) {
    try {
        $params = @{Uri=$url; Method=$method; Headers=$headers; UseBasicParsing=$true; TimeoutSec=15}
        if ($body) { $params.Body = $body; $params.ContentType = 'application/json' }
        $r = Invoke-WebRequest @params
        $status = if ($r.StatusCode -eq $expectCode) { "OK ($($r.StatusCode))" } else { "UNEXPECTED ($($r.StatusCode))" }
        # Show first 120 chars of response
        $preview = $r.Content.Substring(0, [Math]::Min(120, $r.Content.Length))
        Write-Output "[$status] $label | $preview"
    } catch {
        $code = $null
        try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
        Write-Output "[FAIL $code] $label | $($_.Exception.Message.Substring(0,[Math]::Min(80,$_.Exception.Message.Length)))"
    }
}

Write-Output ""
Write-Output "=== FRONTEND ==="
Test-Endpoint "Frontend (Vercel)" $frontend -headers @{}

Write-Output ""
Write-Output "=== AUTH ==="
Test-Endpoint "POST /api/auth/login (superadmin)" "$base/api/auth/login" POST '{"email":"superadmin@edunex.in","password":"Edunex@2024"}' @{}
Test-Endpoint "POST /api/auth/login (bad password)" "$base/api/auth/login" POST '{"email":"superadmin@edunex.in","password":"wrong"}' @{} -expectCode 401

Write-Output ""
Write-Output "=== DASHBOARD ==="
Test-Endpoint "GET /api/dashboard" "$base/api/dashboard"

Write-Output ""
Write-Output "=== STUDENTS ==="
Test-Endpoint "GET /api/students" "$base/api/students"
Test-Endpoint "GET /api/students?page=1&limit=5" "$base/api/students?page=1&limit=5"

Write-Output ""
Write-Output "=== TEACHERS ==="
Test-Endpoint "GET /api/teachers" "$base/api/teachers"

Write-Output ""
Write-Output "=== FEES ==="
Test-Endpoint "GET /api/fees" "$base/api/fees"

Write-Output ""
Write-Output "=== BUS / TRANSPORT ==="
Test-Endpoint "GET /api/bus" "$base/api/bus"

Write-Output ""
Write-Output "=== ENQUIRIES ==="
Test-Endpoint "GET /api/enquiries" "$base/api/enquiries"

Write-Output ""
Write-Output "=== PARENTS ==="
Test-Endpoint "POST /api/parents/login (bad)" "$base/api/parents/login" POST '{"phone":"9999999999","otp":"000000"}' @{} -expectCode 401

Write-Output ""
Write-Output "=== VOICE AGENT ==="
Test-Endpoint "GET /api/calls/voice-agent-twiml" "$base/api/calls/voice-agent-twiml?student=Test&type=general&school=Edunex" -headers @{}
Test-Endpoint "GET /api/voice-agent/stream (WS route check)" "$base/api/calls/voice-agent-twiml" -headers @{}

Write-Output ""
Write-Output "=== HEALTH DETAILS ==="
Test-Endpoint "GET /health" "$base/health" -headers @{}

Write-Output ""
Write-Output "DONE"
