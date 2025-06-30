import React from "react";

interface ConfirmUpgradeModalProps {
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
}

const ConfirmUpgradeModal: React.FC<ConfirmUpgradeModalProps> = ({
  onClose,
  onConfirm,
  planName,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Confirm Upgrade</h2>
        <p>
          Are you sure you want to upgrade to <strong>{planName}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUpgradeModal;
