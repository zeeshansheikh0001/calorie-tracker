"use client";

import { useState, useEffect, useCallback } from 'react';

// Define notification action type for service worker notifications
interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Extended notification options for service worker
interface ServiceWorkerNotificationOptions extends NotificationOptions {
  data?: any;
  actions?: NotificationAction[];
  vibrate?: number[];
  requireInteraction?: boolean;
}

// Simple notification service using browser Notifications API
export function useNotificationService() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check for browser support and current permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Function to request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.error("Notifications are not supported in this browser.");
      return false;
    }

    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Function to send a notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn("Cannot send notification: either notifications are not supported or permission is not granted");
      return;
    }

    try {
      return new Notification(title, options);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported, permission]);

  // Function to send notification via service worker (supports rich features)
  const sendServiceWorkerNotification = useCallback(async (title: string, options?: ServiceWorkerNotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn("Cannot send notification: either notifications are not supported or permission is not granted");
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return registration.showNotification(title, options);
      } catch (error) {
        console.error('Service worker notification failed:', error);
        // Fallback to basic notification
        const { actions, data, ...basicOptions } = options || {};
        return sendNotification(title, basicOptions);
      }
    } else {
      // Fallback to basic notification
      const { actions, data, ...basicOptions } = options || {};
      return sendNotification(title, basicOptions);
    }
  }, [isSupported, permission, sendNotification]);

  // Send a test notification using service worker
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const testNotificationOptions: ServiceWorkerNotificationOptions = {
      body: "Great! Push notifications are working perfectly on your device.",
      icon: "/favicon/android-chrome-192x192.png",
      badge: "/favicon/favicon-32x32.png",
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      requireInteraction: true,
      data: {
        type: 'test',
        url: '/reminders'
      },
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Got it!'
        }
      ]
    };

    // Use service worker for rich notifications with actions
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return registration.showNotification("🎉 Test Notification", testNotificationOptions);
      } catch (error) {
        console.error('Service worker notification failed, falling back to basic notification:', error);
        // Fallback to basic notification without actions
        return sendNotification("🎉 Test Notification", {
          body: "Great! Push notifications are working perfectly on your device.",
          icon: "/favicon/android-chrome-192x192.png"
        });
      }
    } else {
      // Fallback for browsers without service worker support
      return sendNotification("🎉 Test Notification", {
        body: "Great! Push notifications are working perfectly on your device.",
        icon: "/favicon/android-chrome-192x192.png"
      });
    }
  }, [permission, requestPermission, sendNotification]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await requestPermission();
    if (!permission) {
      throw new Error('Notification permission denied');
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    // Convert VAPID key to Uint8Array
    const urlBase64ToUint8Array = (base64String: string) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // TODO: Uncomment when Supabase auth is fully implemented
    /*
    // Send subscription to server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to save push subscription');
    }
    */
    
    // Temporary mock implementation
    console.log('Push subscription would be saved to server (disabled)');

    return subscription;
  }, [requestPermission]);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendServiceWorkerNotification,
    sendTestNotification,
    subscribeToPush
  };
}
