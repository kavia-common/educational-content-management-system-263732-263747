import React from "react";
import TopNav from "../components/TopNav";
import Sidebar from "../components/Sidebar";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function AppLayout({ children }) {
  /** Default application layout with top nav and sidebar. */
  return (
    <>
      <TopNav />
      <div className="layout-shell">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </>
  );
}
