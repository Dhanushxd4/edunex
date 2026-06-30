@echo off
echo === Deploy9: Video + Bus features ===

echo --- Step 1: Check Supabase tables ---
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\setup-tables.ps1" > "C:\Users\admin\Downloads\edunex\deploy9-log.txt" 2>&1

echo --- Step 2: Deploy to Railway ---
cd /d "C:\Users\admin\Downloads\edunex\backend"
railway up --service edunex-api --environment production --detach >> "C:\Users\admin\Downloads\edunex\deploy9-log.txt" 2>&1
echo EXIT: %ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\deploy9-log.txt"
echo DONE >> "C:\Users\admin\Downloads\edunex\deploy9-log.txt"
