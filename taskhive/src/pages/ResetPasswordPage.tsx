import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";
import axios from "axios";
import Toast from "../components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid or missing reset token.");
    }
  }, [searchParams]);

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

  const validateForm = () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/User/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      showToast(
        "Password has been reset successfully! You can now log in with your new password.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        showToast(
          apiMessage || "Failed to reset password. Please try again.",
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
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-center">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                required
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                required
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#F57C00] to-[#FFA726] text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 text-center text-base">
            <span className="text-gray-600">Remember your password? </span>
            <Link
              to="/login"
              className="text-[#F57C00] font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
