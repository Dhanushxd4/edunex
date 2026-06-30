@echo off
cd /d "C:\Users\admin\Downloads\edunex"
echo Pushing master to GitHub (force)...
"C:\Program Files\Git\cmd\git.exe" push origin master --force 2>&1
echo.
echo Done. Check https://github.com/Dhanushxd4/edunex
pause
