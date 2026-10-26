
## Document Generation Status & Future Roadmap

The primary challenge in synchronizing the export functionality with the UI preview has been the reliance on Tailwind-heavy component rendering, which is difficult to map 1:1 to Word DOCX format. 

Current Progress:
- The data parity issue is resolved: the `exportDocx` function now explicitly maps all resume and cover letter data fields from the `tailoredResume`/`masterResume` sources to `docx` library components.
- The cover letter paragraphing issue is resolved: the `splitParagraphs` utility correctly handles multiline text rendering for both the preview and export.
- Formatting: The `docx` export uses explicit spacing and formatting (headings, bold, italics) to mimic the visual structure.

Future Maintenance Notes for Export Logic:
- If new data fields are added to the resume structure, ensure they are also mapped within the `exportDocx` function in `src/components/ResumeDocument.tsx`.
- The current approach is a direct component-to-docx mapping. If a complete visual overhaul is required, the architectural recommendation is to move toward a semantic HTML generation (using standard HTML tags like `h1`, `p`, `ul` with minimal inline styles) and utilize an HTML-to-DOCX library (note: check for browser compatibility if using `html-to-docx`).

### To Do List
- [ ] Document Generation: Refine DOCX formatting to match the "Modern Clean" preview theme more precisely, specifically focusing on column-based layout mapping and font family consistency.
- [ ] Implement "Q & A's for this job" tab in TailorStudio.
- [ ] Add "Q & A's for Job Applications" option to the Job Tailor & ATS Studio dropdown menu.
