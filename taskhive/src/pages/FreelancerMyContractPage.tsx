/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

interface Application {
  applicationId: number;
  freelancerId: number;
  freelancerName: string;
  jobPostId: number;
  jobPostTitle: string;
  coverLetter: string;
  bidAmount: number;
  status: string;
  cvFile: string | null;
  appliedAt: string;
  isExpanded?: boolean;
  clientData?: {
    profile: {
      fullName: string;
      imageUrl: string;
      country: string;
      phoneNumber: string;
      address: string;
    };
  };
  jobPost?: {
    title: string;
    description: string;
    categoryName: string;
    location: string;
    jobType: string;
    deadline: string;
    salaryMin: number;
    salaryMax: number;
    employerId: number;
  };
}

interface ReviewData {
  rating: number;
  comment: string;
}

const FreelancerMyContractPage = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Application | null>(
    null
  );
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 5,
    comment: "",
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // thêm: trạng thái tạo chat theo từng contract
  const [creatingChatId, setCreatingChatId] = useState<number | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Helper function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  // Get freelancerId from JWT token
  const getFreelancerIdFromToken = () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return null;
      }

      const decodedToken = decodeJWT(token);
      if (!decodedToken) {
        navigate("/login");
        return null;
      }

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem("jwtToken");
        navigate("/login");
        return null;
      }

      const userId = decodedToken.sub || decodedToken.userId || decodedToken.id;
      return parseInt(userId);
    } catch (error) {
      console.error("Error getting freelancerId from token:", error);
      navigate("/login");
      return null;
    }
  };

  // Fetch contracts (applications with Hired/Finished status)
  const fetchContracts = async (freelancerId: number) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/Application/freelancer/${freelancerId}`
      );

      // Filter only contract statuses (Hired and Finished)
      const contractStatuses = ["Hired", "Finished"];
      const filteredContracts = response.data.filter((app: Application) =>
        contractStatuses.includes(app.status)
      );

      // Fetch additional data for each contract
      const contractsWithDetails = await Promise.all(
        filteredContracts.map(async (contract: Application) => {
          try {
            // Get job post details
            const jobResponse = await api.get(
              `/api/JobPost/${contract.jobPostId}`
            );
            const jobData = jobResponse.data;

            // Get client details if employerId exists
            let clientData = null;
            if (jobData?.employerId) {
              try {
                const clientResponse = await api.get(
                  `/api/User/client/${jobData.employerId}`
                );
                clientData = clientResponse.data;
              } catch (clientError) {
                console.error(`Failed to fetch client details:`, clientError);
              }
            }

            return {
              ...contract,
              isExpanded: false,
              jobPost: jobData,
              clientData: clientData,
            };
          } catch (error) {
            console.error(`Failed to fetch details for contract:`, error);
            return {
              ...contract,
              isExpanded: false,
            };
          }
        })
      );

      setContracts(contractsWithDetails);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch contracts:", error);
      if (error.response?.status === 404) {
        setContracts([]);
        setError("");
      } else {
        setError("Failed to load contracts. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse contract
  const toggleContractExpansion = (applicationId: number) => {
    setContracts((prev) =>
      prev.map((contract) =>
        contract.applicationId === applicationId
          ? { ...contract, isExpanded: !contract.isExpanded }
          : contract
      )
    );
  };

  // Open review modal
  const openReviewModal = (contract: Application) => {
    setSelectedContract(contract);
    setShowReviewModal(true);
    setReviewData({ rating: 5, comment: "" });
  };

  // Submit review for client
  const handleSubmitReview = async () => {
    if (!selectedContract?.jobPost?.employerId) {
      showToast(
        "Cannot submit review: Client information not available",
        "error"
      );
      return;
    }

    try {
      setIsSubmittingReview(true);

      const reviewPayload = {
        revieweeId: selectedContract.jobPost.employerId,
        jobPostId: selectedContract.jobPostId,
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
      };

      await api.post("/api/Review", reviewPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setShowReviewModal(false);
      setSelectedContract(null);
      setReviewData({ rating: 5, comment: "" });
      showToast("Review submitted successfully!", "success");
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to submit review";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const freelancerIdFromToken = getFreelancerIdFromToken();
    if (freelancerIdFromToken) {
      fetchContracts(freelancerIdFromToken);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  // TÌM CONVERSATION 1-1 GIỮA FREELANCER & CLIENT
  const findExistingConversation = async (
    freelancerId: number,
    clientId: number
  ): Promise<number | null> => {
    try {
      const res = await api.get(
        `/api/Conversation/freelancer/${freelancerId}`,
        {
          validateStatus: () => true,
        }
      );

      if (res.status >= 200 && res.status < 300 && Array.isArray(res.data)) {
        const hit = res.data.find(
          (c: any) =>
            c?.partnerId === clientId ||
            String(c?.partnerId) === String(clientId)
        );
        if (hit) return hit.conversationId ?? hit.id ?? null;
      }
    } catch (e) {
      // muốn im lặng vẫn nên không để khối rỗng
      console.debug("findExistingConversation skip:", e);
    }
    return null;
  };

  // ===== CHAT: tạo conversation + thêm client =====
  const startChat = async (contract: Application) => {
    const freelancerId = getFreelancerIdFromToken();
    const clientId = contract.jobPost?.employerId;

    if (!freelancerId) return;
    if (!clientId) {
      showToast("Không tìm thấy client của job này.", "error");
      return;
    }

    // helper: bóc conversationId từ nhiều kiểu response
    const extractConversationId = (res: any): string | number | null => {
      try {
        let body = res?.data;

        // Nếu server trả text/plain nhưng là JSON string -> parse
        if (typeof body === "string") {
          const t = body.trim();
          if (t.startsWith("{") || t.startsWith("[")) {
            try {
              body = JSON.parse(t);
            } catch {
              // không phải JSON chuẩn -> fallback số cuối chuỗi
              const tailNum = t.match(/(\d+)\s*$/);
              if (tailNum?.[1]) return tailNum[1];
            }
          } else {
            // chuỗi số thuần
            const n = parseInt(t, 10);
            if (!Number.isNaN(n)) return n;
            const tailNum = t.match(/(\d+)\s*$/);
            if (tailNum?.[1]) return tailNum[1];
          }
        }

        // body là object JSON
        if (typeof body === "object" && body) {
          if (body.conversationId != null) return body.conversationId;
          if (body.id != null) return body.id;
        }

        // fallback: Location header
        const loc = res?.headers?.location || res?.headers?.Location;
        if (typeof loc === "string" && loc) {
          const idFromLoc = loc.split("/").filter(Boolean).pop();
          if (idFromLoc) {
            const n = parseInt(idFromLoc, 10);
            return Number.isNaN(n) ? idFromLoc : n;
          }
        }
      } catch (e) {
        console.error("extractConversationId error:", e);
      }
      return null;
    };

    try {
      setCreatingChatId(contract.applicationId);

      // 0) KIỂM TRA TỒN TẠI (dùng endpoint freelancer)
      const existedId = await findExistingConversation(freelancerId, clientId);
      if (existedId) {
        showToast("Đã có cuộc trò chuyện trước đó.", "success");
        navigate(`/messages`);
        return;
      }

      // 1) TẠO CONVERSATION (creator = freelancer)
      const createRes = await api.post(
        "/api/Conversation",
        { type: "OneToOne", createdBy: freelancerId },
        { headers: { "Content-Type": "application/json" } }
      );

      // có server trả 409/208 kèm id khi đã tồn tại
      if (createRes.status === 409 || createRes.status === 208) {
        const idFromConflict = extractConversationId(createRes);
        if (idFromConflict) {
          navigate(`/messages`);
          return;
        }
      }

      const conversationId = extractConversationId(createRes);
      if (!conversationId) {
        showToast("Không lấy được ConversationId.", "error");
        return;
      }

      // 2) THÊM CLIENT VÀO CONVERSATION
      await api.post(`/api/Conversation/${conversationId}/members/${clientId}`);

      // tuỳ backend: nếu creator KHÔNG auto-join, mở dòng sau
      // await api.post(`/api/Conversation/${conversationId}/members/${freelancerId}`);

      showToast("Đã tạo cuộc trò chuyện.", "success");
      navigate(`/messages`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Không thể tạo cuộc trò chuyện";
      showToast(msg, "error");
    } finally {
      setCreatingChatId(null);
    }
  };

  // Helper functions
  const formatSalary = (amount: number) => {
    if (!amount || isNaN(amount)) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateRelative = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "Unknown";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Hired: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Active",
      },
      Finished: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Completed",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status || "Unknown",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Filter contracts by status
  const activeContracts = contracts.filter(
    (contract) => contract.status === "Hired"
  );
  const completedContracts = contracts.filter(
    (contract) => contract.status === "Finished"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {toast.type === "success" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </svg>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Contracts
              </h1>
              <p className="text-gray-600">
                Manage your active and completed work contracts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
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

        {/* Summary Stats */}
        {contracts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contract Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activeContracts.length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedContracts.length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {contracts.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}

        {/* Contracts List */}
        {contracts.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Contracts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any active contracts yet. Start applying for jobs
                to get hired!
              </p>
              <Link
                to="/find-work"
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Find Work
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.applicationId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Contract Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    toggleContractExpansion(contract.applicationId)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {contract.jobPostTitle || "Untitled Job"}
                        </h3>
                        {getStatusBadge(contract.status)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                        <span>
                          Contract Value:{" "}
                          <span className="font-semibold text-green-600">
                            {formatSalary(contract.bidAmount)}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          Started {formatDateRelative(contract.appliedAt)}
                        </span>
                      </div>

                      {contract.clientData && (
                        <p className="text-gray-600 text-sm">
                          Client:{" "}
                          {contract.clientData.profile?.fullName ||
                            "Unknown Client"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Review Button - Only for Finished contracts */}
                      {contract.status === "Finished" &&
                        contract.jobPost?.employerId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openReviewModal(contract);
                            }}
                            className="text-yellow-600 hover:text-yellow-800 bg-white text-sm font-medium flex items-center gap-1"
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
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                            Review Client
                          </button>
                        )}

                      {/* Chat Button */}
                      {/* NÚT CHAT (header) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startChat(contract);
                        }}
                        disabled={creatingChatId === contract.applicationId}
                        className="text-blue-600 bg-white hover:text-blue-800 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {creatingChatId === contract.applicationId
                          ? "Creating..."
                          : "Chat"}
                      </button>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          contract.isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Contract Details */}
                {contract.isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contract Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Contract Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Contract ID
                            </span>
                            <p className="text-gray-900">
                              #{contract.applicationId}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Start Date
                            </span>
                            <p className="text-gray-900">
                              {formatDate(contract.appliedAt)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Contract Value
                            </span>
                            <p className="text-lg font-bold text-green-600">
                              {formatSalary(contract.bidAmount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Status
                            </span>
                            <div className="mt-1">
                              {getStatusBadge(contract.status)}
                            </div>
                          </div>
                          {contract.jobPost?.categoryName && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">
                                Category
                              </span>
                              <p className="text-gray-900">
                                {contract.jobPost.categoryName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Client & Project Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Client & Project
                        </h4>
                        <div className="space-y-4">
                          {/* Client Info */}
                          {contract.clientData?.profile && (
                            <div>
                              <span className="text-sm font-medium text-gray-500 mb-2 block">
                                Client
                              </span>
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    contract.clientData.profile.imageUrl ||
                                    "/default-avatar.png"
                                  }
                                  alt={
                                    contract.clientData.profile.fullName ||
                                    "Client"
                                  }
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/default-avatar.png";
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {contract.clientData.profile.fullName ||
                                      "Unknown Client"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {contract.clientData.profile.country ||
                                      "Unknown Location"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Project Description */}
                          {contract.jobPost?.description && (
                            <div>
                              <span className="text-sm font-medium text-gray-500 mb-2 block">
                                Project Description
                              </span>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                  {contract.jobPost.description.length > 200
                                    ? `${contract.jobPost.description.substring(
                                        0,
                                        200
                                      )}...`
                                    : contract.jobPost.description}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* CV File */}
                          {contract.cvFile && (
                            <div>
                              <span className="text-sm font-medium text-gray-500 mb-2 block">
                                Submitted CV
                              </span>
                              <a
                                href={contract.cvFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Download CV
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex gap-3">
                        <Link
                          to={`/job/${contract.jobPostId}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Job Details
                        </Link>

                        {/* NÚT CHAT (expanded) */}
                        <button
                          onClick={() => startChat(contract)}
                          disabled={creatingChatId === contract.applicationId}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {creatingChatId === contract.applicationId
                            ? "Creating..."
                            : "Chat with Client"}
                        </button>

                        {contract.status === "Finished" &&
                          contract.jobPost?.employerId && (
                            <button
                              onClick={() => openReviewModal(contract)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              </svg>
                              Review Client
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full transform transition-all duration-300 ease-out">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Client
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedContract.clientData?.profile?.fullName ||
                  "Unknown Client"}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setReviewData((prev) => ({
                            ...prev,
                            rating: index + 1,
                          }))
                        }
                        className={`w-8 h-8 cursor-pointer hover:scale-110 transition-all focus:outline-none text-2xl flex items-center justify-center ${
                          index < reviewData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600 font-medium">
                    {reviewData.rating} out of 5 stars
                  </span>
                </div>

                {/* Rating labels */}
                <div className="mt-2 text-xs text-gray-500">
                  {reviewData.rating === 1 && "Poor"}
                  {reviewData.rating === 2 && "Fair"}
                  {reviewData.rating === 3 && "Good"}
                  {reviewData.rating === 4 && "Very Good"}
                  {reviewData.rating === 5 && "Excellent"}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Share your experience working with this client..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {reviewData.comment.length}/500 characters
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedContract(null);
                  setReviewData({ rating: 5, comment: "" });
                }}
                disabled={isSubmittingReview}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewData.comment.trim()}
                className="flex-1 px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerMyContractPage;
