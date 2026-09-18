import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://prayaas-portal.onrender.com"
    : "http://localhost:5000");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    // Check for admin token or user token
    const token =
      Cookies.get("prayaas_admin_token") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("prayaas_admin_token")
        : null) ||
      Cookies.get("prayaas_user_token") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("prayaas_token")
        : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
