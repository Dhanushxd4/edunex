@echo off
(
  echo === PATH ===
  echo %PATH%
  echo.
  echo === where railway ===
  where railway 2>&1
  echo.
  echo === npm railway ===
  npm list -g @railway/cli 2>&1
  echo.
  echo === railway version ===
  railway --version 2>&1
  echo.
  echo === railway whoami ===
  railway whoami 2>&1
  echo.
  echo === Deploying... ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway up --service edunex-api --detach 2>&1
  echo.
  echo DONE
) > "C:\Users\admin\Downloads\edunex\railway-log.txt" 2>&1
