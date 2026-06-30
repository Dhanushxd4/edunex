@echo off
echo Placing AI voice call to +919908884588... > "C:\Users\admin\Downloads\edunex\call-final-log.txt"
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\call-final.ps1" >> "C:\Users\admin\Downloads\edunex\call-final-log.txt" 2>&1
echo Done >> "C:\Users\admin\Downloads\edunex\call-final-log.txt"
