@echo off
(
  echo === TypeScript Check ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  npx tsc --noEmit 2>&1
  echo.
  echo EXIT CODE: %ERRORLEVEL%
) > "C:\Users\admin\Downloads\edunex\ts-check-log.txt" 2>&1
