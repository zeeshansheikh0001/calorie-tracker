
// // NOTE: This file must be in the public folder.

// // Dynamically import the config and then the Firebase SDKs
// // This ensures the config is available before Firebase tries to initialize.
// try {
//   importScripts('/api/firebase-config');

//   if (self.firebaseConfig) {
//     importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js');
//     importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js');

//     firebase.initializeApp(self.firebaseConfig);

//     const messaging = firebase.messaging();

//     messaging.onBackgroundMessage((payload) => {
//       console.log('[firebase-messaging-sw.js] Received background message ', payload);

//       const notificationTitle = payload.notification?.title || 'New Notification';
//       const notificationOptions = {
//         body: payload.notification?.body || 'Something new happened!',
//         icon: payload.notification?.icon || '/favicon/android-chrome-192x192.png',
//         tag: 'calorie-tracker-notification',
//       };

//       self.registration.showNotification(notificationTitle, notificationOptions);
//     });
//   } else {
//     console.error('Firebase config not loaded in Service Worker.');
//   }
// } catch (e) {
//   console.error('Error importing scripts in service worker:', e);
// }
