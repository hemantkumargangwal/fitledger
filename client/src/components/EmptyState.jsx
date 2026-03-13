import React from 'react';

/**
 * Empty state for tables and sections. Modern SaaS-style with icon, title, description, optional action.
 * @param {React.ReactNode} icon - Lucide icon component (e.g. Users, Inbox)
 * @param {string} title - Heading text
 * @param {string} [description] - Supporting text
 * @param {React.ReactNode} [action] - Optional CTA (e.g. Link or button)
 * @param {string} [className] - Container class
 */
const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400 transition-colors duration-200">
        {Icon && <Icon className="w-8 h-8" strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default EmptyState;
