@echo off
(
  echo === Deploy with environment flag ===
  echo DIR: %CD%
  set RAILWAY_PROJECT_ID=4a8991d8-5407-4464-a553-ec1bb28c1df8
  railway up --service edunex-api --environment production --detach 2>&1
  echo EXIT: %ERRORLEVEL%
  echo DONE
) > "C:\Users\admin\Downloads\edunex\deploy5-log.txt" 2>&1
