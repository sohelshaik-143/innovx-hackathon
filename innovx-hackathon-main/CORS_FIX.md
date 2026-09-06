# Registration/API Deployment Fix

The previous documentation incorrectly described the registration 404 as a CORS-only problem. CORS does not create a server-side 404. The deployment had two separate concerns:

- Vercel served the React SPA, but the Spring Boot API is deployed separately.
- The frontend used a relative `/api` fallback when `VITE_API_URL` was not configured.
- The Vercel catch-all rewrite could also consume `/api/*` requests instead of leaving them for an API service.

## Correct architecture

```text
Browser
  |
  +--> https://rkvalley.vercel.app       React/Vite SPA
  |
  +--> https://YOUR-BACKEND.example/api  Spring Boot API
                                           |
                                           +--> PostgreSQL
```

## Frontend

Set the Vercel Production environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND.example
```

The Axios client automatically appends `/api` when needed.

## Backend

Set:

```text
APP_CORS_ALLOWED_ORIGINS=https://rkvalley.vercel.app
SPRING_PROFILES_ACTIVE=prod
APP_JWT_SECRET=<strong-random-secret>
```

If multiple trusted frontend origins are required, provide them as a comma-separated list.

## Verification

1. Open the deployed frontend.
2. Open browser DevTools → Network.
3. Submit registration.
4. Confirm the request URL is `https://YOUR-BACKEND.example/api/auth/register`.
5. Confirm the response is a JSON success/error response from Spring Boot, not the Vercel `index.html` document.
