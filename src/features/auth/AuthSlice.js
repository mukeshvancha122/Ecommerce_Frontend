import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "auth_v1";

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { user:null, token:null }; }
  catch { return { user:null, token:null }; }
};
const save = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }));
const clear = () => localStorage.removeItem(STORAGE_KEY);

const initialState = { user: null, token: null, status: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const s = load();
      state.user = s.user || null;
      state.token = s.token || null;
    },
    setCredentials(state, action) {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      save(state);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      clear();
    },
  },
});

export const { hydrateFromStorage, setCredentials, logout } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;

export default authSlice.reducer;