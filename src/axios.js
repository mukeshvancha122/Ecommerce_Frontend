import axios from "axios";
import { store } from "./store";
import { logout } from "./features/auth/AuthSlice";
import { getSupportedLanguage } from "./i18n/translations";

// Use proxy in development to avoid CORS issues, direct URL in production
const getBaseURL = () => {
  // Check for environment variable first
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
    const envUrl = process.env.REACT_APP_API_BASE_URL;
    // Ensure it includes /api if not already present
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  
  // In development, use relative path so proxy can intercept and handle CORS
  // The proxy forwards /api/* to http://54.145.239.205:8000/api/*
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    return '/api';
  }
  
  // In production, use the backend server URL directly
  return "http://54.145.239.205:8000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000, // Increased to 30 seconds
  // Performance optimizations for high traffic
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
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