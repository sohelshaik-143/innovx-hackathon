# CORS Configuration Fix for Registration 404 Error

## Problem
The registration endpoint was failing with a **Request failed with status code 404** error when accessing the application from `rkvalley.vercel.app`. This was caused by CORS (Cross-Origin Resource Sharing) policy blocking requests from the Vercel-deployed frontend to the backend API.

## Root Cause
The backend's CORS configuration in `application.yml` only allowed requests from localhost URLs:
```yaml
app:
  cors:
    allowed-origins: "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
```

When the frontend was deployed to `https://rkvalley.vercel.app`, the browser's CORS policy rejected the API request before it even reached the server, resulting in a 404-like error.

## Solution
Updated the CORS configuration to include the Vercel deployment domain:

**File**: `backend/src/main/resources/application.yml`
```yaml
app:
  cors:
    allowed-origins: "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://rkvalley.vercel.app"
```

## Changes Made
1. ✅ Added `https://rkvalley.vercel.app` to the CORS allowed origins
2. ✅ Rebuilt the backend JAR with the updated configuration
3. ✅ Pushed changes to GitHub for deployment

## Testing
After the backend is deployed, the following should now work:

**REST API Requests** from `https://rkvalley.vercel.app`:
- `POST /api/auth/register` - User registration ✅
- `POST /api/auth/login` - User login ✅
- `GET /api/auth/me` - Profile fetch ✅
- All other API endpoints ✅

## Deployment Steps

### If deploying backend to Heroku:
1. Rebuild the backend: `mvn clean package`
2. Deploy using Heroku CLI or GitHub integration
3. Backend will automatically use updated CORS configuration

### If deploying to Azure App Service:
1. Build Docker image with latest code
2. Push to Azure Container Registry
3. Deploy updated image to App Service
4. Monitor deployment logs for startup messages

### If deploying to AWS:
1. Build JAR file: `mvn clean package`
2. Deploy to Elastic Beanstalk or EC2
3. Ensure application is running on port 8080

## Important Notes
- ⚠️ The backend API **must be deployed and running** for the registration to work
- ⚠️ The backend URL must be configured in the frontend via `VITE_API_URL` environment variable
- ⚠️ Ensure the backend domain is accessible from the Vercel frontend (check firewall rules)

## Environment Variables Configuration

### Frontend (Vercel Dashboard)
- **Variable**: `VITE_API_URL`
- **Value**: `https://your-backend-domain.com` (or the actual backend URL where it's deployed)
- **Example**: `https://innovx-backend-prod.herokuapp.com`

### Backend (application.yml)
- **Variable**: `app.cors.allowed-origins`
- **Value**: Add your frontend domain here
- **Current**: Includes `https://rkvalley.vercel.app`

## Verification Checklist
- [ ] Backend built successfully with new CORS config
- [ ] New JAR file deployed to the production server
- [ ] Backend service is running and accessible
- [ ] Frontend environment variable `VITE_API_URL` is configured
- [ ] Test registration by submitting a form on `https://rkvalley.vercel.app/register`
- [ ] Check browser DevTools → Network tab for successful 200/201 response from `/api/auth/register`
- [ ] User should be redirected to login page after successful registration

## Troubleshooting

### Still getting 404 errors?
1. Check backend is running: `curl https://backend-url/api/auth/login`
2. Verify CORS origins in backend logs (search for "registered CORS")
3. Check browser console for specific CORS error messages
4. Ensure frontend is using correct API URL in `VITE_API_URL`

### Backend not responding?
1. Verify backend deployment completed successfully
2. Check application logs for startup messages
3. Ensure port 8080 is open and the process is running
4. Test with: `curl http://localhost:8080/api/auth/login` from backend server

### Validation failed errors?
1. Check request body format matches `RegisterRequest` DTO
2. Verify email/username aren't already registered
3. Check password meets requirements (if any)
4. Review backend application logs for detailed error message

## Related Files
- `backend/src/main/resources/application.yml` - CORS and JWT configuration
- `backend/src/main/java/com/innovx/nodues/security/SecurityConfig.java` - Spring Security setup
- `frontend/src/api/client.ts` - API client with auth interceptor
- `.env.example` - Environment variable template

## Commit History
- Commit: `4908cea` - Fix: Add Vercel domain to CORS allowed origins for API access
