import axios from "axios";

const api = axios.create({
  baseURL: "http://13.61.61.180:8080/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    // Special handling for FormData
    if (config.data instanceof FormData) {
      // Let the browser set Content-Type with boundary
      delete config.headers['Content-Type'];
      
      // Some backends need this for file uploads
      config.headers['Accept'] = 'application/json, application/*+json';
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;