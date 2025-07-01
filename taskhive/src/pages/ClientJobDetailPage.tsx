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

interface ToastState {
  message: string;
  type: "success" | "error";
  show: boolean;
}

const ClientJobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
      fetchCategories();
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
    if (!window.confirm("Are you sure you want to delete this job post?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/api/JobPost/${jobId}`);
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
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
                    {isDeleting ? "Deleting..." : "Delete"}
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
      </div>

      <Footer />
    </div>
  );
};

export default ClientJobDetailPage;
