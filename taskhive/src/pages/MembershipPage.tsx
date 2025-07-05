import React, { useEffect, useState } from "react";
import api from "../services/api";
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
  const [activeMembershipId, setActiveMembershipId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingActive, setLoadingActive] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const auth = useAuth();
  const userId = auth?.userId;

  // 1. Lấy danh sách plans
  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await api.get<Membership[]>("/api/Membership");
        setMemberships(res.data);
      } catch (error) {
        console.error("Failed to load memberships:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberships();
  }, []);

  // 2. Lấy active membership của user
  useEffect(() => {
    if (!userId) {
      setLoadingActive(false);
      return;
    }

    const fetchActive = async () => {
      try {
        const res = await api.get<{ membershipId: number }[]>(
          `/api/UserMemberships/active/${userId}`
        );
        // endpoint trả về array, mình chỉ cần membershipId đầu tiên (nếu có)
        if (res.data.length > 0) {
          setActiveMembershipId(res.data[0].membershipId);
        }
      } catch (error) {
        console.error("Failed to load active membership:", error);
      } finally {
        setLoadingActive(false);
      }
    };
    fetchActive();
  }, [userId]);

  // 3. Handlers
  const handleUpgradeClick = (plan: Membership) => setSelectedPlan(plan);

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
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to create payment link.");
    } finally {
      setLoadingPayment(false);
      setSelectedPlan(null);
    }
  };

  // 4. Loading skeleton
  if (loading || loadingActive) {
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
          {memberships.map((plan, index) => {
            // Xác định kế hoạch này có phải current không?
            const isCurrent =
              activeMembershipId !== null
                ? plan.membershipId === activeMembershipId
                : index === 0;

            return (
              <div
                key={plan.membershipId}
                className={`rounded-xl shadow-md p-6 border ${
                  isCurrent
                    ? "bg-white border-gray-300"
                    : "bg-blue-50 border-blue-500"
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

                {isCurrent ? (
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
            );
          })}
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
    </div>
  );
};

export default MembershipPlansPage;
