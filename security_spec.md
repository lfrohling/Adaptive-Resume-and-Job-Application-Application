# Security Specification for OmniBase Resume App

## 1. Data Invariants
- Each Job, Resume, and CoverLetter MUST be linked to a valid `userId`.
- Users can only read, update, or delete their own Jobs, Resumes, and CoverLetters.
- Document IDs for all collections must be alphanumeric and restricted in size.
- PII (content) in Resumes and CoverLetters must only be accessible by the owner.

## 2. The "Dirty Dozen" Payloads (Examples)
1. `{"title": "Dev", "company": "Tech", "userId": "wrong_user"}` (Unauthorized write)
2. `{"content": "...", "userId": "me"}` (Resume missing userId/title)
...
## 3. Test Runner Strategy
(Will be implemented in firestore.rules.test.ts)
