# MedicTrack Node.js Backend

This backend provides the Express API for your React app and keeps your MySQL core flows.

## Setup

1. Copy `.env.example` to `.env` and adjust DB settings.
2. Run the SQL in `sql/schema.sql` on MySQL.
3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/dashboard`
- `GET /api/doctors`
- `GET|POST|PUT|DELETE /api/patients`
- `GET|POST|PUT|DELETE /api/appointments`
- `GET|PUT /api/staff`
