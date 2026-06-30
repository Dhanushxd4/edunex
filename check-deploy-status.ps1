$base = 'https://edunex-api-production.up.railway.app'

function Check($path) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        return "$($r.StatusCode) - $($r.Content.Substring(0,[Math]::Min(100,$r.Content.Length)))"
    } catch [System.Net.WebException] {
        $code = [int]$_.Exception.Response.StatusCode
        $b=''; try{$s=$_.Exception.Response.GetResponseStream();$rd=[System.IO.StreamReader]::new($s);$b=$rd.ReadToEnd()}catch{}
        return "$code - $($b.Substring(0,[Math]::Min(100,$b.Length)))"
    }
}

Write-Output "=== Deploy Status Check ==="
Write-Output "health    : $(Check '/health')"
Write-Output "video GET : $(Check '/api/video/')"
Write-Output "bus GET   : $(Check '/api/bus/routes')"
Write-Output "DONE"
