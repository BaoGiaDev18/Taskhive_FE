import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";  // <-- import axios instance
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // để hiển thị lỗi

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Giả sử backend có endpoint POST /auth/login
      // Body: { email: string, password: string }
      const response = await api.post("/api/User/login", {
        email,
        password,
      });
      // Giả sử backend trả về { token: string, userEmail: string, userName?: string }
      const { token, userEmail } = response.data;

      // Lưu vào localStorage
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userEmail", userEmail);

      // Chuyển hướng sau khi login thành công
      window.location.href = "/";
    } catch (err: unknown) {
  if (axios.isAxiosError(err) && err.response) {
    const apiMessage = (err.response.data as { message?: string }).message;
    setError(apiMessage || "Login failed. Please try again.");
  } else {
    setError("Login failed. Please try again.");
  }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <img src={Logo} alt="TaskHive" className="h-8" />
      </div>

      <h1 className="text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
        Sign in as admin
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm"
            required
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // 👁 Mắt mở
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6.5C9.33 6.5 6.95 8.02 5.64 10.5C6.95 12.98 9.33 14.5 12 14.5C14.67 14.5 17.05 12.98 18.36 10.5C17.05 8.02 14.67 6.5 12 6.5ZM12 13C10.62 13 9.5 11.88 9.5 10.5C9.5 9.12 10.62 8 12 8C13.38 8 14.5 9.12 14.5 10.5C14.5 11.88 13.38 13 12 13Z"
                  fill="#A0A0A0"
                />
              </svg>
            ) : (
              // 👁️‍🗨️ Mắt đóng
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

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Don't have an account? </span>
        <Link
          to="/register"
          className="text-[#F57C00] font-medium hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
