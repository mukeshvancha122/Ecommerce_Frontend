import axios from "axios";
import { store } from "./store";
import { logout } from "./features/auth/AuthSlice";
import { getSupportedLanguage } from "./i18n/translations";
import { USE_DUMMY_DATA, API_MODE } from "./config/apiConfig";
import { setupMockInterceptor } from "./utils/mockApiInterceptor";

const getBaseURL = () => {
  // If using dummy data, return empty string (requests will be intercepted)
  if (USE_DUMMY_DATA) {
    console.log('🔧 Using empty baseURL for dummy data mode');
    return '';
  }

  // In development, use proxy to avoid CORS issues
  // The proxy (setupProxy.js) will forward /api/* requests to AWS backend
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Using proxy in development mode (CORS bypass)');
    return ''; // Use proxy from setupProxy.js
  }

  // In production, use the API base URL directly
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  return "http://54.145.239.205:8000";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 15000,
});

// Log API mode on initialization
if (process.env.NODE_ENV === 'development') {
  console.log(`🔌 Axios configured for: ${API_MODE} mode`);
}

// Setup mock interceptor if using dummy data (must be before token interceptor)
setupMockInterceptor(API);

// attach token (skip for dummy data mode)
API.interceptors.request.use((config) => {
  // Skip token attachment in dummy data mode (no real requests)
  if (USE_DUMMY_DATA) {
    return config;
  }
  
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