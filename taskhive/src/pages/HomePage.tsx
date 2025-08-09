import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import BGImage from "../assets/BGhome.jpg";
import homeimg1 from "../assets/homeimg.jpg";
import homeimg2 from "../assets/homeimg2.jpg";
import homeimg3 from "../assets/homeimg3.jpg";
import homeimg4 from "../assets/homeimg4.jpg";
import homeimg5 from "../assets/homeimg5.jpg";
import homeimg6 from "../assets/homeimg6.jpg";
import homeimg7 from "../assets/homeimg7.jpg";

interface PlatformReview {
  reviewId: number;
  reviewerId: number;
  reviewer: {
    userId: number;
    fullName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface PlatformReviewsResponse {
  platformReviews: PlatformReview[];
  count: number;
  message: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [allReviews, setAllReviews] = useState<PlatformReview[]>([]); // ✅ Lưu tất cả reviews
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const reviewsPerPage = 3;

  const handleSignUpClick = () => {
    navigate("/register");
  };

  // Fetch platform reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // ✅ Gọi API không có pagination params
      const response = await api.get("/api/Review/platform");
      const data: PlatformReviewsResponse = response.data;

      // ✅ Lưu tất cả reviews
      setAllReviews(data.platformReviews);
      setTotalPages(Math.ceil(data.platformReviews.length / reviewsPerPage));
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setAllReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch một lần khi component mount
  useEffect(() => {
    fetchReviews();
  }, []); // ✅ Chỉ chạy 1 lần

  // ✅ Tính toán reviews hiển thị theo trang hiện tại
  const getCurrentPageReviews = () => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return allReviews.slice(startIndex, endIndex);
  };

  // ✅ Infinite navigation
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? totalPages : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages ? 1 : prev + 1));
  };

  // ✅ Get current reviews to display
  const currentReviews = getCurrentPageReviews();

  // Render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Cập nhật JSX để sử dụng currentReviews
  return (
    <div className=" bg-white">
      {/* Existing sections... */}
      <section
        className="relative h-screen bg-cover bg-center text-white flex items-center"
        style={{
          backgroundImage: `linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(${BGImage})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
            Connect with the best job opportunities
          </h1>
          <p className="text-xl leading-relaxed">
            Need expert help? Discover top-rated freelancers for all your
            business needs. From design to development, find the right talent in
            minutes.
          </p>
          <button
            onClick={handleSignUpClick}
            className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-8 py-3 rounded-xl text-xl"
          >
            Sign up now
          </button>
        </div>
      </section>

      <section className="py-20 px-6 bg-white flex flex-col md:flex-row items-center max-w-7xl mx-auto">
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <img
            src={homeimg1}
            alt="Job Search"
            className="rounded-2xl shadow-xl"
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-10 space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">
            Job Searching Made Easy
          </h2>
          <p className="text-lg text-gray-600">
            Find the perfect job effortlessly with TaskHive.
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>✓ Access over 10,000 job listings from leading companies</li>
            <li>✓ Connect with employers quickly and efficiently</li>
            <li>✓ Simple and seamless application process</li>
          </ul>
          <button
            onClick={handleSignUpClick}
            className="mt-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold px-6 py-3 rounded-xl"
          >
            Get Started
          </button>
        </div>
      </section>

      <section className="bg-[rgba(15,15,15,0.88)] py-20 px-6 text-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text">
            Find the right match for you
          </h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-12 max-w-7xl mx-auto">
          {/* Clients Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm">
            <img
              src={homeimg2}
              alt="Clients"
              className="w-full h-56 object-cover"
            />
            <div className="p-6 text-black">
              <h3 className="text-lg font-semibold mb-2">Clients</h3>
              <p className="mb-4 text-sm">
                Looking for skilled professionals? Connect with top freelancers
                to get your projects done efficiently.
              </p>
              <Link
                to="/hirefreelancer"
                className="text-orange-500 font-semibold"
              >
                Hire Freelancer →
              </Link>
            </div>
          </div>

          {/* Freelancers Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg max-w-sm">
            <img
              src={homeimg3}
              alt="Freelancers"
              className="w-full h-56 object-cover"
            />
            <div className="p-6 text-black">
              <h3 className="text-lg font-semibold mb-2">Freelancers</h3>
              <p className="mb-4 text-sm">
                Find job opportunities that match your skills and work on
                projects you love. Join TaskHive today!
              </p>
              <Link to="/find-work" className="text-orange-500 font-semibold">
                Find Work →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="bg-white py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Explore Categories
        </h2>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Web Developer
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <img src={homeimg4} alt="Frontend Dev" className="rounded-lg" />
              <p className="mt-2 font-medium text-sm">Frontend Development</p>
            </div>
            <div>
              <img src={homeimg5} alt="Backend Dev" className="rounded-lg" />
              <p className="mt-2 font-medium text-sm">Backend Development</p>
            </div>
            <div>
              <img src={homeimg6} alt="E-commerce" className="rounded-lg" />
              <p className="mt-2 font-medium text-sm">E-commerce Solutions</p>
            </div>
            <div>
              <img src={homeimg7} alt="CMS" className="rounded-lg" />
              <p className="mt-2 font-medium text-sm">WordPress & CMS</p>
            </div>
          </div>
          <p className="text-orange-500 mt-2 text-sm text-right">Details →</p>
        </div>
      </section>

      {/* ✅ User Feedback Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real feedback from our amazing community
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={handlePrevPage}
                disabled={totalPages <= 1}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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

              <button
                onClick={handleNextPage}
                disabled={totalPages <= 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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

              {/* Reviews Container */}
              <div className="overflow-hidden mx-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500 ease-in-out">
                  {currentReviews.map((review, index) => (
                    <div
                      key={review.reviewId}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{
                        animation: `slideInUp 0.6s ease-out ${
                          index * 0.1
                        }s both`,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full flex items-center justify-center"></div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {review.reviewer.fullName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600 font-medium">
                          ({review.rating}/5)
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{review.comment}"
                      </p>

                      {/* Decorative Quote */}
                      <div className="mt-4 flex justify-end">
                        <svg
                          className="w-6 h-6 text-orange-200"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Indicators */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentPage === index + 1
                          ? "bg-orange-500 w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {allReviews.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No reviews available yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Our Service */}
      <section className="bg-gradient-to-br from-white via-[#FFF2E2] to-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Our Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-800">
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                💲 Secure Payment
              </h4>
              <p>
                Enjoy a safe and reliable payment system that protects both
                parties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🧑‍💼 Freelancer Marketplace
              </h4>
              <p>
                Connect with top professionals across various industries for
                your projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🔄 Flexible Hiring
              </h4>
              <p>
                Hire freelancers per project or hourly, tailored to your
                business needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                ✅ Quality Assurance
              </h4>
              <p>
                Verified services ensure trust and high-quality work delivery.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button className="px-8 py-3 border border-orange-400 text-orange-500 font-semibold rounded-full hover:bg-orange-50">
              Browse more
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
