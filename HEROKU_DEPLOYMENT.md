# Heroku Backend Deployment Guide

This guide walks you through deploying the Spring Boot backend to Heroku.

## Prerequisites

1. **Heroku Account** - Sign up at https://www.heroku.com
2. **Heroku CLI** - Download from https://devcenter.heroku.com/articles/heroku-cli
3. **Git** - Already installed ✅
4. **Backend JAR built** - `backend/target/automated-nodues-backend-1.0.0-SNAPSHOT.jar` ✅

## Step 1: Install Heroku CLI

### On Windows:
Download and run the installer: https://cli-assets.heroku.com/branches/stable/heroku-x64.exe

Or via Chocolatey:
```bash
choco install heroku-cli
```

After installation, verify:
```bash
heroku --version
```

## Step 2: Login to Heroku

```bash
heroku login
```

This will open a browser window to authenticate. Click "Log in" and you'll be authenticated in your terminal.

## Step 3: Create a New Heroku App

```bash
heroku create your-app-name-here
```

Replace `your-app-name-here` with your desired app name (must be unique across Heroku).

**Example:**
```bash
heroku create innovx-api-prod
```

This will:
- Create a new app on Heroku
- Add a git remote named `heroku`
- Give you a URL like: `https://innovx-api-prod.herokuapp.com`

## Step 4: Set Environment Variables

Set the same environment variables your app needs:

```bash
heroku config:set DB_HOST=your-database-host
heroku config:set DB_PORT=5432
heroku config:set DB_NAME=nodues_db
heroku config:set DB_USER=postgres
heroku config:set DB_PASSWORD=your-password
heroku config:set APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://rkvalley.vercel.app
```

**Or view/edit via Heroku Dashboard:**
1. Go to: https://dashboard.heroku.com/apps
2. Select your app
3. Click `Settings` → `Config Vars`
4. Add variables one by one

## Step 5: Deploy to Heroku

```bash
cd c:\Users\Lenovo\Downloads\startups\innovx
git push heroku main
```

Heroku will:
1. Receive the push
2. Build the JAR file
3. Run the Procfile (`java -jar ...`)
4. Start your application
5. Assign a public URL

**Build output example:**
```
Compiling 91 source files...
Building jar...
Pushing to Heroku...
Launching app...
Released v1 to https://innovx-api-prod.herokuapp.com
```

## Step 6: Verify Deployment

Check if the app is running:

```bash
heroku logs --tail
```

You should see:
```
2026-09-06T14:50:00 app[web.1]: Application started in X.XXX seconds
```

Test the API:
```bash
curl https://your-app-name.herokuapp.com/api/auth/login
```

Should return a 405 Method Not Allowed (since GET is not supported), which means the app is running ✅

## Step 7: Update Frontend with Backend URL

Now that your backend is deployed:

1. Go to **Vercel Dashboard**: https://vercel.com/shaikimambasha968-7849s-projects/rkvalley
2. Click `Settings` → `Environment Variables`
3. Update `API_URL`:
   - **Key**: `API_URL`
   - **Value**: `https://your-app-name.herokuapp.com`
   - **Example**: `https://innovx-api-prod.herokuapp.com`
4. Click `Save`
5. Go to `Deployments` → `Redeploy` → `Redeploy to Production`

## Step 8: Test End-to-End

1. Visit: https://rkvalley.vercel.app/register
2. Fill in registration form
3. Submit
4. Should see success message or redirect to login

If you see errors:
- Check browser DevTools → Network tab
- Look for the API request to `/api/auth/register`
- Status should be 200-201, not 404/500

## Troubleshooting

### App crashes on startup?
```bash
heroku logs --tail
```
Look for error messages and fix them.

### Database connection fails?
Verify `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` are correct.

### CORS error in browser?
1. Verify `APP_CORS_ALLOWED_ORIGINS` includes `https://rkvalley.vercel.app`
2. Restart the app:
   ```bash
   heroku restart
   ```

### Need to view app files?
```bash
heroku run bash
```
This opens a shell in your dyno.

### Check running dyno status?
```bash
heroku ps
```

Should show:
```
Free dyno hours quota remaining this month: 550h 0m (91%)
web.1: up 2016/08/17 08:14:28 +0000 (~ 10s ago)
```

## Useful Commands

| Command | Purpose |
|---------|---------|
| `heroku create app-name` | Create new app |
| `heroku logs` | View application logs |
| `heroku logs --tail` | Stream logs in real-time |
| `heroku config` | View all environment variables |
| `heroku config:set KEY=value` | Add/update environment variable |
| `heroku restart` | Restart the application |
| `heroku ps` | Check dyno status |
| `git push heroku main` | Deploy latest code |
| `heroku open` | Open app in browser |
| `heroku delete --confirm app-name` | Delete an app |

## Database Setup (if using PostgreSQL)

If you need a database on Heroku:

1. Provision Heroku Postgres:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. This automatically sets:
   - `DATABASE_URL` environment variable
   - PostgreSQL database credentials

3. Your app can use this or your own database.

## Next Steps

✅ Backend deployed on Heroku  
✅ Frontend deployed on Vercel  
✅ Connected via API_URL environment variable  

Now test the full flow:
1. Register a new user
2. Login with the registered credentials
3. Access dashboard and features

## Support

- **Heroku Docs**: https://devcenter.heroku.com
- **Spring Boot on Heroku**: https://devcenter.heroku.com/articles/deploying-spring-boot-apps-to-heroku
- **Java on Heroku**: https://devcenter.heroku.com/articles/java-support

## Git Remote Info

After creating a Heroku app, you'll have:

```bash
# View all git remotes
git remote -v

# Output:
origin    https://github.com/sohelshaik-143/innovx-hackathon.git (fetch)
origin    https://github.com/sohelshaik-143/innovx-hackathon.git (push)
heroku    https://git.heroku.com/your-app-name.git (fetch)
heroku    https://git.heroku.com/your-app-name.git (push)
```

### Deploy to GitHub: `git push origin main`
### Deploy to Heroku: `git push heroku main`

---

**Last Updated**: 2026-09-06
