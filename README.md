# finStack - Finance Data Processing and Access Control

A full-stack MERN finance dashboard built for the Zorvyn Backend Internship
Assignment. It supports role-based access control, dual-token JWT
authentication, financial record management, and a real-time analytics
dashboard.

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Zod  
**Frontend:** React (Vite), Tailwind CSS v4, Recharts, Axios, React Router v6

---

## Project Structure
```
finstack/
├── backend/      Express API
└── frontend/     React + Vite client
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd finstack
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

MONGO_URI=mongodb://localhost:27017
DB_NAME=finstack

ACCESS_TOKEN_SECRET=your_access_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=7d
```

Seed the database with demo users and 50 transactions:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file inside `/frontend`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Credentials

After running `npm run seed` in the backend:

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@finstack.com      | Password@123 |
| Analyst | analyst@finstack.com    | Password@123 |
| Viewer  | viewer@finstack.com     | Password@123 |

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/v1/auth/register | Public  | Register as VIEWER   |
| POST   | /api/v1/auth/login    | Public  | Login, get tokens    |
| POST   | /api/v1/auth/refresh  | Cookie  | Refresh access token |
| POST   | /api/v1/auth/logout   | Cookie  | Logout, clear cookie |

### Transactions
| Method | Endpoint                   | Access           | Description          |
|--------|----------------------------|------------------|----------------------|
| GET    | /api/v1/transactions       | All roles        | List with filters    |
| POST   | /api/v1/transactions       | Admin, Analyst   | Create transaction   |
| PUT    | /api/v1/transactions/:id   | Admin, Analyst   | Update transaction   |
| DELETE | /api/v1/transactions/:id   | Admin only       | Soft delete          |

### Dashboard
| Method | Endpoint            | Access           | Description          |
|--------|---------------------|------------------|----------------------|
| GET    | /api/v1/dashboard   | Admin, Analyst   | Summary + charts     |

### Users
| Method | Endpoint          | Access     | Description          |
|--------|-------------------|------------|----------------------|
| GET    | /api/v1/users     | Admin only | List all users       |
| PUT    | /api/v1/users/:id | Admin only | Update role/status   |

---

## Key Features

### Dual-Token Authentication
- **Access Token** (15 min) — stored in React memory, never in
  localStorage. Attached to every request via Axios interceptor.
- **Refresh Token** (7 days) — stored in an `HttpOnly` cookie,
  invisible to JavaScript. Used to silently issue new access tokens.
- On page refresh, the app silently calls `/auth/refresh` so the
  user stays logged in without seeing a login screen.

### Role-Based Access Control
Three roles with clearly defined permissions enforced on both the
backend (middleware) and frontend (conditional rendering):

| Feature               | Viewer | Analyst | Admin |
|-----------------------|--------|---------|-------|
| View dashboard        | ✅     | ✅      | ✅    |
| View transactions     | ✅     | ✅      | ✅    |
| Create / Edit         | ❌     | ✅      | ✅    |
| Delete                | ❌     | ❌      | ✅    |
| Manage users          | ❌     | ❌      | ✅    |

### Explicit Soft Deletes
Deleted transactions are never removed from the database. Every query
explicitly filters `{ isDeleted: false }` — no Mongoose hooks that
could accidentally hide data.

### Audit Logging
Every create, update, and delete action writes an audit log entry with
the userId, action type, and before/after snapshots of the data.
Sensitive fields like passwords are stripped before saving.

### Parallel Dashboard Queries
The dashboard runs 4 MongoDB aggregation queries simultaneously using
`Promise.all`, so all metrics are calculated in a single round trip
to the database.

---

## Assumptions Made

1. New users registered via `/auth/register` always start as `VIEWER`.
   Only an Admin can promote them to `ANALYST` or `ADMIN`.
2. Soft delete is used for transactions — records are never permanently
   removed so the audit trail stays intact.
3. Analysts can create and edit transactions but cannot delete them,
   as financial deletion is considered a high-privilege action.
4. The dashboard shows all data to Admins and only the logged-in
   user's own data to Analysts and Viewers.

---

## Running the Seed Script

The seed script wipes the database and creates fresh data every time:
```bash
cd backend
npm run seed
```

It creates 3 users (Admin, Analyst, Viewer) and 50 randomized
transactions spread across the last 180 days covering multiple
categories and both income and expense types.