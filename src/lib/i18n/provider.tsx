"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translate, type SupportedLocale } from "@/lib/i18n/translations";

interface LanguageContextValue {
  locale: SupportedLocale;
  setLocale: (value: SupportedLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "appLocale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (stored && SUPPORTED_LOCALES.some((l) => l.value === stored)) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((value: SupportedLocale) => {
    setLocaleState(value);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      return translate(locale, key, vars);
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({ locale, setLocale, t, supportedLocales: SUPPORTED_LOCALES }),
    [locale, setLocale, t]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

