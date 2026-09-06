# Docker & Containerized Deployment Guide

CampusClear provides production-ready Dockerfiles and a unified `docker-compose.yml` orchestrating PostgreSQL, Spring Boot, and Nginx.

---

## 1. Quick Start with Docker Compose

Run the entire platform with one command from the project root:

```bash
docker compose up --build -d
```

### Services Launched:
1. **`postgres`** (PostgreSQL 16 Alpine) on port `5432` with healthcheck.
2. **`backend`** (Spring Boot 3 + Java 21) on port `8080` (waits for postgres healthcheck).
3. **`frontend`** (React 18 SPA + Nginx Alpine) on port `80` and `5173`.

---

## 2. Verifying Deployment
- **Web Application**: `http://localhost:5173` or `http://localhost`
- **Public Certificate Verification**: `http://localhost:5173/verify-certificate`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

---

## 3. Stopping Services
```bash
docker compose down -v
```
*(Omit `-v` if you wish to persist the PostgreSQL database volume).*
