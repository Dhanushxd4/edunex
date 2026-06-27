@echo off
cd /d "C:\Users\admin\Downloads\edunex"
set GIT="C:\Program Files\Git\cmd\git.exe"

echo === Edunex: Push orphan commit to GitHub ===
echo.

:: Remove ALL stale locks
if exist ".git\index.lock"  del /f ".git\index.lock"  2>nul
if exist ".git\HEAD.lock"   del /f ".git\HEAD.lock"   2>nul
if exist ".git\config.lock" del /f ".git\config.lock" 2>nul
if exist ".git\packed-refs.lock" del /f ".git\packed-refs.lock" 2>nul

:: Fix broken HEAD — make sure it points to master
echo ref: refs/heads/master> .git\HEAD

:: Show current state
echo Current branch and commit:
%GIT% log --oneline -2 2>&1
echo.

:: Push the clean orphan commit
echo Pushing master to GitHub (force)...
%GIT% push origin master --force 2>&1

echo.
echo === Result above. Check: https://github.com/Dhanushxd4/edunex ===
pause
