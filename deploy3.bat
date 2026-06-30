@echo off
taskkill /f /im railway.exe /t > nul 2>&1

echo [%TIME%] Deploying with Dockerfile (no tsc)... > "C:\Users\admin\Downloads\edunex\deploy3-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"

railway up --service edunex-api --environment production --detach >> "C:\Users\admin\Downloads\edunex\deploy3-log.txt" 2>&1

echo [%TIME%] Done. Exit: %ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\deploy3-log.txt"
