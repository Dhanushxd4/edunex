@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "supabase --version 2>&1; Write-Output '---'; node --version 2>&1; Write-Output '---'; npx supabase --version 2>&1" ^
  > "C:\Users\admin\Downloads\edunex\check-tools-log.txt" 2>&1
