"use client";

import { IconGrid } from "../../components/Icons";

const APP_CATEGORIES = [
  { name: "Google Calendar", desc: "Sync your Google Calendar", installed: true, icon: "📅" },
  { name: "Zoom", desc: "Video conferencing", installed: true, icon: "📹" },
  { name: "Google Meet", desc: "Video conferencing", installed: false, icon: "🎥" },
  { name: "Stripe", desc: "Collect payments", installed: false, icon: "💳" },
  { name: "Zapier", desc: "Automation workflows", installed: false, icon: "⚡" },
  { name: "Hubspot", desc: "CRM integration", installed: false, icon: "🔶" },
];

export default function AppsPage() {
  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Apps</h1>
          <p className="dash-topbar__subtitle">Connect your favourite apps to extend Cal.com functionality.</p>
        </div>
      </div>

      <div className="apps-grid">
        {APP_CATEGORIES.map((app) => (
          <div key={app.name} className="app-card">
            <div className="app-card__icon">{app.icon}</div>
            <div className="app-card__info">
              <span className="app-card__name">{app.name}</span>
              <span className="app-card__desc">{app.desc}</span>
            </div>
            <button className={`dash-btn ${app.installed ? "dash-btn--ghost" : "dash-btn--primary"}`}
              style={{ fontSize: "0.75rem", padding: "6px 12px" }}>
              {app.installed ? "Installed" : "Install"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
