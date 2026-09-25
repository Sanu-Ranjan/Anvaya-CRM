# Anvaya CRM

A full-stack CRM for managing sales leads through a defined pipeline. Built to demonstrate JWT authentication with role-based access, relational data modeling in MongoDB, aggregation-based reporting, URL-driven filtering, and self-hosted VPS deployment.

---

## Demo Link

[Live Demo](https://crm.devranjan.cloud/)

Demo logins (or one click on "Log in as demo" on each login tab):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@anvaya.com | admin123 |
| Sales Agent | john@anvaya.com | agent123 |

---

## Demo Video

Watch a walkthrough of all major features:

[Video Link](https://drive.google.com/file/d/1dTpiMd2fwtaIA9yHki-5L2Kt9Ri7gwGY/view?usp=sharing)

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Sanu-Ranjan/Anvaya-CRM.git
cd Anvaya-CRM

# Backend
cd server
cp .env.example .env      # fill in MONGO_URI, ALLOWED_ORIGINS, JWT_SECRET, ADMIN_*
npm install
npm run seed              # populate demo data and demo logins
npm run dev               # starts on http://localhost:3000

# Frontend
cd ../client
npm install
npm run dev               # starts on http://localhost:5173
```

---

## Tech Stack

- **Frontend:** React 19, React Router 7, Bootstrap 5 (CDN), Chart.js + react-chartjs-2, native fetch
- **Backend:** Node.js, Express 4, Mongoose 8, JWT (jsonwebtoken), bcrypt
- **Database:** MongoDB (self-hosted on VPS)
- **Infrastructure:** Hostinger VPS (Ubuntu LTS), Nginx, PM2, Let's Encrypt via Certbot
- **CI/CD:** GitHub Actions — auto-deploys on push to `main`

---

## Combined Features

- Anyone can browse the dashboard, leads, agents and reports without logging in; adding or editing anything sends guests to login
- Login with JWT, no public signup
- Admin adds a sales agent together with a temporary password; the agent must set their own password on first login
- Change password for every user; admin can reset an agent's password from Settings
- Two roles: **Admin** manages agents, deletes leads and uses Settings; **Sales Agent** adds leads for themselves and edits only leads assigned to them
- Login page with Sales Agent / Admin tabs; admin-only controls are shown dimmed and disabled for agents
- Lead CRUD with assignment, status workflow, priority, tags, time-to-close
- Sales agents directory (with delete)
- Comments / activity log per lead, authored by the logged-in user
- Path-based URL routing for status and agent views (`/leads/status/:status`, `/leads/by-agent/:agentId`)
- Filterable and sortable lead list by status, agent, priority, sort field and order
- Grouped views — leads by status, leads by sales agent
- Settings page (admin) — search and delete agents or leads
- Reports dashboard with 5 visualizations:
  - Closed leads by sales agent (bar)
  - Closed vs in pipeline (pie)
  - Lead status distribution (pie)
  - Closed in last 7 days by agent (bar)
  - Pipeline by status (bar)
- Auto-set `closedAt` when a lead's status flips to Closed via Mongoose `pre('save')` hook

---

## API Quick Reference

All endpoints are prefixed with `/anvaya/v1`. All `GET` routes are public. Every create, update and delete needs an `Authorization: Bearer <token>` header. Routes marked (admin) return 403 for sales agents.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login `{ email, password, role }`, returns `{ token, user }` |
| GET | `/auth/me` | Current user |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` |
| GET | `/leads` | List leads (filters: status, salesAgent, source, priority, tags, sortBy, order) |
| POST | `/leads` | Create a lead |
| GET | `/leads/:id` | Get a single lead |
| PATCH | `/leads/:id` | Partial update (agents: own leads only, no reassigning) |
| DELETE | `/leads/:id` | Delete (admin) |
| GET | `/leads/:id/comments` | List comments for a lead |
| POST | `/leads/:id/comments` | Add a comment |
| GET | `/agents` | List sales agents |
| POST | `/agents` | Create agent and their login `{ name, email, password }` (admin) |
| PATCH | `/agents/:id/password` | Set a new temporary password (admin) |
| GET | `/agents/:id` | Get a single agent |
| DELETE | `/agents/:id` | Delete an agent (admin) |
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag (admin) |
| GET | `/report/last-week` | Leads closed in the last 7 days |
| GET | `/report/pipeline` | Pipeline counts grouped by status |
| GET | `/report/closed-by-agent` | Closed counts grouped by agent |
| GET | `/report/status-distribution` | All statuses with counts |

---

## Design Decisions

- **Public read, protected writes** — visitors can explore the whole CRM without an account; the server only requires a token for non-GET requests, and the frontend sends guests to login (and back) when they try to add or edit
- **No public signup** — with self-signup, anyone who knew an agent's email could register first and take over the account. Instead the admin creates the agent and their login in one step, linking the `User` to the `SalesAgent` record; deleting an agent also removes their login
- **Temporary password, forced change** — the admin sets an initial password, and until the agent changes it (`mustChangePassword`), every API route except `/auth/me` and `/auth/change-password` returns 403 and the frontend redirects to the change-password page. The admin never keeps knowing the real password
- **Admin from env** — on startup the server creates the admin from `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` if that email has no account yet, so there is no way to become admin from the UI, and a password changed later in the app is never overwritten
- **Demo accounts are locked** — seeded demo logins are flagged `isDemo`, so visitors can't change their passwords and lock others out
- **Ownership checked on the server** — agents creating a lead are always assigned to it, and PATCH on someone else's lead returns 403
- **Role checked on the server** — `verifyToken` loads the user fresh from the DB on every request, and `requireAdmin` guards admin routes; the frontend hiding buttons is only UX
- **JWT in `Authorization` header** — frontend and API are on different domains, so a cookie would be third-party and blocked; the token lives in localStorage
- **PATCH over PUT** — matches the actual use case where you update only a status or an agent
- **`closedAt` auto-set** via Mongoose `pre('save')` hook — without this the closed-last-week report has no field to query. The hook also clears `closedAt` if status moves back from Closed
- **`findById` + `.save()`** in the PATCH route instead of `findByIdAndUpdate` — so the `pre('save')` hook actually fires
- **Aggregation pipelines** for reports — `/report/closed-by-agent` uses `$match` → `$group` → `$lookup` → `$unwind` → `$project` → `$sort`
- **Central error-handler middleware** — maps Mongoose validation, cast, and duplicate-key errors to clean HTTP responses, eliminating try/catch in every route
- **`asyncHandler` wrapper** — lets every route use async/await without wrapping in try/catch
- **URL-driven filtering** — filters live in the browser URL via `useSearchParams`, making them shareable and refresh-safe

---

## Known Limitations

- Token in localStorage is readable by JavaScript, so an XSS bug could leak it
- No email invites or "forgot password" flow (no email service); the admin shares temporary passwords manually
- Single admin from `.env`; no UI to promote an agent to admin
- No pagination on `GET /leads` — would be needed at scale

---

## Feature Checklist

A full interactive checklist of every feature verified against the running app:

[CHECKLIST.md](./CHECKLIST.md)

Interactive version: [https://vn7mr9.csb.app/](https://vn7mr9.csb.app/)

---

## Contact

For bugs or feature requests, reach out at [ranjan.code33@gmail.com]()

## Some Screenshots
- Dashboard 
<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/51a76370-8eee-4b03-9915-0266285f1307" />

- Lead List
<img width="1916" height="944" alt="image" src="https://github.com/user-attachments/assets/9a1044be-7c78-427e-b114-da03cee8f837" />

- Sales Agents
<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/78f43b59-5cfe-4c73-b780-f15210d790fc" />

- Reports
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/5ab896e4-a0a7-4790-9a53-9e34160e94b3" />

- Settings
<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/610b84f3-777f-4114-958d-a26234c38979" />


