self.addEventListener('install', (e) => {
    console.log('[Service Worker - Production] App Installed');
});

self.addEventListener('fetch', (e) => {
    // Firebase يتعامل مع الكاش والبيانات تلقائياً
});
