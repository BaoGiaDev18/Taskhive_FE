import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";
import axios from "axios";
import Toast from "../components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/User/request-password-reset", {
        email,
      });

      showToast(
        "Password reset link has been sent to your email. Please check your inbox.",
        "success"
      );
      setEmail(""); // Clear email field
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        showToast(
          apiMessage || "Failed to send reset email. Please try again.",
          "error"
        );
      } else {
        showToast(
          "Network error. Please check your connection and try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="w-full max-w-lg">
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <img src={Logo} alt="TaskHive" className="h-10" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
            Reset Password
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#F57C00] to-[#FFA726] text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-8 text-center text-base space-y-2">
            <div>
              <span className="text-gray-600">Remember your password? </span>
              <Link
                to="/login"
                className="text-[#F57C00] font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
            <div>
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="text-[#F57C00] font-medium hover:underline"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
