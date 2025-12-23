import { useState } from "react";
import { register as registerAPI } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await registerAPI({
        email,
        password,
      });
      setError("Registration successful! Redirecting to login...");
      setError("");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Register error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-8">
            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
            <p className="text-green-100 text-center mt-2">Join us today</p>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-5">
            {error && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                error.includes("successful") 
                  ? "bg-green-900/30 border border-green-700 text-green-200" 
                  : "bg-red-900/30 border border-red-700 text-red-200"
              }`}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="px-8 pb-8 border-t border-slate-700 pt-6">
            <p className="text-slate-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
