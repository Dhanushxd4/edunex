@echo off
cd /d "C:\Users\admin\Downloads\edunex"
set GIT=C:\Users\admin\AppData\Local\GitHubDesktop\app-3.5.11\resources\app\git\cmd\git.exe

:: Read token saved from previous run
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\read-wcm.ps1" 2>&1
if not exist .github-token.tmp (
    echo Token not found!
    pause
    exit /b 1
)
set /p TOKEN=<.github-token.tmp

echo === Committing workflow fix (main -> master) ===
"%GIT%" -c credential.helper= remote set-url origin "https://%TOKEN%@github.com/Dhanushxd4/edunex.git"
"%GIT%" add .github/workflows/deploy.yml
"%GIT%" commit -m "ci: fix workflow trigger branch main -> master"
"%GIT%" -c credential.helper= push origin master 2>&1
set RESULT=%ERRORLEVEL%

"%GIT%" remote set-url origin "https://github.com/Dhanushxd4/edunex.git"
del .github-token.tmp 2>nul

if %RESULT%==0 (
    echo.
    echo SUCCESS! Workflow fix pushed.
    echo Now add these secrets in GitHub: https://github.com/Dhanushxd4/edunex/settings/secrets/actions
    echo   RAILWAY_TOKEN
    echo   VERCEL_TOKEN
    echo   VERCEL_ORG_ID
    echo   VERCEL_PROJECT_ID
) else (
    echo Exit code: %RESULT%
)
pause
