import React from 'react';
import { Layers, Copy, History, Sparkles, FileText, Download, Upload, Folder, RefreshCw } from 'lucide-react';
import { MasterResume, SkillCategory } from '../types/resume';

interface AdditionalUtilitiesProps {
  onShowToast: (msg: string) => void;
  onOpenSnapshotsModal: () => void;
  onSyncCanonicalTruth: () => void;
  onExportJson: () => void;
  onExportTxt: () => void;
  onOpenImportModal: () => void;
  onExportPdf?: () => void;
  onOpenDirectoryGuide?: () => void;
  onResetToSample?: () => void;
  masterResume: MasterResume | null;
  isDemoMode?: boolean;
}

export const AdditionalUtilities: React.FC<AdditionalUtilitiesProps> = ({ 
    onShowToast,
    onOpenSnapshotsModal,
    onSyncCanonicalTruth,
    onExportJson,
    onExportTxt,
    onOpenImportModal,
    onExportPdf,
    onOpenDirectoryGuide,
    onResetToSample,
    masterResume,
    isDemoMode = false
}) => {
  const protocolText = `[SCHEMA & JSOL NODE MAPPING PROTOCOL - STRICT PRESERVATION RULES]

When refactoring, restructuring, or generating code for this career dossier application, you MUST strictly preserve all root keys and array structures without renaming or remapping structural identifiers.

Explicit JSOL / JSON Resume Node Mapping:
1. \`id\` (string) -> Unique identifier for master resume, experiences, projects, certs, licenses, volunteer items, training, and referees. NEVER mutate or omit.
2. \`version\` (number) & \`lastUpdated\` (ISO string) -> Version control metadata for snapshots and sync checkpoints.
3. \`contact\` (Object) -> Candidate contact details mapping to: fullName, headline, email, phone, location, residentialAddress, currentStatus, relocationDetails, linkedin, github, website, websiteList.
4. \`executiveSummaries\` (Array of objects) -> [{ id, focusTrack, text }] for tailored executive summaries.
5. \`experiences\` (Array of WorkExperience objects) -> [{ id, company, role, location, startDate, endDate, isCurrent, summary, bullets: [{ id, text, impactMetric, tags, hidden }], technologies, hidden }].
6. \`projects\` (Array of ProjectItem objects) -> [{ id, name, role, link, period, description, bullets, technologies, hidden }].
7. \`skillCategories\` (Array of SkillCategory objects) -> [{ id, category, skills: string[] }].
8. \`education\` (Array of EducationItem objects) -> [{ id, institution, degree, fieldOfStudy, graduationYear, honors, location, hidden }].
9. \`certifications\` (Array of CertificationItem objects) -> [{ id, name, issuer, date, credentialId, url, hidden }].
10. \`licenses\` (Array of LicenseItem objects) -> [{ id, name, authority, date, details, credentialId, hidden }].
11. \`volunteer\` (Array of VolunteerItem objects) -> [{ id, role, organization, period, location, description, bullets: string[], hidden }].
12. \`training\` (Array of TrainingItem objects) -> [{ id, title, institution, year, description, skillsLearned: string[], hidden }].
13. \`referees\` (Array of RefereeItem objects) -> [{ id, name, role, organization, contactPhone, contactEmail, relationship, notes, hidden }].
14. \`additionalHighlights\` (Array of strings) -> Patents, publications, talks.
15. \`tasks\` (Array of strings or TodoTask objects) -> Backlog and action items.

CRITICAL DIRECTIVE: Do not alter, omit, or rename any of these JSOL keys, array structures, or ID properties during code restructuring. Ensure all TypeScript interfaces in src/types/resume.ts remain fully compliant.`;

  const handleExportRestricted = () => {
    onShowToast('Master file exports are disabled on the demo account. You can export tailored resumes and cover letters in the Tailor Studio!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Additional Utilities</h1>
        <p className="text-slate-400 text-sm mt-1">Framework and database exports, settings, etc</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Active Gemini Model Selection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Select the Gemini model used for AI resume tailoring, parsing, and harvesting.</p>
          </div>
          <select
            value={localStorage.getItem('omibase_gemini_model') || 'gemini-3.1-flash-lite'}
            onChange={(e) => {
              localStorage.setItem('omibase_gemini_model', e.target.value);
              onShowToast(`Active Gemini model switched to ${e.target.value}`);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white cursor-pointer focus:outline-none focus:border-indigo-500"
          >
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Recommended)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-pro">gemini-pro</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Data Integrity Audit</h2>
        <p className="text-xs text-slate-400">Currently loaded skill categories in your active session:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          {masterResume?.skillCategories.map((cat: SkillCategory) => (
            <li key={cat.id} className="text-slate-300">
              {cat.category} ({cat.skills.length} skills)
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20 mb-1">
              <Layers className="w-3.5 h-3.5" />
              AI Prompt Engineering & JSOL Protocol
            </div>
            <h2 className="text-sm font-bold text-white">Schema & JSOL Node Mapping Protocol for AI Studio</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy this structured node mapping protocol to supply to external Gemini prompts when restructuring or refactoring your code. Prevents structural drift and key renaming.
            </p>
          </div>
          <button
            onClick={() => {
              const textToCopy = isDemoMode
                ? "The JSOL Protocol Prompt would go here for authorised users"
                : protocolText;
              navigator.clipboard.writeText(textToCopy);
              onShowToast('JSOL Node Mapping Protocol Copied to Clipboard!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSOL Protocol Prompt</span>
          </button>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-36">
          <pre>{`// Key Nodes: contact | executiveSummaries | experiences | projects | skillCategories | education | certifications | licenses | volunteer | training | referees | tasks`}</pre>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
            <button onClick={onOpenSnapshotsModal} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-semibold transition">
                <History className="w-3.5 h-3.5" /> Snapshots & History
            </button>
            <button onClick={onSyncCanonicalTruth} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition">
                <Sparkles className="w-3.5 h-3.5" /> Sync 11-Page Truth
            </button>
            <button 
                onClick={isDemoMode ? handleExportRestricted : onExportTxt} 
                className={`flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <FileText className="w-3.5 h-3.5" /> Export Core Profile (TXT)
            </button>
            <button 
                onClick={isDemoMode ? handleExportRestricted : onExportJson} 
                className={`flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            {onExportPdf && (
                <button 
                    onClick={isDemoMode ? handleExportRestricted : onExportPdf} 
                    className={`flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold transition ${isDemoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <FileText className="w-3.5 h-3.5" /> Export Core Profile (PDF)
                </button>
            )}
            {onOpenImportModal && (
                <button onClick={onOpenImportModal} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-semibold transition">
                    <Upload className="w-3.5 h-3.5" /> Import
                </button>
            )}
            {onOpenDirectoryGuide && (
                <button onClick={onOpenDirectoryGuide} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition">
                    <Folder className="w-3.5 h-3.5" /> Local Folder
                </button>
            )}
            {onResetToSample && (
                <button onClick={onResetToSample} className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 rounded-xl text-xs font-semibold transition">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset to Sample
                </button>
            )}
            <button
                onClick={async () => {
                    try {
                        await fetch('/api/system/reboot', { method: 'POST' });
                        onShowToast('Backend server rebooted successfully.');
                    } catch (e) {
                        onShowToast('Reboot ping sent.');
                    }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
                <RefreshCw className="w-3.5 h-3.5" /> Reboot Backend Server
            </button>
        </div>
      </div>
    </div>
  );
};
