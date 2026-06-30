@echo off
taskkill /f /im railway.exe /t > nul 2>&1
taskkill /f /im node.exe /t > nul 2>&1

echo [%TIME%] Deploying to Railway... > "C:\Users\admin\Downloads\edunex\deploy2-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"

railway up --service edunex-api --environment production --detach >> "C:\Users\admin\Downloads\edunex\deploy2-log.txt" 2>&1

echo [%TIME%] Upload done. Exit: %ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\deploy2-log.txt"
echo [%TIME%] DONE >> "C:\Users\admin\Downloads\edunex\deploy2-log.txt"
