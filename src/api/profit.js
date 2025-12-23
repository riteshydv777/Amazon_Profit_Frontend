import axios from "axios";
import { getToken } from "../utils/auth";

const API = "http://localhost:8080/profit/summary";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getProfitSummary = async () => {
  const res = await axios.get(API, authHeader());
  return res.data;
};
