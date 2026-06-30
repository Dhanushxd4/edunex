@echo off
(
  echo === Redeploying with TS fix ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  echo Dir: %CD%
  railway up --service edunex-api --detach 2>&1
  echo.
  echo EXIT: %ERRORLEVEL%
  echo DONE
) > "C:\Users\admin\Downloads\edunex\redeploy-log.txt" 2>&1
