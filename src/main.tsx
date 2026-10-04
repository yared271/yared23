import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register official PWA service worker immediately for standalone Chrome execution without address bar
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Registration successful
        registration.update();
      })
      .catch((err) => {
        console.warn('CBE PWA Service Worker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
