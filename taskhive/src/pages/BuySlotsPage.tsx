import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo gốc trên nền đen.png";
import facebook from "../assets/faceicon.jpg";

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
      <div className="pt-20">
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
    </div>
  );
};

export default BuySlotsPage;
