import React from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import "../components/layout.css";

/**
 * PUBLIC_INTERFACE
 * AppLayout
 * Wraps pages in top nav and sidebar.
 */
export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <TopNav />
      <div className="content">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
