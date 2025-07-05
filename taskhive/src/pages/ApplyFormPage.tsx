import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("FreelancerId", String(freelancerId));
    formData.append("JobPostId", String(jobPostId));
    formData.append("CoverLetter", coverLetter);
    formData.append("BidAmount", String(bidAmount));
    formData.append("Status", status);
    if (cvFile) formData.append("CVFile", cvFile);

    try {
      await api.post("/api/Application", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Application submitted successfully!");
      navigate("/find-work");
    } catch (error) {
      console.error("Application failed", error);
    }
  };

  return (
    <div className="pt-24 bg-gray-50 min-h-screen px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Submit a Proposal</h1>

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
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3"
              rows={6}
              placeholder="Write a brief introduction and why you're a good fit..."
              required
            />
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Bid Amount</label>
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-3 pr-16"
                placeholder="e.g. 500000"
                min={0}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                VND
              </span>
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload CV</label>
            <input
              type="file"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="w-full"
              accept=".pdf,.doc,.docx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: .pdf, .doc, .docx (Max: 10MB)
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md transition"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyFormPage;
