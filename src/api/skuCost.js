import axios from "axios";
import { getToken } from "../utils/auth";

const API = "http://localhost:8080/sku-cost";

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
