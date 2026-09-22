# Vidya-Vrtti (विद्या-वृत्ति)
### Unified National Scholarship & Administration Portal
**Ministry of Tribal Affairs (MoTA), Government of India**

An enterprise-grade, full-stack digital scholarship governance platform designed to streamline scholarship delivery, eliminate fake/duplicate applications via AI-powered OCR verification, and provide transparent tracking for Scheduled Tribe (ST) students across India.

---

## 📁 Repository Directory Structure

```
vidya-vrityu/
├── backend/                        # Node.js & Express REST API Server
│   ├── models/                     # Mongoose Schemas (User, Scheme, Application, AuditLog, etc.)
│   ├── routes/                     # Modular API Routes (Auth, Schemes, Applications, Docs, Stats)
│   ├── services/                   # Business Services (AI-OCR pipeline, JWT)
│   ├── index.js                    # Express Application Entry Point
│   ├── seed.js                     # Demo Database Seeder
│   ├── package.json                # Backend Dependencies & Scripts
│   ├── .env.example                # Sample Backend Environment Variables
│   └── README.md                   # Backend Documentation
│
├── frontend/                       # React 19 + Vite + Tailwind CSS Single-Page Application
│   ├── public/                     # Static Assets, Government Guidelines PDFs, Favicons
│   ├── src/
│   │   ├── components/             # Layout (Navbar, Sidebar, Footer) and UI components
│   │   ├── context/                # AuthContext (Role-based session state)
│   │   ├── lib/                    # API Client (Fetches from /api backend)
│   │   ├── pages/
│   │   │   ├── admin/              # 🏛️ Admin & Nodal Officer Portal (Verification, Scrutiny, Merit)
│   │   │   ├── applicant/          # 🎓 ST Student Portal (Apply, Track, Profile, Schemes)
│   │   │   └── auth/               # 🔐 Authentication (Login, Register with Captcha)
│   │   ├── routes/                 # AppRoutes.tsx (Role-based Protected Routes)
│   │   └── types/                  # TypeScript Data Models
│   ├── index.html                  # Frontend Entry Point
│   ├── vite.config.ts              # Vite Configuration & Backend Proxy (/api -> :5000)
│   ├── package.json                # Frontend Dependencies & Scripts
│   └── README.md                   # Frontend Documentation
│
├── docs/                           # Architectural Screenshots & Diagrams
├── .gitignore                      # Global Git Ignore (Strictly excludes all node_modules & .env)
├── package.json                    # Root Orchestration Scripts (Runs frontend & backend concurrently)
├── start.bat                       # One-Click Windows Automated Launcher
└── README.md                       # Main Project Documentation
```

---

## 🏛️ Admin Portal Location

The **Admin and Nodal Officer Portal** is integrated directly into the `frontend` under [`frontend/src/pages/admin`](frontend/src/pages/admin). It shares authentication state and design system tokens with the main application, accessible at `/admin` for users with administrative roles:

- **Executive Dashboard**: Key performance metrics, scheme budgets, and pipeline distribution.
- **Verification Queue**: Institute and State-level document validation with AI-assisted OCR.
- **Scrutiny Workflow**: Mark applications as Approved, Rejected, or Defective with student resubmission.
- **Merit List Engine**: Automated cutoff calculations and batch disbursement generation.
- **Scheme Config Engine**: Define new scholarship schemes and eligibility criteria dynamically.
- **Audit Logs**: Tamper-evident activity logs for full transparency.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas URI

### Quick Start (One Command)

From the root directory, install all dependencies:
```bash
npm run install:all
```

Then start both backend and frontend together:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🛠️ Individual Service Execution

### Backend Only
```bash
cd backend
npm install
npm run seed     # (Optional) Seed demo users and schemes
npm run dev      # Runs on http://localhost:5000
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev      # Runs on http://localhost:5173
```

---

## 🔐 Demo Credentials (Password: `demo123`)

| Role | Email | Access Scope |
| :--- | :--- | :--- |
| **ST Student** | `student@demo.in` | Applicant Portal (`/app`) |
| **Institute Nodal Officer** | `institute@demo.in` | Verification Queue (`/admin`) |
| **State Verification Officer** | `officer@demo.in` | Scrutiny Workflow (`/admin`) |
| **Ministry Selection Committee**| `committee@demo.in` | Merit List Engine (`/admin`) |
| **System Administrator** | `admin@demo.in` | Full Administrative Hub (`/admin`) |

---

## 📤 Pushing to GitHub

Ensure you are in the project root:
```bash
git add .
git commit -m "Organize project into frontend and backend folders"
git branch -M main
git push -u origin main
```

*(Note: `.gitignore` is pre-configured to ensure no `node_modules` or sensitive `.env` files are ever uploaded).*
