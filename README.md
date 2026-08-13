# SMS Registry — School Management System

A modern, full-stack School Management System built with **Next.js 14**, **PostgreSQL**, and **Prisma ORM**. Designed with a premium **Glassmorphism** aesthetic — frosted glass panels, layered translucent surfaces, and soft gradient backgrounds — it provides a unified portal for both Registry **Staff** and **Students**.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

---

## ✨ Features

| Area | Details |
|:--|:--|
| **Staff Portal** | Manage students, programmes, fees, payments, assessments, submissions, and grade publishing |
| **Student Portal** | View own profile, results, fee status, and submitted assessments |
| **Authentication** | Cookie-based session auth — no third-party provider needed |
| **Glassmorphism UI** | `backdrop-blur`, `bg-white/78`, layered frosted glass over a high-res gradient background |
| **Real-time Search** | Debounced client-side search on student lists, fees, and submissions |
| **File Uploads** | Students can upload submission files (PDF, DOCX) stored on server disk |
| **Grade Publishing** | Staff control when grades are visible to students (publish/withhold toggle) |
| **Responsive Layout** | Collapsible sidebar, mobile-aware layouts |

---

## 🗂️ Project Structure

```
.
├── app/
│   ├── (auth)/login/         # Login page & action
│   ├── staff/                # Staff portal pages (dashboard, students, fees, assessments, results…)
│   ├── student/              # Student portal pages (dashboard, profile, results, fees…)
│   ├── layout.tsx            # Root layout with global background
│   └── page.tsx              # Root redirect → login or dashboard
├── components/
│   ├── layout/               # Staff & student sidebars
│   ├── common/               # Reusable UI: CurrencyDisplay, StatusBadge, etc.
│   └── ui/                   # shadcn/ui primitives (Button, Dialog, etc.)
├── lib/
│   ├── session.ts            # Cookie-based session read/write
│   ├── db.ts                 # Prisma client singleton
│   └── utils.ts              # General helpers (cn, formatDate, etc.)
├── prisma/
│   ├── schema.prisma         # Database models
│   └── seed.ts               # Demo data seed script
├── public/
│   └── background-image.png  # Global glassmorphism background
└── .env                      # Local environment variables (never commit this)
```

---

## ⚙️ Local Development Setup

### Prerequisites

| Requirement | Version | Notes |
|:--|:--|:--|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 9.x | Bundled with Node |
| **PostgreSQL** | ≥ 14 | Local install **or** a free cloud instance (see below) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/khan-shaheb-live/SMS-Registry.git
cd SMS-Registry
```

---

### Step 2 — Install dependencies

```bash
npm install
```

---

### Step 3 — Configure environment variables

Create your local `.env` file:

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Open `.env` and fill in your values. The only **required** variable to get started is `DATABASE_URL`.

---

### Step 4 — Set up a PostgreSQL database

#### Option A — Local PostgreSQL (recommended for development)

1. Install PostgreSQL: [postgresql.org/download](https://www.postgresql.org/download/)
2. Create a new database:
   ```sql
   CREATE DATABASE sms_registry;
   CREATE USER sms_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sms_registry TO sms_user;
   ```
3. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://sms_user:your_password@localhost:5432/sms_registry?schema=public"
   ```

#### Option B — Free cloud database (Neon, Supabase, Railway)

These services offer a free PostgreSQL tier with a connection string you can paste directly.

| Service | Free Tier | URL |
|:--|:--|:--|
| **Neon** | 0.5 GB | [neon.tech](https://neon.tech) |
| **Supabase** | 500 MB | [supabase.com](https://supabase.com) |
| **Railway** | 1 GB | [railway.app](https://railway.app) |

After creating a project, copy the **connection string** and paste it into `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

> **Note:** Add `?sslmode=require` to your `DATABASE_URL` when connecting to any cloud database to avoid SSL handshake errors.

---

### Step 5 — Push the schema to the database

This creates all the tables defined in `prisma/schema.prisma`:

```bash
npx prisma db push
```

> For production-style migrations with rollback support, use `npx prisma migrate dev --name init` instead.

After any schema changes, regenerate the Prisma client:

```bash
npx prisma generate
```

---

### Step 6 — Seed demo data

Populate the database with a full set of realistic demo data:

```bash
npm run db:seed
```

This loads **2 programmes**, **1 staff account**, **6 students** in varying states, fees, payment history, assessments, submissions, and graded results. See [Demo Accounts](#-demo-accounts) below for login credentials.

---

### Step 7 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

After running `npm run db:seed`, the following accounts are available.

> **Authentication note:** Login uses email-only lookup with cookie-based sessions — no password is required in the demo environment.

### Staff
| Email | Role |
|:--|:--|
| `staff@university.ac.uk` | STAFF — full access to all management pages |

### Students
| Email | Student ID | Status | Fee Status | Result |
|:--|:--|:--|:--|:--|
| `alice.chen@student.university.ac.uk` | SMS-2025-0001 | Enrolled | ✅ Fully paid | Distinction 78% (published) |
| `bob.patel@student.university.ac.uk` | SMS-2025-0002 | Enrolled | ⚠️ Outstanding | Pass 45% (published) |
| `carol.white@student.university.ac.uk` | SMS-2025-0003 | Enrolled | 🔴 Overdue | Submitted, awaiting grade |
| `david.kim@student.university.ac.uk` | SMS-2025-0004 | Deferred | ⚠️ Partial | Merit 65% (withheld by staff) |
| `emma.davis@student.university.ac.uk` | SMS-2025-0005 | Withdrawn | 🔴 Overdue | No submissions |
| `james.wilson@student.university.ac.uk` | SMS-2024-0001 | Completed | ✅ Fully paid | Merit 62% (published) |

---

## 🌱 Seed Script

The seed script lives at [`prisma/seed.ts`](./prisma/seed.ts) and is invoked with:

```bash
npm run db:seed
```

It is **idempotent** — it wipes all existing data first, then re-inserts a clean, consistent dataset. Safe to re-run at any time during development.

**What gets seeded:**

| Entity | Count | Notes |
|:--|:--|:--|
| Programmes | 2 | BSc Computer Science (£9,250), BA Business Management (£8,500) |
| Users | 7 | 1 staff + 6 student accounts |
| Students | 6 | All statuses covered: Enrolled, Deferred, Withdrawn, Completed |
| Fees | 6 | Mix of fully paid, partial, and overdue |
| Payments | 5 | Covering various instalment scenarios |
| Assessments | 4 | Open, closed, closing soon, and historical |
| Submissions | 5 | On-time, late, and pending grading |
| Grades | 4 | Distinction, Merit, Pass; published and withheld |

**To fully reset and re-seed:**

```bash
npm run db:reset
```

> ⚠️ `db:reset` drops **all data**. Never run this against a production database.

**To browse your database visually:**

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 🔒 Environment Variables

| Variable | Required | Description | Example |
|:--|:--|:--|:--|
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string | `postgresql://user:pass@localhost:5432/sms_registry?schema=public` |
| `NEXTAUTH_SECRET` | ✅ | Secret used to sign session cookies (min 32 chars) | See below |
| `NEXTAUTH_URL` | ✅ | Base URL of your application | `http://localhost:3000` |
| `UPLOAD_DIR` | Optional | Server directory for uploaded submission files | `./uploads` |
| `MAX_FILE_SIZE_MB` | Optional | Maximum file upload size in MB | `10` |

**Generating a secure secret:**

```bash
# macOS / Linux
openssl rand -base64 32

# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 🛠️ Available Scripts

| Command | Description |
|:--|:--|
| `npm run dev` | Start Next.js development server with hot reload |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server (requires `build` first) |
| `npm run lint` | Run ESLint on the codebase |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run db:migrate` | Create and apply a new named migration (dev) |
| `npm run db:seed` | Load demo data into the database |
| `npm run db:studio` | Open Prisma Studio visual database browser |
| `npm run db:reset` | Drop all data, re-run migrations, and re-seed |

---

## 🚀 Deploying to Vercel

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add the following **Environment Variables** in the Vercel project dashboard:
   - `DATABASE_URL` — your production PostgreSQL URL (with `?sslmode=require`)
   - `NEXTAUTH_SECRET` — a securely generated 32+ character secret
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
4. After the first successful deploy, apply the schema and seed to your production database:
   ```bash
   DATABASE_URL="your-production-db-url" npx prisma db push
   DATABASE_URL="your-production-db-url" npm run db:seed
   ```

---

## 🤖 AI Collaboration & Attribution

This project was built through human-AI pair programming across all phases of development:

### 📋 Requirements Analysis — ChatGPT (OpenAI)
Used to structure the project scope from scratch. Prompts were crafted to produce a detailed specification including user roles (Staff, Student), core entities (Student, Programme, Fee, Assessment, Submission, Grade), access control rules, and a full list of CRUD operations required per role.

### 🏗️ System Architecture — Claude (Anthropic)
The technical architecture was designed in conversation with Claude:
- **Route structure**: Next.js 14 App Router layout separating `/staff/` and `/student/` portals
- **Database schema**: Prisma models, enums, and relationships (one-to-one Fee, cascade deletions, published/withheld grade control)
- **API design**: Server Actions over REST API routes, no client-side fetching for auth-gated pages
- **Session strategy**: Cookie-based sessions using `lib/session.ts` in place of full NextAuth complexity

### 💻 Implementation & Development — Antigravity IDE (Google DeepMind)
The full codebase was implemented inside the **Antigravity IDE** using autonomous AI coding agents:
- **Gemini** (Google DeepMind) — UI component generation, global Tailwind class refactoring, Glassmorphism design system migration, TypeScript error resolution during production builds, and deployment debugging
- **Claude Sonnet** (Anthropic) — Server Action logic, Prisma query authoring, form validation with Zod, and complex data transformation (Decimal type handling, grade classification logic, submission management)

The agents executed file edits, ran terminal commands, and iterated on build errors autonomously. The developer reviewed, approved, and directed decisions at each stage.

---

## 📋 Tech Stack

| Layer | Technology |
|:--|:--|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 + custom glassmorphism utilities |
| **UI Components** | shadcn/ui (Radix UI primitives) + Lucide React icons |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 5.22 |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner (toast library) |
| **Date handling** | date-fns |
| **Deployment** | Vercel |

---

## 📄 License

This project was submitted as part of an academic assessment. All rights reserved.
