@echo off
cd /d C:\Users\admin\Downloads\edunex\backend
railway up --service edunex-api > C:\Users\admin\Downloads\edunex\railway-deploy2.txt 2>&1
echo DONE >> C:\Users\admin\Downloads\edunex\railway-deploy2.txt
