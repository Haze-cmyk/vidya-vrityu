# Vidya-Vrityu Project Documentation

## 1. Overview

Vidya-Vrityu is a full-stack scholarship management and administration portal for Scheduled Tribe (ST) students and the officials responsible for processing scholarship applications.

The system brings together:

- Public scholarship information and guidance
- Applicant registration and profile management
- Scholarship discovery and eligibility review
- Multi-section application submission
- PDF document upload and OCR-assisted verification
- Officer scrutiny, approval, rejection, and deficiency workflows
- Merit-list generation
- Scheme configuration
- Notifications, analytics, reports, and audit logging

The project is implemented as a React frontend and an Express/MongoDB backend. It is suitable for demonstrations, prototype validation, and further development into a production scholarship platform.

> **Important:** This repository contains a functional prototype. Production deployments should add stronger authentication, authorization, data protection, durable object storage, operational monitoring, and formal security review.

---

## 2. Product goals

Vidya-Vrityu is intended to improve scholarship administration by:

1. Giving applicants one place to discover schemes and submit applications.
2. Giving officers a structured queue for reviewing applications.
3. Reducing manual document review through OCR and extracted-field comparison.
4. Making deficiencies and status changes visible to applicants.
5. Providing administrators with scheme, merit, reporting, and audit capabilities.
6. Maintaining a consistent application lifecycle from submission to selection and disbursement.

---

## 3. High-level architecture

```text
Browser
  |
  | React 19 + TypeScript + Vite
  | Routes, forms, dashboards, notifications
  |
  | HTTP / JSON / multipart PDF uploads
  v
Express API
  |
  | Authentication and user profile routes
  | Scheme and application workflows
  | OCR/document verification
  | Notifications, statistics, and audit logs
  |
  v
MongoDB via Mongoose

Document verification pipeline:
PDF upload -> local file storage -> PDF/OCR extraction
             -> structured field extraction
             -> fuzzy name comparison
             -> confidence and mismatch results
             -> MongoDB document record
```

### Main applications

| Application | Location | Purpose |
| --- | --- | --- |
| Frontend | `frontend/` | Public pages, applicant portal, and admin portal |
| Backend | `backend/` | REST API, database access, document processing, and business workflows |
| Runtime uploads | `uploads/` and `backend/uploads/` | Uploaded PDFs and extracted OCR text during local execution |

---

## 4. Technology stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- React Hook Form and Zod
- Recharts
- Lucide React
- Sonner notifications
- `react-dropzone` for document selection
- `jsPDF` for client-side document generation where used

### Backend

- Node.js 20+
- Express 5
- MongoDB and Mongoose
- Multer for multipart file uploads
- PDF/OCR processing with `pdf2json` and `tesseract.js`
- Optional Gemini-based structured extraction
- Fuzzy matching with `string-similarity`
- CORS and dotenv

### Deployment-related tools

- Netlify configuration for the frontend
- Railway/Render-compatible backend configuration
- MongoDB Atlas-compatible database configuration
- Concurrent root development command

---

## 5. Repository structure

```text
vidya-vrityu/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection and readiness state
│   ├── models/
│   │   ├── Application.js
│   │   ├── AuditLog.js
│   │   ├── Document.js
│   │   ├── Notification.js
│   │   ├── Scheme.js
│   │   └── User.js
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── schemeRoutes.js
│   │   └── statsRoutes.js
│   ├── services/
│   │   ├── fuzzyMatchingService.js
│   │   ├── geminiService.js
│   │   ├── ocrService.js
│   │   └── pdfOcrPipeline.js
│   ├── entry.js                  # Runtime entry; initializes crypto compatibility
│   ├── index.js                  # Express app and route registration
│   ├── seed.js                   # Demo database seeder
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/                   # Static assets and scheme guidance PDFs
│   ├── src/
│   │   ├── components/           # Layout and reusable UI components
│   │   ├── context/              # Authentication/session context
│   │   ├── lib/
│   │   │   ├── draftManager.ts
│   │   │   └── mockApi.ts        # Typed HTTP API client
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── applicant/
│   │   │   └── auth/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
├── docs/                         # UI screenshots and supporting references
├── uploads/                      # Project-level runtime upload directory
├── .env.example                  # Environment variable template
├── netlify.toml                  # Netlify frontend build and SPA rewrite
├── package.json                  # Root scripts
├── start.bat                     # Windows launcher
├── README.md
└── documentation.md              # This document
```

---

## 6. User roles

The application defines the following roles:

| Role | Description |
| --- | --- |
| `applicant` | Student who browses schemes and submits scholarship applications |
| `institute` | Institute or nodal user involved in institution-level verification |
| `officer` | Verification/scrutiny officer who reviews application and document correctness |
| `committee` | Selection committee user who reviews merit and selection outcomes |
| `admin` | Administrator who manages schemes, reports, audit activity, and portal operations |

The frontend uses a shared authentication context and presents portal pages under `/app` and `/admin`. Role-specific access enforcement should be strengthened before production deployment.

---

## 7. Frontend routes

### Public routes

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/introduction` | Project and portal introduction |
| `/login` | Login |
| `/register` | Registration |
| `/help` | Help page or role-aware redirect |
| `/contact` | Contact page |
| `/guidelines` | Scholarship guidelines |

### Applicant routes

| Route | Page |
| --- | --- |
| `/app` | Applicant dashboard |
| `/app/schemes` | Browse schemes |
| `/app/schemes/:schemeId` | Scheme details |
| `/app/apply/:schemeId` | Application form |
| `/app/applications` | Applicant's applications |
| `/app/applications/:appId` | Application details and status |
| `/app/profile` | Applicant profile |
| `/app/help` | Applicant help |

### Admin and officer routes

| Route | Page |
| --- | --- |
| `/admin` | Admin dashboard |
| `/admin/applications` | Application list |
| `/admin/applications/:appId/review` | Application review |
| `/admin/verification` | Verification queue |
| `/admin/scrutiny` | Scrutiny workflow |
| `/admin/selection` | Merit-list and selection engine |
| `/admin/schemes/configure` | Scheme configuration |
| `/admin/communications` | Official communications |
| `/admin/reports` | Reports |
| `/admin/audit` | Audit log |
| `/admin/help` | Admin help |

---

## 8. Application lifecycle

Applications use the following status values:

```text
draft
submitted
under_verification
query_raised
verified
scrutinized
selected
rejected
disbursed
```

The normal workflow is:

1. Applicant selects a scheme.
2. Applicant completes personal, address, academic, bank, and scheme-specific details.
3. Applicant uploads required documents.
4. Backend records the application as `submitted`.
5. Officer reviews documents and OCR results.
6. Officer verifies the application, rejects it, or raises a deficiency.
7. Applicant can resubmit revised documents when requested.
8. Eligible applications move through scrutiny and selection.
9. Merit results identify selected, waitlisted, and under-review candidates.
10. Approved awards can progress to disbursement.

### Application data areas

An application can contain:

- Applicant identity and contact details
- ST category and tribe information
- Address and domicile information
- Academic qualification and marks
- Bank account details
- Scheme-specific answers
- Uploaded document records
- OCR fields and confidence values
- Deficiency history
- Verification and audit metadata
- Anomaly flags

---

## 9. Document verification pipeline

### Accepted files

- PDF files only
- Maximum file size: 20 MB
- Both the MIME type and `.pdf` extension are checked

### Processing stages

1. Receive the multipart upload.
2. Validate the file type and size.
3. Save the original PDF locally.
4. Extract text and page information through the PDF/OCR pipeline.
5. Extract structured fields such as:
   - full name,
   - date of birth,
   - caste category,
   - certificate number,
   - issuing authority.
6. Compare the extracted name to the registered applicant name using fuzzy matching.
7. Calculate name and overall confidence scores.
8. Mark likely mismatches and low-confidence results.
9. Store the document record and extracted data in MongoDB.
10. Return a frontend-compatible verification response.

### Storage considerations

The current implementation stores files and OCR output on the local filesystem. Cloud container filesystems may be ephemeral. Production deployments should use a persistent volume or object storage such as S3-compatible storage, Azure Blob Storage, or Supabase Storage.

---

## 10. Backend API

All API routes are mounted below `/api`.

### Health

#### `GET /api/health`

Returns service and database readiness information.

Example response shape:

```json
{
  "status": "ok",
  "database": "connected",
  "mongoUriConfigured": true,
  "databaseError": null,
  "timestamp": "2026-09-22T00:00:00.000Z"
}
```

### Authentication and users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Log in using email, username, login ID, or name |
| `POST` | `/api/auth/register` | Create a user account |
| `PUT` | `/api/auth/profile` | Update profile fields |
| `GET` | `/api/auth/users` | List users |

### Schemes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/schemes` | List schemes |
| `GET` | `/api/schemes/:id` | Get a scheme by ID or code |
| `POST` | `/api/schemes` | Create a scheme |
| `PUT` | `/api/schemes/:id` | Update a scheme |

### Applications

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/applications` | List applications with filters |
| `GET` | `/api/applications/merit-list` | Generate a merit list |
| `GET` | `/api/applications/:id` | Get one application |
| `POST` | `/api/applications` | Submit an application |
| `PUT` | `/api/applications/:id` | Update an application |
| `POST` | `/api/applications/:id/approve` | Approve/verify an application |
| `POST` | `/api/applications/:id/reject` | Reject an application |
| `POST` | `/api/applications/:id/raise-deficiency` | Raise a deficiency request |
| `POST` | `/api/applications/:id/resubmit` | Resubmit revised documents |
| `POST` | `/api/applications/:id/unlock` | Unlock an application for editing |

Supported list filters include:

- `schemeCode`
- `status`
- `state`
- `applicantId`
- `search`

Example:

```text
GET /api/applications?status=verified&schemeCode=NFST&state=Odisha
```

### Documents

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/documents/upload` | Upload and process a PDF |
| `POST` | `/api/documents/verify` | Run the dedicated verification pipeline |
| `GET` | `/api/documents/:id` | Get document metadata |
| `GET` | `/api/documents/:id/file` | Retrieve the original file |
| `GET` | `/api/documents/:id/text` | Retrieve extracted OCR text |
| `GET` | `/api/documents/user/:userId` | List documents for a user |

Document upload requests use `multipart/form-data` with fields such as:

- `file`
- `docType`
- `userId`
- `compareName`
- `compareValues`

### Statistics, notifications, and audit

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/stats` | Return dashboard statistics |
| `GET` | `/api/notifications?userId=...` | List notifications |
| `POST` | `/api/notifications` | Create a notification |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read |
| `GET` | `/api/audit` | List audit entries |
| `POST` | `/api/audit` | Create an audit entry |

### API response behavior

- Successful responses generally return JSON data directly.
- Validation and not-found errors return a JSON `message`.
- A disconnected database returns HTTP `503` for normal `/api` routes.
- Server-side failures return HTTP `500` with an error message.

---

## 11. Data models

### User

Important fields include:

- `id`
- `loginId`
- `name`
- `email`
- `phone`
- `role`
- `designation`
- `state`
- `tribe`
- `aadhaar`
- `dob`
- `gender`
- `annualIncome`
- `highestQualification`

### Scheme

Important fields include:

- `id`
- `code`
- `name`
- `description`
- `category`
- `window`
- `eligibility`
- `requiredDocs`
- `stages`
- `selectionCriteria`
- `amount`
- `maxScholarshipAmount`
- `totalSlots`
- `active`

Eligibility rules support operators such as:

- `eq`
- `lt`
- `gt`
- `in`
- `range`

### Application

Important fields include:

- `id`
- `applicantId`
- `applicantName`
- `schemeId`
- `schemeCode`
- `status`
- `currentStage`
- `submittedAt`
- `lastUpdatedAt`
- `personal`
- `address`
- `academic`
- `schemeSpecific`
- `bank`
- `documents`
- `ocrFields`
- `deficiency`
- `deficiencyHistory`
- `score`
- `remarks`
- `verifiedBy`
- `verifiedAt`
- `anomalyFlags`

### Document

Document records include:

- original file name and size,
- document type,
- local file references,
- extracted text,
- extracted fields,
- OCR engine and page count,
- confidence scores,
- fuzzy-match results,
- UI-compatible OCR fields,
- verification status.

### Notification

Notifications contain:

- recipient user ID,
- title and message,
- notification type,
- read state,
- optional frontend link,
- creation timestamp.

### Audit log

Audit records identify:

- actor ID, name, and role,
- action,
- entity type and ID,
- timestamp,
- optional metadata.

---

## 12. Environment configuration

The root `.env.example` documents the backend settings:

```dotenv
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_me_in_production
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vidya-vrtti
ILOVEPDF_PUBLIC_KEY=
ILOVEPDF_SECRET_KEY=
```

### Backend variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Express server port; defaults to `5000` |
| `MONGO_URI` | Recommended | MongoDB connection string |
| `MONGODB_URI` | Alternative | Supported MongoDB variable name |
| `MONGO_URL` | Alternative | Supported deployment variable name |
| `MONGODB_URL` | Alternative | Supported deployment variable name |
| `JWT_SECRET` | Production | Secret used by the authentication design |
| `CORS_ORIGIN` | No | Comma-separated allowed origins |
| `ILOVEPDF_PUBLIC_KEY` | Optional | External PDF/OCR integration |
| `ILOVEPDF_SECRET_KEY` | Optional | External PDF/OCR integration |

### Frontend variables

The frontend API client supports:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API host or complete API base |
| `VITE_API_BASE_URL` | Alternative API host/base variable |

If neither is set, the frontend uses `/api`, which works with the Vite development proxy and same-origin deployments.

---

## 13. Installation and local development

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB locally or MongoDB Atlas
- Optional OCR/AI provider credentials

### Install everything

From the repository root:

```bash
npm run install:all
```

This installs root, backend, and frontend dependencies.

### Configure the environment

Create a local environment file:

```bash
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

Fill in a valid MongoDB URI before running the seed command or using database-backed features.

### Start both applications

```bash
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Start one application

```bash
npm run dev:frontend
npm run dev:backend
```

Equivalent directory-level commands:

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run dev
```

### Seed demo data

```bash
npm run seed
```

The seed operation clears the existing seedable collections before inserting:

- one applicant,
- one institute user,
- one officer,
- one committee user,
- one admin,
- one NFST scholarship scheme.

Do not run the seed command against a database containing data you need to preserve.

---

## 14. Demo accounts

All seeded demo accounts use the password `demo123`.

| Role | Email | Login ID |
| --- | --- | --- |
| Applicant | `student@demo.in` | `VV-2026-10001` |
| Institute | `institute@demo.in` | `VV-2026-10002` |
| Officer | `officer@demo.in` | `VV-2026-10003` |
| Committee | `committee@demo.in` | `VV-2026-10004` |
| Admin | `admin@demo.in` | `VV-2026-10005` |

These credentials are for local demonstration only and must not be used in production.

---

## 15. Build, lint, and preview

### Frontend build

```bash
npm --prefix frontend run build
```

This runs TypeScript project compilation and the Vite production build.

### Frontend lint

```bash
npm --prefix frontend run lint
```

### Preview the production frontend

```bash
cd frontend
npm run preview
```

### Root production build

```bash
npm run build
```

The root build creates the frontend production output and copies it to the root `dist/` directory.

---

## 16. Deployment

### Frontend deployment

The included `netlify.toml` configures:

- build base: `frontend`
- build command: `npm run build`
- publish directory: `dist`
- SPA fallback: all routes rewrite to `/index.html`

Set the frontend API variable to the deployed backend URL when frontend and backend are hosted separately.

### Backend deployment

The backend can be deployed to Railway, Render, a VPS, or another Node.js-compatible service.

Configure:

- `PORT` if the platform provides one,
- a valid `MONGO_URI`,
- a strong `JWT_SECRET`,
- `CORS_ORIGIN` for the deployed frontend,
- optional OCR/AI credentials,
- persistent storage or object storage for uploaded documents.

### Database deployment

MongoDB Atlas is recommended for hosted environments. Configure network access, database users, and least-privilege credentials before deployment.

---

## 17. Operational troubleshooting

### The backend starts but API calls return 503

Check:

1. `MONGO_URI` or an alternative supported MongoDB variable exists.
2. The MongoDB cluster is reachable from the deployment network.
3. Database credentials are correct.
4. MongoDB Atlas network access allows the server.
5. `/api/health` for the reported connection error.

### The frontend cannot reach the backend

For local development:

1. Confirm the backend is running on port `5000`.
2. Confirm Vite is running on port `5173`.
3. Check the `/api` proxy in `frontend/vite.config.ts`.

For separate deployments:

1. Set `VITE_API_URL` or `VITE_API_BASE_URL`.
2. Confirm the backend CORS configuration.
3. Check browser network errors and the backend logs.

### PDF upload is rejected

Confirm that:

- the file is a real PDF,
- the filename ends in `.pdf`,
- the file is no larger than 20 MB,
- the request is sent as `multipart/form-data`.

### OCR results are incomplete

OCR quality depends on document scan quality, language, layout, and provider availability. Use clear, high-resolution PDFs and review confidence and mismatch fields before making a decision.

### Demo users cannot log in

Run the seed command against the configured database, then verify the credentials in the Demo accounts section. Remember that seeding clears the seedable collections.

---

## 18. Security and privacy guidance

Before production use, the following areas require additional hardening:

- Replace demo token behavior with signed, expiring JWTs or secure server sessions.
- Hash passwords using a dedicated password hashing algorithm.
- Enforce authorization middleware for every role-sensitive API endpoint.
- Do not expose all users through an unrestricted user-list endpoint.
- Validate and sanitize every request body and query parameter.
- Restrict CORS to known frontend origins.
- Move uploaded files to private durable object storage.
- Encrypt sensitive personal and bank data at rest and in transit.
- Avoid logging personally identifiable information or document contents.
- Rotate secrets and keep them outside source control.
- Add rate limiting, CSRF protections where applicable, and security headers.
- Add malware scanning and content validation for uploaded files.
- Add immutable or signed audit records for regulated workflows.
- Define retention and deletion policies for documents and applicant data.

The `.gitignore` should continue to exclude `.env`, uploaded files, and dependency directories.

---

## 19. Testing and quality checks

The project currently provides frontend build and lint commands rather than a full automated test suite.

Recommended minimum checks before submitting changes:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

For backend changes, also verify:

```bash
GET http://localhost:5000/api/health
```

Then exercise the affected route with a local database and inspect both success and error responses.

Recommended future test coverage:

- authentication and registration validation,
- role and authorization boundaries,
- application status transitions,
- scheme eligibility rules,
- document upload restrictions,
- OCR confidence and mismatch handling,
- merit-list ordering,
- notification and audit creation,
- database failure behavior.

---

## 20. Extension points

The architecture can be extended with:

- government identity or eKYC integrations,
- Aadhaar masking and identity verification,
- institute APIs,
- direct bank/disbursement integrations,
- configurable workflow state machines,
- multilingual UI and regional-language OCR,
- object storage and signed document URLs,
- background OCR queues,
- advanced duplicate detection,
- configurable merit scoring,
- exports to CSV/PDF,
- role-specific permissions,
- monitoring and alerting dashboards.

---

## 21. Contribution workflow

1. Create a branch for a focused change.
2. Install dependencies with `npm run install:all`.
3. Run the frontend and backend locally.
4. Keep API and TypeScript types aligned.
5. Add or update documentation for user-visible behavior.
6. Run lint and build checks.
7. Review changes for secrets, sensitive logs, and unintended data changes.

Avoid committing:

- `.env` files,
- credentials,
- MongoDB connection strings,
- uploaded documents,
- `node_modules`,
- generated build output unless explicitly required.

---

## 22. Project status and limitations

The repository currently provides:

- a React-based public and portal UI,
- a Node/Express API,
- MongoDB models and routes,
- seeded demonstration data,
- applicant and administrator workflows,
- PDF-only document verification,
- OCR and structured extraction integration points,
- notifications and audit records,
- frontend production build configuration.

Known prototype limitations include:

- authentication and token handling require production hardening,
- some workflow authorization is represented primarily in the UI,
- local file storage is not durable in many cloud environments,
- automated test coverage is limited,
- external OCR/AI behavior depends on provider configuration,
- a formal production license is not currently included.

---

## 23. Related documentation

- [`README.md`](./README.md) - concise project overview and quick start
- [`frontend/README.md`](./frontend/README.md) - frontend-specific notes
- [`backend/README.md`](./backend/README.md) - backend-specific notes
- [`docs/`](./docs/) - screenshots and visual references
- [`frontend/public/docs/`](./frontend/public/docs/) - bundled scholarship guidance PDFs

---

## 24. Contributors

- Jayesh Thakur
- Aryan Tripathi

