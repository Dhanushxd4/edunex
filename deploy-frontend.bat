@echo off
echo Deploying frontend to Vercel...
cd /d "C:\Users\admin\Downloads\edunex\frontend"
call vercel --prod --yes
echo Done!
pause
