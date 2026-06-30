@echo off
echo [%TIME%] > "C:\Users\admin\Downloads\edunex\status2-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"
railway status >> "C:\Users\admin\Downloads\edunex\status2-log.txt" 2>&1
echo [%TIME%] DONE >> "C:\Users\admin\Downloads\edunex\status2-log.txt"
