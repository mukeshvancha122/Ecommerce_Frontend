import axios from "axios";
import { store } from "./store";
import { logout } from "./features/auth/AuthSlice";
import { getSupportedLanguage } from "./i18n/translations";

// In development, use relative URL so proxy can intercept
// In production, use the full API URL
const getBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // In development, use relative path (proxy will handle it)
  // In production, use full URL
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  return "http://54.145.239.205:8000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
});

// attach token
API.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state?.auth?.token || JSON.parse(localStorage.getItem("auth_v1"))?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const language = getSupportedLanguage(state?.locale?.language || "en");
  config.headers["Accept-Language"] = language;
  return config;
});

// global error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(err);
  }
);

export default API;