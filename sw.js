self.addEventListener('install', (e) => {
    console.log('[Service Worker] App Installed');
});

self.addEventListener('fetch', (e) => {
    // Firebase يتعامل مع الكاش والبيانات تلقائياً
});
