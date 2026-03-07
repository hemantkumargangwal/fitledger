import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  dismissible = false, 
  onDismiss,
  className = '',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
    setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
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
    switch (type) {
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
    switch (type) {
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

  if (!isVisible) return null;

  return (
    <div className={`
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
    `}>
      <div className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-soft
        ${getStyles()}
        ${className}
      `}>
        <div className={`flex-shrink-0 ${getIconStyles()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
          )}
          {message && (
            <p className="text-sm leading-relaxed">{message}</p>
          )}
          {children}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`
              flex-shrink-0 p-1 rounded-lg transition-all duration-200
              hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1
              ${getIconStyles()}
            `}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
