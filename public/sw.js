// public/sw.js
// This service worker is intentionally kept simple for compatibility.
// It handles displaying notifications sent via FCM.

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});

// Firebase Cloud Messaging will trigger this 'push' event
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.notification.title || 'Calorie Tracker';
  const options = {
    body: data.notification.body,
    icon: data.notification.icon || '/favicon/android-chrome-192x192.png',
    badge: '/favicon/favicon-32x32.png',
    data: {
      url: data.fcmOptions && data.fcmOptions.link ? data.fcmOptions.link : '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(c => c.navigate(urlToOpen));
      }
      return clients.openWindow(urlToOpen);
    })
  );
});