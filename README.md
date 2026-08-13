# SMS Registry — School Management System

A modern, high-fidelity School Management System redesigned with a premium Glassmorphism aesthetic. It provides a fully functional registration portal for both staff members and students.

## Features & Visual Highlights
- **Premium Glassmorphism Design System**: Frosted glass surfaces (`bg-white/78`, `backdrop-blur-[24px]`, `border-white/70`) over a beautiful, fixed high-resolution gradient background.
- **Improved Legibility**: Darkened ash/grey text colors globally to ensure premium contrast and accessibility.
- **Dynamic Search**: High-performance, debounced real-time searches on lists (students, fees, etc.) operating completely client-side without page reloads.
- **Unified Sidebar**: Redesigned navigation sidebar including elegant collapsible menus and responsive User Cards on both Staff and Student portals.

---

## Getting Started & Local Development

Follow these steps to run the application locally:

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database (running locally or in the cloud)

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your values:
```bash
cp .env.example .env
```
Open `.env` and fill in your local credentials (database connection string, secrets, etc.).

### 4. Database Setup & Seeding
Deploy your schema and populate the database with seed data:
```bash
# Push schema changes to your database
npx prisma db push

# (Optional) Seed the database with sample staff and student accounts
npx prisma db seed
```

### 5. Running the Dev Server
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Environment Variables

Ensure the following variables are configured in your `.env` file:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/sms_registry?schema=public` |
| `NEXTAUTH_SECRET` | Secret key used for session encryption | `your-secret-here` |
| `NEXTAUTH_URL` | Base URL of the application | `http://localhost:3000` |
| `UPLOAD_DIR` | Directory where uploads are saved | `./uploads` |
| `MAX_FILE_SIZE_MB` | Maximum allowed file upload size | `10` |

---

## AI Collaboration & Attribution

This project is a product of human-AI pair programming and collaborative development. Here is how different AI assistants were utilized during the build process:

- **Requirements Analysis**: Developed using **ChatGPT** to structure the scope, user flows, and core project specifications.
- **System Architecture**: Designed in collaboration with **Claude** to lay down clean Next.js 14 route structures, prisma schemas, and API design rules.
- **Development & Implementation**: Built inside the **Antigravity IDE** using autonomous **Gemini** and **Claude Sonnet** agents. The agents executed code refactoring, styling replacements, and real-time search logic implementations directly within the codebase.
