@echo off
(
  echo === Railway Current Logs ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway logs 2>&1
  echo.
  echo === Deploy d16a670b logs ===
  railway logs --deployment d16a670b-a822-4819-9c40-eba748969e64 2>&1
  echo DONE
) > "C:\Users\admin\Downloads\edunex\check8-log.txt" 2>&1
