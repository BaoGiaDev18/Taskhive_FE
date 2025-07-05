/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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

interface Application {
  applicationId: number;
  jobPostId: number;
  freelancerId: number;
  freelancerName: string;
  coverLetter: string;
  bidAmount: number;
  status: string;
  appliedAt: string; // This will be treated as contract start date
  freelancerData?: {
    profile: {
      fullName: string;
      imageUrl: string;
      country: string;
    };
  };
}

interface JobWithContracts extends JobPost {
  applications: Application[];
  contractCount: number;
  isExpanded: boolean;
  loadingApplications: boolean;
}

const ClientContractPage = () => {
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = useState<JobWithContracts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

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

      const userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      return parseInt(userId);
    } catch (error) {
      console.error("Error getting employerId from token:", error);
      navigate("/login");
      return null;
    }
  };

  // Fetch contract applications for a specific job post
  const fetchContractApplications = async (
    jobPostId: number
  ): Promise<Application[]> => {
    try {
      const response = await api.get(`/api/Application/jobpost/${jobPostId}`);
      const applications: Application[] = response.data;

      // Filter only contract applications (Hired, Cancelled, Finished)
      const contractApplications = applications.filter(
        (app) =>
          app.status === "Hired" ||
          app.status === "Cancelled" ||
          app.status === "Finished"
      );

      // Fetch freelancer data for each application (only basic profile info)
      const applicationsWithFreelancerData = await Promise.all(
        contractApplications.map(async (app) => {
          try {
            const freelancerResponse = await api.get(
              `/api/User/freelancer/${app.freelancerId}`
            );
            return {
              ...app,
              freelancerData: {
                profile: freelancerResponse.data.profile,
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch freelancer data for ${app.freelancerId}:`,
              error
            );
            return {
              ...app,
              freelancerData: undefined,
            };
          }
        })
      );

      return applicationsWithFreelancerData;
    } catch (error: any) {
      console.error(
        `Failed to fetch applications for job ${jobPostId}:`,
        error
      );
      return [];
    }
  };

  // Fetch job posts and contract counts
  const fetchJobPostsWithContracts = async (employerId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/JobPost/employer/${employerId}`);
      const jobPostsData: JobPost[] = response.data;

      // Get contract count for each job post
      const jobPostsWithContracts = await Promise.all(
        jobPostsData.map(async (job) => {
          const contractApplications = await fetchContractApplications(
            job.jobPostId
          );
          return {
            ...job,
            applications: [],
            contractCount: contractApplications.length,
            isExpanded: false,
            loadingApplications: false,
          };
        })
      );

      // Filter only job posts that have contracts
      const jobPostsWithAnyContracts = jobPostsWithContracts.filter(
        (job) => job.contractCount > 0
      );

      setJobPosts(jobPostsWithAnyContracts);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch job posts:", error);
      if (error.response?.status === 404) {
        setJobPosts([]);
        setError("");
      } else {
        setError("Failed to load contracts");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse job post applications
  const toggleJobExpansion = async (jobPostId: number) => {
    setJobPosts((prev) =>
      prev.map((job) => {
        if (job.jobPostId === jobPostId) {
          if (!job.isExpanded && job.applications.length === 0) {
            // Load applications if not loaded yet
            loadJobApplications(jobPostId);
          }
          return { ...job, isExpanded: !job.isExpanded };
        }
        return job;
      })
    );
  };

  // Load applications for a specific job
  const loadJobApplications = async (jobPostId: number) => {
    setJobPosts((prev) =>
      prev.map((job) =>
        job.jobPostId === jobPostId
          ? { ...job, loadingApplications: true }
          : job
      )
    );

    try {
      const applications = await fetchContractApplications(jobPostId);

      setJobPosts((prev) =>
        prev.map((job) =>
          job.jobPostId === jobPostId
            ? { ...job, applications, loadingApplications: false }
            : job
        )
      );
    } catch (error) {
      console.error("Failed to load applications:", error);
      setJobPosts((prev) =>
        prev.map((job) =>
          job.jobPostId === jobPostId
            ? { ...job, loadingApplications: false }
            : job
        )
      );
    }
  };

  useEffect(() => {
    const userIdFromToken = getEmployerIdFromToken();
    if (userIdFromToken) {
      fetchJobPostsWithContracts(userIdFromToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Hired: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      Cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
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
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
                My Contracts
              </h1>
              <p className="text-gray-600">
                Manage your active contracts and view completed work
              </p>
            </div>
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

        {/* Job Posts with Contracts */}
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
                No Contracts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any active contracts. Start by hiring freelancers
                for your job posts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobPosts.map((job) => (
              <div
                key={job.jobPostId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Job Post Header - Simplified */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleJobExpansion(job.jobPostId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {job.title}
                        </h3>
                        <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-md text-sm font-medium">
                          {job.categoryName}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.jobType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Contract Count Badge */}
                      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-md">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {job.contractCount} Contract
                          {job.contractCount > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          job.isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Applications/Contracts */}
                {job.isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {job.loadingApplications ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : job.applications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No contract applications found
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {job.applications.map((application) => (
                          <Link
                            key={application.applicationId}
                            to={`/client/contract/${application.applicationId}`}
                            className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              {/* Freelancer Avatar */}
                              <div className="flex-shrink-0">
                                {application.freelancerData ? (
                                  <img
                                    src={
                                      application.freelancerData.profile
                                        .imageUrl || "/default-avatar.png"
                                    }
                                    alt={
                                      application.freelancerData.profile
                                        .fullName
                                    }
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                                )}
                              </div>

                              {/* Contract Info */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                                      {application.freelancerName}
                                    </h4>
                                    {application.freelancerData && (
                                      <span className="text-sm text-gray-600">
                                        {
                                          application.freelancerData.profile
                                            .country
                                        }
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600 mb-1">
                                      {formatSalary(application.bidAmount)}
                                    </div>
                                    {getStatusBadge(application.status)}
                                  </div>
                                </div>

                                {/* Contract Start Date */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>
                                    Contract started:{" "}
                                    {formatDate(application.appliedAt)}
                                  </span>
                                  <span>
                                    {formatDateRelative(application.appliedAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Arrow Icon */}
                              <div className="flex-shrink-0">
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
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {jobPosts.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contract Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jobPosts.reduce(
                    (total, job) =>
                      total +
                      job.applications.filter((app) => app.status === "Hired")
                        .length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Active Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {jobPosts.reduce(
                    (total, job) =>
                      total +
                      job.applications.filter(
                        (app) => app.status === "Finished"
                      ).length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {jobPosts.reduce(
                    (total, job) =>
                      total +
                      job.applications.filter(
                        (app) => app.status === "Cancelled"
                      ).length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {jobPosts.reduce(
                    (total, job) => total + job.contractCount,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Contracts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientContractPage;
