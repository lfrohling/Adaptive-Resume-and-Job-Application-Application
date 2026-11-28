/**
 * File: src/components/LogViewer.tsx
 * Description: Displays runtime errors, warnings, and API diagnostics with one-click .txt export and clearing.
 * Author: Luke Frohling
 */

import React, { useState } from 'react';
import { AlertCircle, Download, Trash2 } from 'lucide-react';
import { getLogs } from '../utils/logger';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState(getLogs());

  const handleDownloadTxt = () => {
    const header = [
      '================================================================================',
      `DIAGNOSTIC & ERROR LOG EXPORT — ${new Date().toLocaleString()}`,
      `Total Entries: ${logs.length}`,
      '================================================================================',
      '',
    ].join('\n');

    const body =
      logs.length === 0
        ? 'No errors or events recorded.'
        : logs
            .map((entry) => `[${entry.timestamp}] [${entry.type.toUpperCase()}] ${entry.message}`)
            .join('\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic_logs_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    localStorage.removeItem('app_logs');
    setLogs([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>System Logs</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Diagnostic Logs</h2>
            <p className="text-xs text-slate-400 mt-1">
              Captures runtime crashes, unhandled promise rejections, warnings, and API errors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Logs (.txt)</span>
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-2 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Logs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No logs available.</p>
          ) : (
            logs.map((entry, index) => (
              <div
                key={index}
                className={`text-xs p-3 rounded-lg border font-mono leading-relaxed ${
                  entry.type === 'error'
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                    : entry.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-slate-500 mr-2">[{entry.timestamp}]</span>
                <span className="font-bold mr-2 uppercase">{entry.type}:</span>
                {entry.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
