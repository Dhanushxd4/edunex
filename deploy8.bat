@echo off
(
  echo === Deploy8: Dockerfile + dist/ now included (gitignore fixed) ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway up --service edunex-api --environment production --detach 2>&1
  echo EXIT: %ERRORLEVEL%
  echo DONE
) > "C:\Users\admin\Downloads\edunex\deploy8-log.txt" 2>&1
