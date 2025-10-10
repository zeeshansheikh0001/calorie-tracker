"use client";

import { useState, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isRecording: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  isDisabled: boolean;
  startListening: () => void;
  stopListening: () => void;
  requestPermission: () => Promise<boolean>;
  error: string | null;
  resetRecording: () => void;
}

export function useSpeechRecognition({
  onResult,
  onError,
  onStart,
  onEnd,
  onRecordingStart,
  onRecordingStop,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return false;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Microphone permission denied';
      setError(errorMessage);
      setHasPermission(false);
      return false;
    }
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (!hasPermission) {
      setError('Microphone permission is required for voice input');
      return;
    }

    try {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsRecording(true);
        setError(null);
        onStart?.();
        onRecordingStart?.();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult?.(transcript);
      };

      recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            setHasPermission(false);
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        onError?.(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false);
        setIsDisabled(true); // Disable button after recording
        onEnd?.();
        onRecordingStop?.();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start speech recognition';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isSupported, hasPermission, onResult, onError, onStart, onEnd]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    setIsDisabled(false);
    setIsRecording(false);
    setIsListening(false);
    setError(null);
  }, []);

  return {
    isListening,
    isRecording,
    isSupported,
    hasPermission,
    isDisabled,
    startListening,
    stopListening,
    requestPermission,
    error,
    resetRecording,
  };
}
