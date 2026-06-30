@echo off
cd /d "C:\Users\admin\Downloads\edunex"
set GIT=C:\Users\admin\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe

echo === Step 1: Reading GitHub token from Windows Credential Manager ===
if exist .github-token.tmp del .github-token.tmp

powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\read-wcm.ps1" 2>&1

if not exist .github-token.tmp (
    echo.
    echo No token saved. Cannot push with token method.
    pause
    exit /b 1
)

set /p TOKEN=<.github-token.tmp
echo.
echo Token found! First 10 chars: %TOKEN:~0,10%

echo.
echo === Step 2: Getting commit SHA ===
for /f %%i in ('"%GIT%" rev-parse HEAD 2^>^&1') do set SHA=%%i
echo HEAD SHA: %SHA%

echo.
echo === Step 3: Force push with token embedded in URL ===
"%GIT%" -c credential.helper= remote set-url origin "https://%TOKEN%@github.com/Dhanushxd4/edunex.git" 2>&1
"%GIT%" -c credential.helper= push origin master --force 2>&1
set RESULT=%ERRORLEVEL%

echo.
echo === Step 4: Restore clean remote URL ===
"%GIT%" remote set-url origin "https://github.com/Dhanushxd4/edunex.git" 2>&1

echo.
if %RESULT%==0 (
    echo ============================
    echo SUCCESS! Pushed to GitHub!
    echo Check: https://github.com/Dhanushxd4/edunex
    echo ============================
) else (
    echo Push exit code: %RESULT%
)
del .github-token.tmp 2>nul
pause
