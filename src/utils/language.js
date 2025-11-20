import { store } from "../store";
import { getSupportedLanguage } from "../i18n/translations";

/**
 * Get the current language from Redux store
 * @returns {string} Language code (en, hi, de, es)
 */
export const getCurrentLanguage = () => {
  const state = store.getState();
  return getSupportedLanguage(state?.locale?.language || "en");
};

/**
 * Get translated content based on current language
 * @param {Object} translations - Object with language keys (en, hi, de, es)
 * @returns {*} The translated content for current language
 */
export const getTranslatedContent = (translations) => {
  const lang = getCurrentLanguage();
  return translations[lang] || translations.en || translations;
};

