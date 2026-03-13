import React from 'react';

/**
 * Reusable data table with header and body.
 * @param {Array<{ key: string, label: string, className?: string, headerClassName?: string, render?: (item) => React.ReactNode }>} columns - Column config
 * @param {Array} data - Array of row objects
 * @param {string} [keyField='id'] - Field to use as React key
 * @param {React.ReactNode} [emptyState] - Custom empty state (e.g. <EmptyState />). When provided, emptyMessage is ignored for empty content.
 * @param {string} [emptyMessage='No data found'] - Shown when data is empty (if emptyState not provided)
 * @param {string} [className] - Table container class
 */
const DataTable = ({ columns, data, keyField = 'id', emptyState, emptyMessage = 'No data found', className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50/90">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0 align-top">
                {emptyState ?? (
                  <div className="px-6 py-12 text-center text-slate-500 text-sm">
                    {emptyMessage}
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField] || row._id}
                className="hover:bg-slate-50/70 transition-colors duration-150 ease-out"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 text-sm text-slate-800 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
