import axios from "axios";
import { getToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        console.log("🚀 API Request:", config.method.toUpperCase(), config.url);
        
        // Skip token for auth endpoints
        if (!config.url?.includes("/api/auth")) {
            const token = getToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
                console.log("🔑 Token attached");
            }
        }
        return config;
    },
    (error) => {
        console.error("❌ API Request Error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("✅ API Response:", response.status);
        return response;
    },
    (error) => {
        console.error("❌ API Response Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
        });
        return Promise.reject(error);
    }
);

export default api;
