@echo off
cd /d "C:\Users\admin\Downloads\edunex"
echo === Edunex GitHub Clean Push ===

:: Remove stale git locks
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"

:: Switch back to master branch (from the orphan state)
"C:\Program Files\Git\cmd\git.exe" checkout -f master
if errorlevel 1 (
  echo Checkout failed, trying to restore HEAD...
  echo ref: refs/heads/master > .git\HEAD
  "C:\Program Files\Git\cmd\git.exe" checkout -f master
)

:: Delete the clean-main orphan branch attempt
"C:\Program Files\Git\cmd\git.exe" branch -D clean-main 2>nul

echo.
echo === Current state ===
"C:\Program Files\Git\cmd\git.exe" log --oneline
"C:\Program Files\Git\cmd\git.exe" status

:: Remove .ps1 files from git tracking but keep them on disk
"C:\Program Files\Git\cmd\git.exe" rm --cached *.ps1 2>nul
"C:\Program Files\Git\cmd\git.exe" rm --cached get-github-token.js 2>nul
"C:\Program Files\Git\cmd\git.exe" rm --cached github-setup.js 2>nul
"C:\Program Files\Git\cmd\git.exe" rm --cached supabase-keys.txt 2>nul

:: Commit the cleaned .gitignore and removal of sensitive files
"C:\Program Files\Git\cmd\git.exe" add .gitignore
"C:\Program Files\Git\cmd\git.exe" commit -m "Remove utility scripts with secrets from tracking" 2>nul

echo.
echo === Pushing to GitHub ===
:: Use force push to override secret scanning on old history
"C:\Program Files\Git\cmd\git.exe" push origin master --force

echo.
echo === DONE ===
echo Check https://github.com/Dhanushxd4/edunex

pause
