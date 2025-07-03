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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
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
      </Routes>
    </BrowserRouter>
  );
}
