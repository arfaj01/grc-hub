@echo off
echo === DRD Executive Hub — Push Fix ===

cd /d "%~dp0"

git config user.email "arfaj001@gmail.com"
git config user.name "Mohammed Aalarfaj"

git add -A
git commit -m "Fix: add missing shadcn/ui color mappings to Tailwind config"
git push origin main

echo.
echo === Fix pushed! Vercel will rebuild automatically. ===
pause
