import React from 'react';
import { Compass, CheckCircle2, XCircle, Zap, Shield, Sparkles, FileText, ArrowRight, DollarSign, Cpu } from 'lucide-react';

export const PlatformAdvice: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-3">
          <Compass className="w-3.5 h-3.5" />
          Strategic Platform Assessment & Free Tool Architecture
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Is Google AI Studio the Best Platform for a Master Resume Engine?
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-2 max-w-3xl">
          <strong>Direct Answer: Yes, an AI Studio-powered dedicated application like this one is significantly superior to Perplexity Pro, ChatGPT, and Claude</strong> for maintaining a massive Master Career Dossier and propagating tailored resumes.
          Below is a technical breakdown of why Perplexity failed your workflow, and the recommended 100% free toolchain.
        </p>
      </div>

      {/* Comparison Grid: AI Studio vs Perplexity Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perplexity Pro Breakdown */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Why Perplexity (Pro) Is Failing You</h3>
              <span className="text-xs text-rose-400 font-medium">Search engine optimized, not career database optimized</span>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Context Truncation & Hallucinations:</strong> Perplexity is designed for web search synthesis, not deep document memory. When you feed it a dense 5-page master resume, it aggressively trims context to conserve tokens, dropping past achievements and dates.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Persistent Export Failures:</strong> Perplexity's built-in export (Markdown / Word / PDF) frequently breaks formatting, loses bullet indents, mangles special characters, and fails on long structured outputs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Feature Cutbacks & Query Caps:</strong> As you experienced, Perplexity has been tightening Pro tier allowances, throttling Opus/Pro models, and introducing restrictive rate limits while charging $20/month ($240/yr).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>No Bidirectional Knowledge Graph:</strong> A chat interface cannot store state or "harvest" newly polished bullets back into a single source of truth. Every new chat starts from scratch.
              </span>
            </li>
          </ul>
        </div>

        {/* AI Studio & Gemini Free Tier Breakdown */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Why AI Studio + Gemini Free Tier Wins</h3>
              <span className="text-xs text-emerald-400 font-medium">100% Free Forever • Unmatched 1M+ Token Window</span>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>1,000,000+ Token Context Window:</strong> Gemini can ingest your entire 20-year career history, every project, patent, code snippet, and 50 job descriptions simultaneously without dropping a single detail.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Generous Free API Tier:</strong> Google AI Studio provides free API keys with up to <strong>15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), and 1,500 Requests Per Day</strong> on flagship Flash models. No subscription, no credit card required.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Strict Structured JSON Schemas:</strong> Unlike messy chat outputs, Gemini's structured schema enforcement guarantees that every resume generation produces valid, predictable data structures without syntax errors.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Pristine Export Engine:</strong> With this bespoke app, you get native browser print-to-PDF formatting (A4/Letter with margin control), clean Workday/Taleo ATS plain text, and complete JSON backups.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 100% Free Recommended Toolchain */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Zero Subscription Stack</span>
          </div>
          <h2 className="text-xl font-bold text-white">The Ideal 100% Free Career & Research Ecosystem</h2>
          <p className="text-xs text-slate-400 mt-1">
            To eliminate monthly SaaS fees and export frustrations forever, combine these free tools:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tool 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">This OmniBase App</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">100% Free</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Role:</strong> Master Career Dossier, Gemini-powered tailoring, ATS matching, knowledge harvesting, and pristine PDF/Markdown/ATS export.
            </p>
            <div className="text-[10px] text-slate-500">Runs locally in browser with instant sync.</div>
          </div>

          {/* Tool 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Obsidian</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">100% Free</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Role:</strong> Offline career knowledge vault. Keep local Markdown notes of interview retrospectives, project post-mortems, and technical architectures.
            </p>
            <div className="text-[10px] text-slate-500">Local files, no cloud lock-in.</div>
          </div>

          {/* Tool 3 */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Typst or Overleaf (LaTeX)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">100% Free Tier</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Role:</strong> If you ever need pixel-perfect academic or mathematical typesetting for research papers or specialized technical publications.
            </p>
            <div className="text-[10px] text-slate-500">Overleaf free tier provides unlimited projects.</div>
          </div>
        </div>
      </div>

      {/* Pro Tips for the Master Resume Workflow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Strategic Workflow Checklist: How to Maximize This App</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-white block mb-0.5">Keep the Master Resume Deliberately Overloaded</strong>
              Do not worry about page count in the Master Dossier! Include every internal tooling metric, side experiment, customer quote, and minor certification. The AI needs rich raw material to synthesize the best 1-page resume.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-white block mb-0.5">Always Check the "Harvest Hub" After Tailoring</strong>
              When Gemini writes a sharper bullet point or identifies a crucial modern technical keyword for a role at Stripe or Google, hit <strong>"Accept & Enrich Master"</strong>. That way, future resumes for other companies will automatically inherit that polished phrasing!
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-white block mb-0.5">Use "Copy ATS Text" for Workday & Taleo Forms</strong>
              Applicant Tracking Systems often have clunky copy-paste boxes that garble PDF special symbols. Use the <strong>"Copy ATS Text"</strong> button in the viewer to get clean, unformatted plain text with bullet markers that parse cleanly into automated HR forms.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              4
            </span>
            <div>
              <strong className="text-white block mb-0.5">Obsidian ➔ Word Export Pipeline</strong>
              Clicking <strong>"Copy Markdown (Obsidian)"</strong> or <strong>"Save .md"</strong> produces clean GitHub-flavored markdown. When pasted into Obsidian, it renders headers, bold metrics, and lists cleanly. To convert to Word (`.docx`), open Word and choose "Paste formatted text", or install the free Obsidian <strong>Pandoc Plugin</strong> to export notes directly into `.docx` with your favorite styling.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
