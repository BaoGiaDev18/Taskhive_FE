import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BGImage from "../assets/BGhome.jpg";
import CategoryFilter from "../components/CategoryFilter";
import api from "../services/api";

interface UserSkill {
  categoryId: number;
  name: string;
  description: string;
}

interface SkillTag {
  categoryId: number;
  categoryName: string;
}

interface FreelancerListItem {
  userId: number;
  fullName: string;
  country: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  skills: SkillTag[];
  about?: string;
}
interface FreelancersResponse {
  items: FreelancerListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const HireFreelancerPage: React.FC = () => {
  const navigate = useNavigate();

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string>("");

  const pageSize = 8;
  const trendingTags = ["Logo design", "Website design", "Image editing"];

  // Thêm useEffect để check authentication
  useEffect(() => {
    checkAuthentication();
    fetchUserSkills();
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [currentPage, selectedSkillIds, searchTerm]);

  const checkAuthentication = () => {
    const token = localStorage.getItem("jwtToken");
    setIsAuthenticated(!!token);
  };

  const fetchUserSkills = async () => {
    try {
      const res = await api.get("/api/Category");
      setUserSkills(res.data as UserSkill[]);
    } catch (e) {
      console.error("Failed to fetch skills:", e);
    }
  };

  const fetchFreelancers = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        Page: currentPage.toString(),
        PageSize: pageSize.toString(),
      });

      if (searchTerm.trim()) params.append("Search", searchTerm.trim());
      selectedSkillIds.forEach((id) =>
        params.append("CategoryIds", id.toString())
      );

      const res = await api.get(
        `/api/User/freelancers/paged-with-ratings?${params}`
      );
      const data: FreelancersResponse = res.data;

      setFreelancers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to fetch freelancer:", err);

      // Reset freelancers and pagination state on error
      setFreelancers([]);
      setTotalPages(0);
      setTotalItems(0);

      if (err?.response?.status === 401) {
        setError("Unauthorized access. Please log in to view freelancers.");
      } else if (
        err?.response?.status === 404 ||
        err?.response?.data?.message?.includes("No freelancers found")
      ) {
        setError("No freelancers found matching your criteria.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to fetch freelancers. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevPage = () => {
    if (canGoPrev) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage((p) => p + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setError("");
    fetchFreelancers();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") setError("");
  };

  const handleTrendingTagClick = (tag: string) => {
    setSearchTerm(tag);
    setCurrentPage(1);
    setError("");
  };

  const handleSkillChange = (ids: number[]) => {
    setSelectedSkillIds(ids);
    setCurrentPage(1);
    setError("");
  };

  const handleSignUpClick = () => {
    navigate("/register");
  };

  const handleSeeMore = (userId: number) => {
    navigate(`/freelancer/${userId}`);
  };

  const handleRetry = () => {
    setError("");
    fetchFreelancers();
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${
            s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );

  const FreelancerCard: React.FC<{ f: FreelancerListItem }> = ({ f }) => (
    <div className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {f.imageUrl ? (
            <img
              src={f.imageUrl}
              alt={f.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = (e.target as HTMLImageElement)
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-gray-300 items-center justify-center ${
              f.imageUrl ? "hidden" : "flex"
            }`}
          >
            <span className="text-gray-700 font-semibold">
              {getInitials(f.fullName)}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {f.fullName}
            </h3>
            <StarRating rating={f.averageRating || 0} />
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {f.country ? f.country : "—"}
            {f.reviewCount
              ? ` • ${f.reviewCount} review${f.reviewCount > 1 ? "s" : ""}`
              : ""}
          </p>

          {f.about ? (
            <p className="text-sm text-gray-700 mt-3 line-clamp-2">{f.about}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 mt-3">
            {f.skills?.slice(0, 5).map((s) => (
              <span
                key={`${f.userId}-${s.categoryId}`}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-[#F57C00] border border-orange-100"
              >
                {s.categoryName}
              </span>
            ))}
            {f.skills && f.skills.length > 5 ? (
              <span className="text-xs text-gray-500">
                +{f.skills.length - 5} more
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <button
              onClick={() => handleSeeMore(f.userId)}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              See more
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <section
        className="relative h-screen bg-cover bg-center text-white flex flex-col justify-center items-center"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Find top freelancers on TaskHive
          </h1>
          <p className="text-xl leading-relaxed">
            Browse expert talent for design, development, content and more.
            Search by skills and hire with confidence.
          </p>
          {!isAuthenticated && (
            <button
              onClick={handleSignUpClick}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl hover:opacity-90 transition-all"
            >
              Sign up now
            </button>
          )}
        </div>

        <div className="w-full flex flex-col items-center mt-12 px-4">
          <div className="max-w-4xl w-full text-white mb-4">
            <p className="text-sm mb-2">Trendings:</p>
            <div className="flex gap-3 flex-wrap">
              {trendingTags.map((tag, i) => (
                <button
                  key={i}
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
                  placeholder="What kind of freelancer are you looking for?"
                  className="w-full outline-none text-gray-800 placeholder-gray-500 bg-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 px-4 py-12">
        <div>
          <CategoryFilter
            categories={userSkills}
            selectedCategories={selectedSkillIds}
            onCategoryChange={handleSkillChange}
          />
        </div>

        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm
                ? `Freelancers for "${searchTerm}"`
                : "Featured Freelancers"}
            </h2>
            <p className="text-gray-600">
              {error
                ? "0 freelancers found"
                : `${totalItems} freelancers found`}
              {selectedSkillIds.length > 0 && ` in selected skills`}
            </p>
          </div>

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
                    No Freelancers Found
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
                          setSelectedSkillIds([]);
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

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {!loading && !error && freelancers.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {freelancers.map((f) => (
                <FreelancerCard key={f.userId} f={f} />
              ))}
            </div>
          )}

          {!loading && !error && freelancers.length === 0 && (
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
                No freelancers found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or browse all freelancers.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && freelancers.length > 0 && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3 w-full max-w-2xl">
                {/* Prev */}
                <button
                  onClick={handlePrevPage}
                  disabled={!canGoPrev}
                  aria-label="Previous page"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
          ${
            canGoPrev
              ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:opacity-90"
              : "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
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
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                {/* Page indicator */}
                <div className="px-5 py-3 text-sm text-gray-700 border-l border-r border-gray-200 flex items-center">
                  Page&nbsp;<span className="font-semibold">{currentPage}</span>
                  &nbsp;/&nbsp;{totalPages}
                </div>

                {/* Next */}
                <button
                  onClick={handleNextPage}
                  disabled={!canGoNext}
                  aria-label="Next page"
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
          ${
            canGoNext
              ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:opacity-90"
              : "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
                >
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Range info */}
              <p className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                –{Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
                freelancers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HireFreelancerPage;
