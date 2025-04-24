import axios from "axios";

const api = axios.create({
  //baseURL: "/api-proxy",
  baseURL: "http://212.85.26.46:8082/api/v1/",
  // Remove the default Content-Type header
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 