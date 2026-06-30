@echo off
setlocal
set BACKEND=C:\Users\admin\Downloads\edunex\backend
set LOGFILE=C:\Users\admin\Downloads\edunex\fix-deploy-log.txt

> "%LOGFILE%" (
  echo === Fix Deploy: TypeScript error fixed in parents.ts ===
  echo Running from: %BACKEND%
  echo.
)

pushd "%BACKEND%"
>> "%LOGFILE%" echo Pushed to: %CD%
>> "%LOGFILE%" railway up --service edunex-api --detach 2>&1
>> "%LOGFILE%" echo EXIT CODE: %ERRORLEVEL%
popd

>> "%LOGFILE%" echo.
>> "%LOGFILE%" echo DONE - Check fix-deploy-log.txt for results
