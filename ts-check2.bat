@echo off
(
  echo === TypeScript Check (after parents.ts fix) ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  npx tsc --noEmit 2>&1
  echo.
  echo === Build test ===
  npx tsc 2>&1
  echo BUILD EXIT: %ERRORLEVEL%
) > "C:\Users\admin\Downloads\edunex\ts-check2-log.txt" 2>&1
