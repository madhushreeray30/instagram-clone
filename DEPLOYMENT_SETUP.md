# Automated Deployment Setup Guide

Your code is on GitHub! ✅ Now let's get your credentials and run the deployment script.

## Step 1: Get Your GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `instagram-deployment`
4. Select these permissions:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Actions and workflows)
5. Click "Generate token"
6. **COPY** the token (you'll only see it once!)
7. Save it somewhere safe temporarily

## Step 2: Get Your Render API Key

1. Go to: https://dashboard.render.com
2. Click your profile icon (top right) → "Account Settings"
3. Scroll down to "API Keys"
4. Click "Create API Key"
5. Give it a name: `instagram-deployment`
6. Click "Create"
7. **COPY** the API key
8. Save it somewhere safe temporarily

## Step 3: Get Your Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name: `instagram-deployment`
4. Select "Full Account" access
5. Click "Create"
6. **COPY** the token
7. Save it somewhere safe temporarily

## Step 4: Create Your .env File

1. In your project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your values:
   ```
   GITHUB_USERNAME=your_actual_github_username
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxx
   VERCEL_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxx
   DB_PASSWORD=ChooseASecurePassword123!
   JWT_SECRET=my_super_secret_key_123
   JWT_REFRESH_SECRET=my_super_refresh_secret_123
   ```

3. **IMPORTANT:** 
   - Never commit `.env` to Git (it's in .gitignore)
   - Never share these credentials
   - Keep this file secure

## Step 5: Install Node Dependencies

```bash
npm install
```

## Step 6: Run the Deployment Script

```bash
node deploy.js
```

The script will:
1. ✅ Push your code to GitHub (already done)
2. ✅ Create PostgreSQL database on Render
3. ✅ Create Redis cache on Render
4. ✅ Deploy backend to Render
5. ✅ Run database migrations
6. ✅ Deploy frontend to Vercel

**This takes about 15-20 minutes.** The script will show you progress as it goes.

## Step 7: Verify Your Deployment

When the script finishes, it will show:
- **Backend URL**: `https://instagram-backend.render.com`
- **Frontend URL**: `https://instagram-clone-xxx.vercel.app`

Open your frontend URL and test:
1. Can you see the sign up page?
2. Can you create an account?
3. Can you log in?

## Troubleshooting

**Script fails at GitHub step:**
- Check your GITHUB_TOKEN is valid
- Make sure you have push permissions to the repo

**Database creation fails:**
- Check your RENDER_API_KEY is correct
- Go to https://dashboard.render.com and verify it works

**Backend deployment fails:**
- Check Render dashboard for error logs
- Verify all environment variables were set correctly

**Frontend deployment fails:**
- Install Vercel CLI: `npm install -g vercel`
- Check your VERCEL_TOKEN is correct
- Try deploying manually: `cd frontend && vercel --prod`

**Still stuck?**
- Check the full logs on Render/Vercel dashboards
- Verify your database and Redis are running
- Make sure backend URL is reachable

---

**Next Steps After Deployment:**

1. **Update Backend with Frontend URL** (if not auto-updated):
   - Go to Render → instagram-backend → Environment
   - Set `FRONTEND_URL` to your Vercel URL
   - Click Save

2. **Set Up Uptime Monitoring**:
   - Go to https://uptimerobot.com
   - Add monitor for: `https://instagram-backend.render.com/health`
   - This keeps your free service awake

3. **Test All Features**:
   - Sign up and log in
   - Create posts
   - Follow users
   - Test search
   - Check console for errors

**You're done! 🚀**
