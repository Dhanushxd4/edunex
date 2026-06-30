@echo off
cd /d "C:\Users\admin\Downloads\edunex"

:: Use GitHub Desktop's own git (already has auth credentials)
for /d %%d in ("C:\Users\admin\AppData\Local\GitHubDesktop\app-*") do set GHDIR=%%d
set GHGIT="%GHDIR%\resources\app\git\cmd\git.exe"
echo Using GitHub Desktop git: %GHGIT%
echo Pushing master to GitHub (force)...
%GHGIT% push origin master --force 2>&1
echo.
echo === Result above ===
pause
