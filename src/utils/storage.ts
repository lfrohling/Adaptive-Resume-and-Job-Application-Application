import { MasterResume, TailoredResume } from '../types/resume';
import { INITIAL_SAMPLE_MASTER_RESUME } from '../services/sampleData';


export async function exportResumeAsJson(resume: MasterResume): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const filename = `master_career_dossier_${date}.json`;
  const jsonContent = JSON.stringify(resume, null, 2);

  // Modern browser File System Access API (allows picking exact directory / folder)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'JSON Career Dossier',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return; // User canceled the picker
      console.warn('File picker failed, falling back to download anchor', err);
    }
  }

  // Fallback for standard browser download behavior
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function exportAsMarkdownFile(content: string, filename: string): Promise<void> {
  // Modern browser File System Access API (allows choosing exact folder in C:\Storage\...)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Markdown Document',
            accept: { 'text/markdown': ['.md'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('File picker failed, falling back to download anchor', err);
    }
  }

  const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generates an exhaustive, beautifully formatted plain text (*.txt) representation of the entire Master Career Dossier.
 */
/**
 * Generates an exhaustive, beautifully formatted plain text (*.txt) representation of the entire Master Career Dossier.
 */
export function formatMasterResumeAsPlainText(resume: MasterResume): string {
  const lines: string[] = [];
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);

  // HEADER: Name & Contact
  lines.push(resume.contact.fullName.toUpperCase());
  if (resume.contact.headline) lines.push(resume.contact.headline);
  lines.push(`${resume.contact.email} | ${resume.contact.phone} | ${resume.contact.location}`);
  
  const allWebsites = [
    ...(resume.contact.website ? [{ url: resume.contact.website, description: '' }] : []),
    ...(resume.contact.websiteList || [])
  ].slice(0, 5);
  
  if (allWebsites.length > 0) {
    allWebsites.forEach(w => lines.push(w.description ? `${w.description}: ${w.url}` : w.url));
  }
  lines.push(divider);
  lines.push('');

  // EXECUTIVE SUMMARY
  if (resume.executiveSummaries && resume.executiveSummaries.length > 0) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(subDivider);
    resume.executiveSummaries.forEach((s) => {
      lines.push(s.text);
      lines.push('');
    });
  }

  // TECHNICAL & CORE COMPETENCIES
  if (resume.skillCategories && resume.skillCategories.length > 0) {
    lines.push('TECHNICAL & CORE COMPETENCIES');
    lines.push(subDivider);
    resume.skillCategories.forEach((cat) => {
      lines.push(`${cat.category.toUpperCase()}: ${cat.skills.join(' • ')}`);
    });
    lines.push('');
  }

  // WORK EXPERIENCE
  if (resume.experiences && resume.experiences.length > 0) {
    lines.push('PROFESSIONAL EXPERIENCE');
    lines.push(subDivider);
    resume.experiences.forEach((exp) => {
      lines.push(`${exp.role} - ${exp.company} (${exp.location})`);
      lines.push(`${exp.startDate} - ${exp.endDate || (exp.isCurrent ? 'Present' : '')}`);
      if (exp.technologies && exp.technologies.length > 0) {
        lines.push(`Stack: ${exp.technologies.join(', ')}`);
      }
      exp.bullets.forEach((b) => {
        lines.push(`${b.text.replace(/^•\s*/, '')}`);
      });
      lines.push('');
    });
  }

  // EDUCATION
  if (resume.education && resume.education.length > 0) {
    lines.push('EDUCATION');
    lines.push(subDivider);
    lines.push(resume.education.map(edu => 
        `${edu.degree} in ${edu.fieldOfStudy}, ${edu.institution}`
    ).join(' | '));
    lines.push('');
  }

  // CERTIFICATIONS
  if (resume.certifications && resume.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    lines.push(subDivider);
    resume.certifications.forEach((cert) => {
      lines.push(`${cert.name} - ${cert.issuer} (${cert.date})`);
    });
    lines.push('');
  }

  return lines.join('\n');
}


/**
 * Triggers a download of the Master Resume as a plain text file (.txt)
 */
export async function exportResumeAsPlainText(resume: MasterResume): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const name = getGuestName(resume).replace(/\s+/g, '_');
  const filename = `${name}-Resume-${date}.txt`;
  const textContent = formatMasterResumeAsPlainText(resume);

  // Modern browser File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Plain Text Career Truth Document',
            accept: { 'text/plain': ['.txt'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(textContent);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('File picker failed, falling back to download anchor', err);
    }
  }

  // Fallback for standard browser download behavior
  const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Triggers a download of the Master Resume as a PDF file (.pdf)
 */
export async function exportResumeAsPdf(resume: MasterResume): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const date = new Date().toISOString().split('T')[0];
  const name = getGuestName(resume).replace(/\s+/g, '_');
  const filename = `${name}-Resume-${date}.pdf`;
  const textContent = formatMasterResumeAsPlainText(resume);

  const doc = new jsPDF();
  const lines = doc.splitTextToSize(textContent, 180);
  doc.text(lines, 10, 10);
  doc.save(filename);
}

export function getGuestName(resume: MasterResume): string {
  return (resume as any)._guestName || resume.contact.fullName;
}

