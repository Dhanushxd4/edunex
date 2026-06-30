@echo off
cd /d "C:\Users\admin\Downloads\edunex\backend"
railway up --service edunex-api --environment production --detach > "C:\Users\admin\Downloads\edunex\deploy11-log.txt" 2>&1
echo EXIT:%ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\deploy11-log.txt"
