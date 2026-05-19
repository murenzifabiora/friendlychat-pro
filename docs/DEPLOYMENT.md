# Deployment Guide

This app deploys in two parts:
- **Backend + Database** → Render (free tier) + MongoDB Atlas (free tier)
- **Frontend** → Vercel (free tier)

---

## Step 1 — MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Click **"Build a Database"** → choose **M0 Free** → pick any region → click **Create**
3. Create a database user:
   - Username: `voicechat`
   - Password: generate a strong one and **save it**
4. Under **Network Access** → click **"Add IP Address"** → choose **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Go to **Database** → click **Connect** → **Drivers** → copy the connection string

   It looks like:
   ```
   mongodb+srv://voicechat:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password and add the DB name:
   ```
   mongodb+srv://voicechat:yourpassword@cluster0.xxxxx.mongodb.net/voicechat?retryWrites=true&w=majority
   ```
   **Save this string — you'll need it in Step 2.**

---

## Step 2 — Backend on Render

1. Push your code to GitHub (see Step 0 below if you haven't)
2. Go to [https://render.com](https://render.com) and sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo → select it
5. Configure:
   - **Name:** `voicechat-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Add **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas connection string from Step 1 |
   | `JWT_SECRET` | any long random string (e.g. `openssl rand -hex 32`) |
   | `CLIENT_URL` | `https://your-app.vercel.app` ← fill in after Step 3 |
   | `JWT_EXPIRE` | `7d` |
   | `MAX_FILE_SIZE` | `52428800` |

7. Click **"Create Web Service"**
8. Wait for the build to finish (~2-3 min). Copy your backend URL:
   ```
   https://voicechat-backend.onrender.com
   ```

> ⚠️ Free Render services spin down after 15 min of inactivity. First request after sleep takes ~30s.

---

## Step 3 — Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"** → import your GitHub repo
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://voicechat-backend.onrender.com/api` |
   | `REACT_APP_WS_URL` | `https://voicechat-backend.onrender.com` |

5. Click **"Deploy"**
6. Copy your frontend URL:
   ```
   https://voicechat-frontend.vercel.app
   ```

---

## Step 4 — Connect Frontend ↔ Backend

1. Go back to **Render** → your backend service → **Environment**
2. Update `CLIENT_URL` to your actual Vercel URL:
   ```
   https://voicechat-frontend.vercel.app
   ```
3. Click **"Save Changes"** — Render will redeploy automatically

---

## Step 0 — Push to GitHub (if not done yet)

```bash
# In the E-learning root folder
git init
git add .
git commit -m "Initial commit"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Verify Everything Works

1. Open your Vercel URL in the browser
2. Register a new account
3. Share the Vercel URL with a friend — they register too
4. Start chatting!

---

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
CLIENT_URL=https://your-app.vercel.app
MAX_FILE_SIZE=52428800
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_WS_URL=https://your-backend.onrender.com
```
