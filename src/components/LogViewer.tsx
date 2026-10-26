import React from 'react';
import { AlertCircle, FileText, Info, Trash2 } from 'lucide-react';
import { getLogs } from '../utils/logger';

export const LogViewer: React.FC = () => {
  const logs = getLogs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>System Logs</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Diagnostic Logs</h2>
          </div>
          <button
            onClick={() => {
              // Clear logs implementation
              localStorage.removeItem('app_logs');
              window.location.reload();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition"
          >
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No logs available.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`text-xs p-3 rounded-lg border ${log.type === 'error' ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' : log.type === 'warning' ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                <span className="font-mono text-slate-500 mr-2">[{log.timestamp}]</span>
                <span className="font-bold mr-2 uppercase">{log.type}:</span>
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
