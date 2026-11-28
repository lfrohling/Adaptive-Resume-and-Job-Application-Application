# OmniBase Resume Engine & Adaptive Job Tailor

This is a comprehensive career knowledge base that acts as the single source of truth for professional experiences, engineering skills, and project metrics. It uses AI to synthesize hyper-targeted resumes and cover letters for each job application and continuously harvests new skills and impact metrics back into the master document.

## Adaptive Features
*   **Master Career Dossier**: Centralized, editable repository for all professional history, skills, and certifications.
*   **AI-Powered Tailoring**: Uses Gemini to parse job descriptions and propagate tailored resumes/cover letters.
*   **Intelligent Knowledge Harvesting**: Automatically enriches the master dossier with new insights discovered during tailoring.
*   **Production Deployment**: Configured for high-availability cloud deployment.

## Tech Stack
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS.
*   **Backend**: Node.js, Express.
*   **AI**: Google Gemini API & SDK.
*   **Database**: Firebase Firestore.

## Production Deployment
The production application is accessible at: [https://adaptive-resume-jobapplication-engine.ai.studio/](https://adaptive-resume-jobapplication-engine.ai.studio/)

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables (e.g., `VITE_GEMINI_API_KEY`, Firebase credentials).
4. Start development server: `npm run dev`
