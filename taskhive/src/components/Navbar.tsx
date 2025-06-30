import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Logoforblack from "../assets/Logo gốc trên nền đen.png";
import api from "../services/api";

interface UserProfile {
  fullName: string;
  imageUrl?: string;
  role?: string;
  email?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    window.location.href = "/login";
  };

  return (
    <nav className="bg-[#0F0E0E]/70 text-white px-10 py-5 flex justify-between items-center fixed top-0 w-full z-50">
      {/* Logo */}
      <div className="text-2xl font-bold">
        <Link to="/">
          <img src={Logoforblack} alt="TaskHive Logo" className="h-12" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="space-x-10 text-lg font-medium">
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

      {/* User Profile or Auth Links */}
      {(() => {
        const token = localStorage.getItem("jwtToken");
        if (token && user) {
          return (
            <div className="flex items-center space-x-6 text-lg">
              {/* Language Button */}
              <button className="text-white hover:text-yellow-400 transition-colors">
                EN
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 hover:border-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 p-0"
                  style={{ padding: 0 }}
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover object-center"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <span className="text-gray-900 text-lg font-bold">
                        {getInitials(user.fullName)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info Header */}
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

                    {/* Menu Items */}
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
                        <Link
                          to="/my-projects"
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
                          My Projects
                        </Link>
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
                            to="/membership"
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
                            Memmbership Plan
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
                        </>
                      )}
                    </div>

                    {/* Logout */}
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
            </div>
          );
        } else {
          return (
            <div className="space-x-6 text-lg">
              <button className="text-white hover:text-yellow-400 transition-colors">
                EN
              </button>
              <Link
                to="/login"
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Log in / Sign up
              </Link>
            </div>
          );
        }
      })()}
    </nav>
  );
}
