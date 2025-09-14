import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888/api",
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication error:", error.response.data);

      // Check if it's a token expiration error
      if (error.response.data?.message?.includes("expired")) {
        // Clear any stored user data
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Check if it's a missing JWT_SECRET error
      if (error.response.data?.message?.includes("JWT_SECRET missing")) {
        console.error("Server configuration error: JWT_SECRET is missing");
        alert("Server configuration error. Please contact administrator.");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
