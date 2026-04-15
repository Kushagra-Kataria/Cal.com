"use client";

import { IconUsers, IconPlus } from "../../components/Icons";

export default function TeamsPage() {
  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Teams</h1>
          <p className="dash-topbar__subtitle">Create and manage teams to share event types and scheduling resources.</p>
        </div>
        <div className="dash-topbar__right">
          <button className="dash-btn dash-btn--primary">
            <IconPlus size={14} /><span>Create team</span>
          </button>
        </div>
      </div>

      <div className="dash-page-empty">
        <div className="dash-page-empty__icon"><IconUsers size={40} /></div>
        <h3 className="dash-page-empty__title">No teams yet</h3>
        <p className="dash-page-empty__desc">Create a team to collaborate with others and share scheduling resources.</p>
      </div>
    </>
  );
}
