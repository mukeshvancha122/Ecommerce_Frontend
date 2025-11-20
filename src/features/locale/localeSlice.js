import { createSlice } from "@reduxjs/toolkit";
import { getSupportedLanguage } from "../../i18n/translations";

const STORAGE_KEY = "locale_v1";

const loadLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return getSupportedLanguage(saved);
  } catch {
    /* noop */
  }
  return "en";
};

const initialState = {
  language: loadLanguage(),
};

const localeSlice = createSlice({
  name: "locale",
  initialState,
  reducers: {
    setLanguage(state, action) {
      const lang = getSupportedLanguage(action.payload);
      state.language = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* noop */
      }
    },
  },
});

export const { setLanguage } = localeSlice.actions;
export const selectLanguage = (state) => state.locale.language;

export default localeSlice.reducer;

