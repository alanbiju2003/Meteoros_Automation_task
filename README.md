# NFC Campus Attendance

Full-stack REST app for college student NFC ID card check-in/check-out tracking with PostgreSQL + TimescaleDB.

## Architecture

- `backend/`: Express REST API with validation, admin auth, rate limiting, PostgreSQL queries, and Timescale hypertable migration.
- `client/`: Vite React UI with student scan flow at `/` and admin records dashboard at `/admin`.
- `docker-compose.yml`: Local TimescaleDB database.

## Backend API

- `POST /api/attendance/scan`: public student/gate scan endpoint.
- `GET /api/admin/attendance`: admin-only attendance records with date, time, student, longitude, latitude, reader, and metadata.
- `GET /api/admin/attendance/summary`: admin-only 24 hour summary.
- `GET /api/admin/students`: admin-only student/card list.
- `POST /api/admin/students`: admin-only student/card creation.
- `PATCH /api/admin/students/:studentId/card-status`: admin-only card status updates.

Admin endpoints require `x-admin-api-key`.

## Local Setup

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` for student check-in/check-out and `http://localhost:5173/admin` for admin records.

## Notes

- The browser client asks for geolocation and sends latitude, longitude, accuracy, device metadata, reader ID, and timestamped scan data.
- The server returns HTTP `429` automatically when the API or scan-specific rate limits are exceeded.
- For production, replace `ADMIN_API_KEY`, restrict CORS, run behind HTTPS, and connect real NFC readers to `POST /api/attendance/scan`.
# Meteoros_Automation_task
