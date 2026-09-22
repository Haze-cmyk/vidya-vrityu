# Vidya-Vrityu

Vidya-Vrityu is a full-stack scholarship management platform for Scheduled Tribe (ST) students and government administrators. It combines a student application experience with an officer/admin workflow for application review, document verification, merit generation, and scheme management.

The project is designed around the real-world process used by scholarship administrations:
- applicants submit applications and supporting documents,
- officers verify eligibility and document quality,
- committees review merit and selection outcomes,
- administrators manage schemes and operational oversight.

[Read the complete project documentation](./documentation.md)

---

## Project Goal

The platform helps a government scholarship system deal with the common bottlenecks of education support programs:
- fragmented application tracking,
- manual verification effort,
- inconsistent document review,
- poor transparency for applicants,
- limited visibility for administrators.

Vidya-Vrityu addresses this with a unified portal that supports both applicant and administrative workflows in one system.

---

## What the system does

### Applicant side
- browse scholarship schemes,
- view eligibility and required documents,
- complete application forms,
- upload relevant supporting documents,
- monitor application status,
- view deficiencies and query requests,
- review profile and application history.

### Officer / admin side
- monitor incoming applications,
- perform document verification,
- review discrepancies and anomalies,
- raise deficiencies for resubmissions,
- approve or reject applications,
- generate merit lists,
- configure schemes and scholarship parameters,
- inspect audit logs and operational activity.

---

## System architecture

This repository is split into two main parts:

- frontend/: React + Vite + TypeScript UI
- backend/: Express + MongoDB API and document-processing services

At a high level:

- the frontend renders the public, applicant, and admin portals,
- the backend exposes REST endpoints for auth, scheme data, applications, stats, notifications, and documents,
- document verification uses OCR and comparison logic to extract values from uploaded PDFs,
- MongoDB stores users, schemes, applications, documents, and audit data.

---

## Repository structure

```text
vidya-vrityu/
├── backend/                     # Node.js + Express API
│   ├── config/                  # Database connection and runtime configuration
│   ├── models/                  # Mongoose schemas for users, apps, docs, audits, etc.
│   ├── routes/                  # API routes for auth, schemes, applications, docs, statistics
│   ├── services/                # OCR, fuzzy matching, Gemini-based extraction, and document pipeline logic
│   ├── .env.example             # Backend environment example
│   ├── entry.js                 # App entry point used by backend runtime
│   ├── index.js                 # Server bootstrap / route wiring
│   ├── package.json             # Backend dependencies and scripts
│   ├── README.md                # Backend-specific docs
│   ├── seed.js                  # Seed demo users and sample scheme data
│   └── uploads/                 # Local storage for uploaded PDFs and OCR output
│
├── frontend/                    # React app
│   ├── public/                  # Static assets and government guideline PDFs
│   ├── src/
│   │   ├── components/          # Shared UI and layout components
│   │   ├── context/             # Auth context and session state
│   │   ├── lib/                 # API client and mock data integration layer
│   │   ├── pages/               # Landing, auth, applicant, and admin pages
│   │   ├── routes/              # Route definitions and protected-layout flow
│   │   ├── types/               # Shared TypeScript interfaces
│   │   ├── App.tsx              # App shell and toast handling
│   │   └── main.tsx             # React root entry
│   ├── package.json             # Frontend dependencies and scripts
│   ├── README.md                # Frontend-specific docs
│   ├── vite.config.ts          # Vite config and backend proxy setup
│   └── index.html               # Frontend HTML entry point
│
├── docs/                        # Screenshots and design references
├── .env.example                 # Root-level environment template
├── .gitignore                   # Git ignore settings
├── package.json                 # Root scripts to run both apps together
├── start.bat                    # Windows launcher script
├── README.md                    # Main project documentation
└── uploads/                     # Runtime document storage at project root
```

---

## Tech stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts for analytics views
- Lucide icons and UI helpers

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT-based auth flow
- Multer for PDF upload handling
- OCR/document-processing flow using PDF and text extraction services
- optional external OCR and AI extraction services for document verification

---

## User roles and flows

### Applicant role
Applicants can:
- create an account,
- log in with their credentials,
- review schemes,
- fill out scholarship forms,
- upload required PDF documents,
- see verification or deficiency notifications,
- monitor outcomes.

### Institute / nodal officer role
This role supports review and verification inside the administrative portal.

### Officer role
Officers can validate eligibility and document correctness.

### Committee role
Committee users can handle merit-based review and selection decisions.

### Admin role
Admins oversee scheme configuration, user activity, reporting, and governance workflows.

---

## Demo credentials

The project comes with demo users for local testing.

Password for all seeded demo accounts: demo123

| Role | Email | Access |
| --- | --- | --- |
| Applicant | student@demo.in | Applicant portal |
| Institute | institute@demo.in | Admin portal |
| Officer | officer@demo.in | Verification and scrutiny workflows |
| Committee | committee@demo.in | Merit review |
| Admin | admin@demo.in | Full admin dashboard |

The seed data is created by the backend seeder script.

---

## Getting started

### Prerequisites
- Node.js 20 or newer is recommended
- MongoDB instance or a MongoDB Atlas connection string
- optional: OCR or AI extraction service credentials if you want document verification to fully call external services

### 1. Install project dependencies

From the root:

```bash
npm install
```

To install all app dependencies together:

```bash
npm run install:all
```

### 2. Configure environment variables

Copy the backend example file and fill in values if needed:

```bash
cp .env.example .env
```

Backend configuration includes:
- PORT
- JWT_SECRET
- MONGO_URI or other MongoDB connection variables
- optional OCR-related keys

The backend is designed to be tolerant of missing MongoDB configuration during startup, but full application data features require a real MongoDB connection.

### 3. Start the services

Run both frontend and backend together:

```bash
npm run dev
```

This starts:
- frontend on http://localhost:5173
- backend on http://localhost:5000

### 4. Seed demo data (optional)

```bash
npm run seed
```

This creates the default users and a sample scholarship scheme.

---

## Individual app commands

### Backend only

```bash
cd backend
npm install
npm run dev
```

Or start the production-style server:

```bash
cd backend
npm start
```

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

Build the frontend:

```bash
cd frontend
npm run build
```

---

## Important runtime behavior

### Database mode
The backend checks whether MongoDB is configured before it allows normal API access. If the database is not connected, the API path responds with a 503 status for protected routes and logs a clear message.

This is useful for deployments where the app is running before the database is available.

### OCR/document pipeline
The backend supports a PDF-based document-review process:
- save uploaded PDF files,
- extract text using OCR,
- parse structured fields,
- compare extracted values against applicant data,
- store results in MongoDB,
- expose the result through the frontend verification views.

If external AI/OCR credentials are not configured, some parts of this process fall back gracefully rather than failing the entire app.

---

## Main flows in the app

### Scholarship application flow
1. User logs in as applicant.
2. User browses active scholarships.
3. User opens a scheme page and reviews eligibility.
4. User fills the application form.
5. User uploads required documents.
6. Backend processes the documents and extracts fields.
7. Application is submitted for verification.
8. Officers review the application and may approve, reject, or raise deficiency requests.

### Verification and scrutiny flow
1. Officer checks the application.
2. OCR and extracted fields are reviewed.
3. Mismatch/anomaly alerts are identified.
4. Application is approved or deficient.
5. Applicant may resubmit documentation.

### Merit selection flow
1. Eligible applications are queried.
2. The system ranks candidates based on available metrics.
3. Merit list entries are displayed to committee/admin users.
4. Selected and waitlisted applications can be reviewed.

---

## API conventions

The backend exposes route groups under /api with the following patterns:

- /api/auth
- /api/schemes
- /api/applications
- /api/documents
- /api/stats
- /api/notifications
- /api/audit
- /api/health

The frontend talks to the backend through the API client in frontend/src/lib/mockApi.ts and resolves the base URL automatically based on the environment.

---

## Notes for deployment

### Local development
Use the root scripts for working with both apps together.

### Production deployment
Typical deployment targets include:
- Vercel / Netlify for the frontend
- Railway / Render / VPS for the backend
- MongoDB Atlas for the database

The project is designed to allow the backend to run with missing database credentials in a limited mode, but a real database connection is required for normal production use.

---

## Useful commands summary

```bash
# install all dependencies
npm run install:all

# run frontend + backend together
npm run dev

# run only backend
npm run dev:backend

# run only frontend
npm run dev:frontend

# seed demo data
npm run seed

# build frontend
npm --prefix frontend run build
```

---

## Contribution notes

This project is organized as a full-stack demo and prototype workflow rather than a production-ready enterprise system. It is suitable for:
- scholarship portal demonstrations,
- government-tech concept validation,
- educational prototypes,
- internal admin workflow exploration.

For production use, expansion would typically include stricter identity validation, stronger RBAC, audit signing, role isolation, file storage integration, and production-grade deployment security.

---

## Project status

The repository currently contains a functional frontend shell, backend API, seeded administrative users, and a document verification pipeline with mock and real-processing support. It is intended to be easy to run locally and to demonstrate the end-to-end scholarship management workflow.

---

## Contributors

This project was developed as a collaborative scholarship portal prototype.

- Jayesh Thakur
- Aryan Tripathi

---

## License

This repository does not currently include a formal license file. If you intend to publish or distribute it, add an appropriate open-source license before external release.
