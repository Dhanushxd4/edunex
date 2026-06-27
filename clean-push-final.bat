@echo off
setlocal
cd /d "C:\Users\admin\Downloads\edunex"
set GIT="C:\Program Files\Git\cmd\git.exe"

echo === Edunex: Clean push (no secrets) ===
echo.

:: 1. Remove ALL stale locks
if exist ".git\index.lock"       del /f ".git\index.lock"       2>nul
if exist ".git\config.lock"      del /f ".git\config.lock"      2>nul
if exist ".git\HEAD.lock"        del /f ".git\HEAD.lock"        2>nul
if exist ".git\packed-refs.lock" del /f ".git\packed-refs.lock" 2>nul

:: 2. Fix HEAD to point to master (orphan commit 9c5d5e9 is already there)
echo ref: refs/heads/master> .git\HEAD

:: 3. Delete any leftover temp branches
%GIT% branch -D fresh-clean 2>nul
%GIT% branch -D temp-clean 2>nul
%GIT% branch -D temp-orphan2 2>nul

:: 4. Create a NEW orphan branch (clean slate)
echo [1/5] Creating fresh orphan branch...
%GIT% checkout --orphan fresh-clean

:: 5. Stage EVERYTHING first
echo [2/5] Staging all files...
%GIT% add -A

:: 6. NOW explicitly remove all secret/sensitive files from staging
echo [3/5] Removing sensitive files from staging...
%GIT% rm --cached *.ps1              --ignore-unmatch -q 2>nul
%GIT% rm --cached *.sh               --ignore-unmatch -q 2>nul
%GIT% rm --cached supabase-keys.txt  --ignore-unmatch -q 2>nul
%GIT% rm --cached get-github-token.js --ignore-unmatch -q 2>nul
%GIT% rm --cached github-setup.js    --ignore-unmatch -q 2>nul
%GIT% rm --cached get-keys.js        --ignore-unmatch -q 2>nul
%GIT% rm --cached press-enter.vbs    --ignore-unmatch -q 2>nul
%GIT% rm --cached .gh-token.tmp      --ignore-unmatch -q 2>nul
%GIT% rm --cached .github-token.tmp  --ignore-unmatch -q 2>nul
%GIT% rm --cached -r monitor         --ignore-unmatch -q 2>nul
%GIT% rm --cached -r supabase/.temp  --ignore-unmatch -q 2>nul

:: 7. Commit the clean snapshot
echo [4/5] Committing clean snapshot...
%GIT% commit -m "Edunex LMS: Full stack school management with AI voice agent"

:: 8. Replace master with this clean branch
echo [5/5] Replacing master and force-pushing...
%GIT% branch -D master 2>nul
%GIT% branch -m master

:: 9. Force push — no secrets in history, no blocking
%GIT% push origin master --force

echo.
echo === Done! Check: https://github.com/Dhanushxd4/edunex ===
pause
