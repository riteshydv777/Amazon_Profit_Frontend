import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";
import axios from "axios";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const email = localStorage.getItem("userEmail");
        if (email) {
          setUserName(email.split("@")[0]);
        }

        const response = await axios.get("http://localhost:8080/api/profit", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setStats({
            totalRevenue: response.data.totalRevenue || 0,
            totalProfit: response.data.totalProfit || 0,
            totalCost: response.data.totalCost || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const menuItems = [
    {
      icon: "📊",
      title: "View Profit",
      description: "Check your profit analysis",
      link: "/profit",
      color: "from-blue-600 to-blue-700",
    },
    {
      icon: "📤",
      title: "Upload Files",
      description: "Upload CSV files",
      link: "/upload",
      color: "from-green-600 to-green-700",
    },
    {
      icon: "💰",
      title: "SKU Cost",
      description: "Manage SKU costs",
      link: "/sku-cost",
      color: "from-purple-600 to-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent capitalize">{userName || "User"}</span>!
          </h1>
          <p className="text-xl text-slate-600">Here's your business overview at a glance</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    💵
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Cost</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {formatCurrency(stats.totalCost)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                    📉
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-lg p-8 border-l-4 ${stats.totalProfit > 0 ? 'border-green-500' : 'border-red-500'} hover:shadow-xl transition`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Profit</p>
                    <p className={`text-3xl font-bold mt-2 ${stats.totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.totalProfit)}
                    </p>
                  </div>
                  <div className={`w-14 h-14 ${stats.totalProfit > 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center text-2xl`}>
                    {stats.totalProfit > 0 ? "📈" : "📊"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.link}
                    className={`bg-gradient-to-br ${item.color} rounded-xl p-6 text-white hover:shadow-lg transform hover:scale-105 transition duration-300`}
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="opacity-90 text-sm">{item.description}</p>
                    <div className="mt-4 inline-flex items-center text-sm font-medium">
                      Go to page →
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">💡</span>
                  Quick Tips
                </h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>• Upload your CSV files to get started</li>
                  <li>• Set cost prices for accurate profit calculations</li>
                  <li>• Check profit analytics regularly</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="text-xl mr-2">✨</span>
                  Latest Features
                </h3>
                <ul className="text-green-800 space-y-2 text-sm">
                  <li>• SKU-wise profit analysis</li>
                  <li>• Real-time profit calculations</li>
                  <li>• Secure token-based authentication</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
