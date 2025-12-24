import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${API_BASE}/api/auth`;

const apiClient = axios.create({
    baseURL: API,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    console.log("API Request:", config.method.toUpperCase(), config.url);
    return config;
}, (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    console.log("API Response:", response.status, response.data);
    return response;
}, (error) => {
    console.error("Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
    });
    return Promise.reject(error);
});

export const checkHealth = async () => {
    try {
        const res = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
        return res.data;
    } catch (err) {
        console.error("Health check failed:", err.message);
        throw err;
    }
};

export const register = async (data) => {
    const res = await apiClient.post("/register", data);
    return res.data;
};

export const login = async (data) => {
    const res = await apiClient.post("/login", data);
    return res.data;
};

export const setToken = (token) => {
    localStorage.setItem("token", token);
};

export const getToken = () => {
    return localStorage.getItem("token");
};

export const isLoggedIn = () => {
    return !!localStorage.getItem("token");
};

export const logout = () => {
    localStorage.removeItem("token");
};
