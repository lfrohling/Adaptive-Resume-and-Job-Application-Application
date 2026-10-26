import React, { useState } from 'react';
import { 
  ListChecks, 
  FileText, 
  Sparkles, 
  Lightbulb, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Tag, 
  Info,
  Zap,
  Copy,
  Check,
  X,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TodoTask } from '../types/resume';

export const DEFAULT_TODO_SECTIONS = [
  'Document Generation',
  'User Experience & Personalisation',
  'Personal Ideas',
] as const;

export const INITIAL_BACKLOG_TASKS: TodoTask[] = [
  {
    id: 'task-doc-2',
    text: 'Ensure job descriptions in history are fully populated and not just single lines.',
    section: 'Document Generation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-doc-3',
    text: 'Fix resume/cover letter page length disparity issue.',
    section: 'Document Generation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-ux-1',
    text: 'Make the To Do List artifact editable so the user can directly add, change, or check off items.',
    section: 'User Experience & Personalisation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-ux-2',
    text: 'Implement dynamic name replacement: Use the name provided by a Guest user to replace "Jane Doe" across their session\'s generated documents.',
    section: 'User Experience & Personalisation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-ux-3',
    text: 'Add "Click to edit" / "Done" toggle box to all skill categories for item removal.',
    section: 'User Experience & Personalisation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-ux-4',
    text: 'Implement automated backup/snapshot system for Master Resume.',
    section: 'User Experience & Personalisation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-doc-4',
    text: 'Document Generation: Use semantic structure mapping for docx. Preview uses semantic HTML/minimal styles. Export directly maps this structure to docx components (Paragraph, TextRun, HeadingLevel) to ensure high-fidelity parity and avoid conversion gaps.',
    section: 'Document Generation',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

interface TodoListProps {
  tasks: TodoTask[];
  onUpdateTasks: (tasks: TodoTask[]) => void;
  onResetBacklog?: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({ 
  tasks, 
  onUpdateTasks,
  onResetBacklog 
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('Document Generation');
  const [customSection, setCustomSection] = useState('');
  const [isAddingCustomSection, setIsAddingCustomSection] = useState(false);

  // AI Action Modal state
  const [selectedActionTask, setSelectedActionTask] = useState<TodoTask | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  const handleSaveTask = (taskId: string) => {
    onUpdateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, text: editingTaskText } : t))
    );
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  // Derive all active sections (standard + any custom ones found in tasks)
  const taskSections = Array.from(new Set(tasks.map((t) => t.section || 'Document Generation')));
  const allSections = Array.from(
    new Set([...DEFAULT_TODO_SECTIONS, ...taskSections])
  );

  const actionableTasks = tasks.filter((t) => t.section !== 'Personal Ideas');

  const handleAddTask = (targetSection?: string) => {
    const textToAdd = newTaskText.trim();
    if (!textToAdd) return;

    const sectionToUse = targetSection || (isAddingCustomSection && customSection.trim() ? customSection.trim() : selectedSection);
    
    const newTask: TodoTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      text: textToAdd,
      section: sectionToUse,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskText('');
    if (isAddingCustomSection) {
      setCustomSection('');
      setIsAddingCustomSection(false);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleMoveTask = (taskId: string, direction: -1 | 1) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Move within its section
    const sectionTasks = tasks.filter((t) => t.section === task.section);
    const currentIndex = sectionTasks.findIndex((t) => t.id === taskId);
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= sectionTasks.length) return;

    const reorderedSectionTasks = [...sectionTasks];
    const [moved] = reorderedSectionTasks.splice(currentIndex, 1);
    reorderedSectionTasks.splice(targetIndex, 0, moved);

    // Reconstruct full list preserving section order
    let newTasks: TodoTask[] = [];
    allSections.forEach((sec) => {
      if (sec === task.section) {
        newTasks.push(...reorderedSectionTasks);
      } else {
        newTasks.push(...tasks.filter((t) => t.section === sec));
      }
    });

    onUpdateTasks(newTasks);
  };

  const handleChangeTaskSection = (taskId: string, newSection: string) => {
    onUpdateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, section: newSection } : t))
    );
  };

  const handleToggleTaskStatus = (taskId: string) => {
    onUpdateTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus = t.status === 'in_progress' ? 'pending' : 'in_progress';
        return { ...t, status: nextStatus };
      })
    );
    if (selectedActionTask && selectedActionTask.id === taskId) {
      setSelectedActionTask((prev) => (prev ? { ...prev, status: prev.status === 'in_progress' ? 'pending' : 'in_progress' } : null));
    }
  };

  const handleActionNextTask = () => {
    const nextTask = actionableTasks.find((t) => t.status !== 'in_progress') || actionableTasks[0];
    if (nextTask) {
      setSelectedActionTask(nextTask);
    }
  };

  const generateSingleTaskPrompt = (task: TodoTask) => {
    return `Please action and implement this task from the To Do List:

Category: ${task.section}
Task: ${task.text}

Instructions:
1. Implement the required changes directly in the codebase.
2. Verify with compile_applet and lint_applet to ensure zero build errors.
3. Restart the dev server once completed.
4. Mark the task as completed in the To Do List.`;
  };

  const generateBatchPrompt = () => {
    const list = actionableTasks
      .map((t, idx) => `${idx + 1}. [${t.section}] ${t.text}`)
      .join('\n');
    return `Please action the pending backlog tasks from the To Do List in order of priority:

${list}

For each task:
1. Implement the feature or fix in the codebase.
2. Compile and verify the build.
3. Restart the development server.
4. Remove or check off the task upon successful implementation.`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const getSectionBadge = (section: string) => {
    switch (section) {
      case 'Document Generation':
        return {
          icon: <FileText className="w-4 h-4 text-cyan-400" />,
          color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
          desc: 'Document generation logic, PDF rendering, layout formatting, and page budgets.',
        };
      case 'User Experience & Personalisation':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          color: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
          desc: 'Interactive UI features, user preferences, dynamic naming, and safety backups.',
        };
      case 'Personal Ideas':
        return {
          icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          desc: 'Personal notes and plans. Protected from automatic AI ingestion unless requested.',
        };
      default:
        return {
          icon: <Tag className="w-4 h-4 text-indigo-400" />,
          color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
          desc: 'Custom task category.',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">To Do List</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                    {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Section-based planning and AI execution queue. Action priorities and backlog tasks live here.
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {actionableTasks.length > 0 && (
              <button
                onClick={handleActionNextTask}
                className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                title="Action the next priority task with Studio AI"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Action Next Task with Studio AI</span>
              </button>
            )}

            {actionableTasks.length > 1 && (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title="View and export all pending backlog tasks for AI"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Action All ({actionableTasks.length})</span>
              </button>
            )}

            {onResetBacklog && (
              <button
                onClick={onResetBacklog}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title="Populate/Reset list with The Backlog items"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Reload Backlog</span>
              </button>
            )}

            <button
              onClick={() => onUpdateTasks([])}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-semibold border border-rose-800/40 hover:border-rose-700/60 transition cursor-pointer"
              title="Permanently remove all tasks from database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Force Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <input
            type="text"
            placeholder="Type a new task, action item, or personal note..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center gap-2">
            {!isAddingCustomSection ? (
              <select
                value={selectedSection}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsAddingCustomSection(true);
                  } else {
                    setSelectedSection(e.target.value);
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
                <option value="__NEW__">+ New Custom Section...</option>
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="New section name..."
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
                />
                <button
                  onClick={() => setIsAddingCustomSection(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={() => handleAddTask()}
              disabled={!newTaskText.trim()}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {allSections.map((sectionName) => {
          const sectionTasks = tasks.filter((t) => t.section === sectionName);
          const meta = getSectionBadge(sectionName);
          const isPersonalIdeas = sectionName === 'Personal Ideas';

          return (
            <div
              key={sectionName}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition ${
                isPersonalIdeas ? 'border-amber-500/20 bg-amber-950/5' : 'border-slate-800'
              }`}
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-white text-base tracking-tight">{sectionName}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{meta.desc}</p>
                  </div>
                </div>

                {isPersonalIdeas && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Protected: AI will NOT auto-ingest or action without direct instruction</span>
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {sectionTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition"
                  >
                    <div className="flex items-center gap-3.5 flex-1 mr-3">
                      <input
                        type="checkbox"
                        onChange={async (e) => {
                          if (e.target.checked) {
                            const label = e.target.parentElement?.querySelector('span');
                            label?.classList.add('line-through', 'text-slate-500');
                            await new Promise((r) => setTimeout(r, 400));
                            handleRemoveTask(task.id);
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
                        title="Mark as completed & remove"
                      />
                      {/* Task text display/edit */}
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        {editingTaskId === task.id ? (
                          <input
                            type="text"
                            value={editingTaskText}
                            onChange={(e) => setEditingTaskText(e.target.value)}
                            onBlur={() => handleSaveTask(task.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(task.id)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="text-xs sm:text-sm text-slate-200 transition-all duration-300 leading-relaxed cursor-pointer hover:text-indigo-300"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditingTaskText(task.text);
                            }}
                          >
                            {task.text}
                          </span>
                        )}
                        {task.status === 'in_progress' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 animate-pulse">
                            <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                            <span>Actioning with AI</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Action with AI button & 1-click Direct Copy (only for non-personal sections) */}
                      {!isPersonalIdeas && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(generateSingleTaskPrompt(task));
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-750 hover:border-slate-650 transition cursor-pointer"
                            title="Direct 1-click copy AI directive to clipboard"
                          >
                            {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-indigo-400" />}
                            <span className="hidden sm:inline">Copy</span>
                          </button>

                          <button
                            onClick={() => setSelectedActionTask(task)}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 hover:border-indigo-500/50 transition cursor-pointer"
                            title="Open contextual action prompt for Studio AI"
                          >
                            <Zap className="w-3 h-3 text-indigo-400" />
                            <span className="hidden sm:inline">Action</span>
                          </button>
                        </div>
                      )}

                      {/* Move to another section */}
                      <select
                        value={task.section}
                        onChange={(e) => handleChangeTaskSection(task.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 transition cursor-pointer hidden lg:block"
                        title="Move to another section"
                      >
                        {allSections.map((sec) => (
                          <option key={sec} value={sec}>
                            Move to: {sec}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center">
                        <button
                          onClick={() => handleMoveTask(task.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white rounded hover:bg-slate-800 text-xs transition"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveTask(task.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-white rounded hover:bg-slate-800 text-xs transition"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="w-6 h-6 flex items-center justify-center text-rose-500 hover:text-rose-400 hover:bg-rose-950/30 rounded text-base transition ml-1"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {sectionTasks.length === 0 && (
                  <div className="py-6 text-center border border-dashed border-slate-800/80 rounded-xl">
                    <p className="text-xs text-slate-500">
                      {isPersonalIdeas
                        ? 'No personal ideas logged yet. Use the add bar above to save your private thoughts and plans.'
                        : `No pending tasks in ${sectionName}.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Action Single Task with Studio AI (Compact & Responsive) */}
      {selectedActionTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md max-h-[66vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-2.5 px-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Action Task with Studio AI</h3>
                  <span className="text-[9px] text-slate-400 leading-none block">{selectedActionTask.section}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(generateSingleTaskPrompt(selectedActionTask))}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Copy prompt"
                >
                  {hasCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedActionTask(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable, compact) */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2">
                <span className="text-[8px] uppercase font-bold text-slate-500 block mb-0.5">Task Description</span>
                <p className="text-xs font-semibold text-slate-100 leading-snug">{selectedActionTask.text}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] uppercase font-bold text-slate-400">AI Prompt Directive</span>
                  <span className="text-[9px] text-indigo-400">Ready to paste into chat</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap select-all">
                  {generateSingleTaskPrompt(selectedActionTask)}
                </div>
              </div>

              <div className="p-2 bg-indigo-950/20 border border-indigo-500/20 rounded-lg flex items-start gap-1.5 text-[10px] text-indigo-300">
                <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Click <strong>"Copy Directive"</strong> and paste into AI Studio chat, or reply: <em>"Action task: {selectedActionTask.text.slice(0, 30)}..."</em>
                </p>
              </div>
            </div>

            {/* Modal Footer (Pinned, compact) */}
            <div className="p-2 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => handleToggleTaskStatus(selectedActionTask.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                  selectedActionTask.status === 'in_progress'
                    ? 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-950/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                {selectedActionTask.status === 'in_progress' ? '✓ In Progress' : 'Mark In Progress'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedActionTask(null)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  onClick={() => copyToClipboard(generateSingleTaskPrompt(selectedActionTask))}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Directive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch Action All Pending Tasks (Compact & Responsive) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md max-h-[66vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-2.5 px-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Action All Pending Tasks</h3>
                  <span className="text-[9px] text-slate-400 leading-none block">{actionableTasks.length} tasks ready</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(generateBatchPrompt())}
                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Copy batch prompt"
                >
                  {hasCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setIsBatchModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">
                  Compiled AI Batch Directive
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap select-all">
                  {generateBatchPrompt()}
                </div>
              </div>

              <div className="p-2 bg-cyan-950/20 border border-cyan-500/20 rounded-lg flex items-start gap-1.5 text-[10px] text-cyan-300">
                <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Click <strong>"Copy Batch Directive"</strong> and paste into the AI Studio chat window.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-1.5 shrink-0">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white transition"
              >
                Close
              </button>
              <button
                onClick={() => copyToClipboard(generateBatchPrompt())}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/30 transition cursor-pointer"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Batch Directive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
