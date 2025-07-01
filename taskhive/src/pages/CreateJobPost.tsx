/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface JobPostData {
  employerId: number;
  title: string;
  description: string;
  categoryId: number;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  status: string;
  deadline: string;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

const CreateJobPost: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [employerId, setEmployerId] = useState<number>(0);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const [formData, setFormData] = useState<JobPostData>({
    employerId: 0,
    title: "",
    description: "",
    categoryId: 0,
    location: "",
    salaryMin: 0,
    salaryMax: 0,
    jobType: "",
    status: "Open",
    deadline: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Get employerId from JWT token
  const getEmployerIdFromToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        showToast("Please login to create a job post", "error");
        navigate("/login");
        return null;
      }

      const decodedToken = decodeJWT(token);
      if (!decodedToken) {
        showToast("Invalid token. Please login again", "error");
        navigate("/login");
        return null;
      }

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        showToast("Your session has expired. Please login again", "error");
        localStorage.removeItem("jwtToken");
        navigate("/login");
        return null;
      }

      // Extract employerId from token (adjust field name based on your JWT structure)
      const userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      console.log("Decoded token:", decodedToken);
      console.log("Extracted userId:", userId);

      return parseInt(userId);
    } catch (error) {
      console.error("Error getting employerId from token:", error);
      showToast("Authentication error. Please login again", "error");
      navigate("/login");
      return null;
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    // Get employerId from JWT token on component mount
    const userIdFromToken = getEmployerIdFromToken();
    if (userIdFromToken) {
      setEmployerId(userIdFromToken);
      setFormData((prev) => ({
        ...prev,
        employerId: userIdFromToken,
      }));
    }

    fetchCategories();
  }, []);

  // Filter categories when search changes
  useEffect(() => {
    if (categorySearch.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, categories]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/Category");
      console.log("Categories response:", response.data);
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      showToast("Failed to load categories", "error");
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = "Title is required";
        }
        if (formData.categoryId === 0) {
          newErrors.categoryId = "Please select a category";
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        }
        if (!formData.location.trim()) {
          newErrors.location = "Location is required";
        }
        break;
      case 3:
        if (formData.salaryMin < 50000) {
          newErrors.salaryMin = "Minimum salary must be at least 50,000 VND";
        }
        if (formData.salaryMax < 50000) {
          newErrors.salaryMax = "Maximum salary must be at least 50,000 VND";
        }
        if (formData.salaryMax < formData.salaryMin) {
          newErrors.salaryMax = "Maximum salary must be greater than minimum";
        }
        if (!formData.jobType) {
          newErrors.jobType = "Please select a job type";
        }
        break;
      case 4:
        if (!formData.deadline) {
          newErrors.deadline = "Please set a deadline";
        } else {
          const deadlineDate = new Date(formData.deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (deadlineDate <= today) {
            newErrors.deadline = "Deadline must be in the future";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    // Double check if we have employerId
    if (!employerId || employerId === 0) {
      showToast("Authentication error. Please login again", "error");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        employerId: employerId, // Use the employerId from JWT token
      };

      console.log("Submitting job post data:", submitData);

      await api.post("/api/JobPost", submitData);
      showToast("Job post created successfully!", "success");

      setTimeout(() => {
        navigate("/my-job-posts");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create job post:", error);
      if (error.response?.status === 401) {
        showToast("Authentication failed. Please login again", "error");
        localStorage.removeItem("jwtToken");
        navigate("/login");
      } else {
        showToast("Failed to create job post", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setFormData({ ...formData, categoryId: category.categoryId });
    setCategorySearch(category.name);
    setShowCategoryDropdown(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Let's start with a strong title
        </h2>
        <p className="text-gray-600 mb-8">
          This helps your job post stand out to the right candidates. It's the
          first thing they'll see, so make it count!
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write a title for your job post
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g. Build responsive WordPress site with booking/payment functionality"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a category
        </label>
        <div className="relative">
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              setShowCategoryDropdown(true);
              if (e.target.value === "") {
                setFormData({ ...formData, categoryId: 0 });
              }
            }}
            onFocus={() => setShowCategoryDropdown(true)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
              errors.categoryId ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Search for a category..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.categoryId}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col"
                  >
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.description}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {showCategoryDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowCategoryDropdown(false)}
          />
        )}

        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Tell us more about your project
        </h2>
        <p className="text-gray-600 mb-8">
          Great project descriptions include what you're trying to accomplish,
          specific requirements, and your timeline.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={6}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe your project in detail..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
            errors.location ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g. Remote, New York, USA"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>
    </div>
  );

  // Helper function to format VND currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Tell us about your budget
        </h2>
        <p className="text-gray-600 mb-8">
          This will help us match you to talent within your range.
        </p>
      </div>

      {/* Payment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          How do you want to pay?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, jobType: "Hourly" })}
            className={`p-4 border-2 rounded-xl transition-all duration-200 ${
              formData.jobType === "Hourly"
                ? "border-[#F57C00] bg-[#F57C00]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  formData.jobType === "Hourly"
                    ? "border-[#F57C00] bg-[#F57C00]"
                    : "border-gray-300"
                }`}
              >
                {formData.jobType === "Hourly" && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Hourly rate</h3>
                <p className="text-sm text-gray-500">Pay by the hour</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, jobType: "Fixed-price" })}
            className={`p-4 border-2 rounded-xl transition-all duration-200 ${
              formData.jobType === "Fixed-price"
                ? "border-[#F57C00] bg-[#F57C00]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  formData.jobType === "Fixed-price"
                    ? "border-[#F57C00] bg-[#F57C00]"
                    : "border-gray-300"
                }`}
              >
                {formData.jobType === "Fixed-price" && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Fixed price</h3>
                <p className="text-sm text-gray-500">Pay a set amount</p>
              </div>
            </div>
          </button>
        </div>
        {errors.jobType && (
          <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>
        )}
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {formData.jobType === "Fixed-price"
            ? "Project Budget (VND)"
            : "Hourly Rate (VND)"}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <div className="relative">
              <input
                type="number"
                value={formData.salaryMin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salaryMin: parseInt(e.target.value) || 0,
                  })
                }
                min="50000"
                step={formData.jobType === "Fixed-price" ? "100000" : "10000"}
                className={`w-full pl-4 pr-20 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
                  errors.salaryMin ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  formData.jobType === "Fixed-price" ? "500,000" : "50,000"
                }
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {formData.jobType === "Fixed-price" ? "VND" : "VND/hr"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <div className="relative">
              <input
                type="number"
                value={formData.salaryMax || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salaryMax: parseInt(e.target.value) || 0,
                  })
                }
                min="50000"
                step={formData.jobType === "Fixed-price" ? "100000" : "10000"}
                className={`w-full pl-4 pr-20 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
                  errors.salaryMax ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  formData.jobType === "Fixed-price" ? "2,000,000" : "100,000"
                }
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {formData.jobType === "Fixed-price" ? "VND" : "VND/hr"}
              </span>
            </div>
          </div>
        </div>
        {(errors.salaryMin || errors.salaryMax) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.salaryMin || errors.salaryMax}
          </p>
        )}

        {/* Display formatted values */}
        {(formData.salaryMin > 0 || formData.salaryMax > 0) && (
          <div className="text-sm text-gray-600 mt-2">
            {formData.jobType === "Fixed-price"
              ? "Project budget"
              : "Hourly rate"}
            :{" "}
            {formData.salaryMin > 0 && (
              <span className="font-medium">
                {formatVND(formData.salaryMin)} VND
              </span>
            )}
            {formData.salaryMin > 0 && formData.salaryMax > 0 && " - "}
            {formData.salaryMax > 0 && (
              <span className="font-medium">
                {formatVND(formData.salaryMax)} VND
              </span>
            )}
            {formData.jobType === "Hourly" &&
              (formData.salaryMin > 0 || formData.salaryMax > 0) &&
              " per hour"}
            {formData.jobType === "Fixed-price" &&
              (formData.salaryMin > 0 || formData.salaryMax > 0) &&
              " total"}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          <strong>
            {formData.jobType === "Fixed-price"
              ? "Project pricing guidelines"
              : "Hourly rate guidelines"}
          </strong>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {formData.jobType === "Fixed-price" ? (
            <>
              Consider the project scope, complexity, and timeline when setting
              your budget. Fixed-price projects work best when requirements are
              clearly defined.
            </>
          ) : (
            <>
              The minimum hourly rate is <strong>50,000 VND/hour</strong>. This
              ensures quality work from professional freelancers in{" "}
              {categories.find((c) => c.categoryId === formData.categoryId)
                ?.name || "this"}{" "}
              category.
            </>
          )}
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => {
    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Set your project deadline
          </h2>
          <p className="text-gray-600 mb-8">
            When do you need this project completed? This helps freelancers
            understand your timeline.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Deadline
          </label>
          <input
            type="date"
            value={formData.deadline ? formData.deadline.split("T")[0] : ""}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                // Set to end of day
                const deadlineDate = new Date(dateValue);
                deadlineDate.setHours(23, 59, 59, 999);
                setFormData({
                  ...formData,
                  deadline: deadlineDate.toISOString(),
                });
              } else {
                setFormData({ ...formData, deadline: "" });
              }
            }}
            min={minDate}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent ${
              errors.deadline ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.deadline && (
            <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
          )}

          <div className="mt-3 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Tips for setting deadlines:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Allow enough time for quality work</li>
                  <li>• Consider revisions and feedback cycles</li>
                  <li>• Be realistic about project complexity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const selectedCategory = categories.find(
      (c) => c.categoryId === formData.categoryId
    );

    const formatDeadline = (deadline: string) => {
      if (!deadline) return "Not set";
      const date = new Date(deadline);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Review your job post
          </h2>
          <p className="text-gray-600 mb-8">
            Here's what your job post will look like to freelancers. Make sure
            everything looks correct before publishing.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {selectedCategory?.name}
              </span>
              <span>📍 {formData.location}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                {formData.jobType === "Fixed-price"
                  ? "Fixed Price"
                  : "Hourly Rate"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
                ⏰ Due: {formatDeadline(formData.deadline)}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 leading-relaxed">
              {formData.description}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {formData.jobType === "Fixed-price"
                ? "Project Budget"
                : "Hourly Rate"}
            </h4>
            <p className="text-2xl font-bold text-[#F57C00]">
              {formatVND(formData.salaryMin)} - {formatVND(formData.salaryMax)}{" "}
              {formData.jobType === "Fixed-price" ? "VND" : "VND/hr"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formData.jobType === "Fixed-price"
                ? "Total project budget range"
                : "Hourly rate range"}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className="text-green-600 font-medium">
                Ready to publish
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{currentStep}/5</span>
            <span className="text-sm text-gray-500">Job post</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-12">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
            >
              Next:{" "}
              {currentStep === 1
                ? "Description"
                : currentStep === 2
                ? "Budget"
                : currentStep === 3
                ? "Deadline"
                : "Review"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !employerId}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Publishing...
                </div>
              ) : !employerId ? (
                "Please Login"
              ) : (
                "Publish Job Post"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobPost;
