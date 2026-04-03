# DRD Executive Hub — Push to GitHub
# Run this script from the GRC-Hub-Project folder on your Desktop
# PowerShell: .\deploy-to-github.ps1

Write-Host "=== DRD Executive Hub — GitHub Deploy ===" -ForegroundColor Cyan

# Initialize git if needed
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    Write-Host "Git initialized" -ForegroundColor Green
}

# Set remote (force update if exists)
git remote remove origin 2>$null
git remote add origin https://github.com/arfaj01/grc-hub.git
Write-Host "Remote set to arfaj01/grc-hub" -ForegroundColor Green

# Stage all files (respects .gitignore)
git add -A

# Commit
git commit -m "DRD Executive Hub — production ready (Next.js 15 + Supabase)"

# Force push to main (replacing existing placeholder content)
git push -u origin main --force

Write-Host ""
Write-Host "=== Deploy complete! ===" -ForegroundColor Green
Write-Host "Vercel will auto-deploy from GitHub within 1-2 minutes." -ForegroundColor Yellow
Write-Host "Production URL: https://grc-hub.vercel.app" -ForegroundColor Cyan
