/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

const BlogPostDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/BlogPost/${id}`);
      setBlogPost(response.data);
    } catch (error: any) {
      console.error("Failed to fetch blog post:", error);
      if (error.response?.status === 404) {
        showToast("Blog post not found", "error");
      } else {
        showToast("Failed to load blog post", "error");
      }
    } finally {
      setLoading(false);
    }
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
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    // Simple formatting - split by line breaks and render as paragraphs
    return content.split("\n").map((paragraph, index) => {
      if (paragraph.trim() === "") return null;
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  const handleAuthorClick = () => {
    if (blogPost?.author) {
      // Assuming we have routes for user profiles
      navigate(`/profile/${blogPost.author.userId}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && blogPost) {
      try {
        await navigator.share({
          title: blogPost.title,
          text: `Check out this blog post: ${blogPost.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!", "success");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showToast("Failed to copy link", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F57C00]"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Blog post not found
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
              >
                Browse All Posts
              </button>
            </div>
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

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Blog
          </button>
        </div>

        {/* Hero Image */}
        <div className="mb-8">
          <div className="h-64 md:h-96 rounded-3xl overflow-hidden bg-gray-200 shadow-lg">
            {blogPost.status ? (
              <img
                src={blogPost.status}
                alt={blogPost.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center ${
                blogPost.status ? "hidden" : "flex"
              }`}
            >
              <svg
                className="w-24 h-24 text-white opacity-50"
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
        </div>

        {/* Article Header */}
        <header className="mb-8">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Published
            </span>
            <time dateTime={blogPost.publishedAt || undefined}>
              {formatDate(blogPost.publishedAt)}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {blogPost.title}
          </h1>

          {/* Author & Actions */}
          <div className="flex items-center justify-between">
            <div
              onClick={handleAuthorClick}
              className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-xl p-3 -m-3 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F57C00] to-[#FFA726] flex items-center justify-center">
                <span className="text-white font-bold">
                  {getInitials(blogPost.author.fullName)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {blogPost.author.fullName}
                </p>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share
            </button>
          </div>
        </header>

        {/* Article Content */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 text-lg leading-relaxed">
              {formatContent(blogPost.content)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-500">Share this post:</span>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="bg-white text-gray-700 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                  title="Share"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/blogposts")}
              className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105"
            >
              Read More Posts
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogPostDetail;
