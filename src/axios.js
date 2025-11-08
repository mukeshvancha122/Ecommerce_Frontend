import axios from "axios";
import { store } from "./store";
import { logout } from "./features/auth/AuthSlice";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15000,
});

// attach token
API.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state?.auth?.token || JSON.parse(localStorage.getItem("auth_v1"))?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
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