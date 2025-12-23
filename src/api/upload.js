import axios from "axios";
import { getToken } from "../utils/auth";

const API = "http://localhost:8080/upload";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "multipart/form-data",
  },
});

export const uploadOrders = async (file) => {
  const form = new FormData();
  form.append("file", file);
  await axios.post(`${API}/order`, form, authHeader());
};

export const uploadSettlement = async (file) => {
  const form = new FormData();
  form.append("file", file);
  await axios.post(`${API}/settlement`, form, authHeader());
};
