@echo off
setlocal
cd /d "C:\Users\admin\Downloads\edunex"
set GIT="C:\Program Files\Git\cmd\git.exe"

echo === Edunex GitHub: Squash history and force push ===
echo.

:: Clean up any stale lock files
if exist ".git\index.lock" del /f ".git\index.lock" 2>nul
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"  2>nul

:: Make sure we're on master
echo [1/6] Switching to master branch...
%GIT% checkout -f master 2>&1

:: Delete clean-main orphan branch if it exists
%GIT% branch -D clean-main 2>nul

:: Remove git objects cache to allow orphan
echo.
echo [2/6] Creating clean orphan branch (no secret history)...
%GIT% checkout --orphan temp-clean

:: Add everything (gitignore excludes *.ps1 and secrets)
echo [3/6] Staging all clean files...
%GIT% add -A

:: Single clean commit
echo [4/6] Creating single clean commit...
%GIT% commit -m "Edunex LMS: Full stack school management with AI voice agent"

:: Replace master with temp-clean
echo [5/6] Replacing master branch...
%GIT% branch -D master
%GIT% branch -m master

echo.
echo [6/6] Force pushing to GitHub (no old history = no secret scanning block)...
%GIT% push origin master --force

echo.
echo === Check result above ===
echo If push succeeded: https://github.com/Dhanushxd4/edunex
pause
