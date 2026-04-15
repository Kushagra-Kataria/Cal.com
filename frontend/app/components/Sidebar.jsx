"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSearch, IconChevronDown, IconCalendar, IconBookOpen, IconClock,
  IconUsers, IconGrid, IconGitBranch, IconZap, IconBarChart,
  IconGlobe, IconCopy, IconGift, IconSettings,
} from "./Icons";

const NAV_ITEMS = [
  { href: "/dashboard/event-types", icon: IconCalendar, label: "Event types", key: "event-types" },
  { href: "/dashboard/bookings", icon: IconBookOpen, label: "Bookings", key: "bookings" },
  { href: "/dashboard/availability", icon: IconClock, label: "Availability", key: "availability" },
  { href: "/dashboard/teams", icon: IconUsers, label: "Teams", key: "teams", badge: "i" },
  { href: "/dashboard/apps", icon: IconGrid, label: "Apps", key: "apps", expandable: true },
  { href: "/dashboard/routing", icon: IconGitBranch, label: "Routing", key: "routing" },
  { href: "/dashboard/workflows", icon: IconZap, label: "Workflows", key: "workflows" },
  { href: "/dashboard/insights", icon: IconBarChart, label: "Insights", key: "insights", expandable: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar__top">
        <div className="dash-sidebar__profile">
          <div className="dash-avatar">K</div>
          <span className="dash-sidebar__username">KUSHAGRA ...</span>
          <IconChevronDown size={14} />
        </div>
        <button className="dash-sidebar__search-btn" aria-label="Search">
          <IconSearch size={16} />
        </button>
      </div>

      <nav className="dash-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`dash-nav-item ${isActive ? "dash-nav-item--active" : ""}`}
            >
              <span className="dash-nav-item__icon"><Icon size={16} /></span>
              <span className="dash-nav-item__label">{item.label}</span>
              {item.badge && <span className="dash-nav-item__badge">{item.badge}</span>}
              {item.expandable && (
                <span className="dash-nav-item__chevron">
                  <IconChevronDown size={14} />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="dash-sidebar__bottom">
        <a href="#" className="dash-sidebar__link">
          <IconGlobe size={14} />
          <span>View public page</span>
        </a>
        <a href="#" className="dash-sidebar__link">
          <IconCopy size={14} />
          <span>Copy public page link</span>
        </a>
        <a href="#" className="dash-sidebar__link">
          <IconGift size={14} />
          <span>Refer and earn</span>
        </a>
        <a href="#" className="dash-sidebar__link">
          <IconSettings size={14} />
          <span>Settings</span>
        </a>
        <div className="dash-sidebar__footer">
          © 2025 Cal.com, Inc. v4.8.6-beta.69
        </div>
      </div>
    </aside>
  );
}
