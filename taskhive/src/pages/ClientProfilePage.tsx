/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

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

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

interface Reviewer {
  userId: number;
  fullName: string;
}

interface Review {
  reviewId: number;
  reviewerId: number;
  reviewer: Reviewer;
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

const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile");
  const [reviews, setReviews] = useState<MyReviewsResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (userId) {
      fetchClientProfile();
    }
  }, [userId]);

  const fetchClientProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/User/client/${userId}`);
      setProfile(response.data);
    } catch (error: any) {
      console.error("Failed to fetch client profile:", error);
      if (error.response?.status === 404) {
        showToast("Client profile not found", "error");
      } else {
        showToast("Failed to load client profile", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClientReviews = async () => {
    if (!userId) return;

    setReviewsLoading(true);
    try {
      const response = await api.get(
        `/api/Review/user/${userId}/received-reviews`
      );
      setReviews(response.data);
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && userId) {
      fetchClientReviews();
    }
  }, [activeTab, userId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <p className="text-gray-600">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Client profile not found
          </h2>
          <p className="text-gray-600 mb-6">
            The client profile you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              <p className="text-gray-600 mt-1">Client Profile</p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 flex items-center gap-2"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Tabs */}
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
              Reviews
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
            <div className="flex items-start gap-8 mb-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.fullName}
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
                      profile.imageUrl ? "hidden" : "flex"
                    }`}
                  >
                    <span className="text-white text-3xl font-bold">
                      {getInitials(profile.fullName)}
                    </span>
                  </div>
                </div>

                {/* Email Verification Status */}
                <div className="mt-6 flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      profile.isEmailVerified ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {profile.isEmailVerified ? (
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
                    {profile.isEmailVerified
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <p className="text-gray-900 py-2">{profile.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <p className="text-gray-900 py-2">{profile.country}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="py-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Company Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <p className="text-gray-900 py-2">
                    {profile.companyName || (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
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
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description
                  </label>
                  <p className="text-gray-900 py-2">
                    {profile.companyDescription || (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
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
                    Reviews Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-[#F57C00] mb-2">
                        {reviews.statistics.totalReviews}
                      </div>
                      <div className="text-gray-600">
                        Total Review
                        {reviews.statistics.totalReviews !== 1 ? "s" : ""}
                      </div>
                    </div>

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
                    Recent Reviews
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
                        This client hasn't received any reviews yet.
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
                  There was an error loading reviews.
                </p>
                <button
                  onClick={fetchClientReviews}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-300"
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

export default ClientProfilePage;
