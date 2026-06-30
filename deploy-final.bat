@echo off
cd /d "C:\Users\admin\Downloads\edunex\backend"
echo [%TIME%] Starting TSC check... > "C:\Users\admin\Downloads\edunex\deploy-final-log.txt"

node_modules\.bin\tsc --noEmit >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt" 2>&1

if %ERRORLEVEL% NEQ 0 (
  echo [%TIME%] TSC FAILED - aborting deploy >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt"
  exit /b 1
)

echo [%TIME%] TSC PASSED - deploying to Railway... >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt"

railway up --service edunex-api --environment production --detach >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt" 2>&1

echo [%TIME%] Deploy command finished. Waiting 60s for build... >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt"
timeout /t 60 /nobreak > nul

railway logs >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt" 2>&1
echo [%TIME%] DONE >> "C:\Users\admin\Downloads\edunex\deploy-final-log.txt"
