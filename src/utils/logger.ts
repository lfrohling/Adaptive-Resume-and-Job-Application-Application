type LogEntry = {
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
};

let logs: LogEntry[] = [];

export const log = (type: 'error' | 'warning' | 'info', message: string) => {
  const entry = { timestamp: new Date().toISOString(), type, message };
  logs.push(entry);
  console.log(`[${type.toUpperCase()}] ${message}`);
  // Optionally: store in localStorage to persist across refreshes
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_logs', JSON.stringify(logs));
  }
};

export const getLogs = (): LogEntry[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app_logs');
    if (saved) {
      logs = JSON.parse(saved);
    }
  }
  return logs;
};
