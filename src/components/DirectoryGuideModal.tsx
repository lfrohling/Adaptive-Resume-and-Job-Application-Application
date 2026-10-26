import React, { useState } from 'react';
import { Folder, X, Check, Copy, HardDrive, AlertCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface DirectoryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectoryGuideModal: React.FC<DirectoryGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedTarget, setCopiedTarget] = useState(false);

  if (!isOpen) return null;

  const targetPath = `C:\\Storage\\Google AI Studio - Local Files`;
  const subdirs = [
    `C:\\Storage\\Google AI Studio - Local Files\\Master Dossier Backups`,
    `C:\\Storage\\Google AI Studio - Local Files\\Tailored Applications`,
    `C:\\Storage\\Google AI Studio - Local Files\\Obsidian Vault Sync`,
  ];

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Local File Directory & Safe Storage</h3>
              <p className="text-xs text-slate-400">
                How file saving works between your browser, Google AI Studio, and Windows.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300">
          {/* Explanation Banner */}
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Where did that "C:\Users\...\Downloads\Delete" directory come from?</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              When you press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">Ctrl+S</kbd> in your browser, or when your browser auto-downloads a web page, Windows saves it into your browser's default <strong>Downloads</strong> folder. Because your browser's download folder was configured to point to your <code className="text-rose-300">Downloads\Delete</code> directory, files landed there.
            </p>
          </div>

          {/* Solution 1: We enabled the Native File System Save Dialog */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Feature Enabled: Direct Folder Save Dialog</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Active</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When you click <strong>"Backup JSON"</strong> or <strong>"Save .md"</strong> in OmniBase, your browser will now open the native <strong>Windows Save As</strong> file picker. You can navigate directly to your permanent storage location.
            </p>
          </div>

          {/* Desired Directory Structure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white text-xs uppercase tracking-wider">
                Recommended Local Structure:
              </label>
              <button
                onClick={() => copyPath(targetPath)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTarget ? 'Copied base path!' : 'Copy base path'}
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-200">
              <div className="text-cyan-400 font-bold">{targetPath}\</div>
              {subdirs.map((dir, idx) => (
                <div key={idx} className="pl-4 text-slate-400 flex items-center gap-2">
                  <span>↳</span>
                  <span className="text-slate-300">{dir.split('\\').pop()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chrome / Edge / Firefox Settings Guide */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <span>How to permanently configure Chrome/Edge to prevent auto-saving in Downloads:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
              <li>Open your browser settings (<code className="text-slate-200">chrome://settings/downloads</code> or <code className="text-slate-200">edge://settings/downloads</code>).</li>
              <li>Toggle ON: <strong>"Ask where to save each file before downloading"</strong>.</li>
              <li>Optionally change your default Location from <code className="text-rose-300">Downloads\Delete</code> to <code className="text-emerald-300">C:\Storage\Google AI Studio - Local Files</code>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
