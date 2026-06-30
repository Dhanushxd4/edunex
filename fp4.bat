@echo off
cd /d "C:\Users\admin\Downloads\edunex"
set GIT=C:\Users\admin\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe

echo === Step 1: Scanning Chrome for GitHub token ===
node get-github-token.js 2>&1

if not exist .github-token.tmp (
    echo.
    echo No token found in Chrome. Check output above.
    pause
    exit /b 1
)

set /p TOKEN=<.github-token.tmp
echo Token found (first 8 chars): %TOKEN:~0,8%...

echo.
echo === Step 2: Getting commit SHA ===
for /f %%i in ('"%GIT%" rev-parse HEAD 2^>^&1') do set SHA=%%i
echo SHA: %SHA%

echo.
echo === Step 3: Pushing with token in URL (no credential helper) ===
"%GIT%" -c credential.helper= remote set-url origin "https://%TOKEN%@github.com/Dhanushxd4/edunex.git" 2>&1
"%GIT%" -c credential.helper= push origin master --force 2>&1
set RESULT=%ERRORLEVEL%

echo.
echo === Step 4: Restoring clean remote URL ===
"%GIT%" remote set-url origin "https://github.com/Dhanushxd4/edunex.git" 2>&1

echo.
if %RESULT%==0 (
    echo SUCCESS! Check: https://github.com/Dhanushxd4/edunex
) else (
    echo Push exited with code: %RESULT%
)
pause
