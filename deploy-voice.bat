@echo off
cd /d "C:\Users\admin\Downloads\edunex\backend"
echo === Deploying Edunex backend with Voice Agent to Railway ===
echo.
railway up --service edunex-api --detach 2>&1
echo.
echo === Deploy triggered. Checking health in 15s... ===
timeout /t 15 /nobreak >nul
curl -s https://edunex-api-production.up.railway.app/health 2>&1
echo.
echo Done!
pause
