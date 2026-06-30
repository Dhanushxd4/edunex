@echo off
(
  echo === Railway Logs - Latest ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway logs 2>&1
  echo.
  echo === Status ===
  railway status 2>&1
  echo DONE
) > "C:\Users\admin\Downloads\edunex\check9-log.txt" 2>&1
