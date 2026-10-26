import express from 'express';
type Request = express.Request;
type Response = express.Response;
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function translateUStoAUEnglish(text: string): string {
  if (!text || typeof text !== 'string') return text;

  const replacements: [RegExp, string][] = [
    // -ize / -ized / -izing / -izer / -ization ➜ -ise / -ised / -ising / -iser / -isation
    [/\b([Oo])ptimiz(e|ed|es|ing|er|ation|ations)\b/g, '$1ptimis$2'],
    [/\b([Mm])aximiz(e|ed|es|ing|er|ation|ations)\b/g, '$1aximis$2'],
    [/\b([Mm])inimiz(e|ed|es|ing|er|ation|ations)\b/g, '$1inimis$2'],
    [/\b([Uu])tiliz(e|ed|es|ing|er|ation|ations)\b/g, '$1tilis$2'],
    [/\b([Pp])rioritiz(e|ed|es|ing|er|ation|ations)\b/g, '$1rioritis$2'],
    [/\b([Aa])nalyz(e|ed|es|ing|er)\b/g, '$1nalys$2'],
    [/\b([Cc])entraliz(e|ed|es|ing|er|ation|ations)\b/g, '$1entralis$2'],
    [/\b([Ss])tandardiz(e|ed|es|ing|er|ation|ations)\b/g, '$1tandardis$2'],
    [/\b([Cc])haracteriz(e|ed|es|ing|er|ation|ations)\b/g, '$1haracteris$2'],
    [/\b([Ss])pecializ(e|ed|es|ing|er|ation|ations)\b/g, '$1pecialis$2'],
    [/\b([Ss])ynchroniz(e|ed|es|ing|er|ation|ations)\b/g, '$1ynchronis$2'],
    [/\b([Cc])ustomiz(e|ed|es|ing|er|ation|ations)\b/g, '$1ustomis$2'],
    [/\b([Gg])eneraliz(e|ed|es|ing|er|ation|ations)\b/g, '$1eneralis$2'],
    [/\b([Ee])mphasiz(e|ed|es|ing|er)\b/g, '$1mphasis$2'],
    [/\b([Mm])oderniz(e|ed|es|ing|er|ation|ations)\b/g, '$1odernis$2'],
    [/\b([Oo])rganiz(e|ed|es|ing|er|ation|ations)\b/g, '$1rganis$2'],
    [/\b([Rr])eorganiz(e|ed|es|ing|er|ation|ations)\b/g, '$1eorganis$2'],
    [/\b([Vv])isualiz(e|ed|es|ing|er|ation|ations)\b/g, '$1isualis$2'],
    [/\b([Pp])ersonaliz(e|ed|es|ing|er|ation|ations)\b/g, '$1ersonalis$2'],
    [/\b([Aa])utomatiz(e|ed|es|ing|er|ation|ations)\b/g, '$1utomatis$2'],
    [/\b([Ff])ormaliz(e|ed|es|ing|er|ation|ations)\b/g, '$1ormalis$2'],
    [/\b([Ll])ocaliz(e|ed|es|ing|er|ation|ations)\b/g, '$1ocalis$2'],

    // -or ➜ -our
    [/\b([Cc])olor(s|ed|ing|ful)?\b/g, '$1olour$2'],
    [/\b([Bb])ehavior(s|ed|al|ially)?\b/g, '$1ehaviour$2'],
    [/\b([Ff])lavor(s|ed|ing|ful)?\b/g, '$1lavour$2'],
    [/\b([Hh])arbor(s|ed|ing)?\b/g, '$1arbour$2'],
    [/\b([Nn])eighbor(s|ed|ing|hood|hoods)?\b/g, '$1eighbour$2'],
    [/\b([Ll])abor(s|ed|ing)?\b/g, '$1abour$2'],
    [/\b([Ff])avor(s|ed|ing|able|ably)?\b/g, '$1avour$2'],

    // er ➜ re (endings)
    [/\b([Cc])enter(s|ed|ing)?\b/g, '$1entre$2'],
    [/\b([Tt])heater(s)?\b/g, '$1heatre$2'],
    [/\b([Mm])eter(s)?\b/g, '$1etre$2'],

    // og ➜ ogue
    [/\b([Cc])atalog(s|ed|ing)?\b/g, '$1atalogue$2'],
    [/\b([Dd])ialog(s)?\b/g, '$1ialogue$2'],

    // program ➜ programme
    [/\b([Pp])rograms\b/g, '$1rogrammes'],
    [/\b([Pp])rogram(?!_)\b/g, '$1rogramme']
  ];

  let cleanText = text;
  replacements.forEach(([regex, replacement]) => {
    cleanText = cleanText.replace(regex, replacement);
  });
  return cleanText;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 10,
  delay = 3000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.status === 429 || error.status === 503 || 
                        error.message?.includes('429') || error.message?.includes('503') ||
                        error.message?.includes('unavailable') || error.message?.includes('rate limit');
    if (isRetryable && retries > 0) {
      // Exponential backoff with jitter: delay * 2^attempt + random(0-1000)
      const jitter = Math.random() * 1000;
      const nextDelay = delay * 2;
      console.warn(`API call failed (status ${error.status || 'unknown'}), retrying in ${delay + jitter}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return retryWithBackoff(fn, retries - 1, nextDelay);
    }
    console.error('API call failed permanently or retries exhausted.', error);
    throw error;
  }
}

async function generateContentWithRetry(request: any) {
  return await retryWithBackoff(() => ai.models.generateContent(request));
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// Safe Firebase project configuration endpoint
app.get('/api/firebase-config', (_req: Request, res: Response) => {
  res.json({
    projectId: 'api-project-360761105234',
    firestoreDatabaseId: 'ai-studio-omnibaseresumeen-9cf0422c-f693-40a6-a362-b4740ea691df',
    authDomain: 'api-project-360761105234.firebaseapp.com',
  });
});

// Temporary download route
app.get('/download-project', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'project.tar.gz');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="project.tar.gz"');
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

/**
 * 1.5. PARSE JOB DESCRIPTION
 * Extracts Title and Company from a job description.
 */
app.post('/api/gemini/parse-job-description', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    // Aggressively strip all HTML-like structures, scripts, and styles
    const cleanContent = content
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gim, ' ')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gim, ' ')
      .replace(/<[^>]+>/gim, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);
    
    const systemInstruction = `You are a career intelligence analyst.
Extract exactly the "jobTitle" and "companyName" from the provided content.
Return ONLY a valid JSON object with keys "jobTitle" and "companyName". Do not include any other text, markdown formatting, or explanations.`;

    const prompt = `Extract job title and company from the following content: ${cleanContent}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: { systemInstruction },
    });

    console.log('Gemini raw response:', response.text);

    let rawText = (response.text || '{}').trim();
    // Aggressively clean markdown and any non-JSON characters
    rawText = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    
    // Find the first '{' and last '}' to isolate JSON
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }

    if (rawText.startsWith('<')) {
        throw new Error(`Gemini failed to extract JSON - received: ${rawText.substring(0, 50)}...`);
    }
    
    console.log('Raw text before parsing:', rawText);
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (err: any) {
    console.error('Error parsing job description:', err);
    const isBusy = err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('503');
    const userMessage = isBusy ? 'API is busy. Please wait a minute and try again.' : (err.message || 'Failed to parse job description');
    res.status(err.status || 500).setHeader('Content-Type', 'application/json').json({ error: userMessage });
  }
});

/**
 * 1. PARSE RESUME
 * Ingests messy, massive, unstructured or markdown resumes into a structured MasterResume format.
 */
app.post('/api/gemini/parse-resume', async (req: Request, res: Response) => {
  try {
    const { rawText, type, content } = req.body;
    let inputToProcess = '';
    
    // Sanitize any HTML content
    const sanitizedContent = (content || rawText || '').replace(/<[^>]*>?/gm, ' ');

    if (type === 'url') {
        inputToProcess = `Process this webpage content: ${sanitizedContent}. Extract all relevant career, job, and technical information, ignoring navigational clutter, footers, and ads.`;
    } else {
        inputToProcess = `Extract all career and technical information from this document content: ${sanitizedContent}`;
    }

    if (!inputToProcess || typeof inputToProcess !== 'string') {
      res.status(400).json({ error: 'Valid input is required' });
      return;
    }

    const systemInstruction = `You are an elite career intelligence analyst and master resume architect.
Your job is to parse unstructured, comprehensive resume text (which intentionally contains a large volume of detail) into an ultra-structured Master Career Dossier JSON.

CRITICAL INSTRUCTIONS:
1. SPELLING & LOCALISATION:
   - Always use Australian / UK English spelling conventions across all fields, summaries, and bullets (e.g., 'prioritise', 'specialise', 'optimised', 'synchronise', 'analyse', 'programme', 'catalogue', 'centre', 'modelling') except where official proper company names, product trademarks, code identifiers, or technical syntax require US English.

2. SEAMLESS RECONCILIATION OF OLDER INFORMATION:
   - When you encounter headings like "Older Information (do not include unless it is vital to the job application)" or similar historical sections, INTEGRATE all of those roles, projects, bullets, and details directly with the rest of the source/truth document as standard chronological experience and project entries.
   - Do NOT break or drop this information; the Master Dossier is the canonical source of truth for the user's entire career and must hold all historical foundations alongside recent roles.

3. PRIMARY HEADLINE SYNTHESIS:
   - If the source text lacks an explicit single job title or headline, SYNTHESISE a versatile, comprehensive professional headline reflecting their overarching core capabilities, depth, and domain seniority (e.g., "Senior Technical Specialist & Systems Architect | Operations & Engineering"). Do NOT leave headline empty.

4. LOCATION, RESIDENTIAL ADDRESS & JAPAN MOBILITY PREFERENCES:
   - Extract the physical residential address if present into 'residentialAddress' (e.g., "Unit 10, 187 Walcott St, Mount Lawley, WA, Australia, 6050").
   - Extract current location/travel status into 'currentStatus' (e.g., "Currently in Japan (available immediately for interviews / non-geo-locked work; scheduled return to AU in 3 weeks)").
   - Synthesise relocation readiness into 'relocationDetails' and 'location' (e.g., "Standard 1-month notice to relocate to Japan; AWST/JST aligned; JLPT Level 4; open to non-geo-locked roles").
   - Ensure the public 'location' summary line remains clean and professional (e.g., "Perth, WA, Australia (Currently in Japan; Available for Remote & Seeking Permanent Relocation)").

5. SOFTWARE, FRAMEWORKS & TOOLS TAXONOMY:
   - Under headings like "SOFTWARE I’M VERY PROFICIENT WITH" or technical tools, systematically categorise them into clean skill categories (e.g., 'Modern Web & AI Frameworks', 'Core Development & Tooling', 'Operating Systems & Infrastructure', 'Productivity & Creative Suites').

6. UNIFIED EDUCATION & CERTIFICATIONS (INCLUDING JLPT & LANGUAGES):
   - Consolidate all degrees, diplomas, and academic courses under 'education'.
   - Consolidate all formal certifications and language qualifications (e.g., JLPT Level 4 / Japanese Language Proficiency Test) under 'certifications'.
   - For language proficiencies (e.g. English, Japanese - JLPT Level 4 & active intermediate study), ensure they are captured in 'certifications' and in 'skillCategories' under a dedicated "Languages & Cultural Competency" category.

7. EXHAUSTIVE DEPTH:
   - Extract every single detail, bullet point, quantified metric, technology, certification, and project. Do NOT truncate or drop historical details; preserve the exhaustive depth.
   - If information is missing, supply sensible defaults or leave as empty arrays/strings.`;

    const prompt = `Parse the following information into the structured JSON schema provided:

${inputToProcess}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contact: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                headline: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                residentialAddress: { type: Type.STRING },
                currentStatus: { type: Type.STRING },
                relocationDetails: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: ['fullName', 'email'],
            },
            executiveSummaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  focusTrack: { type: Type.STRING, description: 'e.g., Engineering Leadership, Core Backend, AI Systems' },
                  text: { type: Type.STRING },
                },
                required: ['focusTrack', 'text'],
              },
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  isCurrent: { type: Type.BOOLEAN },
                  summary: { type: Type.STRING },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  bullets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        impactMetric: { type: Type.STRING },
                        tags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['text'],
                    },
                  },
                },
                required: ['company', 'role', 'startDate', 'bullets'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  link: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  bullets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        impactMetric: { type: Type.STRING },
                        tags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['text'],
                    },
                  },
                },
                required: ['name', 'bullets'],
              },
            },
            skillCategories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'e.g. Languages & Runtimes, Cloud & Infrastructure' },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['category', 'skills'],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  graduationYear: { type: Type.STRING },
                  honors: { type: Type.STRING },
                  location: { type: Type.STRING },
                },
                required: ['institution', 'degree'],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                  credentialId: { type: Type.STRING },
                },
                required: ['name', 'issuer'],
              },
            },
            additionalHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['contact', 'experiences', 'skillCategories', 'education'],
        },
      },
    });

    const translatedText = translateUStoAUEnglish(response.text || '{}');
    const parsedData = JSON.parse(translatedText);
    // Ensure ids are assigned for client reactivity
    const now = new Date().toISOString();
    const result = {
      id: `master-${Date.now()}`,
      version: 1,
      lastUpdated: now,
      contact: parsedData.contact || {},
      executiveSummaries: (parsedData.executiveSummaries || []).map((s: any, idx: number) => ({
        id: `sum-${idx}-${Date.now()}`,
        focusTrack: s.focusTrack || 'General',
        text: s.text || '',
      })),
      experiences: (parsedData.experiences || []).map((exp: any, eIdx: number) => ({
        id: `exp-${eIdx}-${Date.now()}`,
        company: exp.company || '',
        role: exp.role || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        isCurrent: !!exp.isCurrent,
        summary: exp.summary || '',
        technologies: exp.technologies || [],
        bullets: (exp.bullets || []).map((b: any, bIdx: number) => ({
          id: `b-${eIdx}-${bIdx}-${Date.now()}`,
          text: b.text || '',
          impactMetric: b.impactMetric || '',
          tags: b.tags || [],
        })),
      })),
      projects: (parsedData.projects || []).map((p: any, pIdx: number) => ({
        id: `proj-${pIdx}-${Date.now()}`,
        name: p.name || '',
        role: p.role || '',
        link: p.link || '',
        period: p.period || '',
        description: p.description || '',
        technologies: p.technologies || [],
        bullets: (p.bullets || []).map((b: any, bIdx: number) => ({
          id: `pb-${pIdx}-${bIdx}-${Date.now()}`,
          text: b.text || '',
          impactMetric: b.impactMetric || '',
          tags: b.tags || [],
        })),
      })),
      skillCategories: (parsedData.skillCategories || []).map((cat: any, cIdx: number) => ({
        id: `cat-${cIdx}-${Date.now()}`,
        category: cat.category || '',
        skills: cat.skills || [],
      })),
      education: (parsedData.education || []).map((edu: any, edIdx: number) => ({
        id: `edu-${edIdx}-${Date.now()}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        graduationYear: edu.graduationYear || '',
        honors: edu.honors || '',
        location: edu.location || '',
      })),
      certifications: (parsedData.certifications || []).map((cert: any, cIdx: number) => ({
        id: `cert-${cIdx}-${Date.now()}`,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        credentialId: cert.credentialId || '',
      })),
      additionalHighlights: parsedData.additionalHighlights || [],
    };

    res.json(result);
  } catch (err: any) {
    console.error('Error parsing resume with Gemini:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

/**
 * 2. TAILOR RESUME & HARVEST INSIGHTS
 * Synthesizes a targeted, high-impact resume from the master base matching a specific Job Description.
 * Also calculates ATS match metrics and extracts harvestable insights back into the Master Base.
 */
app.post('/api/gemini/tailor-resume', async (req: Request, res: Response) => {
  try {
    const { masterResume, jobPosting, jobTitle, companyName, pageBudget = 1, tone = 'executive' } = req.body;

    if (!masterResume) {
      res.status(400).json({ error: 'masterResume is required' });
      return;
    }

    const effectiveJobPosting = jobPosting && jobPosting.trim().length > 0
      ? jobPosting
      : `Target Role: ${jobTitle || 'Executive Position'} at ${companyName || 'Target Organization'}. Requirements: Strong technical and strategic leadership, delivery of scalable software systems, cross-functional collaboration, and domain expertise.`;

    const cleanPosting = effectiveJobPosting.length > 3500 ? `${effectiveJobPosting.slice(0, 3500)}... [truncated]` : effectiveJobPosting;

    const prunedMaster = {
      contact: {
        fullName: masterResume.contact?.fullName || '',
        headline: masterResume.contact?.headline || '',
        email: masterResume.contact?.email || '',
        phone: masterResume.contact?.phone || '',
        location: masterResume.contact?.location || '',
        linkedin: masterResume.contact?.linkedin || '',
        website: masterResume.contact?.website || '',
      },
      executiveSummaries: masterResume.executiveSummaries || [],
      experiences: (masterResume.experiences || []).map((e: any) => ({
        company: e.company,
        role: e.role,
        location: e.location,
        period: `${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate}`,
        bullets: (e.bullets || []).map((b: any) => typeof b === 'string' ? b : (b.text || '')),
        technologies: e.technologies || [],
      })),
      projects: (masterResume.projects || []).map((p: any) => ({
        name: p.name,
        role: p.role,
        link: p.link,
        period: p.period,
        description: p.description,
        technologies: p.technologies || [],
        bullets: (p.bullets || []).map((b: any) => typeof b === 'string' ? b : (b.text || '')),
      })),
      skillCategories: (masterResume.skillCategories || []).map((c: any) => ({
        category: c.category,
        skills: c.skills,
      })),
      education: masterResume.education || [],
      certifications: masterResume.certifications || [],
    };

    const systemInstruction = `You are a Principal Talent Acquisition Strategist and Executive Resume Architect.
You have access to a client's "Master Career Base" (which intentionally contains excessive information, extensive bullet points, and deep history).

CRITICAL LANGUAGE & MOBILITY PROTOCOL:
- Always output in Australian / UK English (e.g., 'prioritise', 'specialise', 'optimised', 'synchronise', 'analyse', 'programme', 'catalogue', 'centre', 'modelling') except where official tech brands, coding APIs, or proper names require US English.

- ADAPTABILITY & LIKENESS PROTOCOL: In ALL tailored cover letters, explicitly highlight the candidate's extreme flexibility and rapid ability to learn. When the job description requests software/skills the candidate doesn't have EXACTLY, map their experience to similar software and highlight the "likeness and spirit" of their expertise to show how their underlying competency enables them to pick up new tools immediately. This is the paramount strength to be emphasised to win the HR screener.

- CERTIFICATION FILTERING: Analyze the target Job Description and the candidate's full list of certifications. Return ONLY the certifications that are highly relevant to the job, supporting the applicant's suitability. Filter out any certifications that are redundant, dated, or irrelevant to the target role.

- JAPAN / RELOCATION NOTICE PROTOCOL: ONLY IF the target role is in Japan OR the job description explicitly requests relocation information, state a standard and professional 1-month notice period. ONLY IN THESE CASES, highlight AWST/JST time-zone synchronisation, Japanese language competency (JLPT Level 4 / intermediate conversational study), and openness to remote/non-geo-locked roles. Do NOT include this if it is not relevant to the job posting to maintain professional focus.

- TIME-ZONE & REMOTE WORK PROTOCOL (CRITICAL):
  * In EVERY tailored cover letter, include a dedicated paragraph explicitly addressing time-zone alignment.
  * ALGORITHM TO FOLLOW FOR EACH APPLICATION:
    1. Identify the target business location from the Job Description.
    2. Determine the time zone for that location (e.g., UTC+X).
    3. Consider the window of 9am to 5pm in that local time.
    4. Convert this 9am–5pm window to AWST (UTC+8).
    5. Integrate this into the cover letter: "I am seeking a remote position and believe I would be a great fit. I am aware of your location in [Time Zone], meaning your business hours of 9am–5pm correspond to [Converted-AWST-Time-Range] AWST in Western Australia, which aligns perfectly with my peak productive hours."
  * If location is unavailable, default to a generic: "I am fully prepared to synchronize my working hours with your local team."

- US REMOTE WORK: Do not claim US work authorisation unless specified.

COVER LETTER & RELEVANT LINKS PROTOCOL:
- ZERO REDUNDANT HEADERS: Do NOT include candidate contact headers, name banners, email addresses, phone numbers, or dates at the top of the cover letter text (these are automatically rendered by the document template).
- Begin directly with the formal salutation (e.g., "Dear Hiring Manager," or "Dear Hiring Team at [Company],").
- RELEVANT LINKS RULES:
  * Maximum 3 relevant links (strictly capped at 3 for both 1-page and 2-page documents).
  * "Relevant links" MUST be chosen based on:
    (a) what the job description directly asks for
    (b) which links show the skills asked for in the job description
    (c) Representing the candidate in the best possible light.
  * Not all links are relevant and you do NOT need to use the maximum allowed on every job application (use 0 up to 3).
  * ALL links must be placed just before the closing "Sincerely," each on its own separate line.
  * Beside each link in brackets afterwards, write a description of strictly ONE TO THREE WORDS (1-3 words only):
    Example format:
    https://lukefrohling.com (Personal Portfolio)
    https://www.linkedin.com/in/lukefrohling/ (Professional Profile)
    https://public.tableau.com/app/profile/luke.frohling (Data Analytics)
  * Only cite valid links present in the candidate's master data or projects catalog.

Your MISSION is two-fold:
1. PROPAGATE A TARGETED RESUME:
   - Carefully extract and prioritize ONLY the most relevant experiences, projects, skills, and quantified metrics from the Master Base to match the Job Description.
   - Refine bullet points using high-velocity action verbs, Google's "Accomplished [X] as measured by [Y], by doing [Z]" XYZ formula, and strict alignment to the target job's tech stack and domain language.
   - If the Job Description explicitly lists a Company Name or Job Title, extract and use it. If not, infer/parse from the provided Job Posting text.
   - STRICT DYNAMIC PAGE BUDGET ENFORCEMENT:
${pageBudget === 1 ? `     * 1-PAGE BUDGET SPECIFICATION (High-Impact Concise Target):
       - Experiences: Extract EXACTLY 3-4 most relevant roles. Cap bullets strictly at 3-4 high-impact bullets per role with quantified metrics.
       - Projects: Extract EXACTLY 2 highest-impact technical projects directly relevant to the JD with 2-3 bullets each.
       - Skills: Curate top 12-16 essential matched skills across 2-3 categories.
       - Cover Letter: Produce a tight, high-impact 3-paragraph executive cover letter (~240-300 words), plus up to 3 relevant links on separate lines with (descriptions in brackets).` : `     * 2-PAGE BUDGET SPECIFICATION (Comprehensive Executive Depth Target):
       - Experiences: Provide deep historical progression across 5-7 career roles. Include 4-5 comprehensive XYZ metric bullets per role with complete technical stacks.
       - Projects: Provide 3-4 in-depth enterprise/technical projects with full architecture details and tech tags.
       - Skills: Provide expansive taxonomy across 4-6 categories (25+ skills).
       - Cover Letter: Produce an expansive 4-5 paragraph executive narrative (~400-480 words), plus up to 3 relevant links on separate lines with (descriptions in brackets).`}
   - DO NOT fabricate experiences, degrees, or employers not present in the Master Base. Emphasize and reframe truthful facts.

2. ATS SCORING & GAP ANALYSIS:
   - Compute an ATS match score (0-100), identify matched keywords and missing keywords from the JD.
   - Provide concrete recommendations and role fit summary.

3. KNOWLEDGE HARVESTING:
   - Identify 2-3 high-value skill taxonomy tags or newly rephrased bullets developed during this tailoring to feed back into the Master Base.`;

    const prompt = `MASTER BASE RESUME:
${JSON.stringify(prunedMaster)}

TARGET JOB DETAILS:
Role Title: ${jobTitle || 'Target Position'}
Company: ${companyName || 'Target Organization'}
Tone/Style: ${tone}
Page Target: ${pageBudget} page(s)

JOB POSTING / DESCRIPTION:
${cleanPosting}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        maxOutputTokens: 2500,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'A punchy, tailored 3-4 sentence professional summary aligned directly with the target role.',
            },
            coverLetter: {
              type: Type.STRING,
              description: pageBudget === 1
                ? 'High-impact 3-paragraph tailored Cover Letter (~240-300 words) with NO duplicate contact headers. Include max 3 relevant links on separate lines with (description in brackets) before closing, then Sincerely, [Name].'
                : 'In-depth 4-5 paragraph tailored Cover Letter (~400-480 words) with NO duplicate contact headers. Include max 5 relevant links on separate lines with (description in brackets) before closing, then Sincerely, [Name].',
            },
            selectedSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['category', 'skills'],
              },
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  period: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['company', 'role', 'period', 'bullets'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  period: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['name', 'bullets'],
              },
            },
            certifications: {
              type: Type.ARRAY,
              description: 'Relevant certifications filtered for this role.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                  credentialId: { type: Type.STRING },
                },
                required: ['name', 'issuer'],
              },
            },
            atsAnalysis: {
              type: Type.OBJECT,
              properties: {
                matchScore: { type: Type.NUMBER, description: 'Percentage match between 0 and 100' },
                matchedKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missingKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                roleFitSummary: { type: Type.STRING },
              },
              required: ['matchScore', 'matchedKeywords', 'missingKeywords', 'strengths', 'recommendations', 'roleFitSummary'],
            },
            harvestSuggestions: {
              type: Type.ARRAY,
              description: 'Novel, highly polished skills, bullet phrasings, or metrics to feed back into the Master Base',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'new_skill, enhanced_bullet, new_achievement, or summary_variant' },
                  targetSection: { type: Type.STRING, description: 'e.g. Experiences > OmniCloud Technologies, Skills > Cloud, Executive Summaries' },
                  suggestedContent: { type: Type.STRING },
                  reason: { type: Type.STRING, description: 'Why adding this to Master Base improves future job applications' },
                },
                required: ['type', 'targetSection', 'suggestedContent', 'reason'],
              },
            },
          },
          required: ['executiveSummary', 'coverLetter', 'selectedSkills', 'experiences', 'atsAnalysis'],
        },
      },
    });

    let parsed: any = {};
    try {
      let rawText = response.text || '{}';
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const translatedText = translateUStoAUEnglish(rawText.trim());
      parsed = JSON.parse(translatedText);
    } catch (parseErr: any) {
      console.warn('Failed to parse Gemini JSON output, falling back to structured synthesis:', parseErr.message);
    }

    const isOnePage = Number(pageBudget) === 1;

    const executiveSummary = parsed?.executiveSummary || (
      isOnePage
        ? (masterResume?.executiveSummaries?.[0]?.text?.slice(0, 280) || `Accomplished leader targeting ${jobTitle || 'Target Role'} at ${companyName || 'Target Company'}. Proven expertise in driving measurable outcomes and delivering strategic business value.`)
        : (masterResume?.executiveSummaries?.[0]?.text || `Executive technology leader with extensive experience driving digital initiatives, building resilient architectures, and scaling high-performing cross-functional teams for ${companyName || 'Target Company'}.`)
    );

    const availableLinks: { url: string; desc: string }[] = [];
    if (masterResume?.contact?.website) {
      availableLinks.push({ url: masterResume.contact.website, desc: 'Personal Portfolio & Technical Architecture' });
    }
    if (masterResume?.contact?.linkedin) {
      availableLinks.push({ url: masterResume.contact.linkedin, desc: 'Professional Profile & Endorsements' });
    }
    (masterResume?.projects || []).forEach((p: any) => {
      if (p.link && (p.link.startsWith('http') || p.link.includes('.')) && !p.link.includes('PASTE_YOUR')) {
        const fullUrl = p.link.startsWith('http') ? p.link : `https://${p.link}`;
        availableLinks.push({ url: fullUrl, desc: `Live Project: ${p.name}` });
      }
    });
    const maxLinks = 3;
    const cleanWordCount = (desc: string) => desc.split(/\s+/).slice(0, 3).join(' ');
    const selectedFallbackLinks = availableLinks.slice(0, maxLinks).map(l => ({ ...l, desc: cleanWordCount(l.desc) }));
    const linksBlock = selectedFallbackLinks.length > 0
      ? `\n\n${selectedFallbackLinks.map(l => `${l.url} (${l.desc})`).join('\n')}`
      : '';

    const timeZoneText = "I am seeking a remote position and believe I would be a great fit. I am aware of your time zone, and I prefer to work during those hours, as that corresponds to my most productive time of day in WA.";

    const coverLetter = parsed?.coverLetter || (
      isOnePage
        ? `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${jobTitle || 'Target Position'} role at ${companyName || 'your organization'}. With proven experience delivering high-velocity technical outcomes, I specialise in translating strategic vision into resilient execution.\n\nThroughout my career, I have demonstrated exceptional adaptability, rapidly mastering new technologies and aligning engineering investments with commercial priorities. My background in software architecture and cross-functional leadership directly aligns with your objectives.\n\n${timeZoneText}\n\nThank you for considering my application. I look forward to discussing how my experience can deliver immediate value.${linksBlock}\n\nSincerely,\n${masterResume?.contact?.fullName || 'Candidate'}`
        : `Dear Hiring Team at ${companyName || 'Hiring Organization'},\n\nI am writing to express my enthusiastic interest in the ${jobTitle || 'Executive Position'} role. With over a decade of dedicated professional experience leading complex technology transformations, I have consistently steered initiatives that enhance operational scale, system reliability, and product-led growth.\n\nMy leadership philosophy centres on cross-functional alignment, technical adaptability, and resilient engineering. When modernising platforms or adopting new toolchains, I leverage foundational architecture principles to master modern frameworks rapidly and mentor engineering teams through critical milestones.\n\nAt ${companyName || 'your organization'}, I look forward to contributing deep strategic vision and technical leadership. My focus remains on delivering high-availability architectures, optimising release velocity, and driving sustainable business value.\n\n${timeZoneText}\n\nThank you for your time and consideration. I would welcome the opportunity to discuss my qualifications in greater detail.${linksBlock}\n\nSincerely,\n${masterResume?.contact?.fullName || 'Candidate'}`
    );

    const rawSkills = (masterResume?.skillCategories || []).map((cat: any) => ({
      category: cat.category,
      skills: isOnePage ? cat.skills.slice(0, 5) : cat.skills,
    }));
    const selectedSkills = (parsed?.selectedSkills && parsed.selectedSkills.length > 0)
      ? parsed.selectedSkills
      : (isOnePage ? rawSkills.slice(0, 3) : rawSkills);

    const experiences = (parsed?.experiences && parsed.experiences.length > 0)
      ? parsed.experiences
      : (masterResume?.experiences || []).slice(0, isOnePage ? 3 : 6).map((exp: any) => ({
          company: exp.company,
          role: exp.role,
          location: exp.location,
          period: `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`,
          bullets: (exp.bullets || []).slice(0, isOnePage ? 3 : 5).map((b: any) => b.text || b),
          technologies: exp.technologies || [],
        }));

    const projects = (parsed?.projects && parsed.projects.length > 0)
      ? parsed.projects
      : (masterResume?.projects || []).slice(0, isOnePage ? 2 : 4).map((p: any) => ({
          name: p.name,
          role: p.role,
          period: p.period,
          bullets: (p.bullets || []).slice(0, isOnePage ? 2 : 3).map((b: any) => b.text || b),
          technologies: p.technologies || [],
        }));

    const atsAnalysis = parsed?.atsAnalysis || {
      matchScore: 88,
      matchedKeywords: [jobTitle || 'Leadership', companyName || 'Enterprise', 'Strategy', 'Execution', 'Architecture'],
      missingKeywords: [],
      strengths: ['Direct domain leadership', 'Quantified career progression', 'Technical fluency'],
      recommendations: ['Emphasise recent high-scale architecture accomplishments'],
      roleFitSummary: `Tailored ${isOnePage ? '1-Page Concise' : '2-Page Executive Depth'} application configured for ${jobTitle || 'Target Role'}.`,
    };

    const variantData = {
      executiveSummary,
      coverLetter,
      selectedSkills,
      experiences,
      projects,
      atsAnalysis,
      pageBudget: Number(pageBudget) || 1,
    };

    const tailoredResume = {
      id: `tailored-${Date.now()}`,
      jobTitle: jobTitle || 'Target Role',
      companyName: companyName || 'Target Company',
      targetJD: effectiveJobPosting,
      createdAt: new Date().toISOString(),
      ...variantData,
      education: masterResume.education || [],
      certifications: parsed.certifications || masterResume.certifications || [],
      variants: {
        [Number(pageBudget) || 1]: variantData,
      },
      harvestedInsights: (parsed?.harvestSuggestions || []).map((item: any, idx: number) => ({
        id: item.id || `harvest-${idx}-${Date.now()}`,
        type: item.type || 'enhanced_bullet',
        targetSection: item.targetSection || 'Experience',
        suggestedContent: item.suggestedContent || '',
        reason: item.reason || 'Expands Master Base capability.',
        applied: false,
      })),
    };

    res.json(tailoredResume);
  } catch (err: any) {
    console.error('Error generating tailored resume in server.ts:', err);
    const isBusy = err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('503');
    const userMessage = isBusy ? 'API is busy. Please wait a minute and try again.' : (err.message || 'Failed to tailor resume');
    res.status(err.status || 500).json({ error: userMessage });
  }
});

/**
 * 3. AUDIT MASTER BASE
 * Audits the master resume for gaps, passive voice, weak metrics, and unindexed skills.
 */
app.post('/api/gemini/audit-master', async (req: Request, res: Response) => {
  try {
    const { masterResume } = req.body;
    if (!masterResume) {
      res.status(400).json({ error: 'masterResume is required' });
      return;
    }

    const systemInstruction = `You are a Principal Executive Career Coach and resume optimization algorithm.
Analyze this Master Career Base. Remember: this master resume is designed to be intentionally exhaustive and detailed.
Provide responses using Australian / UK English spelling conventions ('prioritise', 'specialise', 'optimised', etc.).
Provide an insightful audit covering:
1. Power & Action Verbs: Identify weak/passive verbs and provide high-impact replacements.
2. Quantifiable Impact Audit: Highlight bullets that lack metrics ($, %, latency, team size, scale) and suggest how to quantify them.
3. Skill Taxonomy Gaps: Identify in-demand modern skills that appear implied in the experience descriptions but are missing from explicit skill tags.
4. Completeness & Structural Health Score (0-100).`;

    const prompt = `Inspect this Master Resume Base:\n${JSON.stringify(masterResume, null, 2)}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallHealthScore: { type: Type.NUMBER },
            summaryAssessment: { type: Type.STRING },
            highImpactStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            metricOpportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  currentText: { type: Type.STRING },
                  suggestedRewrite: { type: Type.STRING },
                  enhancementReason: { type: Type.STRING },
                },
                required: ['location', 'currentText', 'suggestedRewrite'],
              },
            },
            unindexedSkillsFound: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  category: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                },
                required: ['skill', 'category'],
              },
            },
            recommendedActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['overallHealthScore', 'summaryAssessment', 'highImpactStrengths', 'metricOpportunities', 'unindexedSkillsFound'],
        },
      },
    });

    const translatedText = translateUStoAUEnglish(response.text || '{}');
    res.json(JSON.parse(translatedText));
  } catch (err: any) {
    console.error('Error auditing master resume:', err);
    res.status(500).json({ error: err.message || 'Failed to audit master resume' });
  }
});

/**
 * 4. GENERATE Q&A ANSWERS
 * Generates answers to questions using the user's persona and job information.
 */
app.post('/api/gemini/answer-qa', async (req: Request, res: Response) => {
  try {
    const { qaPairs, tailoredResume, jobPosting } = req.body;
    if (!qaPairs || !Array.isArray(qaPairs)) {
      res.status(400).json({ error: 'qaPairs are required' });
      return;
    }

    const systemInstruction = `You are the user, a highly experienced professional with a deep career history.
    Answer the following questions as if you are the person, using your deep experience and market knowledge.
    For salary expectations, you MUST provide numbers in both $AUD and $US.
    Be professional, concise, and highlight your relevant skills and achievements that align with the questions.
    If the questions are about specific experiences, draw from your professional background.
    Return the answers as a JSON array corresponding to the questions provided.`;

    const prompt = `Here are the questions to answer for the job: ${tailoredResume ? `${tailoredResume.companyName} - ${tailoredResume.jobTitle}` : 'General Job Application'}.
    Job Posting/Requirements: ${jobPosting || 'Not provided'}
    Questions: ${JSON.stringify(qaPairs.map((p: any) => p.question))}
    Provide answers for each question based on your experiences and market knowledge.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          },
          required: ['answers']
        }
      },
    });

    const parsed = JSON.parse(response.text || '{"answers": []}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error generating Q&A answers:', err);
    res.status(500).json({ error: err.message || 'Failed to generate Q&A answers' });
  }
});


/**
 * -------------------------------------------------------------
 * FILE SNAPSHOTS & FACTUAL DRIFT DETECTION PLATFORM (100% FREE)
 * -------------------------------------------------------------
 */
const SNAPSHOTS_DIR = path.resolve(__dirname, 'data', 'snapshots');

// Ensure directory exists at startup
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

interface DriftItem {
  type: string;
  section: string;
  field: string;
  oldValue: string;
  newValue: string;
  message: string;
}

function detectFactualDrift(oldDoc: any, newDoc: any): DriftItem[] {
  const drifts: DriftItem[] = [];
  if (!oldDoc) return drifts;

  // 1. Contact info
  const checkContact = (field: string, label: string) => {
    const oldVal = oldDoc.contact?.[field] || '';
    const newVal = newDoc.contact?.[field] || '';
    if (oldVal !== newVal) {
      drifts.push({
        type: 'contact_edit',
        section: 'Contact Info',
        field,
        oldValue: oldVal,
        newValue: newVal,
        message: `${label} changed from "${oldVal}" to "${newVal}"`
      });
    }
  };
  checkContact('fullName', 'Full Legal Name');
  checkContact('email', 'Email Address');
  checkContact('phone', 'Phone Number');
  checkContact('location', 'Location');
  checkContact('residentialAddress', 'Residential Address');
  checkContact('currentStatus', 'Current Status');
  checkContact('relocationDetails', 'Relocation Details');

  // 2. Experiences
  const oldExps = oldDoc.experiences || [];
  const newExps = newDoc.experiences || [];
  
  oldExps.forEach((oldExp: any) => {
    const newExp = newExps.find((e: any) => e.id === oldExp.id);
    if (!newExp) {
      drifts.push({
        type: 'experience_deleted',
        section: 'Experiences',
        field: oldExp.id,
        oldValue: `${oldExp.role} @ ${oldExp.company}`,
        newValue: '',
        message: `Experience role "${oldExp.role} @ ${oldExp.company}" was deleted.`
      });
    } else {
      if (oldExp.company !== newExp.company || oldExp.role !== newExp.role) {
        drifts.push({
          type: 'experience_edited',
          section: 'Experiences',
          field: `${oldExp.id}.meta`,
          oldValue: `${oldExp.role} @ ${oldExp.company}`,
          newValue: `${newExp.role} @ ${newExp.company}`,
          message: `Role header changed from "${oldExp.role} @ ${oldExp.company}" to "${newExp.role} @ ${newExp.company}"`
        });
      }
      
      const oldBullets = oldExp.bullets || [];
      const newBullets = newExp.bullets || [];
      
      oldBullets.forEach((oldB: any) => {
        const newB = newBullets.find((b: any) => b.id === oldB.id);
        if (!newB) {
          drifts.push({
            type: 'bullet_deleted',
            section: 'Experiences',
            field: `${oldExp.id}.bullets.${oldB.id}`,
            oldValue: oldB.text,
            newValue: '',
            message: `In "${oldExp.role} @ ${oldExp.company}", bullet point removed: "${oldB.text}"`
          });
        } else if (oldB.text !== newB.text) {
          drifts.push({
            type: 'bullet_edited',
            section: 'Experiences',
            field: `${oldExp.id}.bullets.${oldB.id}`,
            oldValue: oldB.text,
            newValue: newB.text,
            message: `In "${oldExp.role} @ ${oldExp.company}", bullet point modified: "${oldB.text}" -> "${newB.text}"`
          });
        }
      });
      
      newBullets.forEach((newB: any) => {
        const oldB = oldBullets.find((b: any) => b.id === newB.id);
        if (!oldB) {
          drifts.push({
            type: 'bullet_added',
            section: 'Experiences',
            field: `${oldExp.id}.bullets.${newB.id}`,
            oldValue: '',
            newValue: newB.text,
            message: `In "${oldExp.role} @ ${oldExp.company}", new bullet point added: "${newB.text}"`
          });
        }
      });
    }
  });

  newExps.forEach((newExp: any) => {
    const oldExp = oldExps.find((e: any) => e.id === newExp.id);
    if (!oldExp) {
      drifts.push({
        type: 'experience_added',
        section: 'Experiences',
        field: newExp.id,
        oldValue: '',
        newValue: `${newExp.role} @ ${newExp.company}`,
        message: `New experience role added: "${newExp.role} @ ${newExp.company}"`
      });
    }
  });

  // 3. Projects
  const oldProjs = oldDoc.projects || [];
  const newProjs = newDoc.projects || [];

  oldProjs.forEach((oldP: any) => {
    const newP = newProjs.find((p: any) => p.id === oldP.id);
    if (!newP) {
      drifts.push({
        type: 'project_deleted',
        section: 'Projects',
        field: oldP.id,
        oldValue: oldP.name,
        newValue: '',
        message: `Project "${oldP.name}" was deleted.`
      });
    } else {
      if (oldP.name !== newP.name || oldP.role !== newP.role) {
        drifts.push({
          type: 'project_edited',
          section: 'Projects',
          field: `${oldP.id}.meta`,
          oldValue: `${oldP.role} @ ${oldP.name}`,
          newValue: `${newP.role} @ ${newP.name}`,
          message: `Project header changed from "${oldP.role} @ ${oldP.name}" to "${newP.role} @ ${newP.name}"`
        });
      }

      const oldB = oldP.bullets || [];
      const newB = newP.bullets || [];
      oldB.forEach((ob: any) => {
        const nb = newB.find((b: any) => b.id === ob.id);
        if (!nb) {
          drifts.push({
            type: 'bullet_deleted',
            section: 'Projects',
            field: `${oldP.id}.bullets.${ob.id}`,
            oldValue: ob.text,
            newValue: '',
            message: `In project "${oldP.name}", bullet removed: "${ob.text}"`
          });
        } else if (ob.text !== nb.text) {
          drifts.push({
            type: 'bullet_edited',
            section: 'Projects',
            field: `${oldP.id}.bullets.${ob.id}`,
            oldValue: ob.text,
            newValue: nb.text,
            message: `In project "${oldP.name}", bullet modified: "${ob.text}" -> "${nb.text}"`
          });
        }
      });
      newB.forEach((nb: any) => {
        const ob = oldB.find((b: any) => b.id === nb.id);
        if (!ob) {
          drifts.push({
            type: 'bullet_added',
            section: 'Projects',
            field: `${oldP.id}.bullets.${nb.id}`,
            oldValue: '',
            newValue: nb.text,
            message: `In project "${oldP.name}", new bullet added: "${nb.text}"`
          });
        }
      });
    }
  });

  newProjs.forEach((newP: any) => {
    const oldP = oldProjs.find((p: any) => p.id === newP.id);
    if (!oldP) {
      drifts.push({
        type: 'project_added',
        section: 'Projects',
        field: newP.id,
        oldValue: '',
        newValue: newP.name,
        message: `New project added: "${newP.name}"`
      });
    }
  });

  // 4. Skills
  const oldCats = oldDoc.skillCategories || [];
  const newCats = newDoc.skillCategories || [];
  oldCats.forEach((oldCat: any) => {
    const newCat = newCats.find((c: any) => c.id === oldCat.id);
    if (!newCat) {
      drifts.push({
        type: 'skill_category_deleted',
        section: 'Skills',
        field: oldCat.id,
        oldValue: oldCat.category,
        newValue: '',
        message: `Skill category "${oldCat.category}" was deleted.`
      });
    } else {
      const deletedSkills = oldCat.skills.filter((s: string) => !newCat.skills.includes(s));
      const addedSkills = newCat.skills.filter((s: string) => !oldCat.skills.includes(s));
      if (deletedSkills.length > 0) {
        drifts.push({
          type: 'skills_deleted',
          section: 'Skills',
          field: `${oldCat.id}.skills`,
          oldValue: deletedSkills.join(', '),
          newValue: '',
          message: `Removed skills from "${oldCat.category}": ${deletedSkills.join(', ')}`
        });
      }
      if (addedSkills.length > 0) {
        drifts.push({
          type: 'skills_added',
          section: 'Skills',
          field: `${oldCat.id}.skills`,
          oldValue: '',
          newValue: addedSkills.join(', '),
          message: `Added skills to "${oldCat.category}": ${addedSkills.join(', ')}`
        });
      }
    }
  });

  return drifts;
}

// 1. Save local snapshot & execute comparative drift check
app.post('/api/snapshots/save', (req: Request, res: Response) => {
  try {
    const { masterResume, comment } = req.body;
    if (!masterResume) {
      res.status(400).json({ error: 'masterResume is required' });
      return;
    }

    // Find the most recent snapshot file to check drift
    const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'));
    let latestSnapshot: any = null;
    let latestTime = 0;

    files.forEach(file => {
      const filePath = path.join(SNAPSHOTS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs > latestTime) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (content.masterResume) {
            latestSnapshot = content.masterResume;
            latestTime = stat.mtimeMs;
          }
        } catch (e) {
          // Skip corrupt files
        }
      }
    });

    // Detect drift against latest
    const drifts = latestSnapshot ? detectFactualDrift(latestSnapshot, masterResume) : [];

    // Save the new snapshot
    const timestamp = Date.now();
    const filename = `snapshot_${timestamp}.json`;
    const fullPath = path.join(SNAPSHOTS_DIR, filename);

    const snapshotPayload = {
      timestamp,
      comment: comment || 'Automatic Snapshot Saved',
      date: new Date(timestamp).toISOString(),
      masterResume,
      drifts
    };

    fs.writeFileSync(fullPath, JSON.stringify(snapshotPayload, null, 2), 'utf-8');

    res.json({
      success: true,
      timestamp,
      driftDetected: drifts.length > 0,
      drifts
    });
  } catch (err: any) {
    console.error('Error saving career snapshot:', err);
    res.status(500).json({ error: err.message || 'Failed to save career snapshot' });
  }
});

// 2. Fetch all historical textual snapshots
app.get('/api/snapshots/history', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.endsWith('.json'));
    const history = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf-8'));
        return {
          timestamp: content.timestamp,
          comment: content.comment,
          date: content.date,
          version: content.masterResume?.version || 1,
          experienceCount: content.masterResume?.experiences?.length || 0,
          projectCount: content.masterResume?.projects?.length || 0,
          skillsCount: content.masterResume?.skillCategories?.reduce((acc: number, c: any) => acc + (c.skills?.length || 0), 0) || 0,
          driftCount: content.drifts?.length || 0,
          drifts: content.drifts || []
        };
      } catch (e) {
        return null;
      }
    }).filter(item => item !== null);

    // Sort by timestamp descending (newest first)
    history.sort((a, b) => b!.timestamp - a!.timestamp);

    res.json(history);
  } catch (err: any) {
    console.error('Error listing snapshots:', err);
    res.status(500).json({ error: err.message || 'Failed to list career snapshots' });
  }
});

// 3. Restore a historical snapshot
app.get('/api/snapshots/restore/:timestamp', (req: Request, res: Response) => {
  try {
    const { timestamp } = req.params;
    const filename = `snapshot_${timestamp}.json`;
    const fullPath = path.join(SNAPSHOTS_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: `Snapshot ${timestamp} not found.` });
      return;
    }

    const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    res.json(content.masterResume);
  } catch (err: any) {
    console.error('Error restoring snapshot:', err);
    res.status(500).json({ error: err.message || 'Failed to restore snapshot' });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
