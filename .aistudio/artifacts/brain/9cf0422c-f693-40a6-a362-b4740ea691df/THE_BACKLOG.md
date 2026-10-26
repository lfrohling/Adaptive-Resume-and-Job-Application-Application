# The Backlog

This document tracks all requested features, pending tasks, and bug fixes to ensure clarity and accountability.

## Pending Backlog (Synced with To Do List Tab)

### Document Generation
- [x] Fix DOCX page break issue (headings separating from content).
- [x] Implement "click to copy" buttons for Q&A answers.
- [x] Fix Q&A ghost answer generation.
- [x] Cap resume websites strictly at 3 relevant links with 1-3 word bracketed descriptions.
- [x] Place each website on its own separate line in preview, DOCX, Markdown (.md), ATS plain text, and PDF.
- [x] Eliminate master website link dumping from cover letter header (retaining max 3 relevant links in body before closing).

### User Experience & Personalisation
- [x] **URGENT**: Resolve "Service temporarily unavailable" (implement exponential backoff retries for AI API calls).
- [x] Implement toggle for individual certification visibility (to handle "Sake" certs).
- [x] Implement rich in-app Certification Manager (Edit title/modules, Add new certs, Delete, 1-click "App Development" inserter).
- [ ] Finish education date bulk-removal utility.
- [x] Integrate precise 5-step time-zone conversion (Employer-local to AWST) into cover letter.
- [x] Synchronize exported DOCX, Markdown (.md), and PDF formatting with Preview.
- [x] Standardize .md and .pdf file naming to match DOCX convention ([Company]-[Role]-[Candidate]-[Type].[ext]).
- [ ] Ensure job descriptions in history are fully populated.
- [ ] Implement dynamic name replacement.
- [ ] Add "Click to edit" / "Done" toggle box to all skill categories for item removal.
- [x] Implement relevance-based certification filtering (AI-assisted).
- [ ] Implement automated backup/snapshot system for Master Resume.
- [x] Investigate and resolve CSP violation crash on Job Ingestion.
- [x] Re-verify DOCX page break prevention.
