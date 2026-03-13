"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  translations,
  type AppLanguage,
  type TranslationKeys,
} from "@/lib/translations";

const STORAGE_KEY = "app-language";

function getStoredLang(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ko") return stored;
  return "en";
}

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(getStoredLang());
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: AppLanguage) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKeys) => translations[lang][key],
    [lang]
  );

  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          lang: "en",
          setLang,
          t: (key) => translations.en[key],
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en" as AppLanguage,
      setLang: () => {},
      t: (key: TranslationKeys) => translations.en[key],
    };
  }
  return ctx;
}
