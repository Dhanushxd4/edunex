@echo off
(
  echo === Check Deploy7 Status ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway status 2>&1
  echo.
  echo === Logs ===
  railway logs --deployment d4e62ba7-65c5-45f1-8f48-ca250df4499c 2>&1
  echo DONE
) > "C:\Users\admin\Downloads\edunex\check7-log.txt" 2>&1
