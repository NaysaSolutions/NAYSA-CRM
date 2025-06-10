// utils/api.js
import axios from "axios";

const BASE_URL = process.env.NODE_ENV === 'development'
  ? "http://127.0.0.1:8000/api"
  : "http://192.168.56.1:82/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    // common headers can be set here if any
  }
});

// Generic POST request
export const PostAPI = async (endpoint, data, config = {}) => {
  try {
    const response = await axiosInstance.post(endpoint, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Generic GET request
export const GetAPI = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await axiosInstance.get(endpoint, { params, ...config });
    return response;
  } catch (error) {
    throw error;
  }
};

// Export BASE_URL if you still want to use it for fetch calls outside axios
export { BASE_URL };
