export const SWEAR_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'bastard', 'motherfucker', 'wanker'
];

export const processGuestName = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return 'Jane Doe';
  }

  const trimmed = input.trim();
  if (trimmed.toLowerCase() === 'guest') {
    return 'Jane Doe';
  }

  // Strictly strip out any character apart from letters and spaces as specified:
  // e.g. "lfrohling@gmail.com" -> "lfrohlinggmailcom"
  let sanitized = trimmed.replace(/[^a-zA-Z\s]/g, '');

  if (sanitized.length > 40) {
    sanitized = sanitized.substring(0, 40);
  }

  const result = sanitized.trim();
  return result === '' ? 'Jane Doe' : result;
};

export const processGuestEmail = (name: string): string => {
  if (!name || name.toLowerCase() === 'jane doe' || name.toLowerCase() === 'guest') {
    return 'jane.doe.pro@example.com.au';
  }
  const formattedName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
  return `${formattedName}.pro@example.com.au`;
};

export const applyNameReplacement = <T>(data: T, newName: string): T => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object' && typeof data !== 'string') return data;

  const replaceInString = (str: string): string => {
    // Replace "Jane Doe" case-insensitively using replacer function to avoid regex replacement token issues
    return str.replace(/Jane Doe/gi, () => newName);
  };

  const traverse = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'string') {
      return replaceInString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(traverse);
    }
    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = traverse(obj[key]);
      }
      return newObj;
    }
    return obj;
  };

  return traverse(data);
};
