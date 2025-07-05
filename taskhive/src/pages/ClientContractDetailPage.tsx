/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

interface Application {
  applicationId: number;
  jobPostId: number;
  freelancerId: number;
  freelancerName: string;
  coverLetter: string;
  bidAmount: number;
  status: string;
  appliedAt: string;
  jobPost?: {
    title: string;
    description: string;
    categoryName: string;
    location: string;
    jobType: string;
    deadline: string;
    salaryMin: number;
    salaryMax: number;
  };
  freelancerData?: {
    profile: {
      fullName: string;
      imageUrl: string;
      country: string;
      phoneNumber: string;
      address: string;
    };
    average: number;
    count: number;
  };
}

interface ReviewData {
  rating: number;
  comment: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmButtonClass,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full transform transition-all duration-300 ease-out">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientContractDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  //const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Fetch application details
  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);

      // Get application details
      const appResponse = await api.get(`/api/Application/${applicationId}`);
      const appData = appResponse.data;

      // Get job post details
      const jobResponse = await api.get(`/api/JobPost/${appData.jobPostId}`);
      const jobData = jobResponse.data;

      // Get freelancer details
      const freelancerResponse = await api.get(
        `/api/User/freelancer/${appData.freelancerId}`
      );
      const freelancerData = freelancerResponse.data;

      setApplication({
        ...appData,
        jobPost: jobData,
        freelancerData: freelancerData,
      });

      setError("");
    } catch (error: any) {
      console.error("Failed to fetch application details:", error);
      setError("Failed to load contract details");
    } finally {
      setLoading(false);
    }
  };

  // Mark contract as finished
  const handleCompleteContract = async () => {
    if (!application) return;

    try {
      setIsCompleting(true);

      const formData = new FormData();
      formData.append("ApplicationId", application.applicationId.toString());
      formData.append("CoverLetter", application.coverLetter);
      formData.append("BidAmount", application.bidAmount.toString());
      formData.append("Status", "Finished");
      formData.append("CVFile", ""); // Empty file

      await api.put("/api/Application", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state
      setApplication((prev) => (prev ? { ...prev, status: "Finished" } : null));
      setShowCompleteConfirm(false);
      showToast("Contract marked as completed successfully!", "success");
    } catch (error: any) {
      console.error("Failed to complete contract:", error);
      showToast("Failed to complete contract", "error");
    } finally {
      setIsCompleting(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!application) return;

    try {
      setIsSubmittingReview(true);

      const reviewPayload = {
        revieweeId: application.freelancerId, // Changed from freelancerId to revieweeId
        jobPostId: application.jobPostId, // Added jobPostId
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
      };

      await api.post("/api/Review", reviewPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" }); // Reset form
      showToast("Review submitted successfully!", "success");
    } catch (error: any) {
      console.error("Failed to submit review:", error);

      // Better error handling
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to submit review";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  // Helper functions
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Hired: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Active",
      },
      Cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Cancelled",
      },
      Finished: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completed",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-2`}
      >
        {config.label}
      </span>
    );
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void
  ) => {
    if (interactive) {
      // Interactive stars for review modal - using simple Unicode stars
      return Array.from({ length: 5 }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onRatingChange && onRatingChange(index + 1)}
          className={`w-8 h-8 cursor-pointer hover:scale-110 transition-all focus:outline-none text-2xl ${
            index < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ));
    } else {
      // Static stars for display (matching JobDetailPage format)
      return Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`text-lg ${
            index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              {error || "Contract not found"}
            </h3>
            <p className="text-red-600 mb-4">
              The contract you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link
              to="/client/my-contracts"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {toast.type === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </svg>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/client/my-contracts"
            className="text-orange-600 hover:text-orange-800 mb-4 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Contracts
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contract Details
              </h1>
              <p className="text-gray-600">
                Manage and track your contract progress
              </p>
            </div>

            <div className="flex items-center gap-4">
              {getStatusBadge(application.status)}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {application.status === "Hired" && (
                  <button
                    onClick={() => setShowCompleteConfirm(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mark as Completed
                  </button>
                )}

                {application.status === "Finished" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Overview - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Project Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {application.jobPost?.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md">
                      {application.jobPost?.categoryName}
                    </span>
                    <span>{application.jobPost?.location}</span>
                    <span>•</span>
                    <span>{application.jobPost?.jobType}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {application.jobPost?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Project Budget
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.jobPost?.salaryMin &&
                      application.jobPost?.salaryMax
                        ? `${formatSalary(
                            application.jobPost.salaryMin
                          )} - ${formatSalary(application.jobPost.salaryMax)}`
                        : "Budget not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Original Deadline
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.jobPost?.deadline
                        ? formatDate(application.jobPost.deadline)
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Contract Terms
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Agreed Amount
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatSalary(application.bidAmount)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Contract Started
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(application.appliedAt)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateRelative(application.appliedAt)}
                  </p>
                </div>
              </div>

              {application.coverLetter && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Freelancer's Proposal
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Freelancer Info - Right Side */}
          <div className="space-y-6">
            {/* Freelancer Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Freelancer
              </h3>

              {application.freelancerData && (
                <div className="space-y-4">
                  {/* Profile */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={
                        application.freelancerData.profile.imageUrl ||
                        "/default-avatar.png"
                      }
                      alt={application.freelancerData.profile.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <Link
                        to={`/freelancer/${application.freelancerId}`}
                        className="font-medium text-gray-900 hover:text-orange-600 transition-colors"
                      >
                        {application.freelancerData.profile.fullName}
                      </Link>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex text-yellow-400">
                          {renderStars(
                            Math.round(application.freelancerData.average)
                          )}
                        </div>
                        <span className="text-gray-600">
                          {application.freelancerData.average.toFixed(1)} (
                          {application.freelancerData.count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Location
                      </span>
                      <p className="text-gray-900">
                        {application.freelancerData.profile.country}
                      </p>
                    </div>

                    {application.freelancerData.profile.phoneNumber && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Phone
                        </span>
                        <p className="text-gray-900">
                          {application.freelancerData.profile.phoneNumber}
                        </p>
                      </div>
                    )}

                    {application.freelancerData.profile.address && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Address
                        </span>
                        <p className="text-gray-900">
                          {application.freelancerData.profile.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Send Message
                </button>

                <Link
                  to={`/freelancer/${application.freelancerId}`}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Contract Modal */}
      <ConfirmationModal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        onConfirm={handleCompleteContract}
        title="Mark Contract as Completed"
        message="Are you sure you want to mark this contract as completed? This action will finalize the project and allow you to leave a review for the freelancer."
        confirmText="Mark as Completed"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
        isLoading={isCompleting}
      />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full transform transition-all duration-300 ease-out">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Leave a Review
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setReviewData((prev) => ({
                            ...prev,
                            rating: index + 1,
                          }))
                        }
                        className={`w-8 h-8 cursor-pointer hover:scale-110 transition-all focus:outline-none text-2xl flex items-center justify-center ${
                          index < reviewData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600 font-medium">
                    {reviewData.rating} out of 5 stars
                  </span>
                </div>

                {/* Rating labels */}
                <div className="mt-2 text-xs text-gray-500">
                  {reviewData.rating === 1 && "Poor"}
                  {reviewData.rating === 2 && "Fair"}
                  {reviewData.rating === 3 && "Good"}
                  {reviewData.rating === 4 && "Very Good"}
                  {reviewData.rating === 5 && "Excellent"}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience working with this freelancer..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {reviewData.comment.length}/500 characters
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewData({ rating: 5, comment: "" }); // Reset form
                }}
                disabled={isSubmittingReview}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewData.comment.trim()}
                className="flex-1 px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContractDetailPage;
