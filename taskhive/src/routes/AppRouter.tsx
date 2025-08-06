import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import HireFreelancerPage from "../pages/HireFreelancerPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import RequestPasswordResetPage from "../pages/RequestPasswordResetPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import ClientProfilePage from "../pages/ClientProfilePage";
import FreelancerProfilePage from "../pages/FreelancerProfilePage";
import BlogPostPage from "../pages/BlogPost/BlogPostPage";
import BlogPostDetail from "../pages/BlogPost/BlogPostDetail";
import CreateJobPost from "../pages/CreateJobPost";
import FindWorkPage from "../pages/FindWorkPage";
import ChatTest from "../components/ChatTest";
import MembershipPlansPage from "../pages/MembershipPage";
import WhyTaskhivePage from "../pages/WhyTaskhivePage";
import JobPostDetail from "../pages/JobDetailPage";
import MyJobPostsPage from "../pages/MyJobPostsPage";
import ClientJobDetailPage from "../pages/ClientJobDetailPage";
import MembershipPaymentConfirm from "../pages/MembershipPaymentConfirm";
import BuySlotsPage from "../pages/BuySlotsPage";
import SlotPaymentConfirm from "../pages/SlotPaymentConfirm.tsx";
import ApplyFormPage from "../pages/ApplyFormPage";
import ClientContractPage from "../pages/ClientContractPage.tsx";
import ClientContractDetailPage from "../pages/ClientContractDetailPage.tsx";
import FreelancerMyProposalsPage from "../pages/FreelancerMyProposalsPage.tsx";
import FreelancerMyContractPage from "../pages/FreelancerMyContractPage.tsx";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute"; // Thêm import
import AdminLayout from "../layouts/AdminLayout.tsx";
import TransactionPage from "../pages/Admin/TransactionPage.tsx";
import ManageUserPage from "../pages/Admin/ManageUserPage.tsx";
import FeedbackPage from "../pages/Admin/FeedbackPage.tsx";
import DashboardPage from "../pages/Admin/DashboardPage.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={false}>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hirefreelancer"
          element={
            <MainLayout>
              <HireFreelancerPage />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/client/:userId"
          element={
            <MainLayout>
              <ClientProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/freelancer/:userId"
          element={
            <MainLayout>
              <FreelancerProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/blogposts"
          element={
            <MainLayout>
              <BlogPostPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <MainLayout>
              <BlogPostDetail />
            </MainLayout>
          }
        />
        <Route
          path="/create-job-post"
          element={
            <MainLayout>
              <CreateJobPost />
            </MainLayout>
          }
        />
        <Route
          path="/find-work"
          element={
            <MainLayout>
              <FindWorkPage />
            </MainLayout>
          }
        />
        <Route
          path="/job/:jobId"
          element={
            <MainLayout>
              <JobPostDetail />
            </MainLayout>
          }
        />
        <Route
          path="/my-job-posts"
          element={
            <MainLayout>
              <MyJobPostsPage />
            </MainLayout>
          }
        />
        <Route
          path="/my-job-posts/:jobId"
          element={
            <MainLayout>
              <ClientJobDetailPage />
            </MainLayout>
          }
        />
        <Route path="/chat-test" element={<ChatTest />} />
        <Route
          path="/membership"
          element={
            <MainLayout>
              <MembershipPlansPage />
            </MainLayout>
          }
        />
        <Route
          path="/about"
          element={
            <MainLayout>
              <WhyTaskhivePage />
            </MainLayout>
          }
        />
        <Route
          path="/membership/confirm"
          element={<MembershipPaymentConfirm />}
        />
        <Route
          path="/buy-slots"
          element={
            <MainLayout>
              <BuySlotsPage />
            </MainLayout>
          }
        />
        <Route path="/buy-slots/confirm" element={<SlotPaymentConfirm />} />
        <Route
          path="/apply"
          element={
            <MainLayout>
              <ApplyFormPage />
            </MainLayout>
          }
        />
        <Route
          path="/client/my-contracts"
          element={
            <MainLayout>
              <ClientContractPage />
            </MainLayout>
          }
        />
        <Route
          path="/client/contract/:applicationId"
          element={
            <MainLayout>
              <ClientContractDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/my-proposals"
          element={
            <MainLayout>
              <FreelancerMyProposalsPage />
            </MainLayout>
          }
        />
        <Route
          path="/my-contracts"
          element={
            <MainLayout>
              <FreelancerMyContractPage />
            </MainLayout>
          }
        />

        <Route
          path="*"
          element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          }
        />

        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <TransactionPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <ManageUserPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedbacks"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <FeedbackPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
