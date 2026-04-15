"use client";

import { IconBarChart } from "../../components/Icons";

export default function InsightsPage() {
  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Insights</h1>
          <p className="dash-topbar__subtitle">View analytics and insights across your bookings and event types.</p>
        </div>
      </div>

      <div className="dash-page-empty">
        <div className="dash-page-empty__icon"><IconBarChart size={40} /></div>
        <h3 className="dash-page-empty__title">No insights yet</h3>
        <p className="dash-page-empty__desc">Insights will appear once you have booking activity to analyze.</p>
      </div>
    </>
  );
}
