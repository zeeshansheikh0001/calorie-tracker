import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Platform detection utilities for web vs React Native/Expo WebView
 */

/**
 * Check if running in React Native WebView
 */
export function isReactNativeWebView(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for React Native WebView specific properties
  return !!(
    (window as any).ReactNativeWebView ||
    (window as any).webkit?.messageHandlers?.ReactNativeWebView ||
    (window as any).ReactNativeWebView?.postMessage ||
    // Check for Expo WebView
    (window as any).expo ||
    // Check for common WebView user agents
    /wv|WebView/.test(navigator.userAgent) ||
    // Check for React Native specific properties
    (window as any).__REACT_NATIVE_WEBVIEW__ ||
    // Check for Expo specific properties
    (window as any).__EXPO__ ||
    // Check for common mobile app user agents
    /Mobile.*Safari.*Version/.test(navigator.userAgent) && 
    !/Chrome/.test(navigator.userAgent)
  );
}

/**
 * Check if running in Expo WebView specifically
 */
export function isExpoWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).expo || !!(window as any).__EXPO__;
}

/**
 * Check if running in React Native WebView
 */
export function isReactNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).ReactNativeWebView ||
    (window as any).__REACT_NATIVE_WEBVIEW__ ||
    /wv|WebView/.test(navigator.userAgent)
  );
}

/**
 * Check if running on Android (in WebView)
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Check if running on iOS (in WebView)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Check if running in web browser (not in WebView)
 */
export function isWeb(): boolean {
  if (typeof window === 'undefined') return true;
  return !isReactNativeWebView();
}

/**
 * Check if running in any mobile app (WebView)
 */
export function isMobileApp(): boolean {
  return isReactNativeWebView();
}

/**
 * Get the current platform
 */
export function getPlatform(): 'web' | 'android' | 'ios' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  if (isReactNativeWebView()) {
    if (isAndroid()) return 'android';
    if (isIOS()) return 'ios';
    return 'unknown';
  }
  
  if (isWeb()) return 'web';
  
  return 'unknown';
}

/**
 * Check if Google Play Store button should be shown
 * Only show on web, hide in mobile app (WebView)
 */
export function shouldShowGooglePlayButton(): boolean {
  return isWeb();
}

/**
 * Check if App Store button should be shown
 * Only show on web, hide in mobile app (WebView)
 */
export function shouldShowAppStoreButton(): boolean {
  return isWeb();
}

/**
 * Get detailed platform information
 */
export function getPlatformInfo() {
  return {
    platform: getPlatform(),
    isWeb: isWeb(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isMobileApp: isMobileApp(),
    isReactNativeWebView: isReactNativeWebView(),
    isExpoWebView: isExpoWebView(),
    isReactNative: isReactNative(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
  };
}
