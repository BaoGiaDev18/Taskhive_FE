/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

interface SkillCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
}

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface FreelancerProfile {
  userId: number;
  email: string;
  fullName: string;
  userName: string | null;
  cvFile: string;
  portfolioUrl: string;
  country: string;
  imageUrl: string;
  role: "Freelancer";
  isEmailVerified: boolean;
  skills: SkillCategory[];
}

interface ClientProfile {
  userId: number;
  email: string;
  fullName: string;
  companyName: string;
  companyWebsite: string | null;
  companyDescription: string | null;
  country: string;
  imageUrl: string;
  role: "Client";
  isEmailVerified: boolean;
}

type UserProfile = FreelancerProfile | ClientProfile;

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

interface Reviewer {
  userId: number;
  fullName: string;
}

interface Reviewee {
  userId: number;
  fullName: string;
}

interface Review {
  reviewId: number;
  reviewerId: number;
  reviewer: Reviewer;
  revieweeId: number;
  reviewee: Reviewee;
  jobPostId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isDeleted: boolean;
}

interface RatingDistribution {
  rating: number;
  count: number;
}

interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution[];
}

interface MyReviewsResponse {
  reviews: Review[];
  statistics: ReviewStatistics;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile");
  const [reviews, setReviews] = useState<MyReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchProfile();
    if (profile?.role === "Freelancer") {
      fetchCategories();
    }
  }, [profile?.role]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      showToast("Please login to view your profile", "error");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/api/User/me");
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("userEmail");
        showToast("Session expired. Please login again", "error");
        navigate("/login");
      } else {
        showToast("Failed to load profile", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get("/api/Category");
      setCategories(response.data);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      showToast("Failed to load skill categories", "error");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
    setImagePreview(profile?.imageUrl || null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!editedProfile || !profile) return;

    setLoading(true);
    try {
      let imageUrl = editedProfile.imageUrl;

      // Upload image if there's a new image preview
      if (imagePreview && imagePreview !== editedProfile.imageUrl) {
        try {
          imageUrl = await uploadImage();
        } catch (uploadError: any) {
          console.error("Failed to upload image:", uploadError);
          showToast("Failed to upload image. Please try again.", "error");
          setLoading(false);
          return;
        }
      }

      // Prepare update data based on role
      if (profile.role === "Client") {
        const updateData = {
          fullName: editedProfile.fullName,
          companyName: (editedProfile as ClientProfile).companyName,
          companyWebsite:
            (editedProfile as ClientProfile).companyWebsite || null,
          companyDescription:
            (editedProfile as ClientProfile).companyDescription || null,
          country: editedProfile.country,
          imageUrl: imageUrl,
        };

        await api.put(`/api/User/client/${profile.userId}`, updateData);
      } else {
        const updateData = {
          fullName: editedProfile.fullName,
          cvFile: (editedProfile as FreelancerProfile).cvFile,
          portfolioUrl: (editedProfile as FreelancerProfile).portfolioUrl,
          country: editedProfile.country,
          imageUrl: imageUrl,
        };

        await api.put(`/api/User/freelancer/${profile.userId}`, updateData);
      }

      // Update local state with new data
      const updatedProfile = { ...editedProfile, imageUrl };
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setImagePreview(null);
      setIsEditing(false);

      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      // More specific error handling
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(`Validation error: ${errorMessages.join(", ")}`, "error");
      } else {
        showToast(
          error.response?.data?.message || "Failed to update profile",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imagePreview) {
        reject(new Error("No image to upload"));
        return;
      }

      // Convert base64 to file
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
              return;
            }

            const formData = new FormData();
            formData.append("imageFile", blob, "profile-image.jpg");

            try {
              const response = await api.post(
                "/api/User/upload-image",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );

              const uploadedImageUrl =
                response.data.imageUrl || response.data.url || response.data;

              // Set the uploaded URL to preview immediately
              setImagePreview(uploadedImageUrl);

              // Also update the edited profile with the new image URL
              if (editedProfile) {
                setEditedProfile({
                  ...editedProfile,
                  imageUrl: uploadedImageUrl,
                });
              }

              resolve(uploadedImageUrl);
            } catch (error) {
              reject(error);
            }
          },
          "image/jpeg",
          0.9
        );
      };

      img.src = imagePreview;
    });
  };

  // Update handleInputChange to handle userName for freelancers
  const handleInputChange = (field: string, value: string) => {
    if (!editedProfile) return;

    // Special handling for userName which might be null
    if (field === "userName" && editedProfile.role === "Freelancer") {
      setEditedProfile({
        ...editedProfile,
        [field]: value || null,
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  // Update handleImageChange to properly handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image file", "error");
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Add helper function to validate URL
  const isValidHttpsUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Get available categories (not yet added by user)
  const getAvailableCategories = () => {
    if (!profile || profile.role !== "Freelancer" || !categories.length) {
      return [];
    }

    const userSkillCategoryIds = profile.skills.map(
      (skill) => skill.categoryId
    );
    return categories.filter(
      (category) => !userSkillCategoryIds.includes(category.categoryId)
    );
  };

  // Handle remove skill (placeholder for future API)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveSkill = (categoryId: number) => {
    showToast("Remove skill functionality will be implemented soon", "info");
    // TODO: Implement API call to remove skill
  };

  // Handle add skill (placeholder for future API)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddSkill = (categoryId: number) => {
    showToast("Add skill functionality will be implemented soon", "info");
    // TODO: Implement API call to add skill
  };

  // Fetch reviews
  const fetchMyReviews = async () => {
    setReviewsLoading(true);
    try {
      // Always use the same endpoint - the API should return appropriate reviews based on the authenticated user
      const response = await api.get("/api/Review/my-received-reviews");
      setReviews(response.data);
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load reviews when tab changes
  useEffect(() => {
    if (activeTab === "reviews") {
      fetchMyReviews();
    }
  }, [activeTab]);

  // Star rating component
  const StarRating: React.FC<{ rating: number; size?: "sm" | "md" | "lg" }> = ({
    rating,
    size = "md",
  }) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F57C00]"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Profile not found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load your profile information.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/")}
              className="bg-[#F57C00] text-white px-6 py-2 rounded-lg hover:bg-[#E65100] transition"
            >
              Back to Home
            </button>
            <button
              onClick={fetchProfile}
              className="border border-[#F57C00] text-[#F57C00] px-6 py-2 rounded-lg hover:bg-[#F57C00] hover:text-white transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                {profile?.role === "Client"
                  ? "Client Account"
                  : "Freelancer Account"}
              </p>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-8 py-3 rounded-xl border-2 border-gray-300 transition font-bold text-xl bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Elegant Design */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-2">
          <div className="flex bg-gray-50/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`relative px-5 py-3 mx-1 text-sm font-medium rounded-md transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                activeTab === "profile"
                  ? "bg-gray-100 text-[#F57C00] shadow-sm transform scale-[1.01]"
                  : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </button>

            {/* Show Reviews tab for both roles */}
            <button
              onClick={() => setActiveTab("reviews")}
              className={`relative px-5 py-3 mx-1 text-sm font-medium rounded-md transition-all duration-300 flex-1 flex items-center justify-center gap-2 ${
                activeTab === "reviews"
                  ? "bg-gray-100 text-[#F57C00] shadow-sm transform scale-[1.01]"
                  : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              My Reviews
              {reviews?.statistics?.totalReviews && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === "reviews"
                      ? "bg-[#F57C00]/10 text-[#F57C00]"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {reviews.statistics.totalReviews}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Profile Content - All existing profile JSX goes here */}
            <div className="flex items-start gap-8 mb-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {(isEditing ? imagePreview : currentProfile?.imageUrl) ? (
                      <img
                        src={
                          isEditing ? imagePreview! : currentProfile!.imageUrl
                        }
                        alt={currentProfile!.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center ${
                        (isEditing ? imagePreview : currentProfile?.imageUrl)
                          ? "hidden"
                          : "flex"
                      }`}
                    >
                      <span className="text-white text-3xl font-bold">
                        {getInitials(currentProfile!.fullName)}
                      </span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition text-sm inline-block">
                          Change Photo
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Email Verification Status */}
                <div className="mt-6 flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      profile?.isEmailVerified
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {profile?.isEmailVerified ? (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile?.isEmailVerified
                      ? "Email Verified"
                      : "Email Pending Verification"}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.fullName || ""}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {currentProfile?.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 py-2">
                      {currentProfile?.email}
                    </p>
                    <span className="text-xs text-gray-500">
                      Email cannot be changed
                    </span>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.country || ""}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {currentProfile?.country}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="py-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          profile.role === "Client"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            {profile.role === "Client" && "companyName" in profile && (
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Company Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          editedProfile && "companyName" in editedProfile
                            ? editedProfile.companyName
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.companyName || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Company Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={
                          editedProfile && "companyWebsite" in editedProfile
                            ? editedProfile.companyWebsite || ""
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("companyWebsite", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.companyWebsite ? (
                          <a
                            href={profile.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F57C00] hover:underline"
                          >
                            {profile.companyWebsite}
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Company Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={
                          editedProfile && "companyDescription" in editedProfile
                            ? editedProfile.companyDescription || ""
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "companyDescription",
                            e.target.value
                          )
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                        placeholder="Describe your company..."
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profile.companyDescription || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {profile.role === "Freelancer" && "userName" in profile && (
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Portfolio URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="url"
                          value={
                            editedProfile && "portfolioUrl" in editedProfile
                              ? editedProfile.portfolioUrl
                              : ""
                          }
                          onChange={(e) =>
                            handleInputChange("portfolioUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                          placeholder="https://portfolio.com"
                        />
                        {editedProfile &&
                          "portfolioUrl" in editedProfile &&
                          editedProfile.portfolioUrl &&
                          !isValidHttpsUrl(editedProfile.portfolioUrl) && (
                            <p className="text-red-500 text-xs mt-1">
                              Please enter a valid HTTPS URL
                            </p>
                          )}
                      </div>
                    ) : (
                      <p className="text-gray-900 py-2">
                        {isValidHttpsUrl(profile.portfolioUrl) ? (
                          <a
                            href={profile.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F57C00] hover:underline"
                          >
                            View Portfolio
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* CV File */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV File
                    </label>
                    <p className="text-gray-900 py-2">
                      {profile.cvFile && profile.cvFile !== "string" ? (
                        <a
                          href={`/api/files/${profile.cvFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#F57C00] hover:underline"
                        >
                          Download CV
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>

                    {/* Available Skills to Add */}
                    {getAvailableCategories().length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Available skills to add:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getAvailableCategories().map((category) => (
                            <button
                              key={category.categoryId}
                              onClick={() =>
                                handleAddSkill(category.categoryId)
                              }
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
                              title={category.description}
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current User Skills */}
                    <div className="py-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">
                            Your current skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <span
                                key={`${skill.categoryId}-${index}`}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F57C00]/10 text-[#F57C00] group"
                              >
                                {skill.categoryName}
                                <button
                                  onClick={() =>
                                    handleRemoveSkill(skill.categoryId)
                                  }
                                  className="ml-2 w-4 h-4 rounded-full bg-[#F57C00]/20 hover:bg-[#F57C00]/40 flex items-center justify-center transition-colors text-[#F57C00] font-bold text-xs"
                                  title="Remove skill"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-400">No skills added</span>
                          {categoriesLoading && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F57C00]"></div>
                              <span className="text-sm text-gray-500">
                                Loading available skills...
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F57C00]"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              </div>
            ) : reviews ? (
              <div>
                {/* Reviews Statistics */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    My Reviews Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Reviews */}
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[#F57C00] mb-2">
                        {reviews.statistics.totalReviews}
                      </div>
                      <div className="text-gray-600">
                        Total Review
                        {reviews.statistics.totalReviews !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[#F57C00] mb-2">
                        {reviews.statistics.averageRating.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        <StarRating
                          rating={Math.round(reviews.statistics.averageRating)}
                          size="md"
                        />
                      </div>
                      <div className="text-gray-600">Average Rating</div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Rating Distribution
                      </div>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const distribution =
                          reviews.statistics.ratingDistribution.find(
                            (d) => d.rating === rating
                          );
                        const count = distribution?.count || 0;
                        const percentage =
                          reviews.statistics.totalReviews > 0
                            ? (count / reviews.statistics.totalReviews) * 100
                            : 0;

                        return (
                          <div
                            key={rating}
                            className="flex items-center gap-2 mb-1"
                          >
                            <span className="text-xs text-gray-600 w-4">
                              {rating}★
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 w-6">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    My Recent Reviews
                  </h3>

                  {reviews.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.reviews.map((review) => (
                        <div
                          key={review.reviewId}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {getInitials(review.reviewer.fullName)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.reviewer.fullName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>

                            <StarRating rating={review.rating} size="md" />
                          </div>

                          <div className="text-gray-700 leading-relaxed">
                            {review.comment}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg
                          className="w-16 h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-500">
                        {profile?.role === "Freelancer"
                          ? "Complete some projects to start receiving reviews from clients."
                          : "Start working with freelancers to receive reviews for your projects."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to load reviews
                </h3>
                <p className="text-gray-500 mb-4">
                  There was an error loading your reviews.
                </p>
                <button
                  onClick={fetchMyReviews}
                  className="bg-[#F57C00] text-white px-4 py-2 rounded-lg hover:bg-[#E65100] transition"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
