# 🚀 Step-by-Step Vercel Deployment Guide

This guide will walk you through deploying your MoneyQ application to Vercel.

---

## Prerequisites

Before you begin, make sure you have:

- ✅ A Vercel account ([sign up here](https://vercel.com/signup) if needed)
- ✅ A Supabase project set up with database
- ✅ An OpenAI API key
- ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to Git

If you haven't already, push your code to a Git repository:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add your remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/moneyq.git

# Push to main branch
git push -u origin main
```

---

## Step 2: Set Up Supabase Database

### 2.1 Ensure Database is Ready

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Make sure your database is active (not paused)
4. Go to **Settings** → **Database**

### 2.2 Get Your Connection Strings

You'll need **two** connection strings:

1. **Connection Pooler URL** (for Vercel - recommended)
   - In Supabase Dashboard → Settings → Database
   - Find **"Connection Pooling"** section
   - Copy the connection string (port **6543**)
   - Format: `postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true`

2. **Direct Connection URL** (for Prisma migrations)
   - In the same Database settings page
   - Find **"Connection string"** section
   - Copy the direct connection string (port **5432**)
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Note:** For Vercel, you MUST use the connection pooler (port 6543) because Vercel's IP addresses are dynamic and can't be added to an allowlist.

### 2.3 Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)

You can deploy via CLI or the web interface. For CLI:

```bash
npm i -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - If using GitHub/GitLab/Bitbucket, connect your account
   - Select your `moneyq` repository
   - Click **"Import"**

### 3.3 Configure Project Settings

Vercel will auto-detect Next.js. Configure:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (default)
- **Build Command:** `pnpm build` (or `npm run build`)
- **Output Directory:** `.next` (default)
- **Install Command:** `pnpm install` (or `npm install`)

**Important:** If using `pnpm`, you may need to add a `.npmrc` file or configure Vercel to use pnpm. Vercel usually auto-detects `pnpm-lock.yaml`.

---

## Step 4: Add Environment Variables

### 4.1 Add Environment Variables in Vercel

In the Vercel project settings, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (USE CONNECTION POOLER - port 6543)
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true

# Direct URL for Prisma migrations (port 5432)
DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# App URL (update after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_string_min_32_chars

# Exchange Rate API (optional)
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
```

### 4.2 Generate CRON_SECRET

Generate a secure random string for `CRON_SECRET`:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use an online generator
# https://randomkeygen.com/
```

### 4.3 Set Environment for Each Variable

- **Production:** ✅ (checked)
- **Preview:** ✅ (checked) - if you want preview deployments
- **Development:** ❌ (optional)

---

## Step 5: Run Database Migrations

### 5.1 Option A: Run Migrations Locally (Before First Deploy)

Before deploying, ensure your database schema is up to date:

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (uses DIRECT_URL)
pnpm db:push

# Seed categories
pnpm db:seed
```

### 5.2 Option B: Run Migrations via Vercel Build

You can add a build script to run migrations. However, **Vercel's build environment uses the connection pooler**, which doesn't support migrations. You'll need to:

1. Run migrations locally using `DIRECT_URL`
2. Or use a migration service
3. Or add a post-deploy script (see Step 6)

---

## Step 6: Configure Build Settings

### 6.1 Update package.json Build Script (Optional)

If you want to ensure Prisma Client is generated during build:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**Note:** Vercel runs `postinstall` automatically, so Prisma Client will be generated.

### 6.2 Verify Build Command

In Vercel project settings → **Settings** → **General**:
- Build Command: `pnpm build` (or `npm run build`)
- Output Directory: `.next`
- Install Command: `pnpm install` (or `npm install`)

---

## Step 7: Deploy

### 7.1 Trigger Deployment

1. Click **"Deploy"** in Vercel dashboard
2. Or push a commit to trigger automatic deployment:
   ```bash
   git push origin main
   ```

### 7.2 Monitor Build Logs

Watch the build logs in Vercel dashboard:
- ✅ Build should complete successfully
- ⚠️ If Prisma errors occur, ensure `DATABASE_URL` and `DIRECT_URL` are set correctly
- ⚠️ If build fails, check the logs for specific errors

---

## Step 8: Update App URL

### 8.1 Get Your Deployment URL

After successful deployment, Vercel will provide a URL like:
- `https://moneyq-abc123.vercel.app`

### 8.2 Update NEXT_PUBLIC_APP_URL

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual deployment URL:
   ```
   NEXT_PUBLIC_APP_URL=https://moneyq-abc123.vercel.app
   ```
3. **Redeploy** for the change to take effect (or wait for next deployment)

---

## Step 9: Verify Cron Jobs

### 9.1 Check vercel.json

Your `vercel.json` already has cron jobs configured:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-recurring",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-insights",
      "schedule": "0 3 1 * *"
    },
    {
      "path": "/api/cron/update-exchange-rates",
      "schedule": "0 1 1 * *"
    }
  ]
}
```

### 9.2 Verify Cron Jobs in Vercel

1. Go to **Settings** → **Cron Jobs** in your Vercel project
2. You should see the three cron jobs listed
3. They will run automatically according to their schedules

**Note:** Cron jobs require a Vercel Pro plan or higher. On the free Hobby plan, you can test them manually.

---

## Step 10: Test Your Deployment

### 10.1 Test Authentication

1. Visit your deployment URL
2. Try signing up with a new account
3. Verify email confirmation works (if enabled)
4. Test login

### 10.2 Test Core Features

- ✅ Create an expense
- ✅ Add income
- ✅ Create a recurring expense
- ✅ Test AI categorization
- ✅ View dashboard

### 10.3 Test API Endpoints

Check that API routes work:
- `/api/expenses`
- `/api/income`
- `/api/summary`

---

## Step 11: Set Up Custom Domain (Optional)

### 11.1 Add Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `moneyq.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## Step 12: Monitor and Maintain

### 12.1 Check Deployment Logs

- Go to **Deployments** tab
- Click on any deployment to see logs
- Monitor for errors

### 12.2 Set Up Monitoring (Optional)

- Use Vercel Analytics (available on Pro plan)
- Set up error tracking (Sentry, etc.)
- Monitor API usage and costs

### 12.3 Database Maintenance

- Monitor Supabase database usage
- Set up database backups
- Watch for connection pool limits

---

## Troubleshooting

### Build Fails with Prisma Error

**Error:** `Prisma Client has not been generated yet`

**Solution:**
1. Ensure `postinstall` script runs `prisma generate`
2. Check that `DATABASE_URL` is set correctly
3. Verify connection pooler URL format

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Use **Connection Pooler URL** (port 6543) for `DATABASE_URL`
2. Use **Direct Connection URL** (port 5432) for `DIRECT_URL`
3. Ensure database is not paused in Supabase
4. Check Supabase project is active

### Cron Jobs Not Running

**Solution:**
1. Verify `CRON_SECRET` is set in environment variables
2. Check Vercel plan supports cron jobs (Pro+)
3. Test cron endpoints manually:
   ```bash
   curl -X GET https://your-app.vercel.app/api/cron/process-recurring \
     -H "Authorization: Bearer your_cron_secret"
   ```

### Environment Variables Not Working

**Solution:**
1. Ensure variables are set for **Production** environment
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

### OpenAI API Errors

**Solution:**
1. Verify `OPENAI_API_KEY` is correct
2. Check OpenAI account has credits
3. Monitor API usage in OpenAI dashboard

---

## Quick Checklist

Before deploying, ensure:

- [ ] Code is pushed to Git repository
- [ ] Supabase project is set up and active
- [ ] Database schema is pushed (`pnpm db:push`)
- [ ] Categories are seeded (`pnpm db:seed`)
- [ ] All environment variables are collected
- [ ] `DATABASE_URL` uses connection pooler (port 6543)
- [ ] `DIRECT_URL` uses direct connection (port 5432)
- [ ] `CRON_SECRET` is generated and secure
- [ ] `NEXT_PUBLIC_APP_URL` will be updated after first deploy
- [ ] Vercel account is ready
- [ ] Build command is correct (`pnpm build`)

---

## Post-Deployment

After successful deployment:

1. ✅ Update `NEXT_PUBLIC_APP_URL` with actual deployment URL
2. ✅ Test all features end-to-end
3. ✅ Verify cron jobs are scheduled
4. ✅ Set up custom domain (if needed)
5. ✅ Monitor logs for errors
6. ✅ Set up backups for database
7. ✅ Configure error tracking (optional)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

**🎉 Congratulations! Your MoneyQ app should now be live on Vercel!**
