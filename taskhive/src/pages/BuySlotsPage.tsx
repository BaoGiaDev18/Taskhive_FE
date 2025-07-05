import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
interface SlotPackage {
  quantity: number;
  price: number;
}

const slotPackages: SlotPackage[] = [
  { quantity: 10, price: 100000 },
  { quantity: 20, price: 200000 },
  { quantity: 50, price: 500000 },
  { quantity: 100, price: 900000 },
  { quantity: 200, price: 1600000 },
];

const BuySlotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SlotPackage>(slotPackages[2]);
  const [currentSlots, setCurrentSlots] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const userId = auth?.userId;

  const [toast, setToast] = useState({
    message: "",
    type: "info" as "success" | "error" | "info",
    isVisible: false,
  });

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToast({ message: msg, type, isVisible: true });
  };
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchCurrentSlots = async () => {
      try {
        const res = await api.get("/api/User/me");
        console.log("Current user data:", res.data);
        setCurrentSlots(res.data.remainingSlots || 0);
      } catch (err) {
        console.error("Failed to load slot info", err);
      }
    };

    fetchCurrentSlots();
  }, []);

  const handleBuy = async () => {
    if (!userId) {
      showToast("You must be logged in", "error");
      return;
    }
    localStorage.setItem("paymentUserId", userId.toString());

    try {
      setLoading(true);
      const res = await api.post("/api/Payment/create-link", {
        amount: selected.price,
        description: `Buy ${selected.quantity} slots`,
        items: [
          {
            name: `${selected.quantity} Slots`,
            quantity: selected.quantity,
            price: selected.price,
          },
        ],
        cancelUrl: window.location.href,
        returnUrl: `${window.location.origin}/buy-slots/confirm?quantity=${selected.quantity}&price=${selected.price}`,
      });

      const checkoutUrl = res.data.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Failed to create payment link", err);
      showToast("Failed to create payment link", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="pt-20">
      <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-md shadow-md mt-20">
        <h1 className="text-2xl font-bold mb-6">Buy Slots</h1>

        <div className="mb-4">
          <p className="text-gray-600">Your available Slots</p>
          <p className="text-xl font-semibold">{currentSlots}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select the amount to buy
          </label>
          <select
            className="w-full border px-4 py-2 rounded-md"
            value={selected.price}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              const found = slotPackages.find((p) => p.price === value);
              if (found) setSelected(found);
            }}
          >
            {slotPackages.map((pkg) => (
              <option key={pkg.quantity} value={pkg.price}>
                {pkg.quantity} for {formatCurrency(pkg.price)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-gray-700">
          <p>
            <strong>Your account will be charged:</strong>{" "}
            {formatCurrency(selected.price)}
          </p>
          <p>
            <strong>Your new Slots balance will be:</strong>{" "}
            {currentSlots + selected.quantity}
          </p>
          <p>
            <strong>These Slots will expire on:</strong>{" "}
            {new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="text-sm text-gray-500 mt-4 mb-8">
          This bundle of slots will expire 1 year from today. Unused slots
          rollover to the next month.
          <br />
          You’re authorizing the platform to charge your account. If sufficient
          funds exist, it will use your balance. Otherwise, it will charge your
          primary payment method.
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Buy Slots"}
          </button>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
          duration={3000}
        />
      </div>
    </div>
  );
};

export default BuySlotsPage;
