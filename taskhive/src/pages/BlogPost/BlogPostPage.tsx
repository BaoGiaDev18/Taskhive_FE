/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Toast from "../../components/Toast";

interface Author {
  userId: number;
  fullName: string;
}

interface BlogPost {
  blogpostId: number;
  authorId: number;
  author: Author;
  title: string;
  content: string;
  publishedAt: string | null;
  status: string; // This is imageUrl
  isDeleted: boolean;
}

interface BlogPostResponse {
  items: BlogPost[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

const BlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const pageSize = 9; // 3x3 grid

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const page = searchParams.get("page");
    const search = searchParams.get("search");

    if (page) setCurrentPage(parseInt(page));
    if (search) setSearchTerm(search);

    fetchBlogPosts(page ? parseInt(page) : 1, search || "");
  }, [searchParams]);

  const fetchBlogPosts = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        Page: page.toString(),
        PageSize: pageSize.toString(),
        IsPublished: "true", // Chỉ lấy bài đã published
      });

      if (search.trim()) {
        params.append("Search", search.trim());
      }

      const response = await api.get(`/api/BlogPost?${params.toString()}`);
      const data: BlogPostResponse = response.data;

      setBlogPosts(data.items);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error: any) {
      console.error("Failed to fetch blog posts:", error);
      showToast("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", "1");
    if (searchTerm.trim()) {
      newSearchParams.set("search", searchTerm.trim());
    }
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", page.toString());
    setSearchParams(newSearchParams);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchParams({});
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBlogClick = (blogId: number) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F57C00]"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TaskHive Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights, tips, and stories from our community of
            freelancers and clients
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-2xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
              >
                Search
              </button>

              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-3 border border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Info */}
        {totalItems > 0 && (
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Showing {blogPosts.length} of {totalItems} blog posts
              {searchTerm && (
                <span className="font-medium"> for "{searchTerm}"</span>
              )}
            </p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogPosts.map((post) => (
                <div
                  key={post.blogpostId}
                  onClick={() => handleBlogClick(post.blogpostId)}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Blog Image */}
                  <div className="h-48 overflow-hidden rounded-t-3xl bg-gray-200">
                    {post.status ? (
                      <img
                        src={post.status}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center ${
                        post.status ? "hidden" : "flex"
                      }`}
                    >
                      <svg
                        className="w-16 h-16 text-white opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                    {/* Status Badge - Removed since all posts are published */}
                    <div className="flex items-center justify-end mb-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#F57C00] transition-colors">
                      {post.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {truncateContent(post.content)}
                    </p>

                    {/* Author */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-semibold">
                          {getInitials(post.author.fullName)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {post.author.fullName}
                        </p>
                        <p className="text-xs text-gray-500">Author</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-[#F57C00] hover:text-white shadow-sm"
                  }`}
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
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show only a window of pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                            currentPage === page
                              ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-lg transform scale-105"
                              : "bg-white text-gray-700 hover:bg-[#F57C00] hover:text-white shadow-sm"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-[#F57C00] hover:text-white shadow-sm"
                  }`}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-gray-400 mb-6">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm
                ? "No published posts found"
                : "No published posts yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No published posts match your search "${searchTerm}". Try different keywords.`
                : "Check back later for fresh insights from our community!"}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
              >
                View All Published Posts
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
