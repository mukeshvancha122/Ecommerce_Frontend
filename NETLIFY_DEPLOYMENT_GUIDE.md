# Netlify Deployment Guide

This guide will walk you through deploying your Ecommerce Frontend application to Netlify.

## Prerequisites

- ✅ Build completed successfully (`npm run build`)
- ✅ Netlify account (free tier works)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## Method 1: Deploy via Netlify Dashboard (Recommended for First Time)

### Step 1: Prepare Your Repository

1. **Commit your changes** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Verify `netlify.toml` exists** in the root directory:
   - ✅ Should be at `/Users/mukeshreddy/Developer/Ecommerce_Frontend/netlify.toml`
   - ✅ Contains build configuration and redirects

### Step 2: Connect to Netlify

1. **Go to [Netlify](https://www.netlify.com/)**
   - Sign up or log in

2. **Click "Add new site" → "Import an existing project"**

3. **Connect to Git provider**:
   - Choose GitHub, GitLab, or Bitbucket
   - Authorize Netlify to access your repositories

4. **Select your repository**:
   - Find `Ecommerce_Frontend` repository
   - Click on it

### Step 3: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Node version**: `18` (or latest LTS)

**If auto-detection doesn't work, manually set:**
- Base directory: (leave empty)
- Build command: `NODE_OPTIONS=--openssl-legacy-provider npm run build`
- Publish directory: `build`

### Step 4: Set Environment Variables (Important!)

Click "Show advanced" → "New variable" and add:

```
NODE_VERSION = 18
NODE_OPTIONS = --openssl-legacy-provider
CI = false
REACT_APP_API_BASE_URL = http://54.145.239.205:8000/api
```

**Note**: `CI = false` prevents ESLint warnings from failing the build. This is already configured in `netlify.toml`, but you can also set it manually.

**Optional Environment Variables** (if needed):
```
REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_test_xxx
REACT_APP_PAYPAL_CLIENT_ID = sb_xxx
REACT_APP_CHATBOT_API_URL = http://54.145.239.205:5005/webhooks/rest/webhook/
```

### Step 5: Deploy

1. **Click "Deploy site"**
2. **Wait for build to complete** (usually 2-5 minutes)
3. **Your site will be live** at `https://random-name-123.netlify.app`

### Step 6: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

---

## Method 2: Deploy via Netlify CLI (For Developers)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```
This will open your browser to authenticate.

### Step 3: Initialize Netlify Site

```bash
cd /Users/mukeshreddy/Developer/Ecommerce_Frontend
netlify init
```

Follow the prompts:
- **Create & configure a new site** (or link to existing)
- **Team**: Select your team
- **Site name**: Enter a name (or leave blank for auto-generated)
- **Build command**: `npm run build` (or press Enter to use default)
- **Directory to deploy**: `build` (or press Enter to use default)

### Step 4: Set Environment Variables

```bash
netlify env:set NODE_VERSION 18
netlify env:set NODE_OPTIONS --openssl-legacy-provider
netlify env:set CI false
netlify env:set REACT_APP_API_BASE_URL http://54.145.239.205:8000/api
```

**Note**: `CI = false` prevents ESLint warnings from failing the build.

### Step 5: Deploy

**For production deployment:**
```bash
npm run build
netlify deploy --prod
```

**For preview deployment (testing):**
```bash
npm run build
netlify deploy
```

---

## Method 3: Drag & Drop Deployment (Quick Test)

### Step 1: Build Locally

```bash
cd /Users/mukeshreddy/Developer/Ecommerce_Frontend
npm run build
```

### Step 2: Deploy

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `build` folder
3. Your site will be live in seconds!

**Note**: This method doesn't support automatic deployments. Use Method 1 or 2 for continuous deployment.

---

## Post-Deployment Configuration

### 1. Verify SPA Routing Works

Test these routes to ensure React Router works:
- `https://your-site.netlify.app/`
- `https://your-site.netlify.app/products`
- `https://your-site.netlify.app/product/black-shirt`
- `https://your-site.netlify.app/login`

All routes should load correctly (not show 404).

### 2. Check API Connectivity

1. Open browser console
2. Navigate to your site
3. Check for API errors
4. Verify API calls are going to: `http://54.145.239.205:8000/api`

### 3. Test Authentication Flow

1. Try logging in
2. Verify token is stored in localStorage
3. Test protected routes (`/orders`, `/account`)

---

## Troubleshooting

### Issue: Build Fails with OpenSSL Error

**Solution**: Ensure `NODE_OPTIONS=--openssl-legacy-provider` is set in:
- `package.json` build script ✅ (already done)
- Netlify environment variables ✅ (add it)

### Issue: Build Fails with "Treating warnings as errors because process.env.CI = true"

**Solution**: This is already fixed! The `netlify.toml` file includes `CI = false` in the build environment. If you still see this error:
- Verify `CI = false` is in `netlify.toml` under `[build.environment]`
- Or manually add `CI = false` as an environment variable in Netlify dashboard
- The `package.json` build script also includes `CI=false` as a fallback

### Issue: 404 Errors on Routes

**Solution**: Verify `netlify.toml` has the redirect rule:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: API Calls Fail (CORS)

**Solution**: 
- The backend at `http://54.145.239.205:8000` needs to allow your Netlify domain
- Add your Netlify URL to backend CORS settings:
  ```
  ALLOWED_ORIGINS = [
    'https://your-site.netlify.app',
    'https://*.netlify.app'
  ]
  ```

### Issue: Environment Variables Not Working

**Solution**:
- Environment variables must start with `REACT_APP_` to be available in the build
- Rebuild after adding environment variables
- Check Netlify build logs to verify variables are set

### Issue: Build Takes Too Long

**Solution**:
- Enable build caching in Netlify
- Use `NODE_VERSION = 18` in environment variables
- Consider upgrading to `react-scripts` 5.x (requires testing)

---

## Continuous Deployment Setup

Once connected to Git:

1. **Automatic deployments** happen on every push to `main` branch
2. **Deploy previews** are created for pull requests
3. **Branch deploys** can be configured for other branches

### Configure Branch Deploys:

1. Go to **Site settings** → **Build & deploy** → **Branch deploys**
2. Enable branch deploys for specific branches (e.g., `develop`, `staging`)

---

## Performance Optimization

### 1. Enable Build Plugins

In Netlify dashboard:
- Go to **Plugins**
- Search for "Bundle Analyzer" or "Image Optimization"
- Install recommended plugins

### 2. Configure Headers

Already configured in `netlify.toml`:
- Cache static assets for 1 year
- Security headers (X-Frame-Options, etc.)

### 3. Enable CDN

Netlify automatically uses a global CDN. No additional configuration needed.

---

## Monitoring & Analytics

### Enable Netlify Analytics:

1. Go to **Site settings** → **Analytics**
2. Enable **Netlify Analytics** (paid feature) or use **Google Analytics**

### Add Google Analytics:

1. Get your GA tracking ID
2. Add to `public/index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   ```

---

## Security Checklist

- ✅ HTTPS enabled (automatic on Netlify)
- ✅ Security headers configured (in `netlify.toml`)
- ✅ Environment variables secured (not exposed in client code)
- ✅ API keys stored in environment variables (not hardcoded)

---

## Quick Reference

### Build Command:
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

### Publish Directory:
```
build
```

### Required Environment Variables:
```
NODE_VERSION=18
NODE_OPTIONS=--openssl-legacy-provider
CI=false
REACT_APP_API_BASE_URL=http://54.145.239.205:8000/api
```

### Netlify Site URL Format:
```
https://your-site-name.netlify.app
```

---

## Next Steps

1. ✅ Deploy to Netlify
2. ✅ Test all routes and features
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring/analytics
5. ✅ Enable continuous deployment
6. ✅ Configure backend CORS for your Netlify domain

---

## Support

- **Netlify Docs**: https://docs.netlify.com/
- **Netlify Status**: https://www.netlifystatus.com/
- **Community Forum**: https://answers.netlify.com/

---

**Your application is now ready for deployment! 🚀**

