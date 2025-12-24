import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function SkuCost() {
  const [sku, setSku] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const save = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!sku || !costPrice) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${API_BASE}/api/sku-cost`,
        { sku, costPrice: parseFloat(costPrice) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessage("SKU cost saved successfully!");
      setMessageType("success");
      setSku("");
      setCostPrice("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save SKU cost. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-8">
            <h2 className="text-3xl font-bold text-white">SKU Cost Management</h2>
            <p className="text-purple-100 mt-2">Set or update the cost price for your SKUs</p>
          </div>

          <form onSubmit={save} className="p-8 space-y-6">
            {message && (
              <div className={`px-6 py-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                {message}
              </div>
            )}

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-3">
                SKU
              </label>
              <input
                type="text"
                placeholder="Enter SKU (e.g., SKU-123456)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-3">
                Cost Price (₹)
              </label>
              <input
                type="number"
                placeholder="Enter cost price"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
              >
                {loading ? "Saving..." : "Save SKU Cost"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full py-3 bg-white border border-purple-200 text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </form>

          <div className="px-8 pb-8 border-t border-slate-200 pt-6 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Tips:</h3>
            <ul className="text-slate-700 space-y-2 text-sm">
              <li>• Use unique SKU identifiers</li>
              <li>• Update costs regularly for accurate profit calculations</li>
              <li>• Cost price should be in your base currency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
