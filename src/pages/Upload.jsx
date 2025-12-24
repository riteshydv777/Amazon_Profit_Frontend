import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Upload() {
  const [orderLoading, setOrderLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [isOrderUploaded, setIsOrderUploaded] = useState(false);
  const [isSettlementUploaded, setIsSettlementUploaded] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const upload = async (url, file, setLoading, setUploaded) => {
    if (!file) {
      setMessage("Please select a file");
      setMessageType("error");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading to:", url);
      console.log("File:", file.name, file.type, file.size);

      await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setMessage(`✅ ${file.name} uploaded successfully!`);
      setMessageType("success");
      setUploaded(true);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Upload error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      let errorMsg = "Upload failed. Please try again.";
      if (error.response?.status === 401) {
        errorMsg = "Unauthorized. Please login again.";
      } else if (error.response?.status === 400) {
        errorMsg = error.response?.data?.message || "Invalid file format or structure";
      } else if (error.response?.status === 500) {
        errorMsg = "Server error: " + (error.response?.data?.message || "Check backend logs");
      } else if (error.message === "Network Error") {
        errorMsg = "Network error. Is backend running?";
      }
      
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <h2 className="text-3xl font-bold text-white">Upload Files</h2>
            <p className="text-blue-100 mt-2">Upload your CSV files for orders and settlements</p>
          </div>

          <div className="p-8 space-y-6">
            {message && (
              <div className={`px-6 py-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-500 transition">
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Order CSV</h3>
                  <p className="text-slate-600 text-sm mb-6">Upload your orders CSV file</p>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) =>
                        upload(
                          `${API_BASE}/api/upload/orders`,
                          e.target.files[0],
                          setOrderLoading,
                          setIsOrderUploaded
                        )
                      }
                      disabled={orderLoading}
                      className="hidden"
                    />
                    <span className={`inline-block px-6 py-3 rounded-lg font-medium transition ${
                      orderLoading
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                      {orderLoading ? "Uploading..." : "Choose File"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-green-500 transition">
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Settlement CSV</h3>
                  <p className="text-slate-600 text-sm mb-6">Upload your settlements CSV file</p>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) =>
                        upload(
                          `${API_BASE}/api/upload/settlement`,
                          e.target.files[0],
                          setSettlementLoading,
                          setIsSettlementUploaded
                        )
                      }
                      disabled={settlementLoading}
                      className="hidden"
                    />
                    <span className={`inline-block px-6 py-3 rounded-lg font-medium transition ${
                      settlementLoading
                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}>
                      {settlementLoading ? "Uploading..." : "Choose File"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">File Format Requirements</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Files must be in CSV format</li>
                <li>• First row should contain column headers</li>
                <li>• All required columns must be present</li>
                <li>• Maximum file size: 10 MB</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => navigate("/sku-cost")}
                disabled={!isOrderUploaded || !isSettlementUploaded}
                className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-lg ${
                  isOrderUploaded && isSettlementUploaded
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105"
                    : "bg-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                Proceed to SKU Cost Management →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
