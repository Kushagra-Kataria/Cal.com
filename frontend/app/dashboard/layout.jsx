"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  return (
    <div className="dash-layout">
      <Sidebar width={sidebarWidth} onWidthChange={setSidebarWidth} />
      <main className="dash-main" style={{ marginLeft: `${sidebarWidth}px` }}>
        {children}
      </main>
    </div>
  );
}
