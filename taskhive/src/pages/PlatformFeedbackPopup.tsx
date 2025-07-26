import { useState } from "react";
import api from "../services/api";

interface PlatformFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PlatformFeedbackPopup: React.FC<PlatformFeedbackPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please provide a comment");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/api/Review/platform", {
        rating,
        comment: comment.trim(),
      });

      // Reset form
      setRating(0);
      setComment("");
      setHoveredRating(0);

      onSuccess?.();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to submit feedback:", error);
      setError(
        error.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      setHoveredRating(0);
      setError("");
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={starValue}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-3xl transition-colors duration-200 ${
            isActive ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400 focus:outline-none`}
          disabled={isSubmitting}
        >
          ★
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Very Poor";
      case 2:
        return "Poor";
      case 3:
        return "Average";
      case 4:
        return "Good";
      case 5:
        return "Excellent";
      default:
        return "Select a rating";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[700px] flex flex-col overflow-hidden">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Share Your Feedback
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Help us improve TaskHive platform
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 disabled:opacity-50 flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable if needed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6">
            {/* Rating Section - Fixed height */}
            <div className="mb-6 flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How would you rate your experience?
              </label>
              <div className="flex items-center justify-center gap-3 mb-2">
                {renderStars()}
              </div>
              {/* ✅ Fixed height để không bị nhảy */}
              <div className="h-5 flex items-center justify-center">
                <p className="text-center text-sm text-gray-600">
                  {getRatingText(hoveredRating || rating)}
                </p>
              </div>
            </div>

            {/* Comment Section - Flexible */}
            <div className="mb-6 flex-1 flex flex-col">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-3 flex-shrink-0"
              >
                Tell us more about your experience
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about TaskHive platform..."
                className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm min-h-[120px]"
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {comment.length}/500 characters
                </span>
              </div>
            </div>

            {/* Error Message - Fixed height */}
            <div className="mb-4 flex-shrink-0">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed height */}
            <div className="flex gap-4 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer - Fixed height */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
            </svg>
            <span className="text-xs">
              Your feedback helps us improve TaskHive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformFeedbackPopup;
