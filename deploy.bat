@echo off
echo === DRD Executive Hub — GitHub Deploy ===

cd /d "%~dp0"

git config user.email "arfaj001@gmail.com"
git config user.name "Mohammed Aalarfaj"

if not exist ".git" (
    git init
    git branch -M main
    echo Git initialized
)

git remote remove origin 2>nul
git remote add origin https://github.com/arfaj01/grc-hub.git
echo Remote set to arfaj01/grc-hub

git add -A
git commit -m "DRD Executive Hub — production ready (Next.js 15 + Supabase)"
git push -u origin main --force

echo.
echo === Deploy complete! ===
echo Vercel will auto-deploy within 1-2 minutes.
echo Production URL: https://grc-hub.vercel.app
pause
