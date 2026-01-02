import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import axios from "axios";
import DetailedProfitReport from "../components/DetailedProfitReport";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Dashboard() {
  const [step, setStep] = useState(0); // 0: Start, 1: Upload Orders, 2: Upload Payments, 3: SKU Cost, 4: Report
  const [userName, setUserName] = useState("");
  const [orderFile, setOrderFile] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skus, setSkus] = useState([]);
  const [skuCosts, setSkuCosts] = useState({});
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserName(email.split("@")[0]);
    }
  }, []);

  const handleOrderUpload = async () => {
    if (!orderFile) return;
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", orderFile);
      const response = await axios.post(`${API_BASE}/api/upload/orders`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setOrderSummary(response.data.data);
      setStep(2);
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
      await axios.post(`${API_BASE}/api/upload/settlement`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      // Fetch SKUs after both uploads to initialize cost management
      const response = await axios.get(`${API_BASE}/api/profit`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (response.data && response.data.skuProfits) {
        const uniqueSkus = response.data.skuProfits.map(s => s.sku);
        setSkus(uniqueSkus);
        const initialCosts = {};
        response.data.skuProfits.forEach(s => {
          initialCosts[s.sku] = s.cost || "";
        });
        setSkuCosts(initialCosts);
      }
      setStep(3);
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
      // Save each SKU cost
      await Promise.all(
        Object.entries(skuCosts).map(([sku, costPrice]) => 
          axios.put(`${API_BASE}/api/sku-cost`, 
            { sku, costPrice: parseFloat(costPrice) || 0 },
            { headers: { Authorization: `Bearer ${getToken()}` } }
          )
        )
      );
      
      // ✅ NEW: Fetch detailed report
      const response = await axios.get(`${API_BASE}/api/profit/detailed`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      setReportData(response.data.data); // Extract data from ApiResponse wrapper
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save SKU costs");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const downloadReport = () => {
    if (!reportData || !reportData.skuProfits) return;
    const headers = ["SKU", "Revenue", "Cost", "Profit", "Margin %"];
    const rows = reportData.skuProfits.map((sku) => {
      const profit = sku.profit || 0;
      const revenue = sku.revenue || 0;
      const margin = revenue ? ((profit / revenue) * 100).toFixed(2) : 0;
      return [
        sku.sku,
        revenue,
        sku.cost || 0,
        profit,
        margin
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amazon_profit_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tools = [
    {
      id: 1,
      name: "Profit Calculator",
      description: "Calculate your Amazon profit with detailed analysis",
      icon: "📊",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      action: () => setStep(1)
    },
    {
      id: 2,
      name: "SKU Analysis",
      description: "Analyze profits by individual SKU",
      icon: "📦",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      action: () => alert("Feature coming soon!")
    },
    {
      id: 3,
      name: "Revenue Report",
      description: "Detailed revenue breakdown and trends",
      icon: "📈",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      action: () => alert("Feature coming soon!")
    },
    {
      id: 4,
      name: "Expense Tracker",
      description: "Track all your selling expenses",
      icon: "💰",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      action: () => alert("Feature coming soon!")
    },
    {
      id: 5,
      name: "Tax Calculator",
      description: "Calculate taxes on your profits",
      icon: "🧮",
      color: "bg-gradient-to-br from-pink-400 to-pink-600",
      action: () => alert("Feature coming soon!")
    },
    {
      id: 6,
      name: "Inventory Manager",
      description: "Manage your product inventory",
      icon: "📦",
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      action: () => alert("Feature coming soon!")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Username */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Welcome, <span className="text-blue-600 capitalize">{userName || "User"}</span>
              </h1>
              <p className="text-slate-500">Choose a tool to analyze your Amazon business</p>
            </div>
            {reportData && (
              <div className="text-right bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-xs text-green-600 font-semibold">Latest Profit</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(reportData.totalProfit)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-red-500 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Tools Grid */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                onClick={tool.action}
                className="cursor-pointer group"
              >
                <div className={`${tool.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 h-full flex flex-col justify-between`}>
                  <div>
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                    <p className="text-white/80 text-sm">{tool.description}</p>
                  </div>
                  <div className="mt-6 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Get Started</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File Upload Section */}
        {step > 0 && step < 4 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-slate-100 px-8 py-6 border-b">
              <div className="flex justify-between max-w-3xl mx-auto">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      step === s ? "bg-blue-600 text-white shadow-lg" : step > s ? "bg-green-500 text-white" : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}>
                      {step > s ? "✓" : s}
                    </div>
                    <span className={`ml-3 text-sm font-bold ${step === s ? "text-blue-600" : step > s ? "text-green-600" : "text-slate-400"}`}>
                      {s === 1 ? "Order Sheet" : s === 2 ? "Payment Sheet" : "SKU Costs"}
                    </span>
                    {s < 3 && <div className={`flex-1 h-1 mx-4 rounded ${step > s ? "bg-green-500" : "bg-slate-200"}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-12">
            {orderSummary && step > 1 && step < 4 && (
              <div className="mb-10 bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-900 flex items-center">
                    <span className="mr-2">📋</span> Order Data Summary
                  </h3>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    File: {orderSummary.fileName}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Orders</p>
                    <p className="text-xl font-black text-blue-600">{orderSummary.totalOrders}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Sales</p>
                    <p className="text-xl font-black text-green-600">{formatCurrency(orderSummary.totalSales)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Unique SKUs</p>
                    <p className="text-xl font-black text-purple-600">{orderSummary.uniqueSkus}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Date Range</p>
                    <p className="text-sm font-bold text-slate-700">
                      {orderSummary.dateFrom} <br/> to {orderSummary.dateTo}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Step 1: Upload Order Sheet</h2>
                  <p className="text-slate-500">Please provide your Amazon Order CSV file</p>
                </div>
                
                <div className="border-3 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors bg-slate-50">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setOrderFile(e.target.files[0])}
                    className="hidden"
                    id="order-upload"
                  />
                  <label htmlFor="order-upload" className="cursor-pointer group">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📄</div>
                    <p className="text-slate-700 font-semibold mb-2">
                      {orderFile ? orderFile.name : "Click to select Order CSV or TXT"}
                    </p>
                    <p className="text-slate-400 text-sm mb-6">Max file size 10MB</p>
                    <span className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {orderFile ? "Change File" : "Browse Files"}
                    </span>
                  </label>
                </div>
                
                <div className="mt-10 flex justify-between items-center">
                  <button onClick={() => setStep(0)} className="text-slate-500 font-bold hover:text-slate-700">Cancel</button>
                  <button
                    onClick={handleOrderUpload}
                    disabled={!orderFile || loading}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50 shadow-lg hover:bg-blue-700 transition"
                  >
                    {loading ? "Uploading..." : "Next: Payment Sheet →"}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Step 2: Upload Payment Sheet</h2>
                  <p className="text-slate-500">Provide your Amazon Payment/Settlement CSV file</p>
                </div>

                <div className="border-3 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-green-400 transition-colors bg-slate-50">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setPaymentFile(e.target.files[0])}
                    className="hidden"
                    id="payment-upload"
                  />
                  <label htmlFor="payment-upload" className="cursor-pointer group">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">💰</div>
                    <p className="text-slate-700 font-semibold mb-2">
                      {paymentFile ? paymentFile.name : "Click to select Payment CSV"}
                    </p>
                    <p className="text-slate-400 text-sm mb-6">Max file size 10MB</p>
                    <span className="bg-white border-2 border-green-600 text-green-600 px-6 py-2 rounded-lg text-sm font-bold group-hover:bg-green-600 group-hover:text-white transition-colors">
                      {paymentFile ? "Change File" : "Browse Files"}
                    </span>
                  </label>
                </div>

                <div className="mt-10 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-slate-500 font-bold hover:text-slate-700">← Back</button>
                  <button
                    onClick={handlePaymentUpload}
                    disabled={!paymentFile || loading}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50 shadow-lg hover:bg-green-700 transition"
                  >
                    {loading ? "Processing..." : "Next: SKU Costs →"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Step 3: SKU Cost Management</h2>
                    <p className="text-slate-500">Enter cost price for each unique SKU found in your sheets</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                    {skus.length} SKUs Found
                  </span>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm mb-10">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">SKU Name</th>
                          <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Cost Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {skus.length > 0 ? skus.map((sku) => (
                          <tr key={sku} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-5 text-sm text-slate-900 font-medium">{sku}</td>
                            <td className="px-8 py-5">
                              <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={skuCosts[sku] || ""}
                                  onChange={(e) => setSkuCosts({...skuCosts, [sku]: e.target.value})}
                                  placeholder="0.00"
                                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="2" className="px-8 py-12 text-center text-slate-500">
                              No SKUs found. Please ensure your files have correct data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-slate-500 font-bold hover:text-slate-700">← Back</button>
                  <button
                    onClick={handleSkuCostSubmit}
                    disabled={loading || skus.length === 0}
                    className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Saving Costs..." : "Generate Final Report ✨"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && reportData && (
              <DetailedProfitReport
                reportData={reportData}
                orderSummary={orderSummary}
                skus={skus}
                downloadReport={downloadReport}
                onStartOver={() => {
                  if(window.confirm("Are you sure you want to start over? Current analysis will be cleared from view.")) {
                    setStep(0);
                    setOrderFile(null);
                    setOrderSummary(null);
                    setPaymentFile(null);
                    setReportData(null);
                  }
                }}
              />
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
