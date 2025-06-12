import axios from "axios";
import { getCookie } from "cookies-next";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: BASE_URL + "/api",
});

api.interceptors.request.use(
  function (config) {
    const token = getCookie("auth");
    if (token && config && config.headers) {
      config.headers["authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;
