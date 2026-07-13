# Quick Start: Deploy for FREE in 30 Minutes

## The Fastest Way to Deploy (Copy-Paste Setup)

### Prerequisites (5 minutes)
1. GitHub account (https://github.com)
2. Render account (https://render.com) - Sign up with GitHub
3. Vercel account (https://vercel.com) - Sign up with GitHub

### Step 1: Push Code to GitHub (5 minutes)

```bash
# Initialize git if not done
cd instagram-clone
git remote add origin https://github.com/YOUR_USERNAME/instagram-clone.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend Database (5 minutes)

**On Render.com:**

1. Click "New +" → "PostgreSQL"
2. Fill in:
   - Name: `instagram-postgres`
   - Database: `instagram_clone`
   - Username: `postgres`
   - Click "Create Database"

3. **COPY AND SAVE** the connection string (looks like):
   ```
   postgresql://postgres:PASSWORD@server.render.com:5432/instagram_clone
   ```

4. Click "New +" → "Redis"
5. Fill in:
   - Name: `instagram-redis`
   - Click "Create Redis"

6. **COPY AND SAVE** the redis URL (looks like):
   ```
   redis://default:PASSWORD@server.render.com:12345
   ```

### Step 3: Deploy Backend API (5 minutes)

**On Render.com:**

1. Click "New +" → "Web Service"
2. Select your `instagram-clone` repository
3. Fill in:
   - **Name**: `instagram-backend`
   - **Environment**: Node
   - **Build Command**: 
     ```
     cd backend && npm install && npm run build
     ```
   - **Start Command**: 
     ```
     cd backend && npm start
     ```

4. Scroll down to "Environment" and add these variables:

```
NODE_ENV=production
PORT=5000
DB_HOST=<hostname-from-postgresql-connection-string>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password-from-postgresql-connection-string>
DB_NAME=instagram_clone
REDIS_HOST=<hostname-from-redis-url>
REDIS_PORT=<port-from-redis-url>
REDIS_PASSWORD=<password-from-redis-url>
JWT_ACCESS_SECRET=mysupersecretaccesskey12345678
JWT_REFRESH_SECRET=mysupersecretrefreshkey12345678
FRONTEND_URL=https://your-vercel-project.vercel.app
```

5. Click "Create Web Service"
6. **WAIT** for deployment (5-10 minutes) - Watch the logs
7. Once deployed, **COPY** the URL (e.g., `https://instagram-backend.render.com`)

### Step 4: Run Database Migrations (2 minutes)

**On Render (Backend Service):**

1. Click on your `instagram-backend` service
2. Click "Shell" tab at top
3. Paste and run:
   ```bash
   npm run migration:run
   ```
4. Wait for it to complete (should say "Migrations executed successfully")

### Step 5: Deploy Frontend (5 minutes)

**On Vercel.com:**

1. Click "Add New..." → "Project"
2. Select your `instagram-clone` repository
3. Click "Import"
4. Fill in:
   - **Project Name**: `instagram-clone` (or any name)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://instagram-backend.render.com/api/v1
   VITE_SOCKET_URL=https://instagram-backend.render.com
   VITE_ENV=production
   ```

6. Click "Deploy"
7. **WAIT** for deployment (2-5 minutes)
8. Once done, you'll see a **Deployment URL** (e.g., `https://instagram-clone-abc123.vercel.app`)

### Step 6: Test Your Deployment (3 minutes)

1. Open your Vercel URL in browser
2. Click "Sign Up"
3. Create account with test email
4. Verify email (check console logs if needed)
5. Create a post
6. Like/comment on posts
7. Follow users

## ✅ You're Done! Your App is Live

**Frontend**: `https://your-vercel-project.vercel.app`
**Backend API**: `https://instagram-backend.render.com`
**API Docs**: `https://instagram-backend.render.com/api-docs`

---

## Free Tier Features (Always Free)

✅ 1 backend service (0.5GB RAM, auto-sleep after 15 min)
✅ 1 PostgreSQL database (256MB)
✅ 1 Redis instance
✅ Unlimited frontend deployments
✅ SSL/HTTPS included
✅ Custom domain support (paid)
✅ Automatic deployments from GitHub

**Total Cost: $0/month**

---

## Common Issues & Quick Fixes

### "Backend taking 30 seconds to respond"
**Cause**: Free tier sleeps after 15 minutes
**Fix**: Use free monitoring (UptimeRobot)
```
1. Go to https://uptimerobot.com
2. Add monitor: https://instagram-backend.render.com/health
3. Check every 5 minutes (keeps it awake)
```

### "Database connection error"
**Fix**:
1. Double-check variable names (case-sensitive!)
2. Make sure DB_PASSWORD doesn't have special characters
3. If it does, wrap in quotes: `"pa$$word"`

### "Frontend can't connect to API"
**Fix**:
1. Check VITE_API_URL in Vercel environment
2. Make sure backend service is running (check Render dashboard)
3. Try accessing `https://instagram-backend.render.com/health` directly

### "Migrations didn't run"
**Fix**:
1. Open backend Shell in Render
2. Run: `npm run migration:run`
3. Wait for completion

---

## What to Do After Deployment

### 1. Share Your App
Send this URL to friends:
```
https://your-vercel-project.vercel.app
```

### 2. Monitor Performance
- Check Render dashboard for resource usage
- Check Vercel analytics for frontend performance
- Monitor database size (256MB limit on free)

### 3. Add Custom Domain (Optional, Free)
```
1. Vercel: Settings → Domains → Add custom domain
2. Render: Environment settings → Custom domain
3. Point your domain DNS to their nameservers
```

### 4. Enable Auto-Backups (Optional)
- Render automatically backs up PostgreSQL daily
- No action needed, included in free tier

### 5. Set Up Monitoring (Optional, Free)
- UptimeRobot: https://uptimerobot.com
- Monitors health endpoint
- Alerts if service goes down
- Keeps service awake (bonus!)

---

## Upgrade Path (When You Need More)

| Limit | Free Tier | When to Upgrade |
|-------|-----------|-----------------|
| RAM | 0.5GB | > 100 concurrent users |
| Database | 256MB | > 50k records |
| Bandwidth | 100GB/month | > 10k daily users |
| Auto-sleep | Yes (15 min) | Need always-on service |

**Cheapest upgrades**:
- Render Pro: $7/month per service
- Railway: $5/month base (pay-as-you-go)
- DigitalOcean: $12/month (all-in-one)

---

## Environment Variables Reference

### Backend Variables (Render)
```
NODE_ENV=production
PORT=5000
DB_HOST=server.render.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your-postgres-password>
DB_NAME=instagram_clone
REDIS_HOST=server.render.com
REDIS_PORT=12345
REDIS_PASSWORD=<your-redis-password>
JWT_ACCESS_SECRET=<any-random-string>
JWT_REFRESH_SECRET=<any-random-string>
FRONTEND_URL=https://your-vercel-url
```

### Frontend Variables (Vercel)
```
VITE_API_URL=https://instagram-backend.render.com/api/v1
VITE_SOCKET_URL=https://instagram-backend.render.com
VITE_ENV=production
```

---

## Database Connection Strings Explained

**PostgreSQL from Render:**
```
postgresql://postgres:mypassword@dpg-abc123.render.com:5432/instagram_clone
                      ↑                        ↑                      ↑
                   password                  host                   database
```

Extract:
- `DB_HOST`: `dpg-abc123.render.com`
- `DB_PASSWORD`: `mypassword`
- `DB_PORT`: `5432`
- `DB_NAME`: `instagram_clone`

**Redis from Render:**
```
redis://default:mypassword@grp-abc123.render.com:12345
                ↑                    ↑                ↑
             password               host             port
```

Extract:
- `REDIS_HOST`: `grp-abc123.render.com`
- `REDIS_PASSWORD`: `mypassword`
- `REDIS_PORT`: `12345`

---

## Quick Deployment Checklist

- [ ] Create GitHub account and push code
- [ ] Create Render account
- [ ] Create PostgreSQL database
- [ ] Create Redis instance
- [ ] Deploy backend service
- [ ] Note backend URL
- [ ] Add environment variables to backend
- [ ] Wait for backend to deploy (5-10 min)
- [ ] Run migrations via Shell
- [ ] Create Vercel account
- [ ] Deploy frontend from GitHub
- [ ] Add VITE_API_URL environment variable
- [ ] Wait for frontend to deploy (2-5 min)
- [ ] Test signup, post, like, follow
- [ ] Share URL with friends!

---

## Support Resources

**If something doesn't work:**

1. **Check logs**:
   - Render: Click service → "Logs" tab
   - Vercel: Click deployment → "Logs" tab

2. **Common errors**:
   - "Connection refused" → Backend not running
   - "404 Not Found" → Wrong API URL
   - "No Such File" → Wrong build command

3. **Get help**:
   - Render docs: https://render.com/docs
   - Vercel docs: https://vercel.com/docs
   - GitHub issues in your repo

---

## Next Steps (Optional)

Once deployed and working:

### Add Custom Features (Phase 2)
- WebSocket real-time updates
- Direct messaging
- Stories (24h expiry)
- Search functionality
- Explore/trending page

### Optimize Performance
- Add image optimization
- Enable caching headers
- Use Cloudinary for image storage

### Scale to Paid Plans
- Move to paid Render/Railway/DigitalOcean
- Add monitoring and alerts
- Enable auto-scaling

---

## Summary

✅ **Deployed for FREE**
✅ **In ~30 minutes**
✅ **Using Render + Vercel**
✅ **No credit card needed**
✅ **Always-free tier included**

**Your app is now LIVE on the internet! 🎉**

Share your deployed URL:
```
Frontend: https://your-vercel-project.vercel.app
API Docs: https://instagram-backend.render.com/api-docs
```

Enjoy your Instagram clone!
