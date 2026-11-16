/* ضع الملف ده جنب index.html — ما تغيّرش فيه حاجة */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
const cfg = JSON.parse(new URL(self.location.href).searchParams.get('c') || '{}');
firebase.initializeApp(cfg);
firebase.messaging(); // الإشعار بيظهر تلقائيًا من حمولة notification اللي بتبعتها الـ Function
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => l.length ? l[0].focus() : clients.openWindow('./')));
});
