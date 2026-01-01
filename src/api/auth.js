import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authClient = axios.create({
    baseURL: `${API_BASE_URL}/api/auth`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

authClient.interceptors.request.use((config) => {
    console.log("🚀 Auth Request:", config.method.toUpperCase(), config.url);
    return config;
}, (error) => {
    console.error("❌ Auth Request Error:", error);
    return Promise.reject(error);
});

authClient.interceptors.response.use((response) => {
    console.log("✅ Auth Response:", response.status, response.data);
    return response;
}, (error) => {
    console.error("❌ Auth Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
    });
    return Promise.reject(error);
});

export const checkHealth = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        console.log("✅ Health check passed:", res.data);
        return res.data;
    } catch (err) {
        console.error("❌ Health check failed:", err.message);
        throw err;
    }
};

export const register = async (data) => {
    const res = await authClient.post("/register", data);
    return res.data;
};

export const login = async (data) => {
    const res = await authClient.post("/login", data);
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
