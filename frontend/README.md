# Vidya-Vrtti Frontend & Admin Portals

A modern, responsive React 19 single-page application built with Vite, TypeScript, and Tailwind CSS v4 for the Ministry of Tribal Affairs (MoTA) Scholarship Management System.

## Architecture

This frontend houses both portals in a single, unified, role-governed client:

1. **Student / Applicant Portal (`/app`)**:
   - Browse eligible schemes, dynamic forms with multi-step validation.
   - Real-time status tracking & downloadable receipts/award letters.
   - Profile management with ST community details.

2. **Admin & Officer Hub (`/admin`)**:
   - Located at: `src/pages/admin/`
   - Executive Dashboard with key metrics & pipeline charts.
   - Multi-tier Verification Queue (AI-OCR document scrutiny).
   - Scrutiny Workflow & Defect re-upload requests.
   - Merit List Engine with cutoff calculations & disbursement preview.
   - Scheme Configuration Engine (dynamic eligibility rule creation).
   - System Audit Log & Official Communications.

3. **Public & Informational Pages (`/`)**:
   - Landing page, Scheme Guidelines, Contact, and Helpdesk.

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Vite development server:**
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```
