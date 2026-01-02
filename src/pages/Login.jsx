import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, setToken, checkHealth } from "../api/auth";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);
    const navigate = useNavigate();

    // Check backend health on component mount
    useEffect(() => {
        const testConnection = async () => {
            try {
                const health = await checkHealth();
                setHealthStatus({ status: "connected", data: health });
                console.log("✅ Backend is reachable:", health);
            } catch (err) {
                setHealthStatus({ status: "error", message: err.message });
                console.error("❌ Backend connection failed:", err);
            }
        };
        testConnection();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            console.log("🔐 Attempting login...");
            const response = await login(formData);
            console.log("✅ Login successful:", response);
            
            setToken(response.token);
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Login failed:", err);
            setError(err.response?.data?.message || err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
                    Welcome Back
                </h2>
                
                {/* Backend Connection Status */}
                <div className="mb-4 p-3 rounded text-sm">
                    {healthStatus === null && (
                        <div className="text-yellow-400">🔄 Checking backend connection...</div>
                    )}
                    {healthStatus?.status === "connected" && (
                        <div className="text-green-400">✅ Backend connected</div>
                    )}
                    {healthStatus?.status === "error" && (
                        <div className="text-red-400">
                            ❌ Cannot connect to backend
                            <div className="text-xs mt-1">{healthStatus.message}</div>
                        </div>
                    )}
                </div>

                <p className="text-gray-400 text-center mb-6">
                    Sign in to your account
                </p>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || healthStatus?.status === "error"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="text-gray-400 text-center mt-6">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-400 hover:underline">
                        Sign Up
                    </a>
                </p>

                {/* Debug Info */}
                <div className="mt-4 p-2 bg-gray-700 rounded text-xs text-gray-400">
                    <div>API: {import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}</div>
                </div>
            </div>
        </div>
    );
};

export default Login;