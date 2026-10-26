import React, { useState } from 'react';
import { Printer, Copy, Check, FileText, Sparkles, Download, LayoutTemplate } from 'lucide-react';
import { TailoredResume, MasterResume } from '../types/resume';
import { exportAsMarkdownFile } from '../utils/storage';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeDocumentProps {
  tailoredResume?: TailoredResume | null;
  masterResume?: MasterResume;
  isMasterView?: boolean;
  resumeOptions: { pageBudget: number, emphasis: string };
  activeDoc: 'resume' | 'cover_letter';
  onLog?: () => void;
}

export type ResumeTheme = 'modern' | 'executive' | 'tech';



export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  tailoredResume,
  masterResume,
  isMasterView = false,
  resumeOptions,
  activeDoc,
  onLog,
}) => {
  if (onLog) onLog();
  const isOnePage = resumeOptions.pageBudget === 1;
  const activeVariant = tailoredResume?.variants?.[isOnePage ? 1 : 2];

  const coverLetterText = activeVariant?.coverLetter || tailoredResume?.coverLetter || '';
  const [theme, setTheme] = useState<ResumeTheme>('modern');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const splitParagraphs = (text: string): string[] => {
    if (!text) return [];
    // Try splitting by double newline first, then single newline
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length <= 1) {
       paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    }
    if (paragraphs.length > 0) return paragraphs;
    // Fallback: force split long text
    return text.match(/.{1,300}(\.|\?|!|\s)/g) || [text];
  };

  // If viewing tailored resume, use its data; otherwise fall back to master resume summary
  const contact = masterResume?.contact || {
    fullName: 'Your Name',
    headline: 'Professional Headline',
    email: 'email@example.com',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  };

  const executiveSummary = (activeVariant?.executiveSummary || (tailoredResume ? tailoredResume.executiveSummary : masterResume?.executiveSummaries[0]?.text || ''));

  const rawSkillsList = activeVariant?.selectedSkills
    ? activeVariant.selectedSkills
    : (tailoredResume
        ? tailoredResume.selectedSkills
        : (masterResume?.skillCategories || []).map((cat) => ({
            category: cat.category,
            skills: cat.skills,
          })));

  // Dynamic depth: 1-Page uses top 3 categories with top 5 skills each; 2-Page renders comprehensive taxonomy
  const skillsList = isOnePage
    ? rawSkillsList.slice(0, 3).map(cat => ({
        ...cat,
        skills: cat.skills.slice(0, 5),
      }))
    : (rawSkillsList.length <= 3 && masterResume?.skillCategories && masterResume.skillCategories.length > 3
        ? masterResume.skillCategories.map(cat => ({ category: cat.category, skills: cat.skills }))
        : rawSkillsList);

  const rawExperiences = activeVariant?.experiences
    ? activeVariant.experiences
    : (tailoredResume
        ? tailoredResume.experiences
        : (masterResume?.experiences || []).map((exp) => ({
            company: exp.company,
            role: exp.role,
            location: exp.location,
            period: `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`,
            bullets: exp.bullets.map((b) => b.text),
            technologies: exp.technologies,
          })));

  // Dynamic depth: 1-Page uses top 3 roles with top 3 high-impact bullets; 2-Page renders comprehensive career depth
  const experiences = isOnePage
    ? rawExperiences.slice(0, 3).map(exp => ({
        ...exp,
        bullets: exp.bullets.slice(0, 3),
      }))
    : (rawExperiences.length <= 3 && masterResume?.experiences && masterResume.experiences.length > 3
        ? [
            ...rawExperiences,
            ...masterResume.experiences.slice(rawExperiences.length).map(exp => ({
              company: exp.company,
              role: exp.role,
              location: exp.location,
              period: `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`,
              bullets: exp.bullets.map(b => b.text),
              technologies: exp.technologies,
            }))
          ]
        : rawExperiences);

  const rawProjects = activeVariant?.projects
    ? activeVariant.projects
    : (tailoredResume
        ? tailoredResume.projects
        : (masterResume?.projects || []).map((p) => ({
            name: p.name,
            role: p.role,
            period: p.period,
            bullets: p.bullets.map((b) => b.text),
            technologies: p.technologies,
          })));

  // Dynamic depth: 1-Page uses top 2 key projects with top 2 bullets; 2-Page renders full project portfolio
  const projects = isOnePage
    ? rawProjects.slice(0, 2).map(p => ({
        ...p,
        bullets: p.bullets.slice(0, 2),
      }))
    : (rawProjects.length <= 2 && masterResume?.projects && masterResume.projects.length > 2
        ? [
            ...rawProjects,
            ...masterResume.projects.slice(rawProjects.length).map(p => ({
              name: p.name,
              role: p.role,
              period: p.period,
              bullets: p.bullets.map(b => b.text),
              technologies: p.technologies,
            }))
          ]
        : rawProjects);

  // Helper to ensure descriptions are strictly 1 to 3 words
  const formatOneToThreeWords = (desc: string): string => {
    if (!desc) return 'Portfolio';
    const clean = desc.replace(/[()[\]{}]/g, '').trim();
    const commonMaps: Record<string, string> = {
      'personal portfolio & technical architecture': 'Personal Portfolio',
      'personal website': 'Personal Portfolio',
      'portfolio': 'Personal Portfolio',
      'professional profile & career endorsements': 'Professional Profile',
      'professional profile': 'Professional Profile',
      'linkedin': 'LinkedIn Profile',
      'data analysis & visualisation portfolio': 'Data Analytics',
      'data analysis & visualisation': 'Data Analytics',
      'data analysis': 'Data Analytics',
      'data visualisation': 'Data Visualisation',
      'tableau': 'Tableau Analytics',
      'technical architecture & project portfolio': 'Technical Architecture',
      'technical architecture': 'Technical Architecture',
      'live project: ai customer support triage agent': 'Live AI Project',
    };
    const lower = clean.toLowerCase();
    if (commonMaps[lower]) {
      return commonMaps[lower];
    }
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length <= 3) return words.join(' ');
    return words.slice(0, 3).join(' ');
  };

  // Select strictly at most 3 relevant websites for the Resume
  const resumeWebsites = (() => {
    const pool: { url: string; description: string }[] = [];
    const seen = new Set<string>();

    const addSite = (url?: string, desc?: string) => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      if (cleanUrl.includes('PASTE_YOUR') || seen.has(cleanUrl)) return;
      seen.add(cleanUrl);
      pool.push({
        url: cleanUrl,
        description: formatOneToThreeWords(desc || 'Portfolio Link'),
      });
    };

    // 1. If tailored resume cover letter already extracted job-relevant links, prioritize them
    const rawCl = coverLetterText || '';
    const clMatches = rawCl.match(/https?:\/\/[^\s)]+(?:\s*\([^)]+\))?/g) || [];
    clMatches.forEach((item) => {
      const match = item.match(/(https?:\/\/[^\s()]+)(?:\s*\(([^)]+)\))?/);
      if (match) {
        addSite(match[1], match[2]);
      }
    });

    // 2. Candidate websiteList from master resume
    const masterWebsites = (contact as any).websiteList || [];
    masterWebsites.forEach((w: any) => {
      addSite(w.url, w.description);
    });

    // 3. Fallbacks from contact directly
    if (contact.website) addSite(contact.website, 'Personal Portfolio');
    if (contact.linkedin) addSite(contact.linkedin, 'Professional Profile');

    // 4. Project links if still under 3
    if (pool.length < 3) {
      (masterResume?.projects || []).forEach((p) => {
        if (p.link) addSite(p.link, p.name);
      });
    }

    // Return strictly at most 3 websites, each formatted as `${url} (${description})`
    return pool.slice(0, 3).map((site) => ({
      ...site,
      formattedLine: `${site.url} (${formatOneToThreeWords(site.description)})`,
    }));
  })();

  // Unified cover letter parsing and structuring
  const getStructuredCoverLetter = () => {
    const raw = coverLetterText || '';
    const dateFormatted = new Date(tailoredResume?.createdAt || Date.now()).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const recipient = `To: Hiring Manager / Recruitment Team, ${tailoredResume?.companyName || 'Hiring Organization'}`;

    // Clean top junk if model accidentally echoed markdown headers
    const cleaned = raw
      .replace(/^#+ [^\n]+\n*/g, '')
      .replace(/^\*\*Candidate:\*\*[^\n]+\n*/gi, '')
      .replace(/^\*\*Role:\*\*[^\n]+\n*/gi, '')
      .replace(/^Date:[^\n]+\n*/gi, '')
      .replace(/^To:[^\n]+\n*/gi, '')
      .trim();

    // Separate links and strip any raw model sign-offs so we control the canonical sign-off
    const rawLines = cleaned.split('\n');
    const filteredLines: string[] = [];
    const linkLinesRaw: string[] = [];
    let passedSignOff = false;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) {
        if (!passedSignOff) filteredLines.push('');
        continue;
      }
      if (/^(sincerely|warm regards|kind regards|best regards|respectfully)[,.]?$/i.test(line)) {
        passedSignOff = true;
        continue;
      }
      if (passedSignOff) {
        // Drop trailing candidate name or contact lines present after Sincerely in raw model text
        continue;
      }
      if (/^https?:\/\//i.test(line) || /^\*?\s*https?:\/\//i.test(line)) {
        linkLinesRaw.push(line.replace(/^\*?\s*/, ''));
      } else {
        filteredLines.push(line);
      }
    }

    // Process and strictly cap linkLines to at most 3, with 1-3 word description in brackets
    const parsedLinks: string[] = [];
    const seenLinks = new Set<string>();

    linkLinesRaw.forEach((line) => {
      const match = line.match(/(https?:\/\/[^\s()]+)(?:\s*\(([^)]+)\))?/);
      if (match) {
        const url = match[1];
        if (!seenLinks.has(url)) {
          seenLinks.add(url);
          const desc = formatOneToThreeWords(match[2] || 'Relevant Link');
          parsedLinks.push(`${url} (${desc})`);
        }
      }
    });

    // If model didn't provide links in body, fall back to the 3 relevant resumeWebsites
    let linkLines: string[] = [];
    if (parsedLinks.length > 0) {
      linkLines = parsedLinks.slice(0, 3);
    } else {
      linkLines = resumeWebsites.map((s) => s.formattedLine).slice(0, 3);
    }

    let bodyText = filteredLines.join('\n').trim();

    // Ensure formal salutation exists
    if (!/^dear\s/i.test(bodyText)) {
      bodyText = `Dear Hiring Team at ${tailoredResume?.companyName || 'Hiring Organization'},\n\n${bodyText}`;
    }

    let paragraphs = splitParagraphs(bodyText);

    // Time-zone logic is now handled by the AI generation prompt
    // to ensure precise 5-step calculation for each specific location.


    const signOff = {
      closing: 'Sincerely,',
      name: contact.fullName || 'Candidate',
      contactLine: [contact.email, contact.phone].filter(Boolean).join(' • '),
    };

    return {
      dateFormatted,
      recipient,
      paragraphs,
      linkLines,
      signOff,
    };
  };

  const education = tailoredResume?.education || masterResume?.education || [];
  const rawCertifications = tailoredResume?.certifications || masterResume?.certifications || [];
  const certifications = rawCertifications.filter((c) => !c.hidden);

  const getExportFileName = (extension: 'pdf' | 'docx' | 'md') => {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_\s-]/g, '').trim();
    const businessName = sanitize(tailoredResume?.companyName || 'General').replace(/\s+/g, '_') || 'General';
    
    // For the job description part: use the first three words, separated by "_"
    const rawJobPart = sanitize(tailoredResume?.jobTitle || 'Position');
    const jobWords = rawJobPart.split(/\s+/).filter(Boolean);
    const jobDescriptionPart = jobWords.slice(0, 3).join('_') || 'Position';

    const candidateName = sanitize(contact.fullName || 'Candidate').replace(/\s+/g, '_') || 'Candidate';
    const docType = activeDoc === 'cover_letter' ? 'Cover_Letter' : 'Resume';

    return `${businessName}-${jobDescriptionPart}-${candidateName}-${docType}.${extension}`;
  };

  const generatePdf = async () => {
    const originalTitle = document.title;
    const pdfBaseName = getExportFileName('pdf').replace(/\.pdf$/, '');
    document.title = pdfBaseName;
    console.log("Triggering browser print with document.title =", pdfBaseName);
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const generateAtsPlainText = () => {
    if (activeDoc === 'cover_letter') {
      const cl = getStructuredCoverLetter();
      let out = `${contact.fullName.toUpperCase()}\n`;
      if (contact.headline) out += `${contact.headline}\n`;
      const contactRow = [contact.email, contact.phone, contact.location].filter(Boolean).join(' | ');
      if (contactRow) out += `${contactRow}\n`;
      out += `\n${cl.dateFormatted}\n${cl.recipient}\n\n`;
      cl.paragraphs.forEach((p) => {
        out += `${p.trim()}\n\n`;
      });
      if (cl.linkLines.length > 0) {
        out += `Relevant Links:\n`;
        cl.linkLines.forEach((l) => {
          out += `${l}\n`;
        });
        out += `\n`;
      }
      out += `${cl.signOff.closing}\n${cl.signOff.name}\n${cl.signOff.contactLine}\n`;
      return out;
    }

    let out = `${contact.fullName.toUpperCase()}\n`;
    if (contact.headline) out += `${contact.headline}\n`;
    const contactRow = [contact.email, contact.phone, contact.location].filter(Boolean).join(' | ');
    if (contactRow) out += `${contactRow}\n`;
    resumeWebsites.forEach((site) => {
      out += `${site.formattedLine}\n`;
    });
    out += `\n`;

    if (executiveSummary) {
      out += `PROFESSIONAL SUMMARY\n${executiveSummary}\n\n`;
    }

    if (skillsList.length > 0) {
      out += `AREAS OF EXPERTISE & TECHNICAL SKILLS\n`;
      skillsList.forEach((cat) => {
        out += `${cat.category}: ${cat.skills.join(', ')}\n`;
      });
      out += `\n`;
    }

    if (experiences.length > 0) {
      out += `PROFESSIONAL EXPERIENCE\n`;
      experiences.forEach((exp) => {
        out += `${exp.role.toUpperCase()} | ${exp.company}${exp.location ? ` (${exp.location})` : ''} [${exp.period}]\n`;
        exp.bullets.forEach((b) => {
          out += `• ${b.replace(/^•\s*/, '')}\n`;
        });
        if (exp.technologies && exp.technologies.length > 0) {
          out += `Technologies: ${exp.technologies.join(', ')}\n`;
        }
        out += `\n`;
      });
    }

    if (projects.length > 0) {
      out += `KEY PROJECTS\n`;
      projects.forEach((proj) => {
        out += `${proj.name} ${proj.role ? `(${proj.role})` : ''} ${proj.period ? `[${proj.period}]` : ''}\n`;
        proj.bullets.forEach((b) => {
          out += `• ${b.replace(/^•\s*/, '')}\n`;
        });
        if (proj.technologies && proj.technologies.length > 0) {
          out += `Technologies: ${proj.technologies.join(', ')}\n`;
        }
        out += `\n`;
      });
    }

    if (education.length > 0) {
      out += `EDUCATION\n`;
      education.forEach((edu) => {
        out += `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution}${edu.graduationYear ? ` (${edu.graduationYear})` : ''}\n`;
      });
      out += `\n`;
    }

    if (certifications.length > 0) {
      out += `CERTIFICATIONS\n`;
      certifications.forEach((c) => {
        out += `${c.name} - ${c.issuer}${c.date ? ` (${c.date})` : ''}\n`;
      });
    }

    return out;
  };

  const generateMarkdown = () => {
    if (activeDoc === 'cover_letter') {
      const cl = getStructuredCoverLetter();
      let md = `# ${contact.fullName}\n\n`;
      if (contact.headline) md += `**${contact.headline}**\n\n`;
      const contactRow = [contact.email, contact.phone, contact.location].filter(Boolean).join(' • ');
      if (contactRow) md += `${contactRow}  \n\n`;

      md += `---\n\n`;
      md += `**Date:** ${cl.dateFormatted}  \n`;
      md += `**${cl.recipient}**  \n\n`;

      cl.paragraphs.forEach((p) => {
        md += `${p.trim()}\n\n`;
      });

      if (cl.linkLines.length > 0) {
        md += `**Relevant Links:**  \n`;
        cl.linkLines.forEach((l) => {
          md += `${l}  \n`;
        });
        md += `\n`;
      }

      md += `${cl.signOff.closing}  \n`;
      md += `**${cl.signOff.name}**  \n`;
      if (cl.signOff.contactLine) md += `${cl.signOff.contactLine}\n`;

      return md;
    }

    // RESUME MARKDOWN
    let out = `# ${contact.fullName.toUpperCase()}\n\n`;
    if (contact.headline) out += `**${contact.headline}**\n\n`;
    const contactRow = [contact.email, contact.phone, contact.location].filter(Boolean).join(' • ');
    if (contactRow) out += `${contactRow}  \n`;

    if (resumeWebsites.length > 0) {
      resumeWebsites.forEach((site) => {
        out += `${site.formattedLine}  \n`;
      });
    }

    out += `\n---\n\n`;

    if (executiveSummary) {
      out += `## Professional Summary\n\n${executiveSummary}\n\n`;
    }

    if (skillsList.length > 0) {
      out += `## Technical & Core Competencies\n\n`;
      skillsList.forEach((cat) => {
        out += `- **${cat.category}:** ${cat.skills.join(', ')}\n`;
      });
      out += `\n`;
    }

    if (experiences.length > 0) {
      out += `## Professional Experience\n\n`;
      experiences.forEach((exp) => {
        out += `### ${exp.role} — ${exp.company}${exp.location ? ` (${exp.location})` : ''}\n`;
        out += `*${exp.period}*\n\n`;
        exp.bullets.forEach((b) => {
          out += `- ${b.replace(/^•\s*/, '')}\n`;
        });
        if (exp.technologies && exp.technologies.length > 0) {
          out += `\n*Stack: ${exp.technologies.join(', ')}*\n`;
        }
        out += `\n`;
      });
    }

    if (projects.length > 0) {
      out += `## Key Projects & Engineering Artifacts\n\n`;
      projects.forEach((proj) => {
        out += `### ${proj.name}${proj.role ? ` | ${proj.role}` : ''}\n`;
        if (proj.period) out += `*${proj.period}*\n\n`;
        proj.bullets.forEach((b) => {
          out += `- ${b.replace(/^•\s*/, '')}\n`;
        });
        if (proj.technologies && proj.technologies.length > 0) {
          out += `\n*Stack: ${proj.technologies.join(', ')}*\n`;
        }
        out += `\n`;
      });
    }

    if (education.length > 0) {
      out += `## Education\n\n`;
      education.forEach((edu) => {
        out += `- **${edu.degree} in ${edu.fieldOfStudy}** — ${edu.institution}${edu.graduationYear ? ` (${edu.graduationYear})` : ''}\n`;
      });
      out += `\n`;
    }

    if (certifications.length > 0) {
      out += `## Certifications\n\n`;
      certifications.forEach((c) => {
        out += `- **${c.name}** — ${c.issuer}${c.date ? ` (${c.date})` : ''}\n`;
      });
      out += `\n`;
    }

    return out;
  };

  const exportDocx = async () => {
    const isCoverLetter = activeDoc === 'cover_letter';
    const cl = getStructuredCoverLetter();

    const doc = new Document({
      sections: [{
        children: isCoverLetter ? [
          new Paragraph({ text: contact.fullName, heading: HeadingLevel.HEADING_1 }),
          ...(contact.headline ? [new Paragraph({ text: contact.headline })] : []),
          new Paragraph({ text: [contact.email, contact.phone, contact.location].filter(Boolean).join(' • ') }),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: `Date: ${cl.dateFormatted}` }),
          new Paragraph({ text: cl.recipient }),
          new Paragraph({ text: ' ' }),
          ...cl.paragraphs.map((para) => new Paragraph({ text: para, spacing: { after: 200 } })),
          ...(cl.linkLines.length > 0 ? [
            new Paragraph({ text: 'Relevant Links:', spacing: { before: 120, after: 60 } }),
            ...cl.linkLines.map((link) => new Paragraph({ text: link, spacing: { after: 60 } })),
            new Paragraph({ text: ' ' }),
          ] : []),
          new Paragraph({ text: cl.signOff.closing }),
          new Paragraph({ children: [new TextRun({ text: cl.signOff.name, bold: true })] }),
          ...(cl.signOff.contactLine ? [new Paragraph({ children: [new TextRun({ text: cl.signOff.contactLine, italics: true })] })] : []),
        ] : [
          new Paragraph({ text: contact.fullName.toUpperCase(), heading: HeadingLevel.HEADING_1 }),
          ...(contact.headline ? [new Paragraph({ text: contact.headline, spacing: { after: 120 } })] : []),
          new Paragraph({ text: [contact.email, contact.phone, contact.location].filter(Boolean).join(' • ') }),
          ...resumeWebsites.map((site) => new Paragraph({ text: site.formattedLine })),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2, keepNext: true }),
          ...splitParagraphs(executiveSummary).map((para, i, arr) => new Paragraph({ text: para, spacing: { after: 200 }, keepNext: i < arr.length - 1 })),
          new Paragraph({ text: 'Technical & Core Competencies', heading: HeadingLevel.HEADING_2, keepNext: true }),
          ...skillsList.map((cat, i, arr) => new Paragraph({ text: `${cat.category}: ${cat.skills.join(', ')}`, spacing: { after: 100 }, keepNext: i < arr.length - 1 })),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Professional Experience', heading: HeadingLevel.HEADING_2, keepNext: true }),
          ...experiences.flatMap((exp, expIdx, expArr) => [
            new Paragraph({ children: [new TextRun({ text: `${exp.role} - ${exp.company}${exp.location ? ` (${exp.location})` : ''}`, bold: true })], spacing: { before: 200 }, keepNext: true }),
            new Paragraph({ children: [new TextRun({ text: exp.period, italics: true })], keepNext: true }),
            ...exp.bullets.map((b, bIdx, bArr) => new Paragraph({ text: b.replace(/^•\s*/, ''), bullet: { level: 0 }, spacing: { after: 50 }, keepNext: bIdx < bArr.length - 1 || expIdx < expArr.length - 1 })),
            ...(exp.technologies && exp.technologies.length > 0 ? [new Paragraph({ children: [new TextRun({ text: `Stack: ${exp.technologies.join(', ')}`, italics: true })], spacing: { after: 50 }, keepNext: expIdx < expArr.length - 1 })] : []),
            new Paragraph({ text: ' ', keepNext: expIdx < expArr.length - 1 }),
          ]),
          ...(projects.length > 0 ? [
            new Paragraph({ text: 'Key Projects & Engineering Artifacts', heading: HeadingLevel.HEADING_2, keepNext: true }),
            ...projects.flatMap((proj, projIdx, projArr) => [
              new Paragraph({ children: [new TextRun({ text: `${proj.name}${proj.role ? ` (${proj.role})` : ''}${proj.period ? ` [${proj.period}]` : ''}`, bold: true })], keepNext: true }),
              ...proj.bullets.map((b, bIdx, bArr) => new Paragraph({ 
                text: b.replace(/^•\s*/, ''), 
                bullet: { level: 0 }, 
                spacing: { after: 50 }, 
                keepNext: bIdx < bArr.length - 1 || projIdx < projArr.length - 1 
              })),
              ...(proj.technologies && proj.technologies.length > 0 ? [new Paragraph({ 
                children: [new TextRun({ text: `Stack: ${proj.technologies.join(', ')}`, italics: true })], 
                spacing: { after: 50 },
                keepNext: projIdx < projArr.length - 1
              })] : []),
              new Paragraph({ text: ' ', keepNext: projIdx < projArr.length - 1 }),
            ]),
          ] : []),
          new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2, keepNext: true }),
          ...education.map((edu, i, arr) => new Paragraph({ text: `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution}${edu.graduationYear ? ` (${edu.graduationYear})` : ''}`, spacing: { after: 100 }, keepNext: i < arr.length - 1 })),
          new Paragraph({ text: ' ', keepNext: true }),
          new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_2, keepNext: true }),
          ...certifications.map((c, i, arr) => new Paragraph({ text: `${c.name} - ${c.issuer}${c.date ? ` (${c.date})` : ''}`, spacing: { after: 100 }, keepNext: i < arr.length - 1 })),
        ],
      }],
    });

    const docxBlob = await Packer.toBlob(doc);
    const fileName = getExportFileName('docx');
    saveAs(docxBlob, fileName);
  };

  
  // ... (rest of the file as before, modified to include exportDocx)

  // Theme-specific styling classes
  const themeClasses = {
    modern: {
      container: 'font-sans text-slate-900',
      headerName: 'text-2xl font-bold tracking-tight text-slate-950 uppercase border-b-2 border-slate-900 pb-1',
      sectionTitle: 'text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mt-4 mb-2 flex items-center justify-between',
      roleTitle: 'font-bold text-slate-900 text-sm',
      companyText: 'text-slate-700 font-medium text-xs',
      dateText: 'text-slate-600 text-xs font-medium',
      bulletText: 'text-xs text-slate-800 leading-relaxed',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded',
    },
    executive: {
      container: 'font-serif text-slate-900',
      headerName: 'text-2xl font-serif font-bold tracking-wide text-slate-900 text-center border-b border-slate-400 pb-2',
      sectionTitle: 'text-xs font-serif font-bold uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-0.5 mt-4 mb-2 text-center',
      roleTitle: 'font-bold text-slate-900 text-sm font-serif',
      companyText: 'italic text-slate-800 text-xs',
      dateText: 'text-slate-700 text-xs italic',
      bulletText: 'text-xs text-slate-800 leading-relaxed',
      badge: 'bg-slate-50 text-slate-800 border border-slate-300 text-[10px] px-1.5 py-0.2 rounded-sm',
    },
    tech: {
      container: 'font-sans text-slate-900',
      headerName: 'text-xl font-mono font-bold tracking-tight text-slate-950 uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200',
      sectionTitle: 'text-xs font-mono font-bold uppercase tracking-wider text-indigo-900 border-b-2 border-indigo-200 pb-0.5 mt-4 mb-2',
      roleTitle: 'font-bold text-slate-900 text-sm',
      companyText: 'text-indigo-800 font-semibold text-xs',
      dateText: 'text-slate-600 text-xs font-mono',
      bulletText: 'text-xs text-slate-800 leading-relaxed',
      badge: 'bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] px-1.5 py-0.5 rounded font-mono',
    },
  }[theme];

  return (
    <div className="flex flex-col h-full">
      {/* Control bar (hidden during print) */}
      <div className="no-print bg-slate-900/90 backdrop-blur border border-slate-800 rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
            Style:
          </span>
          <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setTheme('modern')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                theme === 'modern' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modern Clean
            </button>
            <button
              onClick={() => setTheme('executive')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                theme === 'executive' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Serif
            </button>
            <button
              onClick={() => setTheme('tech')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                theme === 'tech' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tech Monospace
            </button>
          </div>
          
          <span className={`text-[11px] font-semibold px-2.5 py-1 flex items-center gap-1.5 ${
            isOnePage 
              ? 'text-cyan-400' 
              : 'text-purple-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnePage ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
            {isOnePage ? '1-Page Concise Mode' : '2-Page Executive Depth'}
          </span>
        </div>


        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/40 transition shadow-sm"
            title="Download .docx file"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export DOCX</span>
          </button>
          
          <button
            onClick={() => copyToClipboard(generateMarkdown(), 'md')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/40 transition shadow-sm"
            title="Copy formatted Markdown directly into Obsidian, Word, or Google Docs"
          >
            {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            {copiedType === 'md' ? 'Copied to Clipboard!' : 'Copy Markdown (Obsidian)'}
          </button>

          <button
            onClick={() => {
              const filename = getExportFileName('md');
              exportAsMarkdownFile(generateMarkdown(), filename);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Download .md file directly into your Obsidian Vault folder"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Save .md</span>
          </button>

          <button
            onClick={() => copyToClipboard(generateAtsPlainText(), 'ats')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
            title="Copy ATS friendly raw text (optimized for Workday/Greenhouse/Taleo paste fields)"
          >
            {copiedType === 'ats' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-slate-400" />}
            {copiedType === 'ats' ? 'Copied ATS Text!' : 'ATS Plain'}
          </button>

          <button
            onClick={generatePdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            title="Download PDF with perfectly styled margins"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Outer preview scroll canvas */}
      <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto flex justify-center">
        {/* The Print Sheet Document (Standard Letter / A4 representation) */}
        <div
          id="resume-document-container"
          className={`w-full max-w-[850px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 md:p-12 transition-all ${themeClasses.container}`}
          style={{ minHeight: '1050px' }}
        >
          {/* Header */}
          <header className={`mb-4 ${theme === 'executive' ? 'text-center' : ''}`}>
            <h1 className={themeClasses.headerName}>{contact.fullName || 'Candidate Name'}</h1>
            <hr className="my-2 border-slate-900" />
            {contact.headline && (
              <p className={`text-xs font-medium text-slate-700 ${theme === 'tech' ? 'font-mono' : ''}`}>
                {contact.headline}
              </p>
            )}
            <hr className="my-2 border-slate-900" />
            <div
              className={`text-slate-600 text-[11px] ${
                theme === 'executive' ? 'text-center' : ''
              }`}
            >
              <div>{[contact.email, contact.phone, contact.location].filter(Boolean).join(' • ')}</div>
              {activeDoc === 'resume' && resumeWebsites.map((site, i) => (
                <div key={i} className="mt-0.5">{site.formattedLine}</div>
              ))}
            </div>
          </header>

          {activeDoc === 'cover_letter' ? (
            <div className="mt-6 text-xs text-slate-800 space-y-5 leading-relaxed max-w-2xl mx-auto p-4 border border-slate-100 rounded-lg">
              {(() => {
                const cl = getStructuredCoverLetter();
                return (
                  <>
                    <div className="text-slate-500 font-mono text-[10px] mb-2">
                      Date: {cl.dateFormatted}
                    </div>
                    <div className="font-bold text-slate-950 text-sm mb-4">
                      {cl.recipient}
                    </div>
                    {cl.paragraphs.length > 0 ? (
                      cl.paragraphs.map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-justify leading-loose mb-4 whitespace-pre-wrap">
                          {paragraph.trim()}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-slate-400">Cover letter content generating...</p>
                    )}
                    {cl.linkLines.length > 0 && (
                      <div className="my-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Relevant Links:
                        </div>
                        {cl.linkLines.map((link, lIdx) => (
                          <div key={lIdx} className="text-xs text-indigo-700 font-mono">
                            {link}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-6 border-t border-slate-100 mt-6">
                      <p>{cl.signOff.closing}</p>
                      <p className="font-bold text-slate-950 text-sm mt-3">{cl.signOff.name}</p>
                      <hr className="my-2 border-slate-300 w-1/3" />
                      {cl.signOff.contactLine && (
                        <p className="text-slate-600 text-[11px] mt-1">
                          {cl.signOff.contactLine}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <>
              {/* Professional Summary */}
              {executiveSummary && (
                <section className="print-page-break-avoid">
                  <h2 className={themeClasses.sectionTitle}>Professional Summary</h2>
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">{executiveSummary}</p>
                </section>
              )}

              {/* Skills Breakdown */}
              {skillsList.length > 0 && (
                <section className="print-page-break-avoid">
                  <h2 className={themeClasses.sectionTitle}>Technical & Core Competencies</h2>
                  <div className="space-y-1.5 text-xs">
                    {skillsList.map((cat, idx) => (
                      <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-bold text-slate-900 text-xs min-w-[130px]">{cat.category}:</span>
                        <span className="text-slate-800 text-xs leading-tight">{cat.skills.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Professional Experience */}
              {experiences.length > 0 && (
                <section>
                  <h2 className={themeClasses.sectionTitle}>Professional Experience</h2>
                  <div className="space-y-4">
                    {experiences.map((exp, expIdx) => (
                      <div key={expIdx} className="print-page-break-avoid">
                        <div className="mt-2">
                          <div className="flex justify-between items-baseline mb-2">
                            <div>
                              <span className={themeClasses.roleTitle}>{exp.role}</span>
                              <span className="text-slate-600 text-xs"> — </span>
                              <span className={themeClasses.companyText}>{exp.company}</span>
                              {exp.location && <span className="text-slate-500 text-[11px]"> ({exp.location})</span>}
                            </div>
                            <span className={themeClasses.dateText}>{exp.period}</span>
                          </div>

                          <ul className="space-y-1 list-disc list-outside ml-4">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className={themeClasses.bulletText}>
                                {bullet.replace(/^•\s*/, '')}
                              </li>
                            ))}
                          </ul>

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1 items-center">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Stack:</span>
                              {exp.technologies.map((t, tIdx) => (
                                <span key={tIdx} className={themeClasses.badge}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Boundary marker removed */}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Selected Projects */}
              {projects.length > 0 && (
                <section className="print-page-break-avoid">
                  <h2 className={themeClasses.sectionTitle}>Key Projects & Engineering Artifacts</h2>
                  <div className="space-y-3">
                    {projects.map((proj, pIdx) => (
                      <div key={pIdx}>
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                            {proj.role && <span className="text-slate-600 text-[11px]"> | {proj.role}</span>}
                          </div>
                          {proj.period && <span className={themeClasses.dateText}>{proj.period}</span>}
                        </div>
                        <ul className="mt-1 space-y-1 list-disc list-outside ml-4">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className={themeClasses.bulletText}>
                              {b}
                            </li>
                          ))}
                        </ul>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 items-center">
                            {proj.technologies.map((t, tIdx) => (
                              <span key={tIdx} className={themeClasses.badge}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education.length > 0 && (
                <section className="col-span-full">
                  <h2 className={themeClasses.sectionTitle}>Education</h2>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {education.map((edu, eIdx) => (
                      <div key={eIdx} className="border border-slate-200 rounded-lg p-3 flex-1 min-w-[200px]">
                        <div className="font-bold">{edu.degree} in {edu.fieldOfStudy}</div>
                        <div className="italic">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Certifications */}
              {certifications.length > 0 && (
                <section className="col-span-full mt-4">
                  <h2 className={themeClasses.sectionTitle}>Certifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {certifications.map((cert, cIdx) => (
                      <div key={cIdx} className="p-3 border border-slate-200 rounded-lg flex flex-col mb-4">
                        <div className="font-bold text-slate-900 text-[11px] leading-tight mb-1">{cert.name}</div>
                        <div className="text-[10px] text-slate-600">{cert.issuer}</div>
                        <div className="text-[10px] text-slate-400 mt-auto pt-1">{cert.date}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
