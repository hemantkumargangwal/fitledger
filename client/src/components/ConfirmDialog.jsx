import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Spinner from './Spinner';

/**
 * Reusable confirmation dialog for destructive actions (e.g. delete).
 * @param {boolean} open - Whether dialog is visible
 * @param {string} title - Dialog title
 * @param {React.ReactNode} message - Body content
 * @param {string} [confirmLabel='Confirm'] - Confirm button text
 * @param {string} [cancelLabel='Cancel'] - Cancel button text
 * @param {boolean} [danger=true] - Red confirm button when true
 * @param {boolean} [loading=false] - Show spinner on confirm button
 * @param {function} onConfirm - Called when user confirms
 * @param {function} onCancel - Called when user cancels or clicks backdrop
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          aria-hidden
          onClick={onCancel}
        />
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full animate-scale-in">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-800">
                  {title}
                </h3>
                <div className="mt-2 text-sm text-slate-600">
                  {message}
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                danger
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {loading && <Spinner className="w-4 h-4" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
