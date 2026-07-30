// Service Worker client registration loader script

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('AstraBank ServiceWorker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('AstraBank ServiceWorker registration failed:', err);
      });
  });
}
