@echo off
echo === DRD Executive Hub — Deploy Fix ===

cd /d "%~dp0"

git config user.email "arfaj001@gmail.com"
git config user.name "Mohammed Aalarfaj"

git add -A
git commit -m "Add bulk import feature — feed data in one go"
git push origin main

echo.
echo === Pushed! Vercel will rebuild. ===
pause
