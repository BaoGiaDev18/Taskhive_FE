import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Logoforblack from "../assets/Logo gốc trên nền đen.png";
import api from "../services/api";
import PlatformFeedbackPopup from "../pages/PlatformFeedbackPopup";
interface UserProfile {
  fullName: string;
  imageUrl?: string;
  role?: string;
  email?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      api
        .get("/api/User/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          // Clear invalid token
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiresAt");
        });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials for profile picture fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post("/api/User/logout");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore error, proceed with logout
    }
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("userEmail");
    setUser(null);
    setShowDropdown(false);
    setShowMobileMenu(false);
    window.location.href = "/login";
  };

  const handleMobileLinkClick = () => {
    setShowMobileMenu(false);
  };

  // Desktop navigation links
  const renderDesktopNavigationLinks = () => {
    const token = localStorage.getItem("jwtToken");

    if (token && user) {
      if (user.role === "Freelancer") {
        return (
          <div className="hidden md:flex space-x-10 text-lg font-medium">
            <Link
              to="/find-work"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Find Work
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Why TaskHive
            </Link>
            <Link
              to="/blogposts"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Blogs
            </Link>
          </div>
        );
      } else if (user.role === "Client") {
        return (
          <div className="hidden md:flex space-x-10 text-lg font-medium">
            <Link
              to="/hirefreelancer"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Hire Freelancer
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Why TaskHive
            </Link>
            <Link
              to="/blogposts"
              className="text-white hover:text-yellow-400 transition-colors"
            >
              Blogs
            </Link>
          </div>
        );
      }
    }

    return (
      <div className="hidden md:flex space-x-10 text-lg font-medium">
        <Link
          to="/hirefreelancer"
          className="text-white hover:text-yellow-400 transition-colors"
        >
          Hire Freelancer
        </Link>
        <Link
          to="/find-work"
          className="text-white hover:text-yellow-400 transition-colors"
        >
          Find Work
        </Link>
        <Link
          to="/about"
          className="text-white hover:text-yellow-400 transition-colors"
        >
          Why TaskHive
        </Link>
        <Link
          to="/blogposts"
          className="text-white hover:text-yellow-400 transition-colors"
        >
          Blogs
        </Link>
      </div>
    );
  };

  // Mobile navigation links
  const renderMobileNavigationLinks = () => {
    const token = localStorage.getItem("jwtToken");

    if (token && user) {
      if (user.role === "Freelancer") {
        return (
          <>
            <Link
              to="/find-work"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Find Work
            </Link>
            <Link
              to="/about"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Why TaskHive
            </Link>
            <Link
              to="/blogposts"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Blogs
            </Link>
          </>
        );
      } else if (user.role === "Client") {
        return (
          <>
            <Link
              to="/hirefreelancer"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Hire Freelancer
            </Link>
            <Link
              to="/about"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Why TaskHive
            </Link>
            <Link
              to="/blogposts"
              className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
              onClick={handleMobileLinkClick}
            >
              Blogs
            </Link>
          </>
        );
      }
    }

    return (
      <>
        <Link
          to="/hirefreelancer"
          className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
          onClick={handleMobileLinkClick}
        >
          Hire Freelancer
        </Link>
        <Link
          to="/find-work"
          className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
          onClick={handleMobileLinkClick}
        >
          Find Work
        </Link>
        <Link
          to="/about"
          className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
          onClick={handleMobileLinkClick}
        >
          Why TaskHive
        </Link>
        <Link
          to="/blogposts"
          className="block px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
          onClick={handleMobileLinkClick}
        >
          Blogs
        </Link>
      </>
    );
  };

  return (
    <>
      <nav className="bg-[#0F0E0E]/70 text-white px-4 md:px-10 py-5 flex justify-between items-center fixed top-0 w-full z-50">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">
            <img
              src={Logoforblack}
              alt="TaskHive Logo"
              className="h-8 md:h-12"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        {renderDesktopNavigationLinks()}

        {/* Desktop User Profile or Auth Links */}
        <div className="hidden md:flex items-center space-x-6 text-lg">
          {(() => {
            const token = localStorage.getItem("jwtToken");
            if (token && user) {
              return (
                <>
                  <button className="text-white hover:text-yellow-400 transition-colors">
                    EN
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 hover:border-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 p-0"
                    >
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <span className="text-gray-900 text-lg font-bold">
                            {getInitials(user.fullName)}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Desktop Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                  <span className="text-gray-900 text-lg font-bold">
                                    {getInitials(user.fullName)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-gray-900 font-semibold text-sm">
                                {user.fullName}
                              </div>
                              {user.role && (
                                <div className="text-gray-500 text-xs capitalize">
                                  {user.role.toLowerCase()}
                                </div>
                              )}
                              {user.email && (
                                <div className="text-gray-400 text-xs">
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            View Profile
                          </Link>

                          {user.role === "Client" && (
                            <>
                              <Link
                                to="/my-job-posts"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  className="w-4 h-4 mr-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                                My Job Posts
                              </Link>
                              <Link
                                to="/client/my-contracts"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  className="w-4 h-4 mr-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                My Contracts
                              </Link>
                              <button
                                onClick={() => setShowFeedbackPopup(true)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left bg-white"
                              >
                                📝 Give Feedback
                              </button>
                            </>
                          )}

                          {user.role === "Freelancer" && (
                            <>
                              <Link
                                to="/my-proposals"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  className="w-4 h-4 mr-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                My Proposals
                              </Link>
                              <Link
                                to="/my-contracts"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  className="w-4 h-4 mr-3 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                My Contracts
                              </Link>
                              <Link
                                to="/membership"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-4 h-4 mr-3 text-gray-400"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                                  />
                                </svg>
                                Membership Plan
                              </Link>
                              <Link
                                to="/buy-slots"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-4 h-4 mr-3 text-gray-400"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                                  />
                                </svg>
                                Slot Plan
                              </Link>
                              <button
                                onClick={() => setShowFeedbackPopup(true)}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left bg-white"
                              >
                                📝 Give Feedback
                              </button>
                            </>
                          )}
                        </div>

                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-100 transition-colors bg-white"
                          >
                            <svg
                              className="w-4 h-4 mr-3 text-yellow-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            } else {
              return (
                <>
                  <button className="text-white hover:text-yellow-400 transition-colors">
                    EN
                  </button>
                  <Link
                    to="/login"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    Log in / Sign up
                  </Link>
                </>
              );
            }
          })()}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {(() => {
            const token = localStorage.getItem("jwtToken");
            if (token && user) {
              return (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-400">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <span className="text-gray-900 text-xs font-bold">
                        {getInitials(user.fullName)}
                      </span>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-white hover:text-yellow-400 transition-colors focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showMobileMenu ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-[#0F0E0E] text-white transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          showMobileMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <img src={Logoforblack} alt="TaskHive Logo" className="h-8" />
          <button
            onClick={() => setShowMobileMenu(false)}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* User Info (if logged in) */}
        {(() => {
          const token = localStorage.getItem("jwtToken");
          if (token && user) {
            return (
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <span className="text-gray-900 text-lg font-bold">
                          {getInitials(user.fullName)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {user.fullName}
                    </div>
                    {user.role && (
                      <div className="text-yellow-400 text-xs capitalize">
                        {user.role.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Navigation Links */}
        <div className="py-4">{renderMobileNavigationLinks()}</div>

        {/* User Menu Items (if logged in) */}
        {(() => {
          const token = localStorage.getItem("jwtToken");
          if (token && user) {
            return (
              <div className="border-t border-gray-700">
                <Link
                  to="/profile"
                  className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                  onClick={handleMobileLinkClick}
                >
                  <svg
                    className="w-5 h-5 mr-3 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  View Profile
                </Link>

                {user.role === "Client" && (
                  <>
                    <Link
                      to="/my-job-posts"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      My Job Posts
                    </Link>
                    <Link
                      to="/client/my-contracts"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      My Contracts
                    </Link>
                  </>
                )}

                {user.role === "Freelancer" && (
                  <>
                    <Link
                      to="/my-proposals"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      My Proposals
                    </Link>
                    <Link
                      to="/my-contracts"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      My Contracts
                    </Link>
                    <Link
                      to="/membership"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 mr-3 text-yellow-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                        />
                      </svg>
                      Membership Plan
                    </Link>
                    <Link
                      to="/buy-slots"
                      className="flex items-center px-6 py-4 text-white hover:bg-gray-800 transition-colors border-b border-gray-700"
                      onClick={handleMobileLinkClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 mr-3 text-yellow-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                        />
                      </svg>
                      Slot Plan
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-6 py-4 text-yellow-400 hover:bg-gray-800 transition-colors border-t border-gray-700 mt-4"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            );
          } else {
            return (
              <div className="border-t border-gray-700 px-6 py-4">
                <Link
                  to="/login"
                  className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition-colors"
                  onClick={handleMobileLinkClick}
                >
                  Log in / Sign up
                </Link>
              </div>
            );
          }
        })()}
      </div>
      <PlatformFeedbackPopup
        isOpen={showFeedbackPopup}
        onClose={() => setShowFeedbackPopup(false)}
        onSuccess={() => {
          alert("Thank you for your feedback!");
        }}
      />
    </>
  );
}
