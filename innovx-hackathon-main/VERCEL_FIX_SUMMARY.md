# Production Deployment & Registration Fix

## Root causes fixed

1. **Vercel SPA rewrite was catching API requests.** The previous catch-all rewrite sent every request, including `/api/*`, to `index.html`.
2. **The frontend silently fell back to `/api` in production.** That only works when a reverse proxy exists (local Vite proxy or Docker/Nginx). Vercel does not proxy the Spring Boot service automatically.
3. **Production and development configuration were mixed.** `application.yml` selected the `dev` profile by default and contained a committed JWT secret.
4. **Public registration accepted privileged roles.** A client could request `STAFF`, `HEAD`, or `ADMIN` during self-registration.
5. **Registration generated institutional IDs when they were omitted.** Production registration now requires the supplied institutional student ID and roll number instead of inventing identifiers.
6. **Authenticated `/me` was included in the public `/api/auth/**` rule.** It is now protected.
7. **Development-only H2 console/frame settings were exposed in the main security configuration.** They are removed from production security rules.
8. **Unexpected backend exception messages could be returned to clients.** Generic messages are now returned while details stay in server logs.
9. **Demo credentials were always shipped/displayed by the production frontend.** Demo UI is now opt-in with `VITE_DEMO_MODE=true`.

## Vercel configuration

Set this Vercel environment variable for Production:

```text
VITE_API_URL=https://YOUR-DEPLOYED-SPRING-BOOT-BACKEND
```

The frontend normalizes the value and uses `/api` automatically. For example, both of these are accepted:

```text
https://api.example.com
https://api.example.com/api
```

The Spring Boot backend must be deployed separately and must be reachable over HTTPS.

## Backend production variables

```text
SPRING_PROFILES_ACTIVE=prod
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<strong-database-password>
APP_JWT_SECRET=<strong-random-secret-at-least-32-bytes>
APP_CORS_ALLOWED_ORIGINS=https://rkvalley.vercel.app
```

Do not commit actual secret values.

## Demo environment

For a controlled hackathon/demo deployment only, set:

```text
VITE_DEMO_MODE=true
```

and use the `dev` profile/data initializer only in an isolated environment. Production should keep demo mode disabled.

## Important deployment rule

A successful Vercel deployment only proves that the React application built and was served. Registration/login also require a running Spring Boot API and PostgreSQL database.

Test the API directly before testing registration in the browser:

```text
POST https://YOUR-BACKEND/api/auth/register
```

The browser request should be sent to the backend domain, not to `rkvalley.vercel.app/api/...`.
