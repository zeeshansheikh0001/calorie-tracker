// Service Worker for handling push notifications
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    if (!event.data) {
        console.log('No data in push event');
        return;
    }

    try {
        const data = event.data.json();
        console.log('Push data:', data);

        const options = {
            body: data.body,
            icon: '/favicon/android-chrome-192x192.png',
            badge: '/favicon/favicon-32x32.png',
            vibrate: [200, 100, 200],
            data: {
                type: data.type || 'general',
                url: getNotificationUrl(data.type)
            },
            actions: [
                {
                    action: 'open',
                    title: 'Open App'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ],
            requireInteraction: true,
            tag: data.type || 'general'
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error parsing push data:', error);

        // Fallback notification
        event.waitUntil(
            self.registration.showNotification('Calorie Tracker Reminder', {
                body: 'You have a new reminder!',
                icon: '/favicon/android-chrome-192x192.png',
                badge: '/favicon/favicon-32x32.png'
            })
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // If no existing window/tab, open a new one
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// Helper function to determine the URL based on notification type
function getNotificationUrl(type) {
    switch (type) {
        case 'meal_reminder':
            return '/log-food';
        case 'water_reminder':
            return '/log-food';
        case 'weigh_in_reminder':
            return '/progress';
        case 'reminder_confirmation':
            return '/reminders';
        default:
            return '/';
    }
}

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
    // You could track analytics here
});