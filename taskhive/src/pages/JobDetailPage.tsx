import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Footer from "../components/Footer";

interface JobDetail {
  jobPostId: number;
  employerId: number;
  employerName: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
}

interface ClientInfo {
  userId: number;
  email: string;
  fullName: string;
  companyName: string;
  companyWebsite: string | null;
  companyDescription: string | null;
  country: string;
  imageUrl: string;
  role: string;
  isEmailVerified: boolean;
}

interface Reviewer {
  userId: number;
  fullName: string;
}

interface Review {
  reviewId: number;
  reviewerId: number;
  reviewer: Reviewer;
  revieweeId: number;
  reviewee: Reviewer;
  jobPostId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isDeleted: boolean;
}

interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

interface ReviewResponse {
  userId: number;
  reviews: Review[];
  statistics: ReviewStatistics;
}

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  useEffect(() => {
    if (job) {
      fetchClientInfo();
      fetchReviews();
    }
  }, [job]);

  const checkAuthentication = () => {
    const token = localStorage.getItem("jwtToken");
    setIsAuthenticated(!!token);
  };

  const fetchJobDetail = async () => {
    try {
      const response = await api.get(`/api/JobPost/${jobId}`);
      setJob(response.data);
    } catch (error) {
      console.error("Failed to fetch job detail:", error);
      setError("Failed to load job details");
    }
  };

  const fetchClientInfo = async () => {
    if (!job) return;
    try {
      const response = await api.get(`/api/User/client/${job.employerId}`);
      setClient(response.data);
    } catch (error) {
      console.error("Failed to fetch client info:", error);
    }
  };

  const fetchReviews = async () => {
    if (!job) return;
    try {
      const response = await api.get(
        `/api/Review/user/${job.employerId}/received-reviews`
      );
      setReviewData(response.data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Negotiable";
    const formatNumber = (num: number) =>
      new Intl.NumberFormat("vi-VN").format(num);
    return `${formatNumber(min)} - ${formatNumber(max)} VND`;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/apply", {
        state: {
          jobPostId: job?.jobPostId,
          jobTitle: job?.title,
          salaryMin: job?.salaryMin,
          salaryMax: job?.salaryMax,
          jobType: job?.jobType,
          deadline: job?.deadline,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist."}
          </p>
          <Link
            to="/find-work"
            className="text-orange-600 hover:text-orange-800 font-medium underline"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const displayedReviews = showAllReviews
    ? reviewData?.reviews || []
    : (reviewData?.reviews || []).slice(0, 5);

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/find-work"
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
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.jobType}</span>
            <span>•</span>
            <span>Posted {formatDateRelative(job.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Job Details
              </h2>

              {/* Salary and Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Salary Range
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Job Type
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {job.jobType}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Application Deadline
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(job.deadline)}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Category
                </h3>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {job.categoryName}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviewData && reviewData.reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Reviews
                </h2>
                <div className="space-y-4">
                  {displayedReviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {review.reviewer.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <Link
                              to={`/freelancer/${review.reviewer.userId}`}
                              className="font-medium text-gray-900 hover:text-orange-600 transition-colors"
                            >
                              {review.reviewer.fullName}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {formatDateRelative(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 ml-13">{review.comment}</p>
                    </div>
                  ))}
                </div>

                {reviewData.reviews.length > 5 && !showAllReviews && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="mt-4 text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Show all {reviewData.reviews.length} reviews
                  </button>
                )}

                {showAllReviews && reviewData.reviews.length > 5 && (
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="mt-4 text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Client Info Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Apply Button */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <button
                onClick={handleApply}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-all"
              >
                Apply Now
              </button>
            </div>

            {/* Client Information */}
            {client && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  About the Client
                </h3>

                {/* Client Profile */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={client.imageUrl || "/default-avatar.png"}
                    alt={client.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/client/${client.userId}`}
                      className="font-medium text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      {client.fullName}
                    </Link>
                    {reviewData?.statistics && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex text-yellow-400">
                          {renderStars(reviewData.statistics.averageRating)}
                        </div>
                        <span className="text-gray-600">
                          {reviewData.statistics.averageRating.toFixed(1)} (
                          {reviewData.statistics.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Details */}
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Location
                    </span>
                    <p className="text-gray-900">{client.country}</p>
                  </div>

                  {client.companyName && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Company
                      </span>
                      <p className="text-gray-900">{client.companyName}</p>
                    </div>
                  )}

                  {client.companyWebsite && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Website
                      </span>
                      <a
                        href={client.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-800 block"
                      >
                        {client.companyWebsite}
                      </a>
                    </div>
                  )}

                  {client.companyDescription && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        About
                      </span>
                      <p className="text-gray-900 text-sm">
                        {client.companyDescription}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      Email Verified
                    </span>
                    <span
                      className={`text-sm ${
                        client.isEmailVerified
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {client.isEmailVerified ? "✓ Verified" : "✗ Not verified"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDetailPage;
