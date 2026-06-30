$base = 'https://edunex-api-production.up.railway.app'

function Req($method, $path, $bodyObj=$null, $tok=$null) {
    $h = @{'Content-Type'='application/json'}
    if ($tok) { $h['Authorization'] = "Bearer $tok" }
    try {
        $args2 = @{Uri="$base$path"; Method=$method; Headers=$h; UseBasicParsing=$true}
        if ($bodyObj) { $args2['Body'] = ($bodyObj | ConvertTo-Json) }
        $r = Invoke-WebRequest @args2
        return "$($r.StatusCode)|$($r.Content)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        return "${code}|$_"
    }
}

"=== EDUNEX FULL AUDIT $(Get-Date -Format 'yyyy-MM-dd HH:mm') ==="
""

# Health
$h = Req 'GET' '/health'
"HEALTH: $h"
""

# Login
$lr = Req 'POST' '/api/auth/login' @{email='superadmin@edunex.in';password='Edunex@2024'}
$lcode = $lr.Split('|')[0]
"LOGIN: $lcode"
$lbody = $lr.Split('|',2)[1]
$tok = ($lbody | ConvertFrom-Json).data.token
if (-not $tok) { "FAILED: $lbody"; exit 1 }
"Token OK: $($tok.Substring(0,25))..."
""

# Test endpoints
$eps = @(
    '/api/students',
    '/api/teachers',
    '/api/dashboard/stats',
    '/api/fees',
    '/api/bus/routes',
    '/api/enquiries',
    '/api/parents',
    '/api/calls/voice-agent-twiml?type=general'
)

foreach ($ep in $eps) {
    $r = Req 'GET' $ep $null $tok
    $code = $r.Split('|')[0]
    $body = $r.Split('|',2)[1]
    $preview = if ($body.Length -gt 150) { $body.Substring(0,150) } else { $body }
    "$ep => HTTP $code"
    "  $preview"
    ""
}

"=== DONE ==="
