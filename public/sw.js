// public/sw.js

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  
  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Calorie Tracker',
      body: event.data.text(),
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
      data: { url: '/' }
    };
  }

  const { title, body, icon, badge, tag, data } = notificationData;

  const options = {
    body: body,
    icon: icon || '/favicon/android-chrome-192x192.png',
    badge: badge || '/favicon/favicon-32x32.png',
    tag: tag || 'default-tag',
    data: data || { url: '/' },
    actions: [
      { action: 'log_meal', title: 'Log Meal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
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
