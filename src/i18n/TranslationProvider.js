import React, { createContext, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import translations, { getSupportedLanguage } from "./translations";
import { selectLanguage } from "../features/locale/localeSlice";

const TranslationContext = createContext({
  language: "en",
  t: (key) => key,
});

const getString = (dictionary, path, fallback) => {
  if (!path) return fallback;
  return path.split(".").reduce((acc, cur) => (acc ? acc[cur] : undefined), dictionary) ?? fallback;
};

export function TranslationProvider({ children }) {
  const languageFromStore = useSelector(selectLanguage);
  const language = getSupportedLanguage(languageFromStore);

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;
    return {
      language,
      t: (path, vars = {}) => {
        const template = getString(dictionary, path, path);
        if (typeof template !== "string") return template;
        return template.replace(/\{\{(.*?)\}\}/g, (_, key) => vars[key.trim()] ?? "");
      },
    };
  }, [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export const useTranslation = () => useContext(TranslationContext);

