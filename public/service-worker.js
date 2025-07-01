self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon/android-chrome-192x192.png',
    badge: '/favicon/favicon-32x32.png',
    data: data // Include the full data payload for use in the click handler
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Get the notification data
  const data = event.notification.data || {};
  const type = data.type || '';
  
  // Default path
  let targetPath = '/';
  
  // Route based on notification type
  switch (type) {
    case 'meal_reminder':
      targetPath = '/log-food/manual';
      break;
    case 'water_reminder':
      targetPath = '/log-food/manual?type=water';
      break;
    case 'weigh_in_reminder':
      targetPath = '/progress';
      break;
    case 'reminder_confirmation':
      targetPath = '/reminders';
      break;
    default:
      // Default route
      targetPath = '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(targetPath) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});
