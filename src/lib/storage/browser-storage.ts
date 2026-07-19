"use client";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}
