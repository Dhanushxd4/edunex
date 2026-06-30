$base = 'https://edunex-api-production.up.railway.app'

# Get JWT token - token is at .data.token
$loginBody = '{"email":"superadmin@edunex.in","password":"Edunex@2024"}'
$loginResp = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json' -UseBasicParsing -TimeoutSec 15
$jwt = ($loginResp.Content | ConvertFrom-Json).data.token
Write-Output "JWT obtained: $(if($jwt -and $jwt.Length -gt 20){'YES ('+$jwt.Substring(0,20)+'...)'}else{'FAILED: '+$jwt})"
$h = @{Authorization="Bearer $jwt"}

function Test-EP($label, $url, $method='GET', $body=$null, $useAuth=$true) {
    try {
        $params = @{Uri=$url; Method=$method; UseBasicParsing=$true; TimeoutSec=15}
        if ($useAuth) { $params.Headers = $h }
        if ($body) { $params.Body = $body; $params.ContentType = 'application/json' }
        $r = Invoke-WebRequest @params
        $preview = ($r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 1 -Compress).Substring(0, [Math]::Min(100, ($r.Content).Length))
        Write-Output "  ✅ $label — $($r.StatusCode) | $preview"
    } catch {
        $code = $null; try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
        $body2 = ''; try { $s = $_.Exception.Response.GetResponseStream(); $reader=[System.IO.StreamReader]::new($s); $body2=$reader.ReadToEnd() } catch {}
        Write-Output "  ❌ $label — $code | $body2"
    }
}

Write-Output ""
Write-Output "===== EDUNEX FULL FEATURE AUDIT ====="
Write-Output ""

Write-Output "[ BACKEND HEALTH ]"
Test-EP "Health check" "$base/health" -useAuth $false

Write-Output ""
Write-Output "[ AUTH ]"
Test-EP "Login (superadmin)" "$base/api/auth/login" POST '{"email":"superadmin@edunex.in","password":"Edunex@2024"}' $false
Test-EP "Login (wrong password)" "$base/api/auth/login" POST '{"email":"superadmin@edunex.in","password":"wrong"}' $false

Write-Output ""
Write-Output "[ DASHBOARD ]"
Test-EP "Dashboard stats" "$base/api/dashboard"

Write-Output ""
Write-Output "[ STUDENTS ]"
Test-EP "List students" "$base/api/students"
Test-EP "Students paginated" "$base/api/students?page=1&limit=5"

Write-Output ""
Write-Output "[ TEACHERS ]"
Test-EP "List teachers" "$base/api/teachers"

Write-Output ""
Write-Output "[ FEES ]"
Test-EP "List fees" "$base/api/fees"

Write-Output ""
Write-Output "[ BUS / TRANSPORT ]"
Test-EP "List bus routes" "$base/api/bus"

Write-Output ""
Write-Output "[ ENQUIRIES ]"
Test-EP "List enquiries" "$base/api/enquiries"

Write-Output ""
Write-Output "[ PARENT PORTAL ]"
Test-EP "Parent login (bad OTP)" "$base/api/parents/login" POST '{"phone":"9999999999","otp":"000000"}' $false

Write-Output ""
Write-Output "[ VOICE AGENT ]"
Test-EP "TwiML endpoint" "$base/api/calls/voice-agent-twiml?student=Test&type=general&school=Edunex" -useAuth $false

Write-Output ""
Write-Output "===== DONE ====="
