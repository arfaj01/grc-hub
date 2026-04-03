@echo off
echo === DRD Executive Hub — Deploy Fix ===

cd /d "%~dp0"

git config user.email "arfaj001@gmail.com"
git config user.name "Mohammed Aalarfaj"

git add -A
git commit -m "Upgrade Next.js to 15.3.1 to fix Vercel security block"
git push origin main

echo.
echo === Pushed! Vercel will rebuild. ===
pause
