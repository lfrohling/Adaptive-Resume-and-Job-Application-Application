import React, { useState } from 'react';
import { History, Target, Trash2, ExternalLink, Calendar, Printer, Building, X } from 'lucide-react';
import { TailoredResume } from '../types/resume';

interface ApplicationsHistoryProps {
  history: TailoredResume[];
  onSelectResume: (res: TailoredResume) => void;
  onDeleteResume: (id: string) => void;
  onClearHistory: () => void;
}

export const ApplicationsHistory: React.FC<ApplicationsHistoryProps> = ({
  history,
  onSelectResume,
  onDeleteResume,
  onClearHistory,
}) => {
  const [previewJob, setPreviewJob] = useState<TailoredResume | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Existing Header Component (lines 20-40) ... */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <History className="w-4 h-4" />
            <span>Applications Archive</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Saved Tailored Resumes</h2>
          <p className="text-xs text-slate-400 mt-1">
            Every resume you generate is cataloged here with its company, ATS match rating, and target job description.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition"
          >
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Applications Tailored Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Head over to the <strong>Job Tailor Studio</strong> tab to paste a job description and propagate your first custom resume!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition cursor-pointer"
                onClick={() => setPreviewJob(item)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{item.companyName}</span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-snug">{item.jobTitle}</h3>
                    </div>
                    {item.atsAnalysis && (
                      <span className="text-xs font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
                        {item.atsAnalysis.matchScore}%
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Ingested: {dateStr} at {timeStr}</span>
                    <span>• {item.experiences.length} roles included</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 italic">
                    "{item.executiveSummary}"
                  </p>
                  <p className="text-xs text-indigo-300 mt-2">Skills: {item.selectedSkills.map(s => s.skills.join(', ')).join(', ')}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectResume(item); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Studio</span>
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteResume(item.id); }}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                    title="Delete tailoring"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
              <h3 className="font-bold text-white">Job Preview: {previewJob.jobTitle}</h3>
              <button onClick={() => setPreviewJob(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {previewJob.targetJD}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
