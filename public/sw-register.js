// Service Worker client registration loader script

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 1. If running on localhost/dev environments, completely unregister service workers to avoid routing freeze
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.')
    ) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then(() => {
            console.log('Development environment: Unregistered active Service Worker to prevent caching lockups.');
          });
        }
      });
      return;
    }

    // 2. Production: Register the offline assets caching service worker
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
