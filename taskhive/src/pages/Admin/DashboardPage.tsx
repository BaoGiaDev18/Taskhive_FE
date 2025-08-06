import { useState, useEffect } from "react";
import api from "../../services/api";

// Interfaces
interface User {
  userId: number;
  email: string;
  imageUrl?: string;
  fullName: string;
  country: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface Payment {
  paymentId: number;
  userId: number;
  amount: number;
  paymentDate: string;
  paymentType: string;
  membershipId?: number;
  slotPurchaseId?: number;
  slotQuantity?: number;
  status: string;
}

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
}

const DashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Thêm state cho toggle buttons
  const [userChartPeriod, setUserChartPeriod] = useState<"7days" | "12months">(
    "7days"
  );
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<
    "7days" | "12months"
  >("7days");

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, paymentsRes, reviewsRes, jobPostsRes] =
        await Promise.all([
          api.get("/api/User/all"),
          api.get("/api/Payment"),
          api.get("/api/Review/platform"),
          api.get("/api/Jobpost"),
        ]);

      // Filter only Freelancer and Client
      const filteredUsers = usersRes.data.users.filter(
        (user: User) => user.role === "Freelancer" || user.role === "Client"
      );

      setUsers(filteredUsers);
      setPayments(paymentsRes.data);
      setReviews(reviewsRes.data.platformReviews);
      setJobPosts(jobPostsRes.data);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper functions
  const getUserStats = () => {
    const freelancers = users.filter((u) => u.role === "Freelancer").length;
    const clients = users.filter((u) => u.role === "Client").length;
    const verified = users.filter((u) => u.isEmailVerified).length;
    return { total: users.length, freelancers, clients, verified };
  };

  const getPaymentStats = () => {
    const completedPayments = payments.filter((p) => p.status === "Completed");
    const total = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const completed = payments.filter((p) => p.status === "Completed").length;
    const pending = payments.filter((p) => p.status === "Pending").length;
    const membership = payments.filter(
      (p) => p.paymentType === "Membership"
    ).length;
    const slots = payments.filter(
      (p) => p.paymentType === "Slot Purchase"
    ).length;

    return {
      total,
      count: payments.length,
      completed,
      pending,
      membership,
      slots,
    };
  };

  const getReviewStats = () => {
    const total = reviews.length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : "0";
    const ratings = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => ratings[r.rating as keyof typeof ratings]++);
    return { total, avgRating, ratings };
  };

  const getJobStats = () => {
    const total = jobPosts.length;
    const open = jobPosts.filter((j) => j.status === "Open").length;
    const closed = jobPosts.filter((j) => j.status === "Closed").length;
    const categories = jobPosts.reduce((acc, job) => {
      acc[job.categoryName] = (acc[job.categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, open, closed, categories };
  };

  const getRecentActivity = () => {
    const recentUsers = users
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    const recentPayments = payments
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )
      .slice(0, 5);

    return { recentUsers, recentPayments };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSeriesData = () => {
    // User registrations data
    const getUserData = (period: "7days" | "12months") => {
      const usersByDate = users.reduce((acc, user) => {
        const date = new Date(user.createdAt);
        const key =
          period === "7days"
            ? date.toLocaleDateString("vi-VN")
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0"
              )}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      if (period === "7days") {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toLocaleDateString("vi-VN");
        }).reverse();

        return last7Days.map((date) => ({
          date,
          users: usersByDate[date] || 0,
        }));
      } else {
        const last12Months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }).reverse();

        return last12Months.map((month) => ({
          date: month,
          users: usersByDate[month] || 0,
        }));
      }
    };

    // Revenue data
    const getRevenueData = (period: "7days" | "12months") => {
      const revenueByDate = payments
        .filter((p) => p.status === "Completed")
        .reduce((acc, payment) => {
          const date = new Date(payment.paymentDate);
          const key =
            period === "7days"
              ? date.toLocaleDateString("vi-VN")
              : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                  2,
                  "0"
                )}`;
          acc[key] = (acc[key] || 0) + payment.amount;
          return acc;
        }, {} as Record<string, number>);

      if (period === "7days") {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toLocaleDateString("vi-VN");
        }).reverse();

        return last7Days.map((date) => ({
          date,
          revenue: revenueByDate[date] || 0,
        }));
      } else {
        const last12Months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }).reverse();

        return last12Months.map((month) => ({
          date: month,
          revenue: revenueByDate[month] || 0,
        }));
      }
    };

    const userChartData = getUserData(userChartPeriod);
    const revenueChartData = getRevenueData(revenueChartPeriod);

    return { userChartData, revenueChartData };
  };

  // Cập nhật formatShortDate để handle cả 2 formats
  const formatChartDate = (
    dateString: string,
    period: "7days" | "12months"
  ) => {
    if (period === "7days") {
      return new Date(
        dateString.split("/").reverse().join("-")
      ).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    } else {
      const [year, month] = dateString.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
        "vi-VN",
        {
          month: "short",
          year: "2-digit",
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userStats = getUserStats();
  const paymentStats = getPaymentStats();
  const reviewStats = getReviewStats();
  const jobStats = getJobStats();
  const { recentUsers, recentPayments } = getRecentActivity();
  const { userChartData, revenueChartData } = getTimeSeriesData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of TaskHive platform analytics and key metrics
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.total}
                </p>
                <p className="text-xs text-gray-600">
                  {userStats.verified} verified
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentStats.total)}
                </p>
                <p className="text-xs text-gray-600">
                  {paymentStats.completed} completed
                </p>
              </div>
            </div>
          </div>

          {/* Job Posts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <svg
                  className="h-8 w-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Job Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobStats.total}
                </p>
                <p className="text-xs text-gray-600">{jobStats.open} open</p>
              </div>
            </div>
          </div>

          {/* Platform Rating */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Platform Rating
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviewStats.avgRating}/5.0
                </p>
                <p className="text-xs text-gray-600">
                  {reviewStats.total} reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Freelancers
                </span>
                <span className="text-sm text-gray-600">
                  {userStats.freelancers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{
                    width: `${
                      (userStats.freelancers / userStats.total) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Clients
                </span>
                <span className="text-sm text-gray-600">
                  {userStats.clients}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{
                    width: `${(userStats.clients / userStats.total) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Email Verified
                </span>
                <span className="text-sm text-gray-600">
                  {((userStats.verified / userStats.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Payment Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payment Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Membership
                </span>
                <span className="text-sm text-gray-600">
                  {paymentStats.membership}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full"
                  style={{
                    width: `${
                      (paymentStats.membership / paymentStats.count) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Slot Purchase
                </span>
                <span className="text-sm text-gray-600">
                  {paymentStats.slots}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{
                    width: `${
                      (paymentStats.slots / paymentStats.count) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Success Rate
                </span>
                <span className="text-sm text-gray-600">
                  {(
                    (paymentStats.completed / paymentStats.count) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Time Series Charts - Updated with toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registrations Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                User Registrations
              </h3>
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setUserChartPeriod("7days")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    userChartPeriod === "7days"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setUserChartPeriod("12months")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    userChartPeriod === "12months"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  12 Months
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Chart Area */}
              <div className="relative h-40 bg-gray-50 rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 280 120">
                  {/* Grid Lines */}
                  <defs>
                    <pattern
                      id="userGrid"
                      width="40"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#userGrid)" />

                  {/* Line Chart */}
                  {(() => {
                    const maxUsers = Math.max(
                      ...userChartData.map((d) => d.users),
                      1
                    );
                    const points = userChartData
                      .map((data, index) => {
                        const x =
                          (index / (userChartData.length - 1)) * 240 + 20;
                        const y = 100 - (data.users / maxUsers) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ");

                    return (
                      <g>
                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />

                        {/* Data Points */}
                        {userChartData.map((data, index) => {
                          const x =
                            (index / (userChartData.length - 1)) * 240 + 20;
                          const y = 100 - (data.users / maxUsers) * 80;
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              {/* Value Labels */}
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                                fontSize="10"
                              >
                                {data.users}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                </svg>

                {/* X-axis Labels */}
                <div className="flex justify-between mt-2 px-2">
                  {userChartData.map((data, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 text-center"
                    >
                      {formatChartDate(data.date, userChartPeriod)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Total this {userChartPeriod === "7days" ? "week" : "year"}:
                  </span>
                  <span className="font-medium text-gray-900">
                    {userChartData.reduce((sum, d) => sum + d.users, 0)} users
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">
                    Peak {userChartPeriod === "7days" ? "day" : "month"}:
                  </span>
                  <span className="font-medium text-gray-900">
                    {Math.max(...userChartData.map((d) => d.users))} users
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Revenue Trend
              </h3>
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setRevenueChartPeriod("7days")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    revenueChartPeriod === "7days"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setRevenueChartPeriod("12months")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    revenueChartPeriod === "12months"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  12 Months
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Chart Area */}
              <div className="relative h-40 bg-gray-50 rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 280 120">
                  {/* Grid Lines */}
                  <rect width="100%" height="100%" fill="url(#revenueGrid)" />

                  {/* Line Chart */}
                  {(() => {
                    const maxRevenue = Math.max(
                      ...revenueChartData.map((d) => d.revenue),
                      1
                    );
                    const points = revenueChartData
                      .map((data, index) => {
                        const x =
                          (index / (revenueChartData.length - 1)) * 240 + 20;
                        const y = 100 - (data.revenue / maxRevenue) * 80;
                        return `${x},${y}`;
                      })
                      .join(" ");

                    return (
                      <g>
                        {/* Area Fill */}
                        <path
                          d={`M 20,100 ${points} L ${
                            ((revenueChartData.length - 1) * 240) /
                              (revenueChartData.length - 1) +
                            20
                          },100 Z`}
                          fill="url(#greenGradient)"
                          opacity="0.2"
                        />

                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />

                        {/* Data Points */}
                        {revenueChartData.map((data, index) => {
                          const x =
                            (index / (revenueChartData.length - 1)) * 240 + 20;
                          const y = 100 - (data.revenue / maxRevenue) * 80;
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              {/* Value Labels */}
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                                fontSize="10"
                              >
                                {data.revenue > 0
                                  ? revenueChartPeriod === "7days"
                                    ? `${Math.round(data.revenue / 1000)}k`
                                    : `${Math.round(data.revenue / 1000000)}M`
                                  : "0"}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}

                  {/* Gradient Definition */}
                  <defs>
                    <pattern
                      id="revenueGrid"
                      width="40"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    </pattern>
                    <linearGradient
                      id="greenGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X-axis Labels */}
                <div className="flex justify-between mt-2 px-2">
                  {revenueChartData.map((data, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 text-center"
                    >
                      {formatChartDate(data.date, revenueChartPeriod)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Total this{" "}
                    {revenueChartPeriod === "7days" ? "week" : "year"}:
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      revenueChartData.reduce((sum, d) => sum + d.revenue, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">
                    Peak {revenueChartPeriod === "7days" ? "day" : "month"}:
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      Math.max(...revenueChartData.map((d) => d.revenue))
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution & Job Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rating Distribution
            </h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <div className="flex items-center w-20">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      {star}
                    </span>
                    <span className="text-yellow-400">★</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            reviewStats.total > 0
                              ? (reviewStats.ratings[
                                  star as keyof typeof reviewStats.ratings
                                ] /
                                  reviewStats.total) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {
                      reviewStats.ratings[
                        star as keyof typeof reviewStats.ratings
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Job Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Job Categories
            </h3>
            <div className="space-y-3">
              {Object.entries(jobStats.categories)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {category}
                    </span>
                    <div className="flex items-center ml-4">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(count / jobStats.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Users
            </h3>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.userId} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {user.imageUrl ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.imageUrl}
                        alt={user.fullName}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.role} • {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "Freelancer"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Payments
            </h3>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.paymentId}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.paymentType}
                    </p>
                    <p className="text-xs text-gray-500">
                      User {payment.userId} • {formatDate(payment.paymentDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
