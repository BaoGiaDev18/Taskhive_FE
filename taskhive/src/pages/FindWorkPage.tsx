import React, { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";
import BGImage from "../assets/BGhome.jpg";
import CategoryFilter from "../components/CategoryFilter";
import api from "../services/api";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

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
  reviewCount: number;
  averageRating: number;
}

interface JobPostResponse {
  items: JobPost[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const FindWork = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string>("");
  const pageSize = 8;

  // Trending tags
  const trendingTags = ["Brand guidelines", "App development", "Image editing"];

  useEffect(() => {
    checkAuthentication();
    fetchCategories();
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, selectedCategories, searchTerm]);

  const checkAuthentication = () => {
    const token = localStorage.getItem("jwtToken");
    setIsAuthenticated(!!token);
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await api.get("/api/Category");
      console.log("Categories response:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    try {
      const params = new URLSearchParams({
        Page: currentPage.toString(),
        PageSize: pageSize.toString(),
      });

      if (searchTerm.trim()) {
        params.append("Search", searchTerm.trim());
      }

      selectedCategories.forEach((categoryId) => {
        params.append("CategoryIds", categoryId.toString());
      });

      console.log("Fetching jobs with params:", params.toString());
      const response = await api.get(
        `/api/JobPost/paged-with-ratings?${params}`
      );
      const data: JobPostResponse = response.data;
      console.log("Jobs response:", data);

      // Success - update jobs
      setJobs(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setError(""); // Clear any previous errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to fetch jobs:", error);

      // Clear jobs on error
      setJobs([]);
      setTotalPages(0);
      setTotalItems(0);

      // Set appropriate error message
      if (error.response?.status === 401) {
        setError("Unauthorized access. Please log in to view jobs.");
      } else if (
        error.response?.status === 404 ||
        error.response?.data?.message?.includes("No job posts found")
      ) {
        setError("No job posts found matching your criteria.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to fetch jobs. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setError(""); // Clear errors when starting new search
    fetchJobs();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setError(""); // Clear errors when clearing search
    }
  };

  const handleTrendingTagClick = (tag: string) => {
    setSearchTerm(tag);
    setCurrentPage(1);
    setError(""); // Clear errors when clicking trending tag
  };

  const handleCategoryChange = (categoryIds: number[]) => {
    console.log("Selected categories changed:", categoryIds);
    setSelectedCategories(categoryIds);
    setCurrentPage(1);
    setError(""); // Clear errors when changing categories
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const handleApplyClick = (jobId: number) => {
    if (!isAuthenticated) {
      navigate("/register");
    } else {
      console.log(`Apply to job ${jobId}`);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    setError("");
    fetchJobs();
  };

  return (
    <div className="bg-white">
      {/* Hero Section with Overlay Search */}
      <section
        className="relative h-screen bg-cover bg-center text-white flex flex-col justify-center items-center"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Find the best job in TaskHive!
          </h1>
          <p className="text-xl leading-relaxed">
            Explore thousands of job opportunities tailored to your skills.
            Connect with top employers and take the next step in your career
            today.
          </p>
          {/* Only show Sign up button if not authenticated */}
          {!isAuthenticated && (
            <button
              onClick={handleSignUpClick}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:opacity-90 transition-all"
            >
              Sign up now
            </button>
          )}
        </div>

        {/* 🔍 Trending + Search bar - Same style as HireFreelancerPage */}
        <div className="w-full flex flex-col items-center mt-12 px-4">
          <div className="max-w-4xl w-full text-white mb-4">
            <p className="text-sm mb-2">Trendings:</p>
            <div className="flex gap-3 flex-wrap">
              {trendingTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTrendingTagClick(tag)}
                  className="bg-white/20 text-white px-4 py-1 rounded-full text-sm hover:bg-white/30 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl w-full">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4">
                <svg
                  className="w-5 h-5 text-gray-600 mr-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 2a8 8 0 105.293 14.293l5.707 5.707-1.414 1.414-5.707-5.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="What are you looking for?"
                  className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content with 2-column job layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 px-4 py-12">
        {/* Filter Sidebar */}
        <div>
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Job Results */}
        <div>
          {/* Results Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? `Results for "${searchTerm}"` : "Job Opportunities"}
            </h2>
            <p className="text-gray-600">
              {error ? "0 jobs found" : `${totalItems} jobs found`}
              {selectedCategories.length > 0 && ` in selected categories`}
            </p>
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No Jobs Found
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex space-x-4">
                      <button
                        onClick={handleRetry}
                        className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm font-medium rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategories([]);
                          setError("");
                          setCurrentPage(1);
                        }}
                        className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Job Cards Grid - 2 Columns */}
          {!loading && !error && jobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.jobPostId}
                  job={job}
                  onApply={handleApplyClick}
                />
              ))}
            </div>
          )}

          {/* Empty State - Only show when no error and no jobs */}
          {!loading && !error && jobs.length === 0 && (
            <div className="text-center py-12">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all jobs.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {!loading &&
            !error &&
            jobs.length > 0 &&
            currentPage < totalPages && (
              <div className="text-center py-8">
                <button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:opacity-90 transition-all"
                >
                  Load More ({totalPages - currentPage} more pages)
                </button>
              </div>
            )}

          {/* Pagination Info */}
          {!loading && !error && jobs.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-600">
              Showing page {currentPage} of {totalPages} ({totalItems} total
              jobs)
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FindWork;
