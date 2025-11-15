import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini?",
  itemName = "",
  confirmText = "Hapus",
  cancelText = "Batal",
  isLoading = false,
  variant = "danger" // danger, warning, info
}) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <FaTrash className="w-6 h-6 text-red-500" />;
      case "warning":
        return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <FaExclamationTriangle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-4">
        {/* Icon dan Message */}
        <div className={`p-4 rounded-lg border ${getVariantStyles()}`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {message}
              </p>
              {itemName && (
                <p className="text-sm font-medium text-gray-900 mt-1">
                  "{itemName}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Warning Text */}
        {variant === "danger" && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3">
            <p className="text-sm text-red-700">
              <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
