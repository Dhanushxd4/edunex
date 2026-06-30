@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\deploy-frontend.ps1" > "C:\Users\admin\Downloads\edunex\deploy-frontend-log.txt" 2>&1
echo Done! Check deploy-frontend-log.txt
pause
