@echo off
echo Running call test... > "C:\Users\admin\Downloads\edunex\call-test2-log.txt"
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\call-test.ps1" >> "C:\Users\admin\Downloads\edunex\call-test2-log.txt" 2>&1
echo Done >> "C:\Users\admin\Downloads\edunex\call-test2-log.txt"
