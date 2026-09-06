# Local Development Setup Guide

Follow these steps to run CampusClear locally on your workstation.

---

## 1. Prerequisites
- **Java**: OpenJDK 21 LTS or newer
- **Maven**: Apache Maven 3.9+
- **Node.js**: v18+ or newer (v20+ recommended)
- **npm**: v9+ or newer

---

## 2. Backend Setup & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Compile and run integration tests:
   ```bash
   mvn clean test
   ```

3. Launch the Spring Boot application:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

The backend starts on `http://localhost:8080`.
- Swagger API Docs: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/v3/api-docs`
- H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:nodues_db`)

---

## 3. Frontend Setup & Run

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend web app starts on `http://localhost:5173`.
All `/api/*` requests are automatically proxied to the backend at `http://localhost:8080`.
