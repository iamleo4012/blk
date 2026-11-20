"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANG,
  LANGS,
  LANG_STORAGE_KEY,
  translate,
  type Lang,
  type TKey,
} from "@/lib/i18n";

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key in the current language. */
  t: (key: TKey) => string;
  /** True when the active language is right-to-left (Arabic). */
  rtl: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

function restoreLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (stored && LANGS.some((l) => l.code === stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

/**
 * App-wide language provider. The choice persists in localStorage, drives
 * all interface labels via `t()`, and flips the document to RTL for Arabic.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => setLangState(restoreLang()), []);

  useEffect(() => {
    const rtl = lang === "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(LANG_STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      },
      t: (key: TKey) => translate(lang, key),
      rtl: lang === "ar",
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
