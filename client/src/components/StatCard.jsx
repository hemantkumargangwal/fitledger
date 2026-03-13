import React from 'react';

/**
 * Reusable stat card for dashboard and other pages.
 * @param {string} title - Card label
 * @param {string|number} value - Main stat value
 * @param {React.ReactNode} icon - Lucide icon component
 * @param {string} iconBg - Tailwind gradient/color classes for icon container
 * @param {React.ReactNode} [subtitle] - Optional subtitle or trend (e.g. "+10% from last month")
 * @param {string} [className] - Additional classes for the card
 */
const StatCard = ({ title, value, icon: Icon, iconBg = 'from-primary-500 to-primary-600', subtitle, className = '' }) => {
  return (
    <div
      className={`group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 ease-out ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {Icon && (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className={Icon ? 'ml-4' : ''}>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            {subtitle && <div className="mt-2 text-sm text-slate-600">{subtitle}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
