import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, Save, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { TailoredResume } from '../types/resume';

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

interface QAStudioProps {
  tailoredResume: TailoredResume | null;
  onSave: (pairs: QAPair[]) => void;
}

export const QAStudio: React.FC<QAStudioProps> = ({ tailoredResume, onSave }) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const basePairs = tailoredResume?.qaPairs || [];
    // Always append 3 empty rows to the existing pairs
    const emptyRows = Array.from({ length: 3 }).map(() => ({
      id: Date.now().toString() + Math.random(),
      question: '',
      answer: ''
    }));
    setQaPairs([...basePairs, ...emptyRows]);
  }, [tailoredResume]);

  const handleSave = () => {
    setSaveStatus('Saving...');
    try {
      onSave(qaPairs);
      setSaveStatus('Save Successful');
    } catch (error) {
      setSaveStatus('Save failed. Please try again.');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAddRow = () => {
    setQaPairs([...qaPairs, { id: Date.now().toString(), question: '', answer: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    setQaPairs(qaPairs.filter(p => p.id !== id));
  };

  const handleUpdate = (id: string, field: 'question' | 'answer', value: string) => {
    setQaPairs(qaPairs.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const validPairs = qaPairs.filter(p => p.question.trim() !== '');
    try {
      const response = await fetch('/api/gemini/answer-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs: validPairs, tailoredResume }),
      });
      const data = await response.json();
      if (data.answers) {
        setQaPairs(qaPairs.map(p => {
            if (p.question.trim() === '') return p;
            const idx = validPairs.findIndex(vp => vp.id === p.id);
            if (idx !== -1 && data.answers[idx]) {
                return { ...p, answer: data.answers[idx] };
            }
            return p;
        }));
      }
    } catch (error) {
      console.error('Failed to generate answers', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <input 
          type="text" 
          placeholder="Business: Job Title"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white"
          value={tailoredResume ? `${tailoredResume.companyName}: ${tailoredResume.jobTitle}` : ''}
          readOnly={!!tailoredResume}
        />
        <div className="flex gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save All Questions
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Get Answers from AI
          </button>
        </div>
      </div>
      {saveStatus && <p className="text-sm text-emerald-400 mt-2">{saveStatus}</p>}

      <div className="space-y-4">
        {qaPairs.map((pair, index) => (
          <div key={pair.id} className="flex gap-2 items-start">
            <textarea 
              className="w-1/4 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white h-24"
              placeholder="Question"
              value={pair.question}
              onChange={(e) => handleUpdate(pair.id, 'question', e.target.value)}
            />
            <div className="flex-1 relative">
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white h-24"
                  placeholder="Answer"
                  value={pair.answer}
                  onChange={(e) => handleUpdate(pair.id, 'answer', e.target.value)}
                />
                <button 
                    className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded transition"
                    onClick={() => navigator.clipboard.writeText(pair.answer)}
                >
                    Copy
                </button>
            </div>
            <button className="bg-rose-900/30 border border-rose-800 text-rose-500 p-2 rounded-lg mt-0.5 hover:bg-rose-900/50" onClick={() => handleRemoveRow(pair.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2" onClick={handleAddRow}>
        <Plus className="w-4 h-4" /> Add Question
      </button>
    </div>
  );
};
