import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";
import axios from "axios";
import Toast from "../components/Toast";
import GoogleLoginButton from "../components/GoogleLoginButton";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
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

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await api.post("/api/User/resend-verification", { email });
      setError("Verification email sent. Please check your inbox.");
      setNeedsVerification(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        if (
          err.response.status === 400 &&
          apiMessage?.includes("already been sent")
        ) {
          setError(
            "A verification email has already been sent. Please check your inbox."
          );
        } else {
          setError(apiMessage || "Failed to resend verification email.");
        }
      } else {
        setError("Failed to resend verification email.");
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setLoading(true);

    try {
      const response = await api.post("/api/User/login", {
        email,
        password,
      });

      // Handle regular login response
    const { accessToken, refreshToken, expiresAt, message } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem("jwtToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tokenExpiresAt", expiresAt);


      showToast(message || "Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        if (
          err.response.status === 401 &&
          apiMessage?.includes("verify your email")
        ) {
          setError(apiMessage);
          setNeedsVerification(true);
        } else {
          setError(apiMessage || "Login failed. Please try again.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    try {
      const response = await api.post("/api/User/google-login", {
        idToken: credential,
      });

      // Handle Google login response - different structure
      const { accessToken, refreshToken, expiresAt, message } = response.data;

      // Store tokens in localStorage
      localStorage.setItem("jwtToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiresAt", expiresAt);

      showToast(
        message || "Google login successful! Redirecting...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;

        // Check if user needs to register with Google
        if (apiMessage === "GOOGLE_REGISTER_REQUIRED") {
          // Store Google token for registration process
          sessionStorage.setItem("googleIdToken", credential);
          showToast("Please complete your registration", "info");
          setTimeout(() => {
            navigate("/register?googleRegister=true");
          }, 1000);
          return;
        }

        showToast(
          apiMessage || "Google login failed. Please try again.",
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

  const handleGoogleError = (error: unknown) => {
    console.error("Google login error:", error);
    showToast("Google login failed. Please try again.", "error");
  };

  return (
    <div className="w-full max-w-lg px-4">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <img src={Logo} alt="TaskHive" className="h-8" />
      </div>

      <h1 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
        Sign in
      </h1>

      {/* Google Login Button */}
      <div className="mb-6">
        <GoogleLoginButton
          onSuccess={handleGoogleLogin}
          onError={handleGoogleError}
          disabled={loading}
        />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="text-xs text-[#F57C00] underline hover:text-[#E65100] mt-1 disabled:opacity-50"
              >
                {resendingVerification ? "Resending..." : "resend verification"}
              </button>
            )}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-6 py-4 text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm"
          required
          disabled={loading}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm"
            required
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6.5C9.33 6.5 6.95 8.02 5.64 10.5C6.95 12.98 9.33 14.5 12 14.5C14.67 14.5 17.05 12.98 18.36 10.5C17.05 8.02 14.67 6.5 12 6.5ZM12 13C10.62 13 9.5 11.88 9.5 10.5C9.5 9.12 10.62 8 12 8C13.38 8 14.5 9.12 14.5 10.5C14.5 11.88 13.38 13 12 13Z"
                  fill="#A0A0A0"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                  fill="#A0A0A0"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#F57C00] to-[#FFA726] text-white font-semibold text-lg hover:opacity-90 transition"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-8 text-center text-base space-y-2">
        <div>
          <Link
            to="/forgot-password"
            className="text-[#F57C00] font-medium hover:underline text-sm"
          >
            Forgot your password?
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
  );
}
