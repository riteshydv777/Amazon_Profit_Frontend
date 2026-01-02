import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Dashboard() {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("dashboardStep");
    return saved ? Number(saved) : 0;
  });

  const [userName, setUserName] = useState("");
  const [orderFile, setOrderFile] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skus, setSkus] = useState([]);
  const [skuCosts, setSkuCosts] = useState({});
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState("");

  const setStepSafe = (value) => {
    setStep(value);
    localStorage.setItem("dashboardStep", value);
  };

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserName(email.split("@")[0]);
    }
  }, []);

  // Auto move to report if report exists (important for refresh)
  useEffect(() => {
    if (reportData) {
      setStepSafe(4);
    }
  }, [reportData]);

  const handleOrderUpload = async () => {
    if (!orderFile) return;
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", orderFile);

      const response = await axios.post(
        `${API_BASE}/api/upload/orders`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setOrderSummary(response.data.data);
      setStepSafe(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to upload order sheet");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async () => {
    if (!paymentFile) return;
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", paymentFile);

      await axios.post(
        `${API_BASE}/api/upload/settlement`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const response = await axios.get(`${API_BASE}/api/profit`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.data?.skuProfits) {
        const uniqueSkus = response.data.skuProfits.map((s) => s.sku);
        setSkus(uniqueSkus);

        const costs = {};
        response.data.skuProfits.forEach((s) => {
          costs[s.sku] = s.cost || "";
        });
        setSkuCosts(costs);
      }

      setStepSafe(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to upload payment sheet");
    } finally {
      setLoading(false);
    }
  };

  const handleSkuCostSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      await Promise.all(
        Object.entries(skuCosts).map(([sku, cost]) =>
          axios.put(
            `${API_BASE}/api/sku-cost`,
            { sku, costPrice: parseFloat(cost) || 0 },
            { headers: { Authorization: `Bearer ${getToken()}` } }
          )
        )
      );

      const response = await axios.get(`${API_BASE}/api/profit`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setReportData(response.data);
      setStepSafe(4);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save SKU costs");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const downloadReport = () => {
    if (!reportData?.skuProfits) return;

    const headers = ["SKU", "Revenue", "Cost", "Profit", "Margin %"];
    const rows = reportData.skuProfits.map((s) => {
      const margin = s.revenue
        ? ((s.profit / s.revenue) * 100).toFixed(2)
        : 0;
      return [s.sku, s.revenue, s.cost || 0, s.profit, margin];
    });

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `amazon_profit_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  /* ---------------- UI RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome,{" "}
              <span className="text-blue-600 capitalize">
                {userName || "User"}
              </span>
            </h1>
            <p className="text-slate-500">
              Choose a tool to analyze your Amazon business
            </p>
          </div>

          {reportData && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-xs text-green-600 font-semibold">
                Latest Profit
              </p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(reportData.totalProfit)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-6">
            {message}
          </div>
        )}

        {/* FINAL REPORT — ALWAYS SHOW IF EXISTS */}
        {reportData && step === 4 && (
          <div>
            <h2 className="text-4xl font-extrabold mb-6">
              Profit Analysis Report
            </h2>

            <button
              onClick={downloadReport}
              className="mb-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold"
            >
              Download CSV
            </button>

            {/* You already have the full table UI below — unchanged */}
            {/* KEEP YOUR EXISTING REPORT JSX HERE */}
          </div>
        )}

        {/* START OVER */}
        {step === 4 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                localStorage.removeItem("dashboardStep");
                setStep(0);
                setOrderSummary(null);
                setReportData(null);
              }}
              className="text-slate-500 font-bold hover:text-blue-600"
            >
              ↻ Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
