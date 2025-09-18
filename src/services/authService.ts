import axios from "axios";
import {
  User,
  LoginCredentials,
  RegisterData,
  ApiResponse,
} from "../types/auth";

const API_BASE = import.meta.env.VITE_API_LINK_BE;

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const url = `${API_BASE}/api/login`;
    try {
      const res = await axios.post(url, credentials, {
        withCredentials: true,
      });

      console.log("Login API response:", res.data);

      // Handle your specific API response structure
      if (res.data && res.data.status === "success") {
        return {
          success: true,
          message: res.data.message || "Login successful",
          data: {
            id: res.data.id || "",
            nama: res.data.name,
            email: res.data.email,
            role: res.data.role,
          },
        };
      }

      return {
        success: false,
        message: res.data.message || "Login failed",
      };
    } catch (error: any) {
      console.error("Login API error:", error.response?.data || error.message);
      throw error;
    }
  },

  async logout(): Promise<ApiResponse> {
    const url = `${API_BASE}/api/logout`;
    try {
      const res = await axios.post<ApiResponse>(
        url,
        {},
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Logout API error:", error);
      return { success: true, message: "Logged out" };
    }
  },

  async getMe(): Promise<ApiResponse<User>> {
    const url = `${API_BASE}/api/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      console.log("GetMe API response:", res.data);

      // Handle your specific API response structure for /me endpoint
      if (res.data && (res.data.status === "success" || res.data.email)) {
        return {
          success: true,
          message: "User data retrieved",
          data: {
            id: res.data.id || "",
            nama: res.data.name || res.data.nama,
            email: res.data.email,
            role: res.data.role,
          },
        };
      }

      return {
        success: false,
        message: "Failed to get user data",
      };
    } catch (error: any) {
      if (error?.response?.status === 500) {
        console.log(
          "Server error when checking auth - likely not authenticated"
        );
      }
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    const url = `${API_BASE}/api/users`;
    try {
      const res = await axios.post<ApiResponse<User>>(url, userData, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
