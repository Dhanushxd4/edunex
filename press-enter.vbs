Set wsh = CreateObject("WScript.Shell")
WScript.Sleep 500
wsh.AppActivate "Windows PowerShell"
WScript.Sleep 800
wsh.SendKeys "~"
WScript.Sleep 500
wsh.SendKeys "~"
