@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\Downloads\edunex\check-deploy-status.ps1" > "C:\Users\admin\Downloads\edunex\deploy-status-log.txt" 2>&1
