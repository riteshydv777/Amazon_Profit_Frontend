import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${API_BASE}/sku-cost`;

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const saveSkuCost = async (data) => {
  await axios.post(API, data, authHeader());
};

export const getAllSkuCosts = async () => {
  const res = await axios.get(API, authHeader());
  return res.data;
};
