/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Footer from "../components/Footer";

interface JobPost {
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

const MyJobPostsPage = () => {
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [employerId, setEmployerId] = useState<number>(0);

  // Helper function to decode JWT token (same as CreateJobPost)
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

  // Get employerId from JWT token (same as CreateJobPost)
  const getEmployerIdFromToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return null;
      }

      const decodedToken = decodeJWT(token);
      if (!decodedToken) {
        navigate("/login");
        return null;
      }

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem("jwtToken");
        navigate("/login");
        return null;
      }

      // Extract employerId from token (same logic as CreateJobPost)
      const userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      console.log("Decoded token:", decodedToken);
      console.log("Extracted userId:", userId);

      return parseInt(userId);
    } catch (error) {
      console.error("Error getting employerId from token:", error);
      navigate("/login");
      return null;
    }
  };

  useEffect(() => {
    // Get employerId from JWT token and fetch job posts
    const userIdFromToken = getEmployerIdFromToken();
    if (userIdFromToken) {
      setEmployerId(userIdFromToken);
      fetchJobPosts(userIdFromToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchJobPosts = async (employerId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/JobPost/employer/${employerId}`);
      setJobPosts(response.data);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch job posts:", error);
      if (error.response?.status === 404) {
        setJobPosts([]);
        setError("");
      } else {
        setError("Failed to load job posts");
      }
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
      month: "short",
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

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Show warning if deadline is within 3 days or has passed
    return diffDays <= 3;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Open: "bg-green-100 text-green-800",
      Inprogress: "bg-blue-100 text-blue-800",
      Closed: "bg-gray-100 text-gray-800",
    };

    const statusText = {
      Open: "Open",
      Inprogress: "In Progress",
      Closed: "Closed",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          statusStyles.Closed
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const handleCreateJobPost = () => {
    navigate("/create-job-post");
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/my-job-posts/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Job Posts
              </h1>
              <p className="text-gray-600">
                Manage your job postings and track applications
              </p>
            </div>
            <button
              onClick={handleCreateJobPost}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Job Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
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

        {/* Job Posts List */}
        {jobPosts.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Job Posts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't created any job posts. Start by creating your first
                job posting.
              </p>
              <button
                onClick={handleCreateJobPost}
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Create Your First Job Post
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPosts.map((job) => (
              <div
                key={job.jobPostId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative p-6"
                onClick={() => handleJobClick(job.jobPostId)}
              >
                {/* Warning Icon for Near Deadline */}
                {isDeadlineNear(job.deadline) && job.status === "Open" && (
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className="bg-red-500 text-white rounded-full p-1.5"
                      title="Deadline approaching!"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Header with Status and Category */}
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(job.status)}
                  <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-md text-sm font-medium">
                    {job.categoryName}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {job.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Job Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block font-medium mb-1">
                      Salary
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium mb-1">
                      Type
                    </span>
                    <span className="font-semibold text-gray-900">
                      {job.jobType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium mb-1">
                      Location
                    </span>
                    <span className="font-semibold text-gray-900">
                      {job.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium mb-1">
                      Deadline
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(job.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium mb-1">
                      Created
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatDateRelative(job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {jobPosts.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jobPosts.filter((job) => job.status === "Open").length}
                </div>
                <div className="text-sm text-gray-600">Open Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {jobPosts.filter((job) => job.status === "Inprogress").length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {jobPosts.filter((job) => job.status === "Closed").length}
                </div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    jobPosts.filter(
                      (job) =>
                        isDeadlineNear(job.deadline) && job.status === "Open"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Near Deadline</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyJobPostsPage;
