export default function Modal({ isOpen, onClose, title, children, type = 'default' }) {
  if (!isOpen) return null;

  const typeStyles = {
    default: 'text-gray-900',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-modalSlideIn z-[10000]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <h3 className={`text-xl font-bold mb-4 pr-8 ${typeStyles[type]}`}>
              {title}
            </h3>
          )}

          {/* Content */}
          <div className="text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
