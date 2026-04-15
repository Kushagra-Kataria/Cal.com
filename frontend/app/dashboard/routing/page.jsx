"use client";

import { IconGitBranch, IconPlus } from "../../components/Icons";

export default function RoutingPage() {
  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Routing</h1>
          <p className="dash-topbar__subtitle">Create routing forms to direct bookers to the right person or event type.</p>
        </div>
        <div className="dash-topbar__right">
          <button className="dash-btn dash-btn--primary">
            <IconPlus size={14} /><span>New route</span>
          </button>
        </div>
      </div>

      <div className="dash-page-empty">
        <div className="dash-page-empty__icon"><IconGitBranch size={40} /></div>
        <h3 className="dash-page-empty__title">No routing forms</h3>
        <p className="dash-page-empty__desc">Create a routing form to ask qualifying questions before booking.</p>
      </div>
    </>
  );
}
