@echo off
taskkill /f /im railway.exe /t > nul 2>&1
taskkill /f /im railway /t > nul 2>&1

echo [%TIME%] Checking Railway status... > "C:\Users\admin\Downloads\edunex\check-status-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"

railway status >> "C:\Users\admin\Downloads\edunex\check-status-log.txt" 2>&1
echo. >> "C:\Users\admin\Downloads\edunex\check-status-log.txt"
echo [%TIME%] Last 30 log lines: >> "C:\Users\admin\Downloads\edunex\check-status-log.txt"
railway logs --lines 30 >> "C:\Users\admin\Downloads\edunex\check-status-log.txt" 2>&1
echo [%TIME%] DONE >> "C:\Users\admin\Downloads\edunex\check-status-log.txt"
