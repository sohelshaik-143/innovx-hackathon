# Environment & Configuration Guide

CampusClear supports multi-profile runtime environments:

## 1. Profiles

| Profile | Target | Database | Migrations |
|---|---|---|---|
| `dev` (Default) | Local Development & Testing | H2 (PostgreSQL mode: `MODE=PostgreSQL`) | Flyway automated migrations |
| `test` | Automated JUnit Integration Tests | In-memory H2 | Flyway migrations + Seed data |
| `prod` | Production / Docker Compose | PostgreSQL 16 | Flyway automated migrations |

---

## 2. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring Boot profile (`dev`, `prod`, `test`) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `nodues_db` | PostgreSQL database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `APP_JWT_SECRET` | 256-bit Hex String | Secret key for signing JWT tokens |
| `APP_JWT_EXPIRATION_MS` | `86400000` (24h) | Token validity duration |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed web clients |
| `APP_STORAGE_CERTIFICATES_DIR` | `./uploads/certificates` | Local path for generated PDF files |
| `APP_SLA_DEFAULT_HOURS` | `48` | Default SLA processing threshold in hours |
