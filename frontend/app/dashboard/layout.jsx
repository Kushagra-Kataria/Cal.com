"use client";

import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dash-main">
        {children}
      </main>
    </div>
  );
}
