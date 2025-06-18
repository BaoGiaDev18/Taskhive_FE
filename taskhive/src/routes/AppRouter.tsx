import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import HireFreelancerPage from "../pages/HireFreelancerPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/hirefreelancer" element={<MainLayout><HireFreelancerPage /></MainLayout>} />
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
