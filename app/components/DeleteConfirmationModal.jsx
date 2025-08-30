import { FiX, FiAlertTriangle } from "react-icons/fi";

function DeleteConfirmationModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-[var(--dark-1)] border border-[var(--grey-0)] rounded-[var(--border-radius)] p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-500 bg-opacity-20 rounded-full">
              <FiAlertTriangle className="text-red-400 text-lg" />
            </div>
            <h2 className="text-xl font-semibold text-white">Delete Message</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--grey-1)] hover:text-white transition-colors duration-200 p-1 rounded hover:bg-[var(--grey-0)] hover:bg-opacity-50"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-[var(--grey-1)] text-sm leading-relaxed">
            This will delete your message and all subsequent character responses that were generated in response to it. 
          </p>
          <p className="text-[var(--grey-1)] text-sm leading-relaxed mt-2 font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--grey-1)] hover:text-white bg-[var(--grey-0)] hover:bg-opacity-80 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--grey-0)] focus:ring-opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;