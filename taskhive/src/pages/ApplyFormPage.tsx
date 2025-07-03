import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";
import facebook from "../assets/faceicon.jpg";

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
      <div className="pt-20">
        <footer className="bg-[#191919] text-white py-16 px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <img src={Logo} alt="TaskHive Logo" className="h-12 mb-6" />
              <div className="flex space-x-4">
                <img src={facebook} alt="fb" className="h-6" />
                <img src="/twitter-icon.png" alt="twitter" className="h-6" />
                <img src="/linkedin-icon.png" alt="linkedin" className="h-6" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">For Clients</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/how-to-hire" className="text-white">
                    How to Hire
                  </Link>
                </li>
                <li>
                  <Link to="/project-catalog" className="text-white">
                    Project Catalog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">For Talents</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/how-to-find-work" className="text-white">
                    How to find work
                  </Link>
                </li>
                <li>
                  <Link to="/freelance-jobs" className="text-white">
                    Freelance Jobs in HCM
                  </Link>
                </li>
                <li>
                  <Link to="/ads" className="text-white">
                    Win work with ads
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/leadership" className="text-white">
                    Leadership
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white mt-12 pt-6 text-sm flex justify-between">
            <p>© 2024 - 2025 TaskHive® Global Inc.</p>
            <div className="space-x-6">
              <Link to="/terms" className="text-white">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ApplyFormPage;
