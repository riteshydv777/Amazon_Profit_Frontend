import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import DetailedProfitReport from "./DetailedProfitReport";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:8080");

export default function Dashboard() {
  /* =========================
     STATE
     ========================= */
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");

  const [orderFile, setOrderFile] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);

  const [orderSummary, setOrderSummary] = useState(null);
  const [skus, setSkus] = useState([]);
  const [skuCosts, setSkuCosts] = useState({});

  const [reportData, setReportData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================
     INIT
     ========================= */
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserName(email.split("@")[0]);
  }, []);

  /* =========================
     HELPERS
     ========================= */
  const authHeaders = {
    Authorization: `Bearer ${getToken()}`,
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);

  /* =========================
     STEP 1 — ORDER UPLOAD
     ========================= */
  const handleOrderUpload = async () => {
    if (!orderFile) return;

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", orderFile);

      const res = await axios.post(
        `${API_BASE}/api/upload/orders`,
        formData,
        { headers: authHeaders }
      );

      setOrderSummary(res.data.data);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Order upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP 2 — PAYMENT UPLOAD
     ========================= */
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
        { headers: authHeaders }
      );

      /* Fetch unique SKUs */
      const skuRes = await axios.get(`${API_BASE}/api/sku`, {
        headers: authHeaders,
      });

      const skuList = Array.isArray(skuRes.data)
        ? skuRes.data
        : skuRes.data?.data || [];

      const uniqueSkus = Array.from(
        new Set(
          skuList
            .filter((s) => s && s.trim())
            .map((s) => s.trim().toUpperCase())
        )
      ).sort();

      /* Fetch existing SKU costs */
      const costRes = await axios.get(`${API_BASE}/api/sku-cost`, {
        headers: authHeaders,
      });

      const costMap = {};
      if (Array.isArray(costRes.data)) {
        costRes.data.forEach((c) => {
          if (c.sku) costMap[c.sku] = c.costPrice;
        });
      }

      const initialCosts = {};
      uniqueSkus.forEach((sku) => {
        initialCosts[sku] = costMap[sku] || "";
      });

      setSkus(uniqueSkus);
      setSkuCosts(initialCosts);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STEP 3 — SAVE SKU COSTS + REPORT
     ========================= */
  const handleSkuCostSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      /* Save SKU costs */
      await Promise.all(
        Object.entries(skuCosts).map(([sku, costPrice]) =>
          axios.put(
            `${API_BASE}/api/sku-cost`,
            { sku, costPrice: Number(costPrice) || 0 },
            { headers: authHeaders }
          )
        )
      );

      /* Fetch detailed profit */
      const res = await axios.get(`${API_BASE}/api/profit/detailed`, {
        headers: authHeaders,
      });

      const backend = res.data.data || res.data;

      /* Normalize data for UI */
      const transformed = {
        totalSales: backend.totalSales || 0,
        purchaseCost: backend.purchaseCost || 0,
        profit: backend.profit || 0,
        profitMargin: backend.profitMargin || 0,
        shippingAndFees: backend.shippingAndFees || 0,
        netSettlement: backend.netSettlement || 0,
        otherCharges: backend.otherCharges || 0,

        dateFrom: backend.dateFrom,
        dateTo: backend.dateTo,

        orderDetails: backend.orderDetails,
        fulfillmentDetails: backend.fulfillmentDetails,
        returnsDetails: backend.returnsDetails,

        skuWiseDetails: backend.skuWiseDetails || [],
        bankTransfers: backend.bankTransfers || [],
      };

      setReportData(transformed);
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.message || "Report generation failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-slate-500">Amazon Profit Dashboard</p>
        </div>

        {reportData && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-xs text-green-700">Latest Profit</p>
            <p className="text-2xl font-bold text-green-800">
              {formatCurrency(reportData.profit)}
            </p>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {message && (
        <div className="max-w-4xl mx-auto mt-6 bg-red-50 border border-red-200 p-4 rounded">
          {message}
        </div>
      )}

      {/* STEP CONTENT */}
      <div className="max-w-5xl mx-auto p-6">
        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="bg-blue-600 text-white px-6 py-3 rounded font-bold"
          >
            Start Profit Calculation
          </button>
        )}

        {step === 1 && (
          <>
            <input type="file" onChange={(e) => setOrderFile(e.target.files[0])} />
            <button onClick={handleOrderUpload} disabled={loading}>
              Upload Orders
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="file"
              onChange={(e) => setPaymentFile(e.target.files[0])}
            />
            <button onClick={handlePaymentUpload} disabled={loading}>
              Upload Payments
            </button>
          </>
        )}

        {step === 3 && (
          <>
            {skus.map((sku) => (
              <div key={sku} className="flex gap-4 mb-2">
                <span className="w-40">{sku}</span>
                <input
                  type="number"
                  value={skuCosts[sku]}
                  onChange={(e) =>
                    setSkuCosts({ ...skuCosts, [sku]: e.target.value })
                  }
                />
              </div>
            ))}
            <button onClick={handleSkuCostSubmit} disabled={loading}>
              Generate Report
            </button>
          </>
        )}

        {step === 4 && reportData && (
          <DetailedProfitReport reportData={reportData} />
        )}
      </div>
    </div>
  );
}
