# DRD Executive Hub — Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account with repo: `moalarfaj/GRC-Hub-Project`
- Vercel account connected to GitHub
- Supabase project: `ovjpruxemlyaapswkngo`

---

## Step 1: Environment Variables

Create `.env.local` in the project root (if not already):

```
NEXT_PUBLIC_SUPABASE_URL=https://ovjpruxemlyaapswkngo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Get the anon key from: https://supabase.com/dashboard/project/ovjpruxemlyaapswkngo/settings/api

---

## Step 2: Supabase Setup

1. Open https://supabase.com/dashboard/project/ovjpruxemlyaapswkngo/sql/new
2. Run the migration script from `supabase/migrations/001_schema.sql`
3. Run the seed data from `supabase/seed.sql` (replace `USER_ID_HERE` with your auth user ID)
4. Verify RLS is enabled on all tables: Settings → Database → Tables

### Create Your Auth User

If you haven't already, create a user in Supabase Authentication:
- Go to Authentication → Users → Add User
- Use your email and a strong password
- Copy the user UUID for the seed data

---

## Step 3: Install & Build Locally

Open PowerShell in `C:\Users\Administrator\Desktop\GRC-Hub-Project`:

```powershell
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

### If Build Fails

Common fixes:

**Missing module errors:**
```powershell
npm install
```

**TypeScript errors — check the file and line number in the error output.**
Most likely causes:
- Missing `await` on `params` in dynamic routes (Next.js 15 requires `Promise<{id: string}>`)
- Import mismatches — ensure client components use `import type` for server modules

**Test locally:**
```powershell
npm run dev
```
Then open http://localhost:3000

---

## Step 4: Push to GitHub

```powershell
# Initialize git if needed
git init
git remote add origin https://github.com/moalarfaj/GRC-Hub-Project.git

# Stage all files
git add -A

# Verify no secrets staged
git diff --cached --name-only | Select-String ".env.local"
# If .env.local appears, run: git reset HEAD .env.local

# Commit
git commit -m "DRD Executive Hub — production ready (Phase 1-5)"

# Push
git push -u origin main
```

---

## Step 5: Deploy on Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import `moalarfaj/GRC-Hub-Project`
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ovjpruxemlyaapswkngo.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-anon-key>`
6. Click Deploy

### Option B: Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted:
- Link to existing project: Yes
- Select your project

---

## Step 6: Post-Deployment Verification

After deployment completes, verify these on the production URL:

### Authentication
- [ ] `/login` loads with Arabic text and Tajawal font
- [ ] Login with email/password works
- [ ] Redirect to dashboard after login
- [ ] Accessing any page without login redirects to `/login`

### Dashboard
- [ ] All 4 KPI cards show data
- [ ] Goals progress bars render correctly
- [ ] Recent achievements list populates
- [ ] Data alerts section works
- [ ] Full RTL layout — text aligned right

### CRUD Operations
- [ ] Create a new achievement (should take < 30 seconds)
- [ ] Edit an existing goal
- [ ] Add a new note
- [ ] Upload a file in Archive

### Reports
- [ ] Generate a monthly report
- [ ] Report shows Strategic Insight Layer (sections 8-11)
- [ ] Print preview works (Ctrl+P)
- [ ] Edit executive summary fields
- [ ] Approve and publish flow works

### Performance
- [ ] Dashboard loads in < 3 seconds
- [ ] Page transitions show loading skeletons
- [ ] No console errors in browser DevTools

---

## Step 7: Supabase Production Settings

1. **Auth Settings** (Authentication → Settings):
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Redirect URLs: add `https://your-vercel-domain.vercel.app/**`

2. **API Settings** (Settings → API):
   - Verify RLS is enforced (should be by default)

3. **Storage** (Storage → Policies):
   - Verify `attachments` bucket exists with authenticated-only policy

---

## Troubleshooting

### "Invalid API key" error
→ Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars matches Supabase dashboard

### Blank page after login
→ Check Supabase Auth → Settings → Site URL matches your Vercel domain

### "relation does not exist" error
→ Run the migration SQL in Supabase SQL Editor

### Build fails on Vercel
→ Check build logs. Most common: missing env vars or TypeScript strict errors

### RLS policy errors (row-level security)
→ Ensure the authenticated user's UUID matches `user_id` in seed data
