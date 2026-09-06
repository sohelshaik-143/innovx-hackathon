# Deployment Guide for CampusClear

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with your repository
- Vercel account (connect to GitHub)

### Steps to Deploy

#### 1. **Push Changes to GitHub**
```bash
git add .
git commit -m "Add Vercel routing configuration"
git push origin main
```

#### 2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Vercel will auto-detect Vite configuration

#### 3. **Configure Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL = https://your-backend-url.com
```

**Important:** Update this with your actual backend URL after deploying the backend.

#### 4. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Your site will be live at a URL like: `https://yourproject.vercel.app`

### Troubleshooting

#### Issue: Routes return 404
- **Solution**: Ensure `vercel.json` is in root directory with proper rewrites
- Check build output shows `frontend/dist` as output directory

#### Issue: API calls fail
- **Solution**: Set `VITE_API_URL` environment variable to your backend URL
- Backend must be deployed and accessible from browser

#### Issue: Static assets not loading
- **Solution**: Vite should handle this automatically
- If issues persist, check `vite.config.ts` has `build.outDir: 'dist'`

---

## Backend Deployment

### Option 1: Heroku (Recommended for free tier)

```bash
# Install Heroku CLI
# Create app
heroku create your-app-name

# Set Java version
echo "java.runtime.version=21" > system.properties

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Azure App Service

```bash
# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service Plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux

# Create app
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name my-app-name --runtime "JAVA|21-java21"

# Deploy
git push azure main
```

---

## Environment Configuration

### Frontend (.env.production in Vercel)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Environment Variables)
```
SPRING_DATASOURCE_URL=jdbc:mysql://db-host:3306/nodues_db
SPRING_DATASOURCE_USERNAME=db_user
SPRING_DATASOURCE_PASSWORD=db_password
JWT_SECRET=your-jwt-secret-key
SPRING_PROFILES_ACTIVE=prod
```

---

## Quick Deployment Checklist

- [ ] `vercel.json` file is in project root
- [ ] `frontend/vite.config.ts` has build configuration
- [ ] `.vercelignore` excludes backend and unnecessary files
- [ ] Backend is deployed and accessible
- [ ] Environment variable `VITE_API_URL` is set in Vercel
- [ ] Git repository is up to date and pushed to main branch
- [ ] Test login flow after deployment

---

## Testing Deployment

After deploying, test these flows:

1. **Home Page**: https://yourapp.vercel.app
2. **Login**: https://yourapp.vercel.app/login
3. **Registration**: https://yourapp.vercel.app/register
4. **Certificate Verification**: https://yourapp.vercel.app/verify-certificate
5. **Quick Switcher**: Test 1-click demo access buttons

---

## Current Deployment Status

**Frontend**: ✅ Ready for Vercel deployment
**Backend**: ⚠️ Needs to be deployed separately

Deploy backend first, then update frontend `VITE_API_URL` with backend URL.
