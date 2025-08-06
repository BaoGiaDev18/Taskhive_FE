import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface FreelancerProfile {
  userId: number;
  email: string;
  fullName: string;
  userName: string | null;
  remainingSlots: number;
  cvFile: string | null;
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

interface FreelancerResponse {
  profile: FreelancerProfile;
  count: number;
  average: number;
}

const ApplyFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobPostId, jobTitle, salaryMin, salaryMax, jobType, deadline } =
    location.state || {};

  const auth = useAuth();
  const freelancerId = auth?.userId;

  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [status] = useState("Pending");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSlots, setRemainingSlots] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  // Fetch freelancer profile to check remaining slots
  useEffect(() => {
    const fetchFreelancerProfile = async () => {
      if (!freelancerId) return;

      try {
        setLoading(true);
        const response = await api.get<FreelancerResponse>(
          `/api/User/freelancer/${freelancerId}`
        );
        setRemainingSlots(response.data.profile.remainingSlots);
        setError("");
      } catch (error) {
        console.error("Failed to fetch freelancer profile:", error);
        setError("Failed to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerProfile();
  }, [freelancerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has remaining slots
    if (remainingSlots === null) {
      setError(
        "Unable to verify your remaining slots. Please refresh the page."
      );
      return;
    }

    if (remainingSlots <= 0) {
      setError(
        "You have no remaining application slots. Please purchase more slots to continue applying."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("FreelancerId", String(freelancerId));
    formData.append("JobPostId", String(jobPostId));
    formData.append("CoverLetter", coverLetter);
    formData.append("BidAmount", String(bidAmount));
    formData.append("Status", status);
    if (cvFile) formData.append("CVFile", cvFile);

    try {
      // Submit application
      await api.post("/api/Application", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Deduct one slot after successful application
      await api.put(
        `/api/User/RemainingSlot/${freelancerId}?updateSlot=${
          remainingSlots - 1
        }`
      );

      alert("Application submitted successfully!");
      navigate("/find-work");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Application failed:", error);
      if (error.response?.status === 400) {
        setError("Invalid application data. Please check your information.");
      } else if (error.response?.status === 409) {
        setError("You have already applied for this job.");
      } else {
        setError("Failed to submit application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 bg-gray-50 min-h-screen px-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-gray-50 min-h-screen px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Submit a Proposal</h1>

        {/* Remaining Slots Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Remaining Application Slots
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                remainingSlots && remainingSlots > 0
                  ? remainingSlots > 3
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {remainingSlots !== null ? remainingSlots : "?"}{" "}
              {remainingSlots === 1 ? "slot" : "slots"}
            </span>
          </div>
          {remainingSlots !== null &&
            remainingSlots <= 3 &&
            remainingSlots > 0 && (
              <p className="text-xs text-yellow-600 mt-2">
                You're running low on application slots. Consider purchasing
                more to continue applying.
              </p>
            )}
          {remainingSlots === 0 && (
            <p className="text-xs text-red-600 mt-2">
              You have no remaining slots. Please purchase more slots to apply
              for jobs.
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Job Info */}
        <div className="mb-8 border p-4 rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">{jobTitle}</h2>
          <p className="text-gray-700 mb-1">
            <strong>Type:</strong> {jobType || "N/A"}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Salary:</strong>{" "}
            {salaryMin || salaryMax
              ? `${salaryMin?.toLocaleString()} - ${salaryMax?.toLocaleString()} VND`
              : "Negotiable"}
          </p>
          <p className="text-gray-700">
            <strong>Deadline:</strong>{" "}
            {deadline ? new Date(deadline).toLocaleDateString("vi-VN") : "N/A"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Letter *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={6}
              placeholder="Write a brief introduction and why you're a good fit for this job..."
              required
              disabled={
                submitting || (remainingSlots !== null && remainingSlots <= 0)
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Explain your relevant experience and approach to this project.
            </p>
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Bid Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-3 pr-16 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. 500000"
                min={0}
                required
                disabled={
                  submitting || (remainingSlots !== null && remainingSlots <= 0)
                }
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                VND
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your proposed budget for this project.
            </p>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload CV (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              accept=".pdf,.doc,.docx"
              disabled={
                submitting || (remainingSlots !== null && remainingSlots <= 0)
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: .pdf, .doc, .docx (Max: 10MB)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-md transition disabled:opacity-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                submitting || (remainingSlots !== null && remainingSlots <= 0)
              }
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>

          {/* Slots Warning */}
          {remainingSlots !== null && remainingSlots <= 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need more application slots?
              </p>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition"
              >
                Purchase More Slots
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyFormPage;
