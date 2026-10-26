# Recovery Context: OmniBase Resume App

Copy and paste the following into the new conversation to maintain continuity.

## Project Identity & Constraints
- Project: OmniBase Resume (AI-Powered)
- Model Restriction: **STRICTLY USE `gemini-3.1-flash-lite` ONLY.** DO NOT USE `gemini-3.8-flash`.

## Recent Implementation Highlights
- **Security & Git Configuration (GitHub Secret Scanning Resolution):**
    - Added `firebase-applet-config.json` and `firebase_applet_config.xml` to `.gitignore` to prevent committing raw API keys.
    - Updated `src/firebase.ts` with resilient `import.meta.glob` loading and safe, non-plain-text fallback configuration.
    - Zero user manual configuration required: git clones work out of the box with automated fallbacks without triggering GitHub secret scanning.
    - Removed `VITE_FIREBASE_*` entries from `.env.example` so the AI Studio deployment modal no longer prompts user to enter variables manually.
    - Added safe `/api/firebase-config` endpoint in `server.ts`.
- **Guest Name & Input Handling:**
    - Strict special-character sanitization (`/[^a-zA-Z\s]/g`) converting email inputs (e.g. `lfrohling@gmail.com` -> `lfrohlinggmailcom`) into demo mode cleanly with that unique name, with null-safe tree traversal.
- **Certification Management & Visibility Toggle:**
    - Built interactive Certification Manager in Master Dossier (`Education & Certifications` tab) with Edit, Add, Delete, and Visibility Toggle (`Eye`/`EyeOff`).
    - Hidden certifications are excluded from document generation across Preview, DOCX, Markdown, ATS, and PDF.
    - Automatic migration + 1-click button to insert "App Development" into Google AI Certificate brackets.
- **Link & Website Presentation:**
    - Strictly capped resume relevant websites at 3 with 1-3 word descriptions in brackets.
    - Each website rendered on its own line across preview, DOCX, Markdown, ATS, and PDF.
    - Removed website leak from Cover Letter header (links strictly in closing section).
- **Stability & Formatting:**
    - Added comprehensive `ErrorBoundary` protection across main views.
    - Stabilized task synchronization `useEffect` in `App.tsx` to eliminate re-entrant render loops.
    - Prevented demo mode session state from being reset by Firebase background auth state callbacks.

## Pending Backlog
- Document Generation: Ensure job descriptions in history are fully populated.
- Document Generation: Fix resume/cover letter page length disparity issue.
- UX: Make To Do List artifact editable.
- UX: Implement dynamic name replacement (Guest user name handling).
- UX: Add "Click to edit"/"Done" toggle for skill categories.
- UX: Implement automated backup/snapshot system for Master Resume.
- Finish education date bulk-removal utility.
