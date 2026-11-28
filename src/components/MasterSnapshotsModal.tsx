import React, { useState } from 'react';
import {
  History,
  Save,
  RotateCcw,
  Trash2,
  Download,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Clock,
  Layers,
  Briefcase,
  Users
} from 'lucide-react';
import { MasterResume, MasterSnapshot } from '../types/resume';
import { PURE_USER_MASTER_RESUME } from '../services/sampleData';

interface MasterSnapshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMaster: MasterResume;
  snapshots: MasterSnapshot[];
  onSaveSnapshot: (name: string) => Promise<void>;
  onRestoreSnapshot: (snapshot: MasterSnapshot) => Promise<void>;
  onDeleteSnapshot: (snapshotId: string) => Promise<void>;
  onSyncCanonicalTruth: () => Promise<void>;
  isDemoMode?: boolean;
}

export const MasterSnapshotsModal: React.FC<MasterSnapshotsModalProps> = ({
  isOpen,
  onClose,
  currentMaster,
  snapshots,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onSyncCanonicalTruth,
  isDemoMode,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const simulateApi = async () => {
    setIsSimulating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSimulating(false);
  };

  const handleCreate = async () => {
    await simulateApi();
    const name = snapshotName.trim() || `Snapshot (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    setIsSaving(true);
    await onSaveSnapshot(name);
    setIsSaving(false);
    setSnapshotName('');
    setActionMsg(`Snapshot "${name}" saved ${isDemoMode ? 'ephemerally!' : 'securely!'}`);
    setTimeout(() => setActionMsg(null), 3500);
  };

  const handleRestore = async (snap: MasterSnapshot) => {
    if (window.confirm(`Restore Master Dossier to snapshot "${snap.name}"? Your current state will be automatically backed up first.`)) {
      await simulateApi();
      await onRestoreSnapshot(snap);
      setActionMsg(`Master Dossier successfully restored to "${snap.name}"!`);
      setTimeout(() => setActionMsg(null), 3500);
    }
  };

  const handleSyncCanonical = async () => {
    if (window.confirm('Sync with the complete 11-page Canonical Truth Document? This will load all 18 experiences, 20 referees, full skills taxonomy, licenses, volunteer records, and training programs into your live record and save a backup snapshot first.')) {
      await simulateApi();
      await onSyncCanonicalTruth();
      setActionMsg('Successfully synced and loaded complete 11-page Canonical Career Dossier!');
      setTimeout(() => setActionMsg(null), 3500);
    }
  };

  const handleDelete = async (snapId: string, snapName: string) => {
      if (window.confirm(`Delete snapshot "${snapName}"?`)) {
          await simulateApi();
          onDeleteSnapshot(snapId);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Master Dossier Version History & Snapshots</span>
              </h2>
              <p className="text-xs text-slate-400">
                Save version checkpoints, revert to past states anytime, or sync with the 11-page Canonical Truth.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notification */}
        {actionMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Actions Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Snapshot Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Save className="w-4 h-4 text-indigo-400" />
                <span>Save Current State as Snapshot</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Before Stripe application..."
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Currently tracking: {currentMaster.experiences.length} roles, {currentMaster.referees?.length || 0} referees, {currentMaster.skillCategories.length} skill groups.
              </p>
            </div>

            {/* Sync Canonical Truth Card */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Sync 11-Page Canonical Truth Document</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Restore all 18 career positions, 20 referees, 8 skill categories, 5 licenses, 7 volunteer roles, and 7 training tracks ingested from your uploaded CV.
                </p>
              </div>
              <button
                onClick={handleSyncCanonical}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync / Load Full 11-Page Master Truth</span>
              </button>
            </div>
          </div>

          {/* Snapshots List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saved Version Checkpoints ({snapshots.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">Stored in cloud & local resilience cache</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6 space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-medium text-slate-400">No custom snapshots saved yet.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click "Save" above to create your first milestone snapshot, or click "Sync 11-Page Master Truth" to initialize all data.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {snapshots.map((snap) => {
                  const dateStr = new Date(snap.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const timeStr = new Date(snap.createdAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={snap.id}
                      className="p-4 bg-slate-950 hover:bg-slate-900/90 border border-slate-800 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{snap.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {dateStr} at {timeStr}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                            <Briefcase className="w-3 h-3" />
                            <span>{snap.itemCounts?.experiences ?? snap.data?.experiences?.length ?? 0} roles</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                            <Layers className="w-3 h-3" />
                            <span>{snap.itemCounts?.skills ?? snap.data?.skillCategories?.length ?? 0} skill groups</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                            <Users className="w-3 h-3" />
                            <span>{snap.itemCounts?.referees ?? snap.data?.referees?.length ?? 0} referees</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestore(snap)}
                          disabled={isSimulating}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Restore Master Dossier to this checkpoint"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(snap.data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `omnibase-master-snapshot-${snap.id}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                          title="Export snapshot as JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(snap.id, snap.name)}
                          disabled={isSimulating}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>OmniBase Snapshot Protection Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
