import { useState, useEffect } from "react";
import api from "../../services/api";

interface PlatformReview {
  reviewId: number;
  reviewerId: number;
  reviewer: {
    userId: number;
    fullName: string;
  };
  revieweeId: number;
  reviewee: {
    userId: number;
    fullName: string;
  };
  jobPostId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isDeleted: boolean;
}

interface PlatformReviewsResponse {
  platformReviews: PlatformReview[];
  count: number;
  message: string;
}

const FeedbackPage = () => {
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/Review/platform");
      const data: PlatformReviewsResponse = response.data;

      setReviews(data.platformReviews);
      setFilteredReviews(data.platformReviews);
      setError("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      setError("Failed to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter reviews by rating and search query
  useEffect(() => {
    let filtered = reviews;

    // Filter by rating
    if (selectedRating !== "All") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(selectedRating)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (review) =>
          review.reviewer.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  }, [selectedRating, searchQuery, reviews]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const getRatingBadge = (rating: number) => {
    const ratingConfig = {
      5: { bg: "bg-green-100", text: "text-green-800", label: "Excellent" },
      4: { bg: "bg-blue-100", text: "text-blue-800", label: "Good" },
      3: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Average" },
      2: { bg: "bg-orange-100", text: "text-orange-800", label: "Poor" },
      1: { bg: "bg-red-100", text: "text-red-800", label: "Very Poor" },
    };

    const config = ratingConfig[rating as keyof typeof ratingConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: "Unknown",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Platform Feedback
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze user feedback for TaskHive platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Reviews
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reviews.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getAverageRating()}/5.0
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Positive Reviews
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {ratingDistribution[4] + ratingDistribution[5]}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7.5 15h2.25m8.25-9.75a3 3 0 11-6 0 3 3 0 016 0zM12.75 18a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Critical Reviews
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {ratingDistribution[1] + ratingDistribution[2]}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <div className="flex items-center w-20">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {star}
                  </span>
                  <span className="text-yellow-400">★</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          reviews.length > 0
                            ? (ratingDistribution[
                                star as keyof typeof ratingDistribution
                              ] /
                                reviews.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[star as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700"
                >
                  Search:
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or comment..."
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[250px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="rating-filter"
                  className="text-sm font-medium text-gray-700"
                >
                  Rating:
                </label>
                <select
                  id="rating-filter"
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
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
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              All Feedback ({filteredReviews.length})
            </h3>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Feedback Found
              </h3>
              <p className="text-gray-600">
                No feedback found matching the selected criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <div key={review.reviewId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {review.reviewer.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.reviewer.fullName}
                          </h4>
                          {getRatingBadge(review.rating)}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            ({review.rating}/5)
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          "{review.comment}"
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Review ID: #{review.reviewId}</span>
                          <span>User ID: {review.reviewerId}</span>
                          <span>Job ID: {review.jobPostId}</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
