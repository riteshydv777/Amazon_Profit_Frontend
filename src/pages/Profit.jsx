import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Profit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/profit`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profit data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading profit data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg max-w-md">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return "text-green-600";
    if (profit < 0) return "text-red-600";
    return "text-slate-600";
  };

  const downloadCSV = () => {
    if (!data.skuProfits || data.skuProfits.length === 0) return;

    const headers = ["SKU", "Revenue", "Cost", "Profit", "Margin %"];
    const rows = data.skuProfits.map((sku) => {
      const skuProfit = sku.profit || 0;
      const skuMargin = sku.revenue ? ((skuProfit / sku.revenue) * 100).toFixed(2) : 0;
      return [
        sku.sku,
        sku.revenue,
        sku.cost,
        skuProfit,
        skuMargin
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sku_profit_analysis.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Profit Dashboard</h1>
          <p className="text-slate-600">Monitor your sales, costs, and profit metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(data.totalRevenue)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-slate-600 text-sm font-medium">Total Cost</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {formatCurrency(data.totalCost)}
            </p>
          </div>

          <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${data.totalProfit > 0 ? 'border-green-500' : 'border-red-500'}`}>
            <p className="text-slate-600 text-sm font-medium">Total Profit</p>
            <p className={`text-2xl font-bold mt-2 ${getProfitColor(data.totalProfit)}`}>
              {formatCurrency(data.totalProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm font-medium">Profit Margin</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {(data.margin || 0).toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <p className="text-slate-600 text-sm font-medium">Total Settlement</p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">
              {formatCurrency(data.totalSettlement)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">SKU-wise Profit Analysis</h2>
              <p className="text-emerald-100 text-sm mt-1">Detailed profit breakdown by SKU</p>
            </div>
            <button
              onClick={downloadCSV}
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">SKU</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Revenue</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Cost</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Profit</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.skuProfits && data.skuProfits.map((sku, index) => {
                  const skuProfit = (sku.profit || 0);
                  const skuMargin = sku.revenue ? ((skuProfit / sku.revenue) * 100).toFixed(2) : 0;
                  return (
                    <tr
                      key={sku.sku || index}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">{sku.sku}</td>
                      <td className="px-6 py-4 text-right text-blue-600 font-medium">
                        {formatCurrency(sku.revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-orange-600 font-medium">
                        {formatCurrency(sku.cost)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${getProfitColor(skuProfit)}`}>
                        {formatCurrency(skuProfit)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${getProfitColor(skuProfit)}`}>
                        {skuMargin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!data.skuProfits || data.skuProfits.length === 0) && (
            <div className="px-8 py-12 text-center">
              <p className="text-slate-600">No SKU data available. Please upload your data first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
