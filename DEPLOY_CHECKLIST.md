# Deployment Checklist - Follow This Step by Step

## Pre-Deployment (Do once)

- [ ] **Create GitHub account** → https://github.com
- [ ] **Create Render account** → https://render.com (sign up with GitHub)
- [ ] **Create Vercel account** → https://vercel.com (sign up with GitHub)

---

## Step 1: Push Code to GitHub (5 minutes)

```bash
cd instagram-clone
git remote add origin https://github.com/YOUR_USERNAME/instagram-clone.git
git branch -M main
git push -u origin main
```

**Checklist:**
- [ ] Replaced `YOUR_USERNAME` with actual GitHub username
- [ ] No errors during push
- [ ] Code is now on GitHub (verify at github.com)

---

## Step 2: Create PostgreSQL Database on Render (5 minutes)

**On Render.com dashboard:**

1. [ ] Click "New +" → "PostgreSQL"
2. [ ] Fill in:
   - [ ] Name: `instagram-postgres`
   - [ ] Database: `instagram_clone`
   - [ ] Username: `postgres`
3. [ ] Click "Create Database"
4. [ ] **WAIT** for database to be created (green status)
5. [ ] Click on database
6. [ ] Copy connection string:
   ```
   postgresql://postgres:PASSWORD@HOST:5432/instagram_clone
   ```
7. [ ] **SAVE** connection string somewhere safe

**Extract from connection string:**
- [ ] Extract PASSWORD → save as `DB_PASSWORD`
- [ ] Extract HOST → save as `DB_HOST`
- [ ] Example: `postgresql://postgres:abc123@dpg-xyz.render.com:5432/instagram_clone`
  - PASSWORD = `abc123`
  - HOST = `dpg-xyz.render.com`

---

## Step 3: Create Redis Cache on Render (5 minutes)

**On Render.com dashboard:**

1. [ ] Click "New +" → "Redis"
2. [ ] Fill in:
   - [ ] Name: `instagram-redis`
   - [ ] Region: (closest to you)
3. [ ] Click "Create Redis"
4. [ ] **WAIT** for Redis to be created (green status)
5. [ ] Click on Redis instance
6. [ ] Copy internal URL:
   ```
   redis://default:PASSWORD@HOST:PORT
   ```
7. [ ] **SAVE** this URL

**Extract from Redis URL:**
- [ ] Extract PASSWORD → save as `REDIS_PASSWORD`
- [ ] Extract HOST → save as `REDIS_HOST`
- [ ] Extract PORT → save as `REDIS_PORT`
- [ ] Example: `redis://default:xyz789@grp-abc.render.com:6379`
  - PASSWORD = `xyz789`
  - HOST = `grp-abc.render.com`
  - PORT = `6379`

---

## Step 4: Deploy Backend to Render (15 minutes)

**On Render.com dashboard:**

1. [ ] Click "New +" → "Web Service"
2. [ ] Select your `instagram-clone` repository
3. [ ] Configure:
   - [ ] **Name**: `instagram-backend`
   - [ ] **Environment**: Node
   - [ ] **Region**: (same as database)
   - [ ] **Build Command**: `cd backend && npm install && npm run build`
   - [ ] **Start Command**: `cd backend && npm start`

4. [ ] Scroll down to "Environment"
5. [ ] Add all these variables (click "Add Environment Variable" for each):

| Key | Value | Source |
|-----|-------|--------|
| `NODE_ENV` | `production` | Type this |
| `PORT` | `5000` | Type this |
| `DB_HOST` | (your DB_HOST) | From Step 2 |
| `DB_PORT` | `5432` | Type this |
| `DB_USERNAME` | `postgres` | Type this |
| `DB_PASSWORD` | (your DB_PASSWORD) | From Step 2 |
| `DB_NAME` | `instagram_clone` | Type this |
| `REDIS_HOST` | (your REDIS_HOST) | From Step 3 |
| `REDIS_PORT` | (your REDIS_PORT) | From Step 3 |
| `REDIS_PASSWORD` | (your REDIS_PASSWORD) | From Step 3 |
| `JWT_ACCESS_SECRET` | `my_super_secret_key_123` | Type any string |
| `JWT_REFRESH_SECRET` | `my_super_secret_refresh_123` | Type any string |
| `FRONTEND_URL` | `https://instagram-clone-YOURNAME.vercel.app` | Will update later |

6. [ ] Click "Create Web Service"
7. [ ] **WAIT** - Service is deploying (watch logs)
   - [ ] Should take 5-10 minutes
   - [ ] Look for "Build successful" message
   - [ ] Service status turns green
8. [ ] Copy the service URL (e.g., `https://instagram-backend.render.com`)
9. [ ] **SAVE** this URL

---

## Step 5: Run Database Migrations (2 minutes)

**On Render (your backend service):**

1. [ ] Click on `instagram-backend` service
2. [ ] Click "Shell" tab at top
3. [ ] Paste this command:
   ```bash
   npm run migration:run
   ```
4. [ ] Press Enter
5. [ ] **WAIT** for completion
6. [ ] Look for message: "Migrations executed successfully"
7. [ ] Note any errors (screenshot if needed)

**If error occurs:**
- [ ] Check database connection
- [ ] Verify DB_PASSWORD has no special characters
- [ ] Restart service and try again

- [ ] Migrations completed successfully

---

## Step 6: Update Frontend URL on Backend (1 minute)

**On Render (your backend service):**

1. [ ] Click "Environment"
2. [ ] Find `FRONTEND_URL`
3. [ ] Update to your actual Vercel URL (will get after Step 8)
4. [ ] For now, you can use placeholder or come back to this
5. [ ] Click "Save"

---

## Step 7: Deploy Frontend to Vercel (10 minutes)

**On Vercel.com:**

1. [ ] Click "Add New" → "Project"
2. [ ] Select your `instagram-clone` repository
3. [ ] Click "Import"
4. [ ] Configure:
   - [ ] **Project Name**: `instagram-clone` (or any name)
   - [ ] **Framework Preset**: Vite
   - [ ] **Root Directory**: `frontend`
   - [ ] **Build Command**: `npm run build`
   - [ ] **Output Directory**: `dist`

5. [ ] Add Environment Variables (click "Add" for each):

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://instagram-backend.render.com/api/v1` |
| `VITE_SOCKET_URL` | `https://instagram-backend.render.com` |
| `VITE_ENV` | `production` |

6. [ ] Click "Deploy"
7. [ ] **WAIT** - Frontend is deploying (2-5 minutes)
8. [ ] When done, click "Visit" to see your live app
9. [ ] Copy the URL (e.g., `https://instagram-clone-abc123.vercel.app`)
10. [ ] **SAVE** this URL

---

## Step 8: Update Backend with Frontend URL (1 minute)

**Back on Render (your backend service):**

1. [ ] Click "Environment"
2. [ ] Find `FRONTEND_URL`
3. [ ] Update value to: `https://instagram-clone-abc123.vercel.app` (your Vercel URL)
4. [ ] Click "Save"
5. [ ] Service auto-redeploys with new settings
6. [ ] **WAIT** for green status

---

## Step 9: Test Your Deployment (5 minutes)

**Open your frontend URL in browser:**

1. [ ] Frontend loads without errors
2. [ ] Click "Sign Up"
3. [ ] Fill in form:
   - [ ] Email: `test@example.com`
   - [ ] Password: `TestPass123!`
   - [ ] Username: `testuser123`
   - [ ] Full Name: `Test User`
4. [ ] Click "Sign Up"
5. [ ] If email verification prompt appears:
   - [ ] Check backend logs for OTP
   - [ ] Or use `000000` for testing
6. [ ] Successfully logged in
7. [ ] Navigate to home page
8. [ ] Test features:
   - [ ] Create post (if image upload ready)
   - [ ] View feed
   - [ ] Search for users
   - [ ] Follow a user

**Success checklist:**
- [ ] Signup works
- [ ] Login works
- [ ] Basic features work
- [ ] No major errors in console

---

## Step 10: Optional - Keep Services Awake (2 minutes)

Free Render services sleep after 15 min inactivity. To keep them alive:

1. [ ] Go to https://uptimerobot.com
2. [ ] Click "Sign Up" (free)
3. [ ] Click "Add New Monitor"
4. [ ] Fill in:
   - [ ] **Monitor Type**: HTTP(s)
   - [ ] **URL**: `https://instagram-backend.render.com/health`
   - [ ] **Friendly Name**: Instagram Backend
   - [ ] **Check Interval**: 5 minutes
5. [ ] Click "Create Monitor"
6. [ ] Done! Service is monitored and kept awake

---

## 🎉 You're Done!

**Your URLs:**

```
Frontend:  https://instagram-clone-YOURNAME.vercel.app
Backend:   https://instagram-backend.render.com
API Docs:  https://instagram-backend.render.com/api-docs
Health:    https://instagram-backend.render.com/health
```

**Share with friends:**
```
https://instagram-clone-YOURNAME.vercel.app
```

---

## 📋 Summary

| Step | Time | Status |
|------|------|--------|
| 1. GitHub | 5 min | ✅ |
| 2. PostgreSQL | 5 min | ✅ |
| 3. Redis | 5 min | ✅ |
| 4. Backend | 15 min | ✅ |
| 5. Migrations | 2 min | ✅ |
| 6. Update URL | 1 min | ✅ |
| 7. Frontend | 10 min | ✅ |
| 8. Update URL | 1 min | ✅ |
| 9. Testing | 5 min | ✅ |
| 10. UptimeRobot | 2 min | ✅ |
| **TOTAL** | **~45 min** | **✅ DONE** |

---

## ❌ Troubleshooting

**Problem: Backend deployment fails**
- Check logs (Render → Service → Logs)
- Check environment variables (typos?)
- Try restarting service

**Problem: Migrations fail**
- Run in Shell: `npm run migration:run`
- Check database connection string
- Verify DB_PASSWORD doesn't have special chars

**Problem: Frontend can't connect to API**
- Check VITE_API_URL in Vercel
- Make sure backend service is running
- Try: `https://instagram-backend.render.com/health`

**Problem: Services keep sleeping**
- Set up UptimeRobot (Step 10)
- Or upgrade to paid plan

---

## ✅ Final Checklist Before Sharing

- [ ] All steps completed
- [ ] Frontend loads
- [ ] Signup works
- [ ] Backend running (green status)
- [ ] Database migrations successful
- [ ] No major errors

**Ready to share your app! 🚀**
