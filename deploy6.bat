@echo off
(
  echo === Deploy6: backend dir, TS fix applied ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway up --service edunex-api --environment production --detach 2>&1
  echo EXIT: %ERRORLEVEL%
  echo DONE
) > "C:\Users\admin\Downloads\edunex\deploy6-log.txt" 2>&1
