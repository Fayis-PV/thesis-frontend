import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./auth-utils";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Attaches Token)
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Enforce Django trailing slash
    if (config.url && !config.url.endsWith("/") && !config.url.includes("?")) {
      config.url += "/";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor (Unwraps data & handles silent refresh)
api.interceptors.response.use(
  (response) => {
    // Return only the payload (the APIResponse object)
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        // Use standard axios to avoid infinite loops with our own interceptor
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        // Django SimpleJWT returns the new tokens directly here
        const { access, refresh } = response.data;
        setTokens(access, refresh || refreshToken);

        // Update the failed request with the new token and retry it
        originalRequest.headers["Authorization"] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., it expired after 7 days), log them out
        clearTokens();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      }
    }

    // Format other errors cleanly
    const responseData = error.response?.data;
    let message = "An unexpected network error occurred";

    if (responseData) {
      if (responseData.message) {
        message = responseData.message;
      } else if (responseData.detail) {
        message = responseData.detail;
      } else if (typeof responseData === "object") {
        // Fallback for standard DRF field errors like {"code": ["This field must be unique."]}
        const extractedErrors = Object.values(responseData).flat();
        if (
          extractedErrors.length > 0 &&
          typeof extractedErrors[0] === "string"
        ) {
          message = extractedErrors.join(" | ");
        }
      }
    }
    return Promise.reject({
      message,
      errors: responseData?.errors || [],
      status: error.response?.status,
    });
  },
);
