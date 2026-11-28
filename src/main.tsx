import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { auth } from './firebase';

const originalFetch = window.fetch.bind(window);

const patchedFetch: typeof window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  if (url.includes('/api/gemini')) {
    const headers = new Headers(init.headers || {});
    if (auth.currentUser?.email) {
      headers.set('x-user-email', auth.currentUser.email);
    }
    init = { ...init, headers };
  }
  return originalFetch(input, init);
};

Object.defineProperty(window, 'fetch', {
  value: patchedFetch,
  configurable: true,
  writable: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
