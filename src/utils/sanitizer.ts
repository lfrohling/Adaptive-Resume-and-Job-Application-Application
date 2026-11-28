/**
 * Robust input sanitization utility to prevent XSS and malicious code injection
 * across all job ingestion, file imports, pasted text, and URL inputs.
 */

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let cleaned = input;

  // 1. Remove script tags and their content completely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove style tags and their content completely
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove dangerous event handlers (onerror, onload, onclick, onmouseover, etc.)
  cleaned = cleaned.replace(/\bon[a-z]+\s*=\s*(["']).*?\1/gi, '');
  cleaned = cleaned.replace(/\bon[a-z]+\s*=\s*[^\s>]+/gi, '');

  // 4. Remove javascript: and vbscript: and data: URIs
  cleaned = cleaned.replace(/javascript\s*:/gi, 'removed-protocol:');
  cleaned = cleaned.replace(/vbscript\s*:/gi, 'removed-protocol:');
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, 'removed-data:');

  // 5. Strip or escape HTML tags to ensure no unescaped markup renders executable code
  // For text inputs and job descriptions, we strip HTML tags entirely or encode angle brackets
  cleaned = cleaned.replace(/<[^>]*>/g, (match) => {
    // Allow basic safe formatting if needed, or strip all tags for absolute security
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  return cleaned.trim();
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
    return '#unsafe-url-blocked';
  }

  return sanitizeText(trimmed);
}

export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeText(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitizedRecord: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitizedRecord[key] = sanitizeObject(value);
    }
    return sanitizedRecord as T;
  }

  return obj;
}
