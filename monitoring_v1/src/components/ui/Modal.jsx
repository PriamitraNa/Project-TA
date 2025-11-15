export default function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
        >
          &times;
        </button>
        
        {/* Header */}
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold pr-8">{title}</h2>
          </div>
        )}

        {/* Body */}
        <div className="mb-4">{children}</div>

        {/* Footer (optional) */}
        {footer && <div className="mt-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
