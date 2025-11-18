import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Card
 * A surface card with padding and subtle shadow.
 */
export default function Card({ title, actions, children, className = '' }) {
  /** Card component */
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      {(title || actions) && (
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
