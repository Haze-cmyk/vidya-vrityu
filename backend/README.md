# Vidya-Vrtti Backend Server

Express.js REST API server with MongoDB / Mongoose integration, OCR verification, and JWT authentication for the Vidya-Vrtti Unified Scholarship Portal.

## Features
- **Authentication**: JWT-based login and registration for Applicants, Institutes, Officers, Committee, and Admin.
- **Scholarship Schemes**: CRUD endpoints and eligibility rule engine.
- **Application Workflow**: Lifecycle state management (Draft, Submitted, Scrutinized, Approved, Rejected).
- **OCR Engine**: AI-assisted document parsing & verification.
- **Audit & Analytics**: Transparent logging and statistics.

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. **Seed sample data (Optional):**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   - Development mode (with auto-reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```
   The backend API will run on `http://localhost:5000`.
