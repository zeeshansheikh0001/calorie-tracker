"use client";

import { useEffect, useRef } from 'react';

/**
 * Custom hook to track and log component render times for performance monitoring
 * 
 * @param componentName Name of the component to track
 * @param enabled Whether performance tracking is enabled
 */
export function usePerformanceMonitor(componentName: string, enabled = false) {
  const renderCount = useRef(0);
  const renderStart = useRef(0);
  
  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current++;
    
    // Log only in development mode
    if (process.env.NODE_ENV === 'development') {
      const renderTime = performance.now() - renderStart.current;
      console.log(`[PERF] ${componentName} rendered (${renderCount.current}): ${renderTime.toFixed(2)}ms`);
    }
    
    return () => {
      if (enabled && process.env.NODE_ENV === 'development') {
        renderStart.current = performance.now();
      }
    };
  });
}

/**
 * Utility to defer non-critical animations until the page has loaded
 * This improves perceived performance by prioritizing layout and content
 * 
 * @param callback Function to execute after initial load
 * @param delay Optional delay in ms before running animations
 */
export function useDeferredAnimations(callback: () => void, delay = 100) {
  useEffect(() => {
    // Wait for main thread to be idle before starting animations
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const timeoutId = setTimeout(() => {
        // @ts-ignore - requestIdleCallback may not be in the TypeScript types
        window.requestIdleCallback(() => {
          callback();
        });
      }, delay);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      const timeoutId = setTimeout(callback, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [callback, delay]);
}

/**
 * Hook to optimize component rendering by skipping animations on low-end devices
 * Uses the device memory API to detect low-end devices
 * 
 * @returns Configuration for animations based on device capabilities
 */
export function useAdaptivePerformance() {
  const isLowEndDevice = useRef(false);
  const isReducedMotion = useRef(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion.current = prefersReducedMotion.matches;
      
      // Check device memory if available
      // @ts-ignore - navigator.deviceMemory is not in standard TypeScript types
      if (navigator.deviceMemory) {
        // Consider devices with less than 4GB RAM as low-end
        // @ts-ignore
        isLowEndDevice.current = navigator.deviceMemory < 4;
      }
    }
  }, []);
  
  return {
    // Disable complex animations on low-end devices or when reduced motion is preferred
    shouldUseComplexAnimations: !isLowEndDevice.current && !isReducedMotion.current,
    
    // Reduce the number of particles on low-end devices
    particleCount: isLowEndDevice.current ? 2 : isReducedMotion.current ? 0 : 6,
    
    // Use simpler transitions on low-end devices
    animationConfig: isLowEndDevice.current || isReducedMotion.current
      ? { duration: 0.3, ease: 'easeOut' }
      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };
} 