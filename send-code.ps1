$wsh = New-Object -ComObject WScript.Shell
$wsh.AppActivate('npm install supabase')
Start-Sleep -Milliseconds 800
$wsh.SendKeys('792e415b')
Start-Sleep -Milliseconds 400
$wsh.SendKeys('~')
