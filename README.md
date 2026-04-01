# MedicTrack Hospital Management System

This repository now includes a modern stack migration:

- `frontend/`: React (Vite)
- `backend/`: Node.js + Express + MySQL

## New Stack

- Frontend: React 18 + Vite
- Backend: Node.js + Express
- Database: MySQL

## Project Structure

- `frontend/` React UI for login, dashboard, patients, appointments, and staff
- `backend/` REST API for auth, dashboard, patients, appointments, staff, doctors

## Run Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Initialize DB with:

- `backend/sql/schema.sql`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:4000`.

## Notes

- Core migrated modules: auth, dashboard, patients, appointments, staff, doctors.
- Password handling currently mirrors your old project behavior (plain text). For production, use password hashing and JWT/session auth.
