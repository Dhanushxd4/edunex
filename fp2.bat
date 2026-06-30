@echo off
cd /d "C:\Users\admin\Downloads\edunex"
echo Pushing with wincred helper (no browser popup)...
"C:\Program Files\Git\cmd\git.exe" -c credential.helper=wincred push origin master --force 2>&1
echo.
echo === Result above ===
pause
