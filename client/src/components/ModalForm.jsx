import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal with optional title and close button.
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Called when backdrop or close is clicked
 * @param {string} [title] - Modal title
 * @param {React.ReactNode} children - Form or content
 * @param {string} [className] - Additional class for the inner modal box
 */
const ModalForm = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          aria-hidden
          onClick={onClose}
        />
        <div
          className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}`}
        >
          {(title || onClose) && (
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              {title && <h3 className="text-xl font-semibold text-slate-800">{title}</h3>}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
