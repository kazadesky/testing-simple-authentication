import { defineStore } from "pinia";
import axios from "axios";
import Cookies from "js-cookie";
import { ref } from "vue";

export const useAuthenticationStore = defineStore("authentication", () => {
  const BASE_URL = ref("http://localhost:3000/api/auth");

  // Inisialisasi token dari cookie (jika ada)
  const token = ref(Cookies.get("accessToken") || "");
  const user = ref(null);
  // Status pending verifikasi (backend mengambilkan {pending: tru, pendingData: { ... }})
  const pendingVerification = ref(null);

  // State untuk forgot password
  const forgotPasswordMessage = ref("");
  const forgotPasswordError = ref("");

  // State untuk reset password
  const resetPasswordMessage = ref("");
  const resetPasswordError = ref("");

  // Fungsi untuk menyimpan token ke cookie dan state
  const setToken = (newToken) => {
    token.value = newToken;
    Cookies.set("accessToken", newToken, { expires: 1 / 24, secure: true, sameSite: "Strict" });
  };

  // Fungsi untuk menghapus token dari cookie dan state
  const clearToken = () => {
    token.value = "";
    Cookies.remove("accessToken");
  };

  // Register: memanggil endpoint /auth/register
  const register = async (payload) => {
    try {
      const response = await axios.post(`${BASE_URL.value}/register`, payload, {
        withCredentials: true,
      });

      // Jika backend mengembalikan pending verifikasi, simpan status tersebut
      if (response.data.pending) {
        pendingVerification.value = response.data.pendingData || true;
      }
      return response.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  // Aksi untuk mengecek status pending verifikasi
  const checkStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL.value}/status`, { withCredentials: true });
      return response.data; // { pending: true/false, pendingData: { ... } }
    } catch (error) {
      console.error("Error checking status:", error);
      return { pending: false };
    }
  };

  // Resend verification email: memanggil endpoint /auth/resend-verification
  const resendVerification = async () => {
    try {
      const response = await axios.post(`${BASE_URL.value}/resend-verification`, {}, { withCredentials: true });

      // Bisa perbaharui pending jika diperlukan
      return response.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  // Recreate account: memanggil endpoint /auth/recreate-account
  const recreateAccount = async () => {
    try {
      const response = await axios.post(`${BASE_URL.value}/recreate-account`, {}, { withCredentials: true });

      // Hapus status pending
      pendingVerification.value = null;
      Cookies.remove("connect.sid");
      return response.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  // Email verified: memanggil endpoint /auth/email-verified
  const emailVerified = async (token) => {
    try {
      const response = await axios.post(`${BASE_URL.value}/verify-email?token=${token}`, {}, { withCredentials: true });

      return response.data;
    } catch (error) {
      console.error(error.message);
    }
  };

  // Login: memanggil endpoint /auth/login
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL.value}/login`, credentials);
      setToken(response.data.token);
      await fetchProfile();
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  // Fetch profile: mengembalikan data user berdasarkan token
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL.value}/profile`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = res.data?.data;
    } catch (error) {
      user.value = null;
      console.error(error.message);
    }
  };

  // Logout: memanggil endpoint logout (jika ada) dan menghapus token
  const logout = async () => {
    try {
      await axios.post(`${BASE_URL.value}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error(error);
    } finally {
      clearToken();
      user.value = null;
    }
  };

  const isAuthenticated = () => !!token.value;

  // Forgot password: memanggil endpoint /auth/forgot-password
  const forgotPassword = async (email) => {
    forgotPasswordMessage.value = "";
    forgotPasswordError.value = "";

    try {
      const response = await axios.post(`${BASE_URL.value}/forgot-password`, email);
      forgotPasswordMessage.value = response.data.message;
    } catch (error) {
      console.error(error.message);
      forgotPasswordError.value = error.response?.data?.message || "Error sending reset email";
    }
  };

  // Reset Password: memanggil endpoint /auth/reset-password
  const resetPassword = async (resetToken, newPassword) => {
    resetPasswordMessage.value = "";
    resetPasswordError.value = "";

    try {
      const response = await axios.post(`${BASE_URL.value}/reset-password`, {
        token: resetToken,
        newPassword, // Perbaikan: gunakan "newPassword" sesuai dengan backend
      });
      resetPasswordMessage.value = response.data.message;
    } catch (error) {
      console.error(error.message);
      resetPasswordError.value = error.response?.data?.message || "Error resetting password";
    }
  };

  const showPassword = ref(false);
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };

  return {
    token,
    user,
    pendingVerification,
    forgotPasswordMessage,
    forgotPasswordError,
    resetPasswordMessage,
    resetPasswordError,
    register,
    checkStatus,
    resendVerification,
    recreateAccount,
    emailVerified,
    login,
    fetchProfile,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    setToken,
    clearToken,
    showPassword,
    togglePassword,
  };
});
