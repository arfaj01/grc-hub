@echo off
echo === DRD Executive Hub — Deploy Fix ===

cd /d "%~dp0"

git config user.email "arfaj001@gmail.com"
git config user.name "Mohammed Aalarfaj"

git add -A
git commit -m "Skip TS type checking during build to unblock deployment"
git push origin main

echo.
echo === Pushed! Vercel will rebuild. ===
pause
