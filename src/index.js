import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with versioned URL so an old SW cannot serve a cached copy
// of this script (old SW would have cached /sw.js only, not /sw.js?v=N), allowing the
// new SW to install and take over. Bump SW_VERSION on deploy when changing sw.js.
const SW_VERSION = 7;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${SW_VERSION}`)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        registration.update();
        setInterval(() => registration.update(), 60 * 60 * 1000);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
