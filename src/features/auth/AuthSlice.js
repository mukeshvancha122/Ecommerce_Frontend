import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "auth_v1";

const load = () => {
  try { 
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { user: null, token: null };
    const parsed = JSON.parse(stored);
    return { 
      user: parsed.user || null, 
      token: parsed.token || null 
    };
  }
  catch (err) { 
    console.error("Error loading auth from storage:", err);
    return { user: null, token: null }; 
  }
};
const save = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      user: state.user, 
      token: state.token 
    }));
  } catch (err) {
    console.error("Error saving auth to storage:", err);
  }
};
const clear = () => localStorage.removeItem(STORAGE_KEY);

const initialState = { user: null, token: null, status: "idle" };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const s = load();
      console.log("Hydrating auth from storage:", { 
        hasUser: !!s.user, 
        userEmail: s.user?.email,
        hasToken: !!s.token 
      });
      state.user = s.user || null;
      state.token = s.token || null;
      console.log("Auth state after hydration:", { 
        hasUser: !!state.user, 
        userEmail: state.user?.email,
        hasToken: !!state.token 
      });
    },
    setCredentials(state, action) {
      const { user, token } = action.payload || {};
      console.log("Setting credentials:", { 
        hasUser: !!user, 
        userEmail: user?.email,
        hasToken: !!token 
      });
      state.user = user || null;
      state.token = token || null;
      save(state);
      console.log("Auth state after setCredentials:", { 
        hasUser: !!state.user, 
        userEmail: state.user?.email,
        hasToken: !!state.token 
      });
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