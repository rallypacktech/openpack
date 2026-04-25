import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Safari Private Browsing blocks localStorage/sessionStorage access and throws SecurityError.
// Patch both with a safe in-memory fallback so third-party libraries don't crash the app.
(function patchStorage() {
  const memStore = {};
  const noop = () => {};
  const safeStorage = {
    getItem: (k) => memStore[k] ?? null,
    setItem: (k, v) => { memStore[k] = String(v); },
    removeItem: (k) => { delete memStore[k]; },
    clear: () => { Object.keys(memStore).forEach(k => delete memStore[k]); },
    key: (i) => Object.keys(memStore)[i] ?? null,
    get length() { return Object.keys(memStore).length; },
  };
  ['localStorage', 'sessionStorage'].forEach((name) => {
    try {
      window[name].getItem('__test__');
    } catch {
      try {
        Object.defineProperty(window, name, { value: safeStorage, writable: false });
      } catch { /* ignore */ }
    }
  });
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)