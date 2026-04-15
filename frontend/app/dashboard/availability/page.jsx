"use client";

import { useState } from "react";
import { IconPlus, IconMoreHorizontal, IconGlobe } from "../../components/Icons";

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("my");

  return (
    <>
      {/* ─── Top bar ─── */}
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Availability</h1>
          <p className="dash-topbar__subtitle">Configure times when you are available for bookings.</p>
        </div>
        <div className="dash-topbar__right">
          <div className="avail-tabs">
            <button
              className={`avail-tabs__btn ${activeTab === "my" ? "avail-tabs__btn--active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My availability
            </button>
            <button
              className={`avail-tabs__btn ${activeTab === "team" ? "avail-tabs__btn--active" : ""}`}
              onClick={() => setActiveTab("team")}
            >
              Team availability
            </button>
          </div>
          <button className="dash-btn dash-btn--primary">
            <IconPlus size={14} /><span>New</span>
          </button>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="dash-event-list">
        {activeTab === "my" ? (
          <>
            {/* Schedule card */}
            <div className="avail-card">
              <div className="avail-card__left">
                <div className="avail-card__info">
                  <div className="avail-card__name-row">
                    <span className="avail-card__name">Working hours</span>
                    <span className="avail-card__badge">Default</span>
                  </div>
                  <span className="avail-card__detail">Mon - Fri, 9:00 AM - 5:00 PM</span>
                  <span className="avail-card__timezone">
                    <IconGlobe size={12} />
                    Europe/London
                  </span>
                </div>
              </div>
              <div className="avail-card__right">
                <button className="dash-icon-btn" aria-label="More options">
                  <IconMoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Out-of-office link */}
            <div className="avail-ooo">
              <span>Temporarily out-of-office?</span>{" "}
              <a href="#" className="avail-ooo__link">Add a redirect</a>
            </div>
          </>
        ) : (
          <div className="dash-page-empty">
            <div className="dash-page-empty__icon">
              <IconGlobe size={40} />
            </div>
            <h3 className="dash-page-empty__title">No team availability</h3>
            <p className="dash-page-empty__desc">Team availability will appear here once you create or join a team.</p>
          </div>
        )}
      </div>
    </>
  );
}
