import { BrowserRouter, Routes, Route } from "react-router-dom";
import { isLoggedIn } from "./utils/auth";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import SkuCost from "./pages/SkuCost";
import Profit from "./pages/Profit";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      {isLoggedIn() && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/sku-cost" element={<ProtectedRoute><SkuCost /></ProtectedRoute>} />
        <Route path="/profit" element={<ProtectedRoute><Profit /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}