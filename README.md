# VELOZITY GLOBAL SOLUTIONS
## Real-Time Client Project Dashboard with Role-Based Access & Live Activity Feed

> Enterprise full-stack solution built with **React (TypeScript)**, **Node.js (Express & TypeScript)**, **PostgreSQL (Prisma ORM)**, **WebSocket (Socket.io)**, and **node-cron**.

---

## 🌟 Executive Architectural Overview

This application is designed specifically for an agency to manage client projects, track task lifecycles, and monitor distributed team activity in real time. It enforces rigorous server-side **Role-Based Access Control (RBAC)** across three distinct roles:

1. **Admin**: Global platform visibility, client & project management, active user WebSocket presence monitoring, and an unfiltered global activity feed.
2. **Project Manager (PM)**: Scoped exclusively to projects they created/manage. PMs cannot view, edit, or receive telemetry from other PMs' projects. Automatically receives real-time notifications when developer tasks are transitioned to `In Review`.
3. **Developer**: Scoped strictly to tasks assigned to them. Developers cannot see tasks assigned to other developers. They have granular permission to update their task status (`To Do` → `In Progress` → `In Review` → `Done`) and view a personalized feed of their own task events.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technology | Rationale & Justification |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons | Component-driven UI with strict typing, sub-millisecond HMR, zero-runtime CSS utility layer, and responsive dark slate aesthetic. |
| **Backend API** | Node.js, Express, TypeScript | Lightweight, battle-tested HTTP layer with composable middleware architecture and seamless Socket.io server integration. |
| **Database** | PostgreSQL 16 | ACID-compliant relational storage with foreign key constraints, cascade rules, and compound query indexing. |
| **ORM** | Prisma | Schema-first migrations, type-safe database queries, autocompletion, and relational integrity. |
| **Real-Time** | WebSocket via Socket.io | Bidirectional event messaging, heartbeats, automated reconnection, room multiplexing, and presence broadcasting. |
| **Background Jobs** | `node-cron` | Lightweight recurring background cron executor running automated overdue detection sweeps without external Redis overhead. |
| **Authentication** | JWT (Dual-Token Pattern) | Short-lived Access Token (in memory) + Long-lived Refresh Token in `HttpOnly`, `SameSite` cookie with database revocation. |
| **Validation** | Zod | Runtime schema validation on every protected API route for request body, params, and query parameters. |

---

## 🏛️ Database Schema & Relational Design

```mermaid
erDiagram
    User ||--o{ RefreshToken : "owns"
    User ||--o{ Project : "manages (PM)"
    User ||--o{ Task : "assigned to (Dev)"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Notification : "receives"
    Client ||--o{ Project : "contracts"
    Project ||--o{ Task : "contains"
    Project ||--o{ ActivityLog : "logs"
    Task ||--o{ ActivityLog : "records"
    Task ||--o{ Notification : "triggers"

    User {
        uuid id PK
        string email UK
        string password
        string name
        enum role "ADMIN | PROJECT_MANAGER | DEVELOPER"
        string avatarUrl
        datetime createdAt
    }

    RefreshToken {
        uuid id PK
        string token UK
        uuid userId FK
        datetime expiresAt
        boolean revoked
    }

    Client {
        uuid id PK
        string name
        string email
        string company
    }

    Project {
        uuid id PK
        string name
        string description
        uuid clientId FK
        uuid managerId FK
        datetime createdAt
    }

    Task {
        uuid id PK
        int taskNumber
        string title
        string description
        enum status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        enum priority "LOW | MEDIUM | HIGH | CRITICAL"
        datetime dueDate
        boolean isOverdue
        uuid projectId FK
        uuid assignedToId FK
        datetime createdAt
    }

    ActivityLog {
        uuid id PK
        string action
        string details
        enum prevStatus
        enum newStatus
        uuid taskId FK
        uuid projectId FK
        uuid userId FK
        datetime createdAt
    }

    Notification {
        uuid id PK
        uuid userId FK
        string title
        string message
        string type
        boolean isRead
        uuid taskId FK
        datetime createdAt
    }
```

### 🎯 Indexing Decisions

1. **`Task` Table**:
   - `@@index([projectId])`: Accelerates project-scoped task list retrievals.
   - `@@index([assignedToId])`: Enforces instant developer-specific task isolation (`WHERE assignedToId = devId`).
   - `@@index([status])`, `@@index([priority])`, `@@index([dueDate])`: Empowers fast multi-attribute filtering via URL query parameters.
   - `@@index([isOverdue])`: Allows the `node-cron` background worker to instantly scan pending overdue items without full table scans.
2. **`ActivityLog` Table**:
   - `@@index([projectId, createdAt(sort: Desc)])`: Compound index for paginated project audit log feeds.
   - `@@index([userId])`, `@@index([taskId])`: Speeds up joins and user audit history.
   - `@@index([createdAt(sort: Desc)])`: Powers the Admin global real-time activity feed and offline catchup queries.
3. **`Notification` Table**:
   - `@@index([userId, isRead])`: Highly optimized composite index for real-time unread notification count badge computation.
4. **`RefreshToken` Table**:
   - `@@index([token])`, `@@index([userId])`: Ensures O(1) lookup during refresh token rotation and revocation.

---

## 🔐 Architectural Decisions

### 1. WebSocket Library Choice: Socket.io vs. Native WebSocket
**Choice**: `Socket.io`
- **Justification**: While native WebSockets provide a low-level RFC 6455 transport, production real-time applications require reconnection backoffs, connection state recovery, heartbeat management, and room multiplexing. Socket.io natively provides room-based pub/sub (`socket.join('project:123')`, `socket.join('role:ADMIN')`), enabling granular, zero-overhead role-filtered activity streams and seamless disconnect cleanup for presence tracking.

### 2. Job Queue Choice: `node-cron` vs. `Bull`
**Choice**: `node-cron`
- **Justification**: The requirement specifies a recurring background sweep to flag tasks past their due date as Overdue. `node-cron` executes natively inside the Node process without requiring an external Redis infrastructure dependency. For an agency dashboard workload, this maximizes deployment reliability and simplifies zero-dependency container orchestration while fully satisfying background processing requirements.

### 3. Authentication & Token Storage Strategy
- **Access Token**: Short-lived (15-minute expiry) signed JWT containing `{ userId, email, role, name }`. Kept exclusively in client memory; never persisted to `localStorage` or `sessionStorage` to mitigate XSS exposure.
- **Refresh Token**: Cryptographically secure 80-character token stored in PostgreSQL with a 7-day TTL and `revoked` flag. Delivered to the client inside an `HttpOnly`, `SameSite=Lax` (or `Strict` in production), `Secure` cookie.
- **Token Rotation**: Each call to `/api/auth/refresh` revokes the incoming refresh token and atomically writes a newly issued refresh token in PostgreSQL, mitigating token replay attacks.

---

## ⚡ Real-Time Role-Filtered Activity Feed & Offline Catchup

### Live Stream Routing:
When an event occurs (e.g. `Ravi moved Task #12 from In Progress → In Review`):
1. The event is written to PostgreSQL in `ActivityLog`.
2. Socket.io broadcasts the event selectively:
   - To room `role:ADMIN` (Admin sees all events).
   - To room `user:${project.managerId}` (Only the PM who owns that project receives it).
   - To room `user:${task.assignedToId}` (Only the developer assigned to that task receives it).
   - To room `project:${projectId}` (Users actively inspecting that project see live DOM updates).

### Offline Users Catchup:
When a client reconnects or boots offline:
- The client calls `GET /api/activities?limit=20`.
- The backend queries PostgreSQL directly:
  - **Admin**: Returns the latest 20 events globally.
  - **PM**: Queries `WHERE project.managerId = user.id LIMIT 20`.
  - **Developer**: Queries `WHERE task.assignedToId = user.id LIMIT 20`.
- Data is strictly retrieved from disk/DB, fulfilling the requirement that missed events must **not** come from an in-memory cache.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js >= 18 (Tested on v24 / v20)
- npm or pnpm
- Docker & Docker Compose (or local PostgreSQL instance)

### Option A: Running with Docker Compose (Recommended)
```bash
# 1. Clone the repository
git clone https://github.com/your-username/velozity-dashboard.git
cd velozity-dashboard

# 2. Start PostgreSQL and Node Backend via Docker
docker compose up -d

# 3. Seed Database
npm run seed

# 4. Start Client Development Server
npm run install:client
npm run dev:client
```

### Option B: Local Node & PostgreSQL Setup
```bash
# 1. Install root, server, and client dependencies
npm run install:all

# 2. Configure Environment Variables
cp server/.env.example server/.env

# Update server/.env with your PostgreSQL credentials:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/velocity?schema=public"

# 3. Push Prisma schema & generate client
npm run prisma:push

# 4. Seed the Database (Creates 1 Admin, 2 PMs, 4 Devs, 3 Projects, 16 Tasks, 3 Overdue, Activities, Notifications)
npm run seed

# 5. Run Server and Client concurrently
npm run dev:server
npm run dev:client
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 👥 Demo Accounts (Pre-Seeded)

All seeded test accounts share the password: `Password123!`

| Role | Name | Email | Permissions / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | Alex Admin | `admin@velozity.com` | Full access, live presence, global feed, all projects |
| **PM 1** | Sarah Mitchell | `pm.sarah@velozity.com` | Manages Projects 1 & 2 only (`Cloud Banking`, `Acme Supply Chain`) |
| **PM 2** | Marcus Vance | `pm.marcus@velozity.com` | Manages Project 3 only (`HealthPulse Patient Records`) |
| **Dev 1** | Ravi Kumar | `dev.ravi@velozity.com` | Assigned tasks in Project 1 (Status updater, personal feed) |
| **Dev 2** | Elena Rostova | `dev.elena@velozity.com` | Assigned tasks in Projects 1 & 3 |
| **Dev 3** | David Chen | `dev.david@velozity.com` | Assigned tasks in Project 2 |
| **Dev 4** | Priya Sharma | `dev.priya@velozity.com` | Assigned tasks in Projects 2 & 3 |

> 💡 **Tip**: Use the **Assessment RBAC Quick-Switcher** toolbar at the top of the application to switch identities instantly with a single click.

---

## 📝 150–250 Word Assessment Explanation Field

### 1. The Hardest Problem Solved
The core challenge was orchestrating bidirectional synchronization between transactional PostgreSQL state and real-time WebSocket rooms under multi-tenant role isolation. A status update must atomically record an audit log, trigger role-based notifications, evaluate overdue criteria, and propagate live DOM updates without data races or security leakage. We solved this by decoupling persistence into dedicated transactional services (`ActivityService`, `NotificationService`) that compute role recipients before dispatching to scoped Socket.io rooms (`role:ADMIN`, `user:${pmId}`, `user:${devId}`).

### 2. Handling the Real-Time Role-Filtered Feed
Rather than broadcasting all events globally and filtering client-side (an anti-pattern that violates role isolation), filtering is enforced at the database and network boundaries. On socket connection, clients join private rooms corresponding to their user ID, role, and assigned project rooms. When a status transition occurs, the server logs the event in PostgreSQL and dispatches Socket.io payloads only to authorized target rooms. For offline users, the database query layer dynamically inspects the caller's JWT claims and joins `ActivityLog` against project ownership or task assignment, ensuring zero unauthorized event visibility.

### 3. One Thing to Do Differently
In a high-throughput enterprise deployment, running recurring overdue cron sweeps against PostgreSQL can become a bottleneck as task counts scale to millions. I would transition from polling sweeps to an event-driven delayed job queue (such as Redis BullMQ with dead-letter queues) or Postgres `pg_cron` with row-level TTL triggers, scheduling exact wake-up jobs per task deadline rather than running periodic batch scans.

---

## ⚠️ Known Limitations
- Background job processing is presently bound to the single active Node instance; in a horizontally scaled cluster behind a load balancer, Redis-backed leader election or an external scheduler would be used to prevent duplicate cron executions.
- In-memory WebSocket presence tracking tracks local node connections; a Redis Socket.io adapter (`@socket.io/redis-adapter`) would be introduced for multi-replica clustering.
