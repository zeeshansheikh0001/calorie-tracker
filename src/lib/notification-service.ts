"use client";

import { useState, useEffect, useCallback } from 'react';
import { firebaseApp, messaging } from './firebase-client';
import { getToken } from 'firebase/messaging';

// This custom hook manages the entire notification lifecycle with FCM
export function useNotificationService() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Check for browser support and current permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (!isSupported || !messaging) return null;
    
    // Check for existing token
    const currentToken = localStorage.getItem('fcmToken');
    if (currentToken) {
        setFcmToken(currentToken);
    }
    return currentToken;
  }, [isSupported]);
  
  // Function to request permission and subscribe
  const subscribe = useCallback(async () => {
    if (!isSupported || !messaging) {
      console.error("Firebase Messaging is not supported or initialized.");
      return null;
    }

    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          throw new Error("VAPID key is not configured in environment variables.");
        }
        
        const token = await getToken(messaging, { vapidKey });
        
        if (token) {
          setFcmToken(token);
          localStorage.setItem('fcmToken', token);

          // Send the token to your server to save it
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          return token;
        } else {
          console.warn("No registration token available. Request permission to generate one.");
          return null;
        }
      } else {
        console.warn("Notification permission was not granted.");
        return null;
      }
    } catch (error) {
      console.error('An error occurred while subscribing to notifications.', error);
      return null;
    }
  }, [isSupported]);

  // Function to unsubscribe
  const unsubscribe = useCallback(async () => {
    const tokenToUnsubscribe = fcmToken;
    if (!tokenToUnsubscribe) return;
    
    try {
      // You don't "delete" a token from FCM, you just stop using it.
      // The key part is removing it from your server's database.
      await fetch('/api/notifications/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenToUnsubscribe }),
      });

      localStorage.removeItem('fcmToken');
      setFcmToken(null);
      
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }, [fcmToken]);

  const sendTestNotification = useCallback(async () => {
    const token = fcmToken || localStorage.getItem('fcmToken');
    if (!token) {
        throw new Error("Not subscribed to notifications. Cannot send a test.");
    }
    await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: token,
            title: "Test Notification",
            message: "If you see this, notifications are working!"
        }),
    });
  }, [fcmToken]);

  return { 
    initialize, 
    subscribe, 
    unsubscribe, 
    sendTestNotification, 
    isSupported, 
    permission,
    subscription: fcmToken // For UI logic, a token means subscribed
  };
}