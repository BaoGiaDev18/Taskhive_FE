/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

interface Application {
  applicationId: number;
  freelancerId: number;
  freelancerName: string;
  jobPostId: number;
  jobPostTitle: string;
  coverLetter: string;
  bidAmount: number;
  status: string;
  cvFile: string | null;
  appliedAt: string;
  isExpanded?: boolean;
  isEditing?: boolean;
}

interface EditFormData {
  coverLetter: string;
  bidAmount: number;
  cvFile: File | null;
  keepCurrentCV: boolean;
}

const FreelancerMyProposalsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingApplicationId, setEditingApplicationId] = useState<
    number | null
  >(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    coverLetter: "",
    bidAmount: 0,
    cvFile: null,
    keepCurrentCV: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Get freelancerId from JWT token
  const getFreelancerIdFromToken = () => {
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
      console.error("Error getting freelancerId from token:", error);
      navigate("/login");
      return null;
    }
  };

  // Fetch applications
  const fetchApplications = async (freelancerId: number) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/Application/freelancer/${freelancerId}`
      );

      // Filter only specific statuses
      const allowedStatuses = ["Pending", "Reviewed", "Rejected", "Cancelled"];
      const filteredApplications = response.data.filter((app: Application) =>
        allowedStatuses.includes(app.status)
      );

      const applicationsData = filteredApplications.map((app: Application) => ({
        ...app,
        isExpanded: false,
        isEditing: false,
      }));

      setApplications(applicationsData);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch applications:", error);
      if (error.response?.status === 404) {
        setApplications([]);
        setError("");
      } else {
        setError("Failed to load proposals");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse application
  const toggleApplicationExpansion = (applicationId: number) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.applicationId === applicationId
          ? { ...app, isExpanded: !app.isExpanded }
          : app
      )
    );
  };

  // Start editing application
  const startEditing = (application: Application) => {
    setEditingApplicationId(application.applicationId);
    setEditFormData({
      coverLetter: application.coverLetter,
      bidAmount: application.bidAmount,
      cvFile: null,
      keepCurrentCV: true,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingApplicationId(null);
    setEditFormData({
      coverLetter: "",
      bidAmount: 0,
      cvFile: null,
      keepCurrentCV: true,
    });
  };

  // Update application
  const updateApplication = async (applicationId: number) => {
    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("ApplicationId", applicationId.toString());
      formData.append("CoverLetter", editFormData.coverLetter);
      formData.append("BidAmount", editFormData.bidAmount.toString());
      formData.append("Status", "Pending"); // Keep current status as Pending

      // Handle CV file
      if (editFormData.keepCurrentCV) {
        formData.append("CVFile", ""); // Empty to keep current CV
      } else if (editFormData.cvFile) {
        formData.append("CVFile", editFormData.cvFile);
      } else {
        formData.append("CVFile", ""); // Empty to keep current CV
      }

      await api.put("/api/Application", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? {
                ...app,
                coverLetter: editFormData.coverLetter,
                bidAmount: editFormData.bidAmount,
                // Only update cvFile if a new one was uploaded
                ...(editFormData.cvFile &&
                  !editFormData.keepCurrentCV && {
                    cvFile: URL.createObjectURL(editFormData.cvFile),
                  }),
              }
            : app
        )
      );

      setEditingApplicationId(null);
      showToast("Application updated successfully!", "success");
    } catch (error: any) {
      console.error("Failed to update application:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to update application";
      showToast(errorMessage, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const freelancerIdFromToken = getFreelancerIdFromToken();
    if (freelancerIdFromToken) {
      fetchApplications(freelancerIdFromToken);
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
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      Reviewed: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Reviewed",
      },
      Rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
      },
      Cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Cancelled",
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

  // Check if application can be edited (only Pending status)
  const canEditApplication = (status: string) => {
    return status === "Pending";
  };

  // Filter applications by status
  const pendingApplications = applications.filter(
    (app) => app.status === "Pending"
  );
  const reviewedApplications = applications.filter(
    (app) => app.status === "Reviewed"
  );
  const rejectedApplications = applications.filter(
    (app) => app.status === "Rejected"
  );
  const cancelledApplications = applications.filter(
    (app) => app.status === "Cancelled"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Proposals
              </h1>
              <p className="text-gray-600">
                Track your job applications and their status
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

        {/* Summary Stats */}
        {applications.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Proposal Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingApplications.length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {reviewedApplications.length}
                </div>
                <div className="text-sm text-gray-600">Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rejectedApplications.length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {cancelledApplications.length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 && !error ? (
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
                No Proposals Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any job proposals yet. Start exploring job
                opportunities!
              </p>
              <Link
                to="/find-work"
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Find Work
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.applicationId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Application Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    toggleApplicationExpansion(application.applicationId)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {application.jobPostTitle}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                        <span>
                          Bid:{" "}
                          <span className="font-semibold text-green-600">
                            {formatSalary(application.bidAmount)}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          Applied {formatDateRelative(application.appliedAt)}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-1">
                        {application.coverLetter}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Edit Button - Only for Pending applications */}
                      {canEditApplication(application.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(application);
                          }}
                          className="text-blue-600 bg-white hover:text-blue-800 text-sm font-medium flex items-center gap-1"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                      )}

                      {/* View Job Link */}
                      <Link
                        to={`/job/${application.jobPostId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        View Job
                      </Link>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          application.isExpanded ? "rotate-180" : ""
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

                {/* Expanded Application Details */}
                {application.isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Application Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Application Details
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Application ID
                            </span>
                            <p className="text-gray-900">
                              #{application.applicationId}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Submitted Date
                            </span>
                            <p className="text-gray-900">
                              {formatDate(application.appliedAt)}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Bid Amount
                            </span>
                            {editingApplicationId ===
                            application.applicationId ? (
                              <div className="mt-1">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editFormData.bidAmount}
                                    onChange={(e) =>
                                      setEditFormData((prev) => ({
                                        ...prev,
                                        bidAmount: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full border border-gray-300 rounded-md p-2 pr-16"
                                    placeholder="e.g. 500000"
                                    min={0}
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                    VND
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-lg font-bold text-green-600">
                                {formatSalary(application.bidAmount)}
                              </p>
                            )}
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Status
                            </span>
                            <div className="mt-1">
                              {getStatusBadge(application.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter & CV */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Proposal Content
                        </h4>

                        <div className="space-y-4">
                          {/* Cover Letter */}
                          <div>
                            <span className="text-sm font-medium text-gray-500 mb-2 block">
                              Cover Letter
                            </span>
                            {editingApplicationId ===
                            application.applicationId ? (
                              <textarea
                                value={editFormData.coverLetter}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    coverLetter: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg p-3"
                                rows={4}
                                placeholder="Write a brief introduction and why you're a good fit..."
                              />
                            ) : (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-gray-700 leading-relaxed">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* CV File */}
                          <div>
                            <span className="text-sm font-medium text-gray-500 mb-2 block">
                              CV File
                            </span>
                            {editingApplicationId ===
                            application.applicationId ? (
                              <div className="space-y-3">
                                {application.cvFile && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="keepCurrentCV"
                                      checked={editFormData.keepCurrentCV}
                                      onChange={(e) =>
                                        setEditFormData((prev) => ({
                                          ...prev,
                                          keepCurrentCV: e.target.checked,
                                          cvFile: e.target.checked
                                            ? null
                                            : prev.cvFile,
                                        }))
                                      }
                                      className="rounded border-gray-300"
                                    />
                                    <label
                                      htmlFor="keepCurrentCV"
                                      className="text-sm text-gray-600"
                                    >
                                      Keep current CV
                                    </label>
                                  </div>
                                )}
                                {!editFormData.keepCurrentCV && (
                                  <div>
                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        setEditFormData((prev) => ({
                                          ...prev,
                                          cvFile: e.target.files?.[0] || null,
                                        }))
                                      }
                                      className="w-full"
                                      accept=".pdf,.doc,.docx"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Accepted formats: .pdf, .doc, .docx (Max:
                                      10MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              application.cvFile && (
                                <a
                                  href={application.cvFile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Download CV
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {editingApplicationId === application.applicationId ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              updateApplication(application.applicationId)
                            }
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
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
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isUpdating}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Link
                            to={`/job/${application.jobPostId}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Job Details
                          </Link>

                          {/* Additional action button for reapply on rejected applications */}
                          {application.status === "Rejected" && (
                            <Link
                              to={`/apply?jobId=${application.jobPostId}`}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                              Apply Again
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerMyProposalsPage;
