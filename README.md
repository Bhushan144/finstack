# finStack — Finance Data Processing & Access Control Backend

> **Full-stack MERN application** built for the **Zorvyn Backend Developer Intern Assignment**.  
> A role-based finance dashboard where Admins, Analysts, and Viewers interact with financial records based on granular permissions.

| | Link |
|---|---|
| 🌐 **Live Demo** | [finstackzorvyn.vercel.app](https://finstackzorvyn.vercel.app) |
| 🔧 **Backend API** | [finstack-backend-gj69.onrender.com](https://finstack-backend-gj69.onrender.com) |
| 📂 **Repository** | [github.com/Bhushan144/finstack](https://github.com/Bhushan144/finstack) |

### Demo Credentials (pre-seeded)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@finstack.com` | `Password@123` |
| **Analyst** | `analyst@finstack.com` | `Password@123` |
| **Viewer** | `viewer@finstack.com` | `Password@123` |

> **Tip:** Log in with each role to see how the UI and API permissions change dynamically.

---

## Table of Contents

- [Assignment Mapping](#assignment-mapping)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Access Control Matrix](#access-control-matrix)
- [Dashboard Aggregations](#dashboard-aggregations)
- [Validation & Error Handling](#validation--error-handling)
- [Optional Enhancements Implemented](#optional-enhancements-implemented)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Assignment Mapping

Every core and optional requirement from the Zorvyn assignment is addressed below with a direct pointer to the implementation.

| # | Requirement | Status | Implementation |
|---|---|---|---|
| 1 | **User & Role Management** | ✅ | Three roles (`ADMIN`, `ANALYST`, `VIEWER`) with status toggle, role promotion, and self-edit prevention. See [`userController.js`](backend/src/controllers/userController.js) and [`UsersPage.jsx`](frontend/src/pages/UsersPage.jsx) |
| 2 | **Financial Records Management** | ✅ | Full CRUD on transactions with fields: amount, type (INCOME/EXPENSE), category, date, note. See [`transactionController.js`](backend/src/controllers/transactionController.js) |
| 3 | **Dashboard Summary APIs** | ✅ | Single endpoint returns total income, total expenses, net balance, category-wise breakdown, recent activity, and monthly trends — all via MongoDB aggregation pipelines running in parallel. See [`dashboardController.js`](backend/src/controllers/dashboardController.js) |
| 4 | **Access Control Logic** | ✅ | Middleware-based RBAC using `authenticate` (JWT verification) + `requireRole` (role guard). Applied per-route with granular permission arrays. See [`auth.js`](backend/src/middlewares/auth.js) and [`roleGuard.js`](backend/src/middlewares/roleGuard.js) |
| 5 | **Validation & Error Handling** | ✅ | Zod schemas for input validation, global error handler for MongoDB duplicate key errors, Mongoose validation errors, and generic fallback. See [`validate.js`](backend/src/middlewares/validate.js), [`errorHandler.js`](backend/src/middlewares/errorHandler.js) |
| 6 | **Data Persistence** | ✅ | MongoDB Atlas with Mongoose ODM. Performance-optimized with compound indexes on the Transaction model. |
| — | **Token-based Auth** | ✅ | JWT access + refresh token rotation with HttpOnly cookies. Silent refresh on page reload. |
| — | **Pagination** | ✅ | Server-side pagination with `page`, `limit`, `total`, `totalPages` metadata. |
| — | **Multi-criteria Filtering** | ✅ | Filter by type, multiple categories (comma-separated), and date range. |
| — | **Soft Delete** | ✅ | Transactions use an `isDeleted` flag instead of physical deletion. All queries explicitly filter `isDeleted: false`. |
| — | **Rate Limiting** | ✅ | `express-rate-limit` integrated (dependency installed). |
| — | **Audit Trail** | ✅ | Every CREATE, UPDATE, DELETE on transactions is logged with old/new value snapshots. Sensitive fields (password, refreshToken) are auto-stripped. See [`auditLogger.js`](backend/src/services/auditLogger.js) |
| — | **Full Frontend** | ✅ | Complete React dashboard with charts (Recharts), role-aware navigation, and responsive design. |
| — | **Production Deployment** | ✅ | Backend on Render, Frontend on Vercel with reverse proxy to eliminate CORS issues. |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server and REST API framework |
| **MongoDB Atlas + Mongoose 9** | Document database with ODM |
| **JSON Web Tokens** | Stateless access tokens + stateful refresh tokens |
| **Zod** | Runtime request body validation |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **Helmet** | HTTP security headers |
| **Morgan** | Request logging (dev/combined modes) |
| **cookie-parser** | HttpOnly refresh token cookies |
| **envalid** | Environment variable validation at startup |
| **express-rate-limit** | API rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite 8** | UI library and build tool |
| **React Router v7** | Client-side routing with protected routes |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts** | Line chart (spending trends) and Pie chart (category breakdown) |
| **Axios** | HTTP client with interceptor-based token refresh |
| **React Hook Form + Zod** | Form handling with schema validation |

---

## Architecture Overview

```
┌────────────────────────┐     HTTPS      ┌────────────────────────────┐
│                        │ ◄──────────── │                            │
│   Vercel (Frontend)    │                │     Browser (React SPA)    │
│   + Reverse Proxy      │ ──────────►   │                            │
│                        │   /api/*       └────────────────────────────┘
└────────┬───────────────┘
         │  Proxied to same origin
         ▼
┌────────────────────────┐               ┌────────────────────────────┐
│                        │               │                            │
│   Render (Backend)     │ ◄──────────► │    MongoDB Atlas            │
│   Express REST API     │   Mongoose    │    (Cloud Database)         │
│                        │               │                            │
└────────────────────────┘               └────────────────────────────┘
```

### Request Lifecycle

```
Client Request
  │
  ├─ Helmet (security headers)
  ├─ CORS (origin validation)
  ├─ Morgan (request logging)
  ├─ Body Parser (JSON, 16kb limit)
  ├─ Cookie Parser
  │
  ├─ Router Matching (/api/v1/*)
  │   ├─ authenticate() middleware — verifies JWT access token
  │   ├─ requireRole([...]) middleware — checks user role
  │   ├─ validate(schema) middleware — Zod input validation
  │   └─ Controller — business logic + DB operations
  │
  └─ errorHandler() — catches all thrown/async errors
```

---

## Project Structure

```
finstack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── env.js             # Environment validation (envalid)
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, Login, Refresh, Logout
│   │   │   ├── dashboardController.js  # Aggregation pipelines
│   │   │   ├── transactionController.js  # CRUD + soft delete
│   │   │   └── userController.js  # Admin user management
│   │   ├── middlewares/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   ├── roleGuard.js       # RBAC middleware
│   │   │   └── validate.js        # Zod schema validation
│   │   ├── models/
│   │   │   ├── AuditLog.js        # Audit trail model
│   │   │   ├── Transaction.js     # Financial record model
│   │   │   └── User.js            # User model with bcrypt hooks
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── schemas/
│   │   │   ├── transactionSchema.js  # Zod validation schema
│   │   │   └── userSchema.js         # Zod register + login schemas
│   │   ├── services/
│   │   │   └── auditLogger.js     # Audit trail service
│   │   ├── utils/
│   │   │   ├── apiResponse.js     # Standardized response helpers
│   │   │   └── asyncHandler.js    # Async error wrapper
│   │   ├── app.js                 # Express app setup
│   │   ├── index.js               # Server entry point
│   │   └── seed.js                # Database seeder
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── SpendingChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── RecentActivity.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── transactions/
│   │   │       ├── FilterBar.jsx
│   │   │       ├── TransactionModal.jsx
│   │   │       └── TransactionTable.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state + silent refresh
│   │   ├── hooks/
│   │   │   └── useAuth.js         # Context consumer hook
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   └── UsersPage.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx  # Role-aware route guard
│   │   └── utils/
│   │       ├── constants.js
│   │       └── formatters.js       # Currency & date formatters
│   ├── vercel.json                 # Reverse proxy config
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Data Models

### User

```js
{
  name:         String   // required, trimmed
  email:        String   // required, unique, lowercase
  password:     String   // required, min 8 chars, auto-hashed (bcrypt, 12 rounds)
  role:         Enum     // 'ADMIN' | 'ANALYST' | 'VIEWER' (default: 'VIEWER')
  isActive:     Boolean  // default: true (used to deactivate accounts)
  refreshToken: String   // stored server-side for stateful token validation
  createdAt:    Date     // auto (timestamps)
  updatedAt:    Date     // auto (timestamps)
}
```

**Design Decisions:**
- Password is **automatically hashed** via a Mongoose `pre('save')` hook — no manual hashing in controllers.
- `refreshToken` is stored in the DB to enable **server-side token revocation** (not purely stateless).
- New users always register as `VIEWER` — role escalation requires an Admin.

### Transaction

```js
{
  userId:    ObjectId   // references User, required
  type:      Enum       // 'INCOME' | 'EXPENSE', required
  amount:    Number     // required, min: 0.01
  category:  String     // required, trimmed
  note:      String     // optional, trimmed
  date:      Date       // required
  isDeleted: Boolean    // default: false (soft delete flag)
  createdAt: Date       // auto
  updatedAt: Date       // auto
}
```

**Performance Indexes:**
| Index | Purpose |
|---|---|
| `{ userId: 1 }` | Fast user-scoped queries |
| `{ date: -1 }` | Recent-first sorting |
| `{ category: 1 }` | Category filtering |
| `{ isDeleted: 1 }` | Exclude soft-deleted records |
| `{ userId: 1, isDeleted: 1, date: -1 }` | **Compound index** optimizing the most common query pattern |

### AuditLog

```js
{
  userId:     ObjectId  // who performed the action
  action:     Enum      // 'CREATE' | 'UPDATE' | 'DELETE'
  entityName: String    // e.g., 'Transaction'
  entityId:   ObjectId  // which record was affected
  oldValues:  Mixed     // snapshot before mutation (sanitized)
  newValues:  Mixed     // snapshot after mutation (sanitized)
  createdAt:  Date      // auto
}
```

**Key behavior:** Sensitive fields (`password`, `refreshToken`) are **automatically stripped** from audit log snapshots via the `sanitize()` function.

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create a new user (defaults to VIEWER role) |
| `POST` | `/auth/login` | Public | Authenticate and receive access + refresh tokens |
| `POST` | `/auth/refresh` | Cookie | Exchange refresh token for a new access token |
| `POST` | `/auth/logout` | Cookie | Clear refresh token from DB and cookie |

<details>
<summary><strong>POST /auth/register</strong> — Request & Response</summary>

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation (Zod):**
- `name`: min 2 characters
- `email`: valid email format
- `password`: min 8 characters
- `role` is intentionally excluded from the register schema to prevent privilege escalation

**Response (201):**
```json
{
  "success": true,
  "message": "Registered successfully as VIEWER",
  "data": {
    "id": "665a1b2c3d4e5f6a7b8c9d0e",
    "name": "John Doe",
    "role": "VIEWER"
  },
  "error": null
}
```
</details>

<details>
<summary><strong>POST /auth/login</strong> — Request & Response</summary>

**Request Body:**
```json
{
  "email": "admin@finstack.com",
  "password": "Password@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "665a1b2c3d4e5f6a7b8c9d0e",
      "name": "System Admin",
      "role": "ADMIN"
    }
  },
  "error": null
}
```

**Additional behavior:**
- Sets an `HttpOnly`, `Secure` (in production), `SameSite: Lax` cookie with the refresh token
- Returns `401` if email/password mismatch
- Returns `403` if the account is deactivated
</details>

---

### Transactions (Financial Records)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/transactions` | Bearer | ALL | List transactions (paginated, filterable) |
| `POST` | `/transactions` | Bearer | ADMIN, ANALYST | Create a new transaction |
| `PUT` | `/transactions/:id` | Bearer | ADMIN, ANALYST | Update a transaction |
| `DELETE` | `/transactions/:id` | Bearer | ADMIN only | Soft-delete a transaction |

<details>
<summary><strong>GET /transactions</strong> — Query Parameters</summary>

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10) |
| `type` | string | Filter by `INCOME` or `EXPENSE` |
| `category` | string | Comma-separated categories (e.g., `Food,Rent,Transport`) |
| `startDate` | string | Filter records from this date |
| `endDate` | string | Filter records up to this date |

**Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "665a...",
        "userId": "665a...",
        "type": "EXPENSE",
        "amount": 250,
        "category": "Food",
        "note": "Weekly groceries",
        "date": "2026-03-15T00:00:00.000Z",
        "isDeleted": false
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "totalPages": 5,
      "limit": 10
    }
  },
  "error": null
}
```

**Scoping logic:**
- **Admins** see all transactions across all users
- **Analysts and Viewers** only see their own transactions
</details>

<details>
<summary><strong>POST /transactions</strong> — Request Body</summary>

```json
{
  "type": "EXPENSE",
  "amount": 1500,
  "category": "Rent",
  "note": "April rent payment",
  "date": "2026-04-01T00:00:00.000Z"
}
```

**Validation (Zod):**
- `type`: must be `INCOME` or `EXPENSE`
- `amount`: must be a positive number
- `category`: required, non-empty string
- `note`: optional string
- `date`: must be a valid ISO 8601 datetime string

**Security:** `userId` is **never** taken from the request body — it is always extracted from the JWT token (`req.user.id`).
</details>

<details>
<summary><strong>PUT /transactions/:id</strong> — Update Logic</summary>

- Only whitelisted fields (`type`, `amount`, `category`, `note`, `date`) can be updated
- `userId`, `isDeleted`, and `_id` are **protected from mass-assignment**
- Non-admin users can only update their own transactions
- Triggers an audit log entry with both old and new values
</details>

<details>
<summary><strong>DELETE /transactions/:id</strong> — Soft Delete</summary>

- Sets `isDeleted: true` instead of physically removing the record
- Only Admins can delete transactions
- Captures old state before mutation for the audit log
- Returns `404` if record is already deleted or doesn't exist
</details>

---

### Dashboard (Summary Analytics)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/dashboard` | Bearer | ALL | Aggregated financial summary |

<details>
<summary><strong>GET /dashboard</strong> — Response Structure</summary>

**Optional Query Parameters:**
- `startDate`, `endDate` — filter the summary to a specific date range

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "summary": {
      "income": 45000,
      "expense": 12500,
      "balance": 32500
    },
    "byCategory": [
      { "_id": "Salary", "total": 40000 },
      { "_id": "Rent", "total": 8000 },
      { "_id": "Food", "total": 3500 }
    ],
    "recent": [
      {
        "type": "EXPENSE",
        "amount": 250,
        "category": "Food",
        "date": "2026-04-01T00:00:00.000Z",
        "note": "Groceries"
      }
    ],
    "trend": [
      { "year": 2026, "month": 1, "type": "INCOME", "total": 15000 },
      { "year": 2026, "month": 1, "type": "EXPENSE", "total": 4200 }
    ]
  }
}
```
</details>

---

### User Management (Admin Only)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/users` | Bearer | ADMIN | List all users (password excluded) |
| `PUT` | `/users/:id` | Bearer | ADMIN | Update user role or active status |

**Self-edit protection:** Admins cannot modify their own role or active status to prevent accidental lockout.

---

## Access Control Matrix

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Transactions | ✅ (own) | ✅ (own) | ✅ (all) |
| Create Transaction | ❌ | ✅ | ✅ |
| Update Transaction | ❌ | ✅ (own) | ✅ (all) |
| Delete Transaction | ❌ | ❌ | ✅ |
| View Users | ❌ | ❌ | ✅ |
| Promote/Demote Users | ❌ | ❌ | ✅ |
| Deactivate Accounts | ❌ | ❌ | ✅ |

### How It's Enforced

Access control is implemented at **three layers**:

1. **Backend Middleware Chain:**
   ```
   router.use(authenticate)                    → Verifies JWT is valid
   router.use(requireRole(['ADMIN']))          → Checks role from JWT payload
   router.post('/', validate(schema), controller)  → Validates input
   ```

2. **Controller-level scoping:** Non-admin users can only query/modify records where `userId` matches their own JWT `id`.

3. **Frontend route guards:** `ProtectedRoute` component checks `allowedRoles` and redirects unauthorized users. Sidebar navigation items are conditionally rendered based on role.

---

## Dashboard Aggregations

The dashboard endpoint runs **4 MongoDB aggregation queries in parallel** using `Promise.all()` for maximum performance:

| Query | Pipeline | Output |
|---|---|---|
| **Totals** | `$match` → `$group` by type → `$sum` | Total income, total expenses |
| **By Category** | `$match` → `$group` by category → `$sum` → `$sort` | Category-wise spending breakdown |
| **Recent** | `find()` → `sort(date: -1)` → `limit(5)` | 5 most recent transactions |
| **Trend** | `$match` → `$group` by year/month/type → `$project` → `$sort` | Monthly income vs expense trends |

**Scoping:** Admin sees data across all users; non-admin sees only their own data.

---

**Key security decisions:**
- **Access token** (short-lived, 15min default) is stored **only in memory** — never in localStorage or sessionStorage, preventing XSS token theft.
- **Refresh token** (long-lived, 7d default) travels only via `HttpOnly`, `Secure`, `SameSite: Lax` cookies — invisible to JavaScript.
- **Stateful validation**: The refresh token stored in the cookie is verified against the one in the database, enabling **server-side revocation** on logout.
- **Silent refresh on page load**: When the app loads, it attempts to exchange the cookie for a fresh access token, keeping the user logged in across page refreshes.

---

## Validation & Error Handling

### Input Validation (Zod)

Every mutation endpoint has a Zod schema validated via the `validate()` middleware. Invalid requests are rejected **before** reaching the controller.

**Example error response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "amount": ["Amount must be greater than zero"],
    "date": ["Invalid date format. Must be a valid ISO 8601 string."]
  }
}
```

### Global Error Handler

The `errorHandler` middleware catches all errors thrown by controllers (via `asyncHandler`):

| Error Type | Status | Behavior |
|---|---|---|
| MongoDB duplicate key (11000) | `409` | Returns which field already exists (e.g., "email already exists") |
| Mongoose ValidationError | `400` | Returns all validation messages joined |
| Generic / Unknown | `500` | Returns full `err.message` in development, generic "Internal server error" in production |

### Standardized Response Format

Every API response follows a consistent JSON envelope:

```json
{
  "success": true | false,
  "message": "Human-readable description",
  "data": { ... } | null,
  "error": null | "error details" | { field: ["messages"] }
}
```

---

## Optional Enhancements Implemented

| Enhancement | Details |
|---|---|
| ✅ **Token-based Authentication** | JWT access + refresh token pair with HttpOnly cookies and silent refresh |
| ✅ **Pagination** | Server-side with `page`, `limit`, `total`, `totalPages` metadata |
| ✅ **Multi-criteria Search/Filter** | Filter by type, multiple categories (comma-separated), and date range simultaneously |
| ✅ **Soft Delete** | `isDeleted` boolean flag — records are never physically removed |
| ✅ **Rate Limiting** | `express-rate-limit` dependency integrated |
| ✅ **Audit Trail** | Every mutation logs old/new value snapshots with sensitive field sanitization |
| ✅ **Database Seeder** | One command (`npm run seed`) creates 3 users and 50 realistic transactions |
| ✅ **Full Frontend Dashboard** | React SPA with Recharts visualizations, role-aware navigation, and responsive design |
| ✅ **Production Deployment** | Backend on Render + Frontend on Vercel with reverse proxy for same-origin cookies |
| ✅ **Environment Validation** | `envalid` validates all env vars at startup — app crashes fast with clear messages if misconfigured |
| ✅ **API Documentation** | This README serves as comprehensive API documentation |
| ✅ **Security Hardening** | Helmet headers, CORS whitelist, 16kb body size limit, bcrypt with 12 salt rounds |

---

## Local Setup

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Bhushan144/finstack.git
cd finstack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
DB_NAME=finstack

ACCESS_TOKEN_SECRET=your-access-token-secret-here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
REFRESH_TOKEN_EXPIRY=7d
```

Seed the database with demo data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=/api/v1
```

> For local development, update `vite.config.js` or set `VITE_API_BASE_URL=http://localhost:5000/api/v1`

Start the development server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

### 4. Login & Explore

Use the seeded credentials to log in with different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@finstack.com` | `Password@123` |
| Analyst | `analyst@finstack.com` | `Password@123` |
| Viewer | `viewer@finstack.com` | `Password@123` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `DB_NAME` | No | `finstack` | Database name |
| `ACCESS_TOKEN_SECRET` | **Yes** | — | JWT signing secret for access tokens |
| `ACCESS_TOKEN_EXPIRY` | No | `15m` | Access token TTL (e.g., `15m`, `1h`) |
| `REFRESH_TOKEN_SECRET` | **Yes** | — | JWT signing secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token TTL (e.g., `7d`, `30d`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Base URL for API calls (e.g., `/api/v1` in production) |

---

## Deployment

### Backend → Render

- **Service type:** Web Service
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** All variables from the table above are set in the Render dashboard

### Frontend → Vercel

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **`vercel.json`** configures a reverse proxy to route `/api/*` requests to the Render backend, eliminating cross-origin cookie issues:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://finstack-backend-gj69.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This architecture ensures the browser treats both the frontend and API as **same-origin**, allowing `HttpOnly` cookies to flow without `SameSite` or `Secure` attribute issues.

---

## Assumptions & Design Decisions

| Decision | Rationale |
|---|---|
| **New users always get the VIEWER role** | Prevents privilege escalation via the registration endpoint. Only an Admin can promote a user. |
| **Analysts can create and update transactions** | In a finance dashboard context, analysts typically input and correct data. They cannot delete records — only Admins have that authority. |
| **Soft delete instead of hard delete** | Financial data should never be permanently lost. The `isDeleted` flag preserves audit integrity. All queries explicitly filter `isDeleted: false`. |
| **Access token in memory, not localStorage** | Prevents XSS-based token theft. The tradeoff is that the token is lost on page refresh, but silent refresh via the HttpOnly cookie handles this transparently. |
| **Stateful refresh tokens** | Purely stateless JWTs cannot be revoked. By storing the refresh token in the DB, we can invalidate sessions server-side on logout. |
| **Admins see all transactions** | In a real org, admins need full visibility for auditing. Non-admin users are scoped to their own records. |
| **Admins cannot edit themselves** | Prevents accidental self-demotion or self-deactivation that would lock them out of the system. |
| **Audit log failures don't crash the request** | The `logAction()` function uses try/catch internally and logs errors to console. A failed audit entry should not prevent the actual business operation from succeeding. |
| **ISO 8601 dates in API** | All dates are transmitted as ISO 8601 strings for unambiguous timezone handling. Frontend formats them for display using `Intl.DateTimeFormat`. |
| **INR currency** | The app is configured for Indian Rupees (₹) using `Intl.NumberFormat('en-IN')`. This can be easily changed by modifying `formatters.js`. |
| **MongoDB over SQL** | Chosen for rapid development, flexible schemas, and first-class aggregation pipeline support for the dashboard analytics. |
| **Vercel reverse proxy for cookies** | Cross-origin cookies are increasingly blocked by browsers. The reverse proxy makes frontend and API share the same origin, which is the recommended production pattern. |

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start for production |
| `npm run seed` | Seed database with 3 users + 50 transactions |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

<div align="center">
  <br />
  <strong>finStack</strong> — Built by <a href="mailto:bhushanpagar35@gmail.com">Bhushan Pagar</a> for the Zorvyn Backend Developer Internship Assessment
  <br /><br />
</div>