import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-white border-l-4 border-green-500 shadow-lg";
      case "error":
        return "bg-white border-l-4 border-red-500 shadow-lg";
      case "info":
        return "bg-white border-l-4 border-[#F57C00] shadow-lg";
      default:
        return "bg-white border-l-4 border-gray-400 shadow-lg";
    }
  };


  const getTitle = () => {
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 transform transition-all duration-300 ease-in-out animate-slide-in">
      <div
        className={`min-w-80 max-w-md w-full rounded-lg p-4 ${getToastStyles()}`}
      >
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {getTitle()}
            </p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
                   <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:ring-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full ${
              type === "success"
                ? "bg-green-500"
                : type === "error"
                ? "bg-red-500"
                : "bg-[#F57C00]"
            } animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
