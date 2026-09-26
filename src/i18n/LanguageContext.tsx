/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import en from "./en.json";
import ar from "./ar.json";

export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

const translations = { en, ar } as const;

type TranslationKeys = typeof en;

// Nested key accessor (e.g. "dashboard.title")
type NestedKeyOf<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${string & K}`>
    : `${Prefix}${Prefix extends "" ? "" : "."}${string & K}`;
}[keyof T];

export type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
  params?: Record<string, string | number>
): string | null {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  if (typeof current !== "string") return null;

  if (params) {
    return Object.entries(params).reduce(
      (acc, [pKey, pVal]) => acc.replace(new RegExp(`{${pKey}}`, "g"), String(pVal)),
      current
    );
  }

  return current;
}

interface LanguageContextType {
  lang: Language;
  dir: Direction;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLang: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_KEY = "drp_lang";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return (stored === "ar" || stored === "en" ? stored : "en") as Language;
  });

  const dir: Direction = lang === "ar" ? "rtl" : "ltr";

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  // Apply dir and lang to <html> element
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang, dir]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const primaryDict = translations[lang] as Record<string, unknown>;
    const result = getNestedValue(primaryDict, key, params);
    if (result !== null) return result;

    // Fallback to English if current is Arabic and missing
    if (lang !== "en") {
      const fallbackDict = translations.en as Record<string, unknown>;
      const fallbackResult = getNestedValue(fallbackDict, key, params);
      if (fallbackResult !== null) return fallbackResult;
    }

    return key;
  };

  return (
    <LanguageContext.Provider
      value={{ lang, dir, t, setLang, isRTL: lang === "ar" }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
