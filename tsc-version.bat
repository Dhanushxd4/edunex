@echo off
echo TSC VERSION TEST %TIME% > "C:\Users\admin\Downloads\edunex\tsc-version-log.txt"
cd /d "C:\Users\admin\Downloads\edunex\backend"
node_modules\.bin\tsc --version >> "C:\Users\admin\Downloads\edunex\tsc-version-log.txt" 2>&1
echo DONE >> "C:\Users\admin\Downloads\edunex\tsc-version-log.txt"
