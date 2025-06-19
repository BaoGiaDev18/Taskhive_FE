import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.jpg";
import api from "../services/api";
import axios from "axios";
import Toast from "../components/Toast";
import GoogleLoginButton from "../components/GoogleLoginButton";

type Role = "Client" | "Freelancer" | null;

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  portfolioUrl: string;
  skillIds: number[];
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "North Korea",
  "South Korea",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia and Montenegro",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isGoogleRegister, setIsGoogleRegister] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    portfolioUrl: "",
    skillIds: [],
  });

  // Check if this is Google register flow
  useEffect(() => {
    const googleRegister = searchParams.get("googleRegister");
    const storedToken = sessionStorage.getItem("googleIdToken");

    if (googleRegister === "true" && storedToken) {
      setIsGoogleRegister(true);
      setGoogleIdToken(storedToken);
    }
  }, [searchParams]);

  // Fetch categories when freelancer is selected
  useEffect(() => {
    if (selectedRole === "Freelancer") {
      fetchCategories();
    }
  }, [selectedRole]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/api/Category");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      showToast("Failed to load skill categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("form");
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | number[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkillToggle = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(categoryId)
        ? prev.skillIds.filter((id) => id !== categoryId)
        : [...prev.skillIds, categoryId],
    }));
  };

  const handleCountrySelect = (country: string) => {
    handleInputChange("country", country);
    setShowCountryDropdown(false);
  };

  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(formData.country.toLowerCase())
  );

  const validateForm = () => {
    if (!formData.country) {
      setError("Please select a country");
      return false;
    }

    if (!isGoogleRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }

    if (selectedRole === "Freelancer" && formData.skillIds.length === 0) {
      setError("Please select at least one skill");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isGoogleRegister && googleIdToken) {
        // Google Register
        await api.post("/api/User/google-register", {
          idToken: googleIdToken,
          country: formData.country,
          role: selectedRole,
          portfolioUrl:
            selectedRole === "Freelancer" ? formData.portfolioUrl : null,
          skillIds: selectedRole === "Freelancer" ? formData.skillIds : null,
        });
      } else {
        // Regular Register
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        if (selectedRole === "Freelancer") {
          await api.post("/api/User/register/freelancer", {
            email: formData.email,
            password: formData.password,
            fullName,
            country: formData.country,
            portfolioUrl: formData.portfolioUrl,
            skillIds: formData.skillIds,
          });
        } else {
          await api.post("/api/User/register/client", {
            email: formData.email,
            password: formData.password,
            fullName,
            country: formData.country,
          });
        }
      }

      // Clear stored Google token
      sessionStorage.removeItem("googleIdToken");

      showToast(
        "Registration successful! Please check your email for verification.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        showToast(
          apiMessage || "Registration failed. Please try again.",
          "error"
        );
      } else {
        showToast("Registration failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterSubmit = async () => {
    if (!selectedRole || !googleIdToken) {
      setError("Missing required information for Google registration");
      return;
    }

    // Validate required fields
    if (!formData.country) {
      setError("Please select a country first");
      return;
    }

    if (selectedRole === "Freelancer" && formData.skillIds.length === 0) {
      setError("Please select at least one skill first");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service first");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/User/google-register", {
        idToken: googleIdToken,
        country: formData.country,
        role: selectedRole,
        portfolioUrl:
          selectedRole === "Freelancer" ? formData.portfolioUrl : null,
        skillIds: selectedRole === "Freelancer" ? formData.skillIds : null,
      });

      // Handle Google register response - same as login
      const { accessToken, refreshToken, expiresAt, message } = response.data;

      // Store tokens in localStorage
      localStorage.setItem("jwtToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("tokenExpiresAt", expiresAt);

      // Clear stored Google token
      sessionStorage.removeItem("googleIdToken");

      showToast(
        message || "Google registration successful! Redirecting...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const apiMessage = (err.response.data as { message?: string }).message;
        showToast(
          apiMessage || "Google registration failed. Please try again.",
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

  const handleGoogleError = (error: any) => {
    console.error("Google registration error:", error);
    showToast("Google registration failed. Please try again.", "error");
  };

  // Handle regular Google register button click
  const handleRegularGoogleRegister = async (credential: string) => {
    // Store Google token for the flow
    sessionStorage.setItem("googleIdToken", credential);

    // Navigate to Google register flow
    navigate("/register?googleRegister=true");
  };

  // Role selection JSX
  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
        <div className="w-full max-w-5xl">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <img src={Logo} alt="TaskHive" className="h-10" />
          </div>

          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
              What is your role?
            </h1>
            {isGoogleRegister && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">
                  🎉 Register with Google - Choose your role to continue
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Client Card */}
            <div
              onClick={() => handleRoleSelect("Client")}
              className="bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#F57C00] group"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#F57C00] group-hover:text-white transition-colors">
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-3">
                  I'm a client
                </h3>
                <p className="text-gray-600 text-lg">
                  Looking to hire for a project
                </p>
              </div>
            </div>

            {/* Freelancer Card */}
            <div
              onClick={() => handleRoleSelect("Freelancer")}
              className="bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-[#F57C00] group"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#F57C00] group-hover:text-white transition-colors">
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M10,4V6H14V4H10Z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-3">
                  I'm a freelancer
                </h3>
                <p className="text-gray-600 text-lg">
                  Looking to work on projects
                </p>
              </div>
            </div>
          </div>

          {/* Google Register Option - Only show for regular flow */}
          {!isGoogleRegister && (
            <div className="mt-16 max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or register with
                  </span>
                </div>
              </div>

              <GoogleLoginButton
                onSuccess={handleRegularGoogleRegister}
                onError={handleGoogleError}
                disabled={loading}
              />
            </div>
          )}

          <div className="text-center mt-12">
            <span className="text-gray-600 text-lg">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-[#F57C00] font-medium hover:underline text-lg"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => setStep("role")}
            className="mb-6 bg-white text-[#F57C00] hover:underline text-sm"
          >
            ← Back to role selection
          </button>

          <h1 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-[#F57C00] to-[#FFA726]">
            Sign up as {selectedRole}
          </h1>

          {/* Google Register Notice */}
          {isGoogleRegister && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center">
                🎉 Almost done! Complete your Google registration by filling the
                required fields below.
              </p>
            </div>
          )}

          {/* Google Register Button for Regular Flow */}
          {!isGoogleRegister && (
            <div className="mb-6">
              <GoogleLoginButton
                onSuccess={handleRegularGoogleRegister}
                onError={handleGoogleError}
                disabled={loading}
              />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-center">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Regular fields for non-Google register */}
            {!isGoogleRegister && (
              <>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                    required
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                  required
                  disabled={loading}
                />

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
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
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
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
              </>
            )}

            {/* Country Dropdown - Required for both flows */}
            <div className="relative">
              <input
                type="text"
                placeholder="Country *"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowCountryDropdown(false), 200)
                }
                className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                required
                disabled={loading}
              />
              {showCountryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio URL - Only for freelancers */}
            {selectedRole === "Freelancer" && (
              <input
                type="url"
                placeholder="Portfolio URL (optional)"
                value={formData.portfolioUrl}
                onChange={(e) =>
                  handleInputChange("portfolioUrl", e.target.value)
                }
                className="w-full px-5 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F57C00] shadow-sm text-base"
                disabled={loading}
              />
            )}

            {/* Skills Selection - Only for freelancers */}
            {selectedRole === "Freelancer" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select your skills *
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({formData.skillIds.length} selected)
                  </span>
                </div>

                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F57C00]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {categories.map((category) => (
                      <label
                        key={category.categoryId}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                          formData.skillIds.includes(category.categoryId)
                            ? "border-[#F57C00] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.skillIds.includes(
                            category.categoryId
                          )}
                          onChange={() =>
                            handleSkillToggle(category.categoryId)
                          }
                          className="mt-1 w-4 h-4 text-[#F57C00] border-gray-300 rounded focus:ring-[#F57C00]"
                          disabled={loading}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {formData.skillIds.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Please select at least one skill area.
                  </p>
                )}
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 mt-8">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#F57C00] border-gray-300 rounded focus:ring-[#F57C00]"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Yes, I understand and agree to the{" "}
                <a
                  href="#"
                  className="text-[#F57C00] underline hover:text-[#E65100]"
                >
                  TaskHive Terms of Service
                </a>
                , including the{" "}
                <a
                  href="#"
                  className="text-[#F57C00] underline hover:text-[#E65100]"
                >
                  User Agreement
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#F57C00] underline hover:text-[#E65100]"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button - Only show for regular registration */}
            {!isGoogleRegister && (
              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#F57C00] to-[#FFA726] text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            )}

            {/* Google Register Button - Only show if using Google flow and required fields are filled */}
            {isGoogleRegister &&
              formData.country &&
              (selectedRole === "Client" ||
                (selectedRole === "Freelancer" &&
                  formData.skillIds.length > 0)) && (
                <button
                  type="button"
                  onClick={handleGoogleRegisterSubmit}
                  disabled={loading || !agreeTerms}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    "Completing registration..."
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Complete Google Registration
                    </>
                  )}
                </button>
              )}
          </form>

          <div className="mt-8 text-center text-base">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-[#F57C00] font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
