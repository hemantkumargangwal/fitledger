import React from 'react';

/**
 * Wrapper card for charts with optional title and badge.
 * @param {string} [title] - Chart title
 * @param {string} [subtitle] - Optional subtitle
 * @param {React.ReactNode} [badge] - Optional badge (e.g. "+12%")
 * @param {React.ReactNode} children - Chart component (e.g. Recharts)
 * @param {string} [className] - Additional classes
 */
const ChartCard = ({ title, subtitle, badge, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 ease-out ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default ChartCard;
