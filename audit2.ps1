$base = 'https://edunex-api-production.up.railway.app'
$to = 15  # 15 second timeout

function Req($method, $path, $bodyObj=$null, $tok=$null) {
    $h = @{'Content-Type'='application/json'}
    if ($tok) { $h['Authorization'] = "Bearer $tok" }
    try {
        $a = @{Uri="$base$path"; Method=$method; Headers=$h; UseBasicParsing=$true; TimeoutSec=$to}
        if ($bodyObj) { $a['Body'] = ($bodyObj | ConvertTo-Json -Compress) }
        $r = Invoke-WebRequest @a
        $b = $r.Content
        if ($b.Length -gt 200) { $b = $b.Substring(0,200) + '...' }
        return "HTTP $($r.StatusCode) | $b"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if (-not $code) { $code = 'TIMEOUT/ERR' }
        return "HTTP $code | $_"
    }
}

"=== EDUNEX AUDIT $(Get-Date -Format 'HH:mm:ss') ==="

# Login
$lr = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -Body '{"email":"superadmin@edunex.in","password":"Edunex@2024"}' -Headers @{'Content-Type'='application/json'} -UseBasicParsing -TimeoutSec $to
$tok = ($lr.Content | ConvertFrom-Json).data.token
"LOGIN: $($lr.StatusCode) | token=$($tok.Substring(0,20))..."

$tests = @(
    @{m='GET'; p='/health'},
    @{m='GET'; p='/api/students?limit=3'},
    @{m='GET'; p='/api/teachers?limit=3'},
    @{m='GET'; p='/api/dashboard/stats'},
    @{m='GET'; p='/api/fees?limit=3'},
    @{m='GET'; p='/api/bus/routes'},
    @{m='GET'; p='/api/enquiries?limit=3'},
    @{m='GET'; p='/api/parents?limit=3'},
    @{m='GET'; p='/api/calls/voice-agent-twiml?type=general'},
    @{m='GET'; p='/api/ai/status'}
)

foreach ($t in $tests) {
    "$($t.p) => $(Req $t.m $t.p $null $tok)"
}

"=== DONE ==="
