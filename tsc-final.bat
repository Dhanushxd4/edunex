@echo off
echo === TSC Check %TIME% %DATE% === > "C:\Users\admin\Downloads\edunex\tsc-final-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"
npx tsc --noEmit >> "C:\Users\admin\Downloads\edunex\tsc-final-log.txt" 2>&1
echo TSC EXIT: %ERRORLEVEL% >> "C:\Users\admin\Downloads\edunex\tsc-final-log.txt"
