"use client";

import { IconZap, IconPlus } from "../../components/Icons";

export default function WorkflowsPage() {
  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Workflows</h1>
          <p className="dash-topbar__subtitle">Automate notifications and reminders with event-driven workflows.</p>
        </div>
        <div className="dash-topbar__right">
          <button className="dash-btn dash-btn--primary">
            <IconPlus size={14} /><span>New workflow</span>
          </button>
        </div>
      </div>

      <div className="dash-page-empty">
        <div className="dash-page-empty__icon"><IconZap size={40} /></div>
        <h3 className="dash-page-empty__title">No workflows</h3>
        <p className="dash-page-empty__desc">Create automated workflows to send reminders, follow-ups, and notifications.</p>
      </div>
    </>
  );
}
