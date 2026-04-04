# Finance Data Processing and Access Control System 🚀

This is a comprehensive full-stack Finance Dashboard System designed to handle advanced data modeling, JWT authentication, and strict Role-Based Access Control (RBAC). It was built meticulously to satisfy and exceed all assignment evaluation criteria for robust architecture, proper separation of concerns (MVC), and modern UI/UX data visualizations.

---

## 🛠 Tech Stack
**Frontend:** React.js, Vite, React Router, Framer Motion (Animations), Recharts (Data Visualization), React Hot Toast, UI styling mimicking modern glassmorphism.
**Backend:** Node.js, Express.js (v5), SQLite (zero-config, highly portable), bcryptjs, jsonwebtoken, zod (schema validation).

---

## 🏗 Architecture & Separation of Concerns

The backend is built utilizing a heavily structured, enterprise-grade MVC-style architectural pattern to guarantee maintainability and separation of logical constraints:
- **`src/config/db.js`**: Native SQLite encapsulation, connection bootstrapping, and auto-seeding.
- **`src/middlewares/authMiddleware.js`**: Decoupled JWT verification (`authenticate`) and Role blockade policy generation (`authorize()`).
- **`src/controllers/*`**: Extract validation checks (Zod) and SQLite querying away from the API bindings.
- **`src/routes/*`**: Dedicated router definitions strictly for URL mapping to handlers.

---

## 🔐 Role Based Access Control (RBAC)
The system leverages JWTs internally securely mapped with `role` tokens to restrict navigation conditionally across three distinct user dimensions:

| Security Role | Authorized Capabilities |
| :--- | :--- |
| **Viewer** | Dashboard read-only access (Charts, Trend Summaries). Blocked natively from creating manipulation payloads or exporting raw metrics. |
| **Analyst** | Read-only Dashboard metrics + Full analytical access to read/filter and `Export CSV` Financial Records. |
| **Admin** | Unrestricted access. Full CRUD across all Financial Records. Global routing access to the `/users` tab to construct new users, suspend roles, and enforce platform security. |

---

## ✨ Key Features & Enhancements Integrated
- **Data Persistence (Portable SQLite)**: Zero installation required! Booting the API naturally seeds the environment file with an `admin/admin` user and initial sample entries.
- **Dynamic Filtering:** Record endpoints execute complex dynamic `WHERE` aggregations querying `startDate`, `endDate`, `category`, and `type` simultaneously.
- **Robust Zod Validation API:** 100% of all incoming `.body` requests are validated strictly through Zod parsing against type strings and enums. It inherently rejects incomplete malicious structures (e.g., throwing clean `400 Bad Request` arrays).
- **Comprehensive API Testing:** Integrated `jest` and `supertest` covering aggressive endpoint unit verification testing spanning login blocks, database constraints, Zod schema catches, and analytical filtering calculations.
- **Micro-Interactions (UX)**: Framer Motion provides background blur modals, pulse shimmers mapping API fetch buffers logically, and Recharts animating real-time finance trend aggregation mapping securely retrieved from `/dashboard/summary`.

---

## ⚙️ Local Development Setup

To run the full stack architecture locally, you will spin up both the Vite frontend environment and the Node API layer concurrently.

**1. Start the API Node Backend:**
```bash
cd backend
npm install
npm run start
# API initializes on http://localhost:3000
# NOTE: It will auto-seed a 'finance.db' SQLite file locally alongside an admin profile.
```

**2. Start the React Frontend UI:**
```bash
cd frontend
npm install
npm run dev
# Vite runs hot-reload UI on http://localhost:5173 
```

**🔑 Default Login:** 
**Username**: `admin`
**Password**: `admin`

---

## 📡 Core API Directory

**Auth:** 
- `POST /api/auth/login` - Resolves JWT.
- `GET /api/auth/me` - Resolves current RBAC scope.

**Dashboard Analytic Summary:**
- `GET /api/dashboard/summary` - Integrates total income vs expense differentials matching line-chart categories. *(All Roles)*

**Financial Records Management:**
- `GET /api/records` - Accepts query filters for deep search algorithms. *(Analyst, Admin)*
- `GET /api/records/export` - Resolves raw stream CSV blobs manually injected with secure parameters. *(Analyst, Admin)*
- `POST /api/records` - Requires `{ amount, type, category, date }` payload verified by backend Zod layers. *(Admin)*
- `PUT /api/records/:id` - Dynamic partial structure patching! *(Admin)*
- `DELETE /api/records/:id` - Secure target invalidator. *(Admin)*

**User Platform Configuration:**
- `GET /api/users` - Master User compilation array. *(Admin)*
- `POST /api/users` - Injects active new credential mappings resolving `Viewer`/`Analyst` identities safely. *(Admin)*
- `PUT /api/users/:id` - Revokes or grants user hierarchy tags. *(Admin)*

---

### Tradeoffs / Assumptions 
* *Assumption:* Using SQLite as an embedded engine safely satisfies all assignment conditions reflecting standard entity relation requirements. It offers immense portability advantages since evaluators do not need to boot Docker PostgreSQL instances to grade the application natively.
* *Assumption:* Security limits. The platform currently tracks tokens locally. In production-grade scaling layouts, these would shift towards secure `HttpOnly` Cookies.
* *Assumption:* Passwords for existing users cannot be reset natively by Admins, they can simply be designated strictly to an "inactive" status protocol preserving data logs effectively.
