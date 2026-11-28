type LogEntry = {
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
};

let logs: LogEntry[] = [];

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('app_logs');
    if (saved) {
      logs = JSON.parse(saved);
    }
  } catch (e) {
    // ignore
  }

  // Intercept console.error to capture runtime errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    originalConsoleError(...args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    log('error', msg);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    originalConsoleWarn(...args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    log('warning', msg);
  };

  window.addEventListener('error', (event) => {
    log('error', event.message || String(event.error));
  });

  window.addEventListener('unhandledrejection', (event) => {
    log('error', `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`);
  });
}

export const log = (type: 'error' | 'warning' | 'info', message: string) => {
  const entry = { timestamp: new Date().toISOString(), type, message };
  logs.push(entry);
  if (logs.length > 200) {
    logs.shift(); // keep last 200 entries
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (e) {
      // ignore
    }
  }
};

export const getLogs = (): LogEntry[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('app_logs');
      if (saved) {
        logs = JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
  }
  return logs;
};
