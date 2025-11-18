import React from "react";

/**
 * Themed Card container for consistent styling.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.role]
 * @param {string} [props.className]
 */
// PUBLIC_INTERFACE
export default function Card({ children, role, className = "" }) {
  return (
    <div className={`card ${className}`} role={role || undefined}>
      {children}
    </div>
  );
}
