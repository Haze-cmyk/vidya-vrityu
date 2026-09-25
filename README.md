# Vidya-Vritti

### Unified Scholarship Management Portal

<p align="center">
  <strong>A full-stack scholarship platform for ST students, institutes, officers, selection committees, and administrators.</strong>
</p>

<p align="center">
  <a href="./documentation.md">Full Documentation</a>
  ·
  <a href="#getting-started">Getting Started</a>
  ·
  <a href="#features">Features</a>
</p>

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/AryanTripathiJi">
        <img src="https://github.com/AryanTripathiJi.png" width="100" height="100" alt="Aryan Tripathi GitHub profile picture" />
        <br />
        <sub><b>Aryan Tripathi</b></sub>
      </a>
      <br />
      <sub><a href="https://github.com/AryanTripathiJi">@AryanTripathiJi</a></sub>
    </td>
    <td align="center">
      <a href="https://github.com/Haze-cmyk">
        <img src="https://github.com/Haze-cmyk.png" width="100" height="100" alt="Jayesh Thakur GitHub profile picture" />
        <br />
        <sub><b>Jayesh Thakur</b></sub>
      </a>
      <br />
      <sub><a href="https://github.com/Haze-cmyk">@Haze-cmyk</a></sub>
    </td>
    <td align="center">
      <a href="https://github.com/prashantmishra02006-source">
        <img src="https://github.com/prashantmishra02006-source.png" width="100" height="100" alt="Prashant Mishra GitHub profile picture" />
        <br />
        <sub><b>Prashant Mishra</b></sub>
      </a>
      <br />
      <sub><a href="https://github.com/prashantmishra02006-source">@prashantmishra02006-source</a></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/sameer309346">
        <img src="https://github.com/sameer309346.png" width="100" height="100" alt="Sameer Singh GitHub profile picture" />
        <br />
        <sub><b>Sameer Singh</b></sub>
      </a>
      <br />
      <sub><a href="https://github.com/sameer309346">@sameer309346</a></sub>
    </td>
    <td align="center">
      <a href="https://github.com/ronitpandey17200-ops">
        <img src="https://github.com/ronitpandey17200-ops.png" width="100" height="100" alt="Ronit Pandey GitHub profile picture" />
        <br />
        <sub><b>Ronit Pandey</b></sub>
      </a>
      <br />
      <sub><a href="mailto:ronitpandey17200@gmail.com">ronitpandey17200@gmail.com</a></sub>
    </td>
    <td align="center">
      <a href="mailto:shre.more10@gmail.com">
        <img src="https://ui-avatars.com/api/?name=Shre+More&background=71816d&color=fff&size=100" width="100" height="100" alt="Shre More profile picture" />
        <br />
        <sub><b>Shre More</b></sub>
      </a>
      <br />
      <sub><a href="mailto:shre.more10@gmail.com">shre.more10@gmail.com</a></sub>
    </td>
  </tr>
</table>

## About

Vidya-Vrityu helps manage the complete scholarship lifecycle:

```text
Discover scheme → Apply → Upload documents → Verify → Scrutinize → Select → Disburse
```

The platform combines a student-facing application portal with an administrative workspace for document verification, scrutiny, merit-list generation, scheme configuration, notifications, reporting, and audit tracking.

## Features

### Applicant portal

- Browse active scholarship schemes and eligibility rules
- Complete multi-step scholarship applications
- Upload PDF supporting documents
- Track application status and deficiencies
- Resubmit requested documents
- Manage profile and view notifications

### Admin and officer portal

- Dashboard metrics and application pipeline views
- Application search, filtering, and review
- OCR-assisted PDF document verification
- Fuzzy name matching and confidence scores
- Approve, reject, or raise deficiency requests
- Merit-list generation and selection review
- Scheme configuration, reports, communications, and audit logs

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js 20+, Express 5, REST API |
| Database | MongoDB with Mongoose |
| Documents | Multer, PDF processing, Tesseract.js, optional AI extraction |
| Deployment | Netlify-compatible frontend, Railway/Render-compatible backend |

## Project structure

```text
vidya-vrityu/
├── frontend/       # React applicant, public, and admin interfaces
├── backend/        # Express API, MongoDB models, and OCR services
├── docs/           # Screenshots and visual references
├── uploads/        # Runtime document storage
├── documentation.md # Complete technical documentation
└── package.json    # Root development scripts
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB or MongoDB Atlas

### Install dependencies

```bash
npm run install:all
```

### Configure the backend

Copy `.env.example` to `.env` and set a MongoDB connection string:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### Run the project

```bash
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

### Seed demo data

```bash
npm run seed
```

> The seed command clears the seedable collections before inserting demo users and a sample scheme. Do not run it against data you need to preserve.

## Demo accounts

All seeded accounts use the password `demo123`.

| Role | Email |
| --- | --- |
| Applicant | `student@demo.in` |
| Institute | `institute@demo.in` |
| Officer | `officer@demo.in` |
| Committee | `committee@demo.in` |
| Admin | `admin@demo.in` |

These credentials are for local demonstrations only.

## Useful commands

```bash
npm run dev              # Start frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run seed             # Seed demo MongoDB data
npm run build            # Build the frontend
npm --prefix frontend run lint
```

## Documentation

For the complete reference, including architecture, API endpoints, data models, workflows, environment variables, deployment, troubleshooting, security guidance, and contribution notes, see:

**[Read the complete project documentation →](./documentation.md)**

## Project status

Vidya-Vrityu is an actively developed scholarship portal prototype intended for demonstrations, workflow validation, and future production hardening.

## License

This repository does not currently include a formal license. Add an appropriate license before external distribution.
