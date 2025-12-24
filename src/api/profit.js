import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${API_BASE}/profit/summary`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getProfitSummary = async () => {
  const res = await axios.get(API, authHeader());
  return res.data;
};
