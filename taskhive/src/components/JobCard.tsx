import React from "react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: {
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
    reviewCount: number;
    averageRating: number;
  };
  onApply?: (jobId: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Negotiable";
    const formatNumber = (num: number) =>
      new Intl.NumberFormat("vi-VN").format(num);
    return `${formatNumber(min)} - ${formatNumber(max)} VND`;
  };

  const formatDate = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
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

  const getExperienceLevel = () => {
    // Simple logic based on salary range
    const avgSalary = (job.salaryMin + job.salaryMax) / 2;
    if (avgSalary > 15000000) return "Expert";
    if (avgSalary > 8000000) return "Intermediate";
    return "Entry level";
  };

  const generateTags = () => {
    const tags = [job.categoryName];

    // Add some relevant tags based on category
    if (job.categoryName.includes("Web")) {
      tags.push("Frontend", "Backend");
    } else if (job.categoryName.includes("UI/UX")) {
      tags.push("Design", "Figma");
    } else if (job.categoryName.includes("Mobile")) {
      tags.push("iOS", "Android");
    } else if (job.categoryName.includes("Marketing")) {
      tags.push("SEO", "Social Media");
    }

    return tags.slice(0, 3); // Limit to 3 tags
  };

  const handleEmployerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/client/${job.employerId}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/job/${job.jobPostId}`);
  };

  return (
    <div className="p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
      {/* ⭐ Rating + Location */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex text-yellow-400">
          {renderStars(job.averageRating)}
        </div>
        <span className="text-sm text-gray-600 ml-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleEmployerClick(e);
            }}
            className="text-orange-600 hover:text-orange-800 hover:underline font-medium transition-colors cursor-pointer"
          >
            {job.employerName}
          </a>
          <span className="text-gray-600"> | {job.location}</span>
        </span>
        {job.reviewCount > 0 && (
          <span className="text-xs text-gray-500">
            ({job.reviewCount} reviews)
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {job.title}
      </h3>

      {/* Meta info: price - level - deadline */}
      <div className="flex justify-between text-sm text-gray-700 mb-2">
        <div>
          <p className="font-medium">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </p>
          <p className="text-xs text-gray-500">
            {job.jobType === "Fixed-price" ? "Fixed price" : "Hourly rate"}
          </p>
        </div>
        <div>
          <p className="font-medium">{getExperienceLevel()}</p>
          <p className="text-xs text-gray-500">Experience level</p>
        </div>
        <div>
          <p className="font-medium">{formatDate(job.deadline)}</p>
          <p className="text-xs text-gray-500">Application deadline</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {generateTags().map((tag, i) => (
          <span
            key={i}
            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplyClick}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md text-sm transition-colors"
      >
        Apply now
      </button>
    </div>
  );
};

export default JobCard;
