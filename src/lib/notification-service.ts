"use client";

import { useState, useEffect, useCallback } from 'react';

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

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    return sendNotification("Test Notification", {
      body: "If you see this, notifications are working!",
      icon: "/favicon/favicon-32x32.png"
    });
  }, [permission, requestPermission, sendNotification]);

  return { 
    isSupported, 
    permission,
    requestPermission,
    sendNotification,
    sendTestNotification
  };
}
