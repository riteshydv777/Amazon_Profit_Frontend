import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    // 🔥 DO NOT attach token for auth endpoints
    if (!config.url.includes("/api/auth")) {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

return config;

export default api;