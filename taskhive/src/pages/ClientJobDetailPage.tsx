/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
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

interface Category {
  categoryId: number;
  name: string;
}

interface Application {
  applicationId: number;
  freelancerId: number;
  freelancerName: string;
  jobPostId: number;
  jobPostTitle: string | null;
  coverLetter: string;
  bidAmount: number;
  status: string;
  cvFile: string | null;
  appliedAt: string;
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
  role: string;
  isEmailVerified: boolean;
  skills: Array<{
    id: number;
    categoryId: number;
    categoryName: string;
    categoryDescription: string;
  }>;
}

interface FreelancerData {
  profile: FreelancerProfile;
  count: number;
  average: number;
}

interface ApplicationDetail extends Application {
  freelancerData?: FreelancerData;
  loading?: boolean;
}

interface ToastState {
  message: string;
  type: "success" | "error";
  show: boolean;
}

interface ApplicationDetailModalProps {
  application: ApplicationDetail;
  isOpen: boolean;
  onClose: () => void;
  onHire: (applicationId: number) => void;
  onDecline: (applicationId: number) => void;
  onMarkAsReviewed: (applicationId: number) => void; // Add this new prop
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onHire,
  onDecline,
  onMarkAsReviewed, // Add this prop
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              Application Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Freelancer Profile */}
          {application.freelancerData ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={
                    application.freelancerData.profile.imageUrl ||
                    "/default-avatar.png"
                  }
                  alt={application.freelancerData.profile.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {application.freelancerData.profile.fullName}
                  </h3>
                  <p className="text-gray-600">
                    {application.freelancerData.profile.country}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {renderStars(application.freelancerData.average)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {application.freelancerData.average.toFixed(1)} (
                      {application.freelancerData.count} reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.freelancerData.profile.isEmailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application.freelancerData.profile.isEmailVerified
                      ? "✓ Verified"
                      : "✗ Not verified"}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {application.freelancerData.profile.skills &&
                application.freelancerData.profile.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.freelancerData.profile.skills.map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {skill.categoryName}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Portfolio */}
              {application.freelancerData.profile.portfolioUrl && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Portfolio
                  </h4>
                  <a
                    href={application.freelancerData.profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 underline"
                  >
                    {application.freelancerData.profile.portfolioUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          )}

          {/* Application Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bid Amount</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatSalary(application.bidAmount)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Applied Date</h4>
              <p className="text-gray-600">
                {formatDate(application.appliedAt)}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {application.coverLetter}
              </p>
            </div>
          </div>

          {/* CV File */}
          {application.cvFile && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">CV File</h4>
              <a
                href={application.cvFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 underline"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download CV
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            {/* Mark as Reviewed Button - Only show for Pending applications */}
            {application.status === "Pending" && (
              <button
                onClick={() => onMarkAsReviewed(application.applicationId)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
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
                Mark as Reviewed
              </button>
            )}

            <button
              onClick={() => onDecline(application.applicationId)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onHire(application.applicationId)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold rounded-lg hover:opacity-90 transition-all"
            >
              Hire Freelancer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add new interfaces for confirmation modals
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
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Actions */}
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

const ClientJobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "applications">(
    "details"
  );
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    show: false,
  });

  // Form data for editing
  const [formData, setFormData] = useState({
    jobPostId: 0,
    title: "",
    description: "",
    categoryId: 0,
    location: "",
    salaryMin: 0,
    salaryMax: 0,
    jobType: "",
    status: "",
    deadline: "",
  });

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "Inprogress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
  ];

  const jobTypeOptions = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
  ];

  // Add confirmation modal states
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
      fetchCategories();
      fetchApplications();
    }
  }, [jobId]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/JobPost/${jobId}`);
      const jobData = response.data;
      setJob(jobData);

      // Initialize form data
      setFormData({
        jobPostId: jobData.jobPostId,
        title: jobData.title,
        description: jobData.description,
        categoryId: jobData.categoryId,
        location: jobData.location,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        jobType: jobData.jobType,
        status: jobData.status,
        deadline: new Date(jobData.deadline).toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Failed to fetch job detail:", error);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/Category");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await api.get(`/api/Application/jobpost/${jobId}`);
      const allApplications: Application[] = response.data;

      // Filter applications with status "Pending" or "Reviewed"
      const filteredApplications = allApplications.filter(
        (app) => app.status === "Pending" || app.status === "Reviewed"
      );

      setApplications(filteredApplications);

      // Fetch freelancer data for each application
      fetchFreelancerDataForApplications(filteredApplications);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchFreelancerDataForApplications = async (
    applications: Application[]
  ) => {
    const updatedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          const response = await api.get(
            `/api/User/freelancer/${app.freelancerId}`
          );
          return {
            ...app,
            freelancerData: response.data,
            loading: false,
          };
        } catch (error) {
          console.error(
            `Failed to fetch freelancer data for ${app.freelancerId}:`,
            error
          );
          return {
            ...app,
            freelancerData: undefined,
            loading: false,
          };
        }
      })
    );

    setApplications(updatedApplications);
  };

  const handleApplicationClick = (application: ApplicationDetail) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedApplication(null), 300);
  };

  const handleHire = async (applicationId: number) => {
    try {
      // Find the current application to get its data
      const currentApplication = applications.find(
        (app) => app.applicationId === applicationId
      );

      if (!currentApplication) {
        showToast("Application not found", "error");
        return;
      }

      // 1. Update Application status to "Hired"
      const applicationFormData = new FormData();
      applicationFormData.append("ApplicationId", applicationId.toString());
      applicationFormData.append("CoverLetter", currentApplication.coverLetter);
      applicationFormData.append(
        "BidAmount",
        currentApplication.bidAmount.toString()
      );
      applicationFormData.append("Status", "Hired");
      applicationFormData.append("CVFile", ""); // Empty CVFile as required

      await api.put("/api/Application", applicationFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 2. Update Job Post status to "Inprogress"
      const jobUpdateData = {
        jobPostId: job!.jobPostId,
        title: job!.title,
        description: job!.description,
        categoryId: job!.categoryId,
        location: job!.location,
        salaryMin: job!.salaryMin,
        salaryMax: job!.salaryMax,
        jobType: job!.jobType,
        status: "Inprogress", // Change status to Inprogress
        deadline: job!.deadline,
      };

      await api.put("/api/JobPost", jobUpdateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update local state
      // Remove hired application from list (since we only show Pending & Reviewed)
      setApplications((prev) =>
        prev.filter((app) => app.applicationId !== applicationId)
      );

      // Update job status locally
      setJob((prev) => (prev ? { ...prev, status: "Inprogress" } : null));
      setFormData((prev) => ({ ...prev, status: "Inprogress" }));

      handleCloseModal();
      showToast(
        "Freelancer hired successfully! Job status updated to In Progress.",
        "success"
      );
    } catch (error: any) {
      console.error("Failed to hire freelancer:", error);

      // Handle specific error messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to hire freelancer";

      showToast(errorMessage, "error");
    }
  };

  const handleDecline = async (applicationId: number) => {
    try {
      // Find the current application to get its data
      const currentApplication = applications.find(
        (app) => app.applicationId === applicationId
      );

      if (!currentApplication) {
        showToast("Application not found", "error");
        return;
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("ApplicationId", applicationId.toString());
      formData.append("CoverLetter", currentApplication.coverLetter);
      formData.append("BidAmount", currentApplication.bidAmount.toString());
      formData.append("Status", "Rejected"); // Set status to Rejected
      formData.append("CVFile", ""); // Empty CVFile as required

      // Call API to decline application
      await api.put("/api/Application", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Remove declined application from the list (since we only show Pending & Reviewed)
      setApplications((prev) =>
        prev.filter((app) => app.applicationId !== applicationId)
      );

      handleCloseModal();
      showToast("Application declined successfully!", "success");
    } catch (error: any) {
      console.error("Failed to decline application:", error);

      // Handle specific error messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to decline application";

      showToast(errorMessage, "error");
    }
  };

  const handleMarkAsReviewed = async (applicationId: number) => {
    try {
      // Find the current application to get its data
      const currentApplication = applications.find(
        (app) => app.applicationId === applicationId
      );

      if (!currentApplication) {
        showToast("Application not found", "error");
        return;
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("ApplicationId", applicationId.toString());
      formData.append("CoverLetter", currentApplication.coverLetter);
      formData.append("BidAmount", currentApplication.bidAmount.toString());
      formData.append("Status", "Reviewed");
      formData.append("CVFile", ""); // Empty CVFile as required

      // Call API to mark as reviewed
      await api.put("/api/Application", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update application status locally
      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? { ...app, status: "Reviewed" }
            : app
        )
      );

      handleCloseModal();
      showToast("Application marked as reviewed!", "success");
    } catch (error: any) {
      console.error("Failed to mark application as reviewed:", error);

      // Handle specific error messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to mark application as reviewed";

      showToast(errorMessage, "error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Prepare data for API
      const updateData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
      };

      await api.put("/api/JobPost", updateData);
      showToast("Job post updated successfully!", "success");

      // Refresh job detail
      await fetchJobDetail();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update job post:", error);
      showToast("Failed to update job post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/JobPost/${jobId}`);

      setShowDeleteConfirm(false);
      showToast("Job post deleted successfully!", "success");

      // Redirect to my job posts after successful deletion
      setTimeout(() => {
        navigate("/my-job-posts");
      }, 2000);
    } catch (error: any) {
      console.error("Failed to delete job post:", error);
      showToast("Failed to delete job post", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClosePost = async () => {
    try {
      setIsClosing(true);

      // Update job status to "Closed"
      const jobUpdateData = {
        jobPostId: job!.jobPostId,
        title: job!.title,
        description: job!.description,
        categoryId: job!.categoryId,
        location: job!.location,
        salaryMin: job!.salaryMin,
        salaryMax: job!.salaryMax,
        jobType: job!.jobType,
        status: "Closed",
        deadline: job!.deadline,
      };

      await api.put("/api/JobPost", jobUpdateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update local state
      setJob((prev) => (prev ? { ...prev, status: "Closed" } : null));
      setFormData((prev) => ({ ...prev, status: "Closed" }));

      setShowCloseConfirm(false);
      showToast("Job post closed successfully!", "success");
    } catch (error: any) {
      console.error("Failed to close job post:", error);
      showToast("Failed to close job post", "error");
    } finally {
      setIsClosing(false);
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

  const formatDateRelativeShort = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString("vi-VN");
  };

  const formatSalaryShort = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          statusStyles.Closed
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const [applicationFilter, setApplicationFilter] = useState<
    "all" | "pending" | "reviewed"
  >("all");

  const filteredApplications = React.useMemo(() => {
    if (applicationFilter === "all") return applications;
    if (applicationFilter === "pending")
      return applications.filter((app) => app.status === "Pending");
    if (applicationFilter === "reviewed")
      return applications.filter((app) => app.status === "Reviewed");
    return applications;
  }, [applications, applicationFilter]);

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
            to="/my-job-posts"
            className="text-orange-600 hover:text-orange-800 font-medium underline"
          >
            Back to My Job Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/my-job-posts"
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
            Back to My Job Posts
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.jobType}</span>
                <span>•</span>
                <span>Posted {formatDateRelative(job.createdAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  {/* Close Post Button */}
                  {job.status !== "Closed" && (
                    <button
                      onClick={() => setShowCloseConfirm(true)}
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Close Post
                    </button>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchJobDetail(); // Reset form data
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Simple white boxes */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "details"
                  ? "bg-white text-gray-900 shadow-md"
                  : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              Job Details
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "applications"
                  ? "bg-white text-gray-900 shadow-md"
                  : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              Applications
              {applications.length > 0 && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">
                  {applications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "details" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            {!isEditing ? (
              // Display Mode
              <div className="space-y-8">
                {/* Status & Category */}
                <div className="flex items-center gap-4">
                  {getStatusBadge(job.status)}
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-sm font-medium">
                    {job.categoryName}
                  </span>
                </div>

                {/* Job Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Salary Range
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Application Deadline
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Last Updated
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDateRelative(job.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Job Description
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Edit Job Post
                </h2>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter job title"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {categories.map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location & Job Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type *
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select job type</option>
                      {jobTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Salary (VND)
                    </label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Salary (VND)
                    </label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Describe the job requirements, responsibilities, and qualifications..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Job Applications
              </h2>
              <p className="text-gray-600">
                {applications.length} applications found (Pending & Reviewed)
              </p>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setApplicationFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    applicationFilter === "all"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({applications.length})
                </button>
                <button
                  onClick={() => setApplicationFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    applicationFilter === "pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Pending (
                  {
                    applications.filter((app) => app.status === "Pending")
                      .length
                  }
                  )
                </button>
                <button
                  onClick={() => setApplicationFilter("reviewed")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    applicationFilter === "reviewed"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Reviewed (
                  {
                    applications.filter((app) => app.status === "Reviewed")
                      .length
                  }
                  )
                </button>
              </div>
            </div>

            {loadingApplications ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
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
                    No Applications Found
                  </h3>
                  <p className="text-gray-600">
                    No applications found for the selected filter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.applicationId}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6"
                  >
                    <div className="flex items-start gap-6">
                      {/* Freelancer Avatar */}
                      <div className="flex-shrink-0">
                        {application.freelancerData ? (
                          <img
                            src={
                              application.freelancerData.profile.imageUrl ||
                              "/default-avatar.png"
                            }
                            alt={application.freelancerData.profile.fullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* Application Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {application.freelancerName}
                            </h3>
                            {application.freelancerData && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {renderStars(
                                    application.freelancerData.average
                                  )}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {application.freelancerData.average.toFixed(
                                    1
                                  )}{" "}
                                  ({application.freelancerData.count} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {formatSalaryShort(application.bidAmount)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  application.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {application.status}
                              </span>
                              {application.status === "Reviewed" && (
                                <svg
                                  className="w-5 h-5 text-blue-500"
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
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter Preview */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {application.coverLetter}
                        </p>

                        {/* Applied Date and Actions */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Applied{" "}
                            {formatDateRelativeShort(application.appliedAt)}
                          </p>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            {application.status === "Pending" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsReviewed(
                                    application.applicationId
                                  );
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                              >
                                <svg
                                  className="w-3 h-3"
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
                                </svg>
                                Mark as Reviewed
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleApplicationClick(application)
                              }
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showCloseConfirm}
          onClose={() => setShowCloseConfirm(false)}
          onConfirm={handleClosePost}
          title="Close Job Post"
          message="Are you sure you want to close this job post? This will stop receiving new applications, but you can still manage existing ones."
          confirmText="Close Post"
          confirmButtonClass="bg-orange-500 hover:bg-orange-600"
          isLoading={isClosing}
        />

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Job Post"
          message="Are you sure you want to delete this job post? This action cannot be undone and all associated applications will be lost."
          confirmText="Delete"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          isLoading={isDeleting}
        />

        {/* Modal */}
        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            isOpen={showModal}
            onClose={handleCloseModal}
            onHire={handleHire}
            onDecline={handleDecline}
            onMarkAsReviewed={handleMarkAsReviewed} // Pass the new handler
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ClientJobDetailPage;
