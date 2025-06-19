import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";
import axios from "axios";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Token is missing.");
        return;
      }

      try {
        await api.post("/api/User/verify-email", { token });
        setStatus("success");
        setMessage(
          "Your email has been verified successfully! You can now log in to your account."
        );
      } catch (err: unknown) {
        setStatus("error");
        if (axios.isAxiosError(err) && err.response) {
          const apiMessage = (err.response.data as { message?: string })
            .message;
          setMessage(
            apiMessage || "Email verification failed. Please try again."
          );
        } else {
          setMessage("Email verification failed. Please try again.");
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <img src={Logo} alt="TaskHive" className="h-8" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
            Email Verification
          </h1>

          <div className="mb-6">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57C00] mb-4"></div>
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <p className="text-red-600">{message}</p>
              </div>
            )}
          </div>

          {status !== "loading" && (
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full block py-3 px-4 rounded-full bg-gradient-to-r from-[#F57C00] to-[#FFA726] text-white font-semibold hover:opacity-90 transition"
              >
                Go to Login
              </Link>

              {status === "error" && (
                <Link
                  to="/register"
                  className="w-full block py-3 px-4 rounded-full border border-[#F57C00] text-[#F57C00] font-semibold hover:bg-[#F57C00] hover:text-white transition"
                >
                  Create New Account
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
