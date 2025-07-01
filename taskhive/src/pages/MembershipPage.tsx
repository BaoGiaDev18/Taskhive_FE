import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";
import facebook from "../assets/faceicon.jpg";
import ConfirmUpgradeModal from "../components/ConfirmUpgradeModalProps";
import { useAuth } from "../contexts/AuthContext";

interface Membership {
  membershipId: number;
  name: string;
  description: string;
  price: number;
  monthlySlotLimit: number;
  features: string;
  status: boolean;
}

const MembershipPlansPage: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const auth = useAuth();
  const userId = auth?.userId;

  const handleUpgradeClick = (plan: Membership) => {
    setSelectedPlan(plan);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !userId) {
      alert("Missing user info or selected plan");
      return;
    }

    localStorage.setItem("paymentUserId", userId.toString());
    setLoadingPayment(true);

    try {
      const res = await api.post("/api/Payment/create-link", {
        amount: selectedPlan.price,
        description: `Upgrade to ${selectedPlan.name}`,
        items: [
          {
            name: selectedPlan.name,
            quantity: 1,
            price: selectedPlan.price,
          },
        ],
        cancelUrl: window.location.href,
        returnUrl: `${window.location.origin}/membership/confirm?membershipId=${selectedPlan.membershipId}&price=${selectedPlan.price}`,
      });

      const checkoutUrl = res.data.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to create payment link.");
    } finally {
      setLoadingPayment(false);
      setSelectedPlan(null);
    }
  };

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await api.get("/api/Membership");
        setMemberships(res.data);
      } catch (error) {
        console.error("Failed to load memberships:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading membership plans...</p>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Membership Plans
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {memberships.map((plan, index) => (
            <div
              key={plan.membershipId}
              className={`rounded-xl shadow-md p-6 border ${
                index === 0 ? "bg-white" : "bg-blue-50 border-blue-500"
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-500 mb-4">{plan.description}</p>

              <div className="text-xl font-bold text-gray-700 mb-2">
                {plan.price.toLocaleString()} VND / month
              </div>

              <ul className="text-gray-700 space-y-2 mb-4">
                <li>• Monthly Slot Limit: {plan.monthlySlotLimit}</li>
                <li>• Features: {plan.features}</li>
                <li>• Status: {plan.status ? "Active" : "Inactive"}</li>
              </ul>

              {index === 0 ? (
                <span className="text-sm text-gray-400 italic">
                  This is your current plan
                </span>
              ) : (
                <button
                  className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  onClick={() => handleUpgradeClick(plan)}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>
        {selectedPlan && (
          <ConfirmUpgradeModal
            planName={selectedPlan.name}
            onClose={() => setSelectedPlan(null)}
            onConfirm={handleConfirmUpgrade}
          />
        )}

        {loadingPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <p className="text-lg font-semibold">Processing payment...</p>
            </div>
          </div>
        )}
      </div>
      <footer className="bg-[#191919] text-white py-16 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <img src={Logo} alt="TaskHive Logo" className="h-12 mb-6" />
            <div className="flex space-x-4">
              <img src={facebook} alt="fb" className="h-6" />
              <img src="/twitter-icon.png" alt="twitter" className="h-6" />
              <img src="/linkedin-icon.png" alt="linkedin" className="h-6" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-to-hire" className="text-white">
                  How to Hire
                </Link>
              </li>
              <li>
                <Link to="/project-catalog" className="text-white">
                  Project Catalog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">For Talents</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/how-to-find-work" className="text-white">
                  How to find work
                </Link>
              </li>
              <li>
                <Link to="/freelance-jobs" className="text-white">
                  Freelance Jobs in HCM
                </Link>
              </li>
              <li>
                <Link to="/ads" className="text-white">
                  Win work with ads
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/leadership" className="text-white">
                  Leadership
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white mt-12 pt-6 text-sm flex justify-between">
          <p>© 2024 - 2025 TaskHive® Global Inc.</p>
          <div className="space-x-6">
            <Link to="/terms" className="text-white">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MembershipPlansPage;
