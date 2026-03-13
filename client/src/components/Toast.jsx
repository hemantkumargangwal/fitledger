import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'text-success-600';
      case 'error':
        return 'text-danger-600';
      case 'warning':
        return 'text-warning-600';
      case 'info':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-soft-lg backdrop-blur-sm
        min-w-[320px] max-w-md
        ${getStyles()}
      `}>
        <div className={`flex-shrink-0 ${getIconStyles()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm mb-1">{toast.title}</p>
          )}
          <p className="text-sm leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${getIconStyles()}
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Global toast function
    window.toast = addToast;
    
    return () => {
      delete window.toast;
    };
  }, []);

  return (
    <div
      className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-h-[calc(100vh-6rem)] overflow-hidden"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto flex-shrink-0">
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

export { ToastContainer, Toast };
export default ToastContainer;
