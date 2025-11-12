import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { clearToken } from "@/lib/auth";

// Verify API URL is configured
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    "❌ NEXT_PUBLIC_API_URL is not configured!\n" +
    "Create apps/web/.env.local with:\n" +
    "NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1"
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? useAuthStore.getState().token : null;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clear auth and redirect to signin
      clearToken();
      if (typeof window !== "undefined") {
        useAuthStore.getState().clear();
        window.location.href = "/signin";
      }
    }
    return Promise.reject(err);
  }
);

export { api };
