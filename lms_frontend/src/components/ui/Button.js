import React from 'react';
import '../../App.css';

/**
 * PUBLIC_INTERFACE
 * Button
 * A themed button primitive with variants.
 */
export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  /** Button component with Ocean Professional theme. */
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition shadow-sm';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400',
    secondary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300',
    ghost: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50',
  };
  const styles = `${base} ${variants[variant] || variants.primary} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`;
  return (
    <button type={type} className={styles} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
