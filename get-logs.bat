@echo off
(
  echo === Railway Build Logs ===
  cd /d "C:\Users\admin\Downloads\edunex\backend"
  railway logs --deployment 24243542-c8b7-4f80-be7a-a882e618b832 2>&1
  echo.
  echo === Railway Status ===
  railway status 2>&1
  echo DONE
) > "C:\Users\admin\Downloads\edunex\railway-build-log.txt" 2>&1
