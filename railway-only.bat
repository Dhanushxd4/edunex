@echo off
taskkill /f /im node.exe /t > nul 2>&1
echo [%TIME%] Killed any hung node processes > "C:\Users\admin\Downloads\edunex\railway-only-log.txt"

cd /d "C:\Users\admin\Downloads\edunex\backend"
echo [%TIME%] Running railway up... >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"

railway up --service edunex-api --environment production --detach >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt" 2>&1

echo [%TIME%] Deploy triggered. Exit: %ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"
echo [%TIME%] Waiting 90s for build to complete... >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"
timeout /t 90 /nobreak > nul

echo [%TIME%] Fetching logs... >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"
railway logs >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt" 2>&1

echo [%TIME%] Status: >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"
railway status >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt" 2>&1
echo [%TIME%] DONE >> "C:\Users\admin\Downloads\edunex\railway-only-log.txt"
