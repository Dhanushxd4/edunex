@echo off
taskkill /f /im powershell.exe /t > nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\audit2.ps1" > "C:\Users\admin\Downloads\edunex\audit2-log.txt" 2>&1
