import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles/global.css';
import './styles/glassmorphism.css';
import './styles/animations.css';
import './styles/components.css';

// Suppress benign browser ResizeObserver loop notifications in React dev error overlay
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
    event.message?.includes('ResizeObserver loop limit exceeded')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker: register only in production to avoid dev-server bundle caching lag
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}
