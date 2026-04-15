"use client";

import { useState, useRef, useEffect } from "react";

/* ─── Default event data ─── */
const DEFAULT_EVENTS = [
  {
    id: 1,
    name: "30 min meeting",
    slug: "/kushagra-kataria-o6ramp/30min",
    duration: 30,
    enabled: true,
  },
  {
    id: 2,
    name: "Secret meeting",
    slug: "/kushagra-kataria-o6ramp/secret",
    duration: 15,
    enabled: false,
  },
  {
    id: 3,
    name: "15 min meeting",
    slug: "/kushagra-kataria-o6ramp/15min",
    duration: 15,
    enabled: true,
  },
];

/* ─── SVG icon components ─── */

function IconSearch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconClock({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconExternalLink({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconLink({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconMoreHorizontal({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function IconPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconGlobe({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  );
}

function IconCopy({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconGift({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function IconSettings({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconCalendar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBookOpen({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconUsers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGrid({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconGitBranch({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function IconZap({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconBarChart({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IconX({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Toggle Component ─── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`dash-toggle ${checked ? "dash-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="dash-toggle__thumb" />
    </button>
  );
}

/* ─── Toast Component ─── */
function Toast({ message, visible, onHide }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  return (
    <div className={`dash-toast ${visible ? "dash-toast--visible" : ""}`}>
      <IconLink size={14} />
      <span>{message}</span>
    </div>
  );
}

/* ─── New Event Modal ─── */
function NewEventModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const slug = `/kushagra-kataria-o6ramp/${name.trim().toLowerCase().replace(/\s+/g, "-")}`;
    onSave({
      id: Date.now(),
      name: name.trim(),
      slug,
      duration: parseInt(duration, 10),
      enabled: true,
    });
  }

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal__header">
          <h3>Add a new event type</h3>
          <button className="dash-modal__close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dash-modal__form">
          <label className="dash-modal__label">
            <span>Title</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Quick chat"
              className="dash-modal__input"
              required
            />
          </label>

          <label className="dash-modal__label">
            <span>Duration (minutes)</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="dash-modal__input"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>

          <div className="dash-modal__actions">
            <button type="button" className="dash-btn dash-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dash-btn dash-btn--primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── More Options Dropdown ─── */
function MoreMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dash-more" ref={menuRef}>
      <button className="dash-icon-btn" onClick={() => setOpen(!open)} aria-label="More options">
        <IconMoreHorizontal size={16} />
      </button>
      {open && (
        <div className="dash-dropdown">
          <button className="dash-dropdown__item" onClick={() => { onEdit(); setOpen(false); }}>
            Edit
          </button>
          <button className="dash-dropdown__item" onClick={() => { onDuplicate(); setOpen(false); }}>
            Duplicate
          </button>
          <button className="dash-dropdown__item dash-dropdown__item--danger" onClick={() => { onDelete(); setOpen(false); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Event Card Row ─── */
function EventCard({ event, onToggle, onCopy, onEdit, onDuplicate, onDelete }) {
  return (
    <div className={`dash-event-card ${!event.enabled ? "dash-event-card--disabled" : ""}`}>
      <div className="dash-event-card__left">
        <div className="dash-event-card__color" />
        <div className="dash-event-card__info">
          <div className="dash-event-card__name-row">
            <span className="dash-event-card__name">{event.name}</span>
            <span className="dash-event-card__slug">{event.slug}</span>
          </div>
          <span className="dash-event-card__duration">
            <IconClock size={12} />
            {event.duration}m
          </span>
        </div>
      </div>

      <div className="dash-event-card__right">
        {!event.enabled && <span className="dash-event-card__hidden-label">Hidden</span>}
        <Toggle checked={event.enabled} onChange={(val) => onToggle(event.id, val)} />
        <button className="dash-icon-btn" onClick={() => window.open(event.slug, "_blank")} aria-label="Open in new tab">
          <IconExternalLink size={16} />
        </button>
        <button className="dash-icon-btn" onClick={() => onCopy(event.slug)} aria-label="Copy link">
          <IconLink size={16} />
        </button>
        <MoreMenu
          onEdit={() => onEdit(event.id)}
          onDuplicate={() => onDuplicate(event.id)}
          onDelete={() => onDelete(event.id)}
        />
      </div>
    </div>
  );
}

/* ─── Sidebar Nav Item ─── */
function NavItem({ icon, label, active, badge, expandable, expanded, onClick }) {
  return (
    <button
      className={`dash-nav-item ${active ? "dash-nav-item--active" : ""}`}
      onClick={onClick}
    >
      <span className="dash-nav-item__icon">{icon}</span>
      <span className="dash-nav-item__label">{label}</span>
      {badge && <span className="dash-nav-item__badge">{badge}</span>}
      {expandable && (
        <span className={`dash-nav-item__chevron ${expanded ? "dash-nav-item__chevron--open" : ""}`}>
          <IconChevronDown size={14} />
        </span>
      )}
    </button>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [activeNav, setActiveNav] = useState("event-types");

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleToggle(id, val) {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, enabled: val } : ev))
    );
  }

  function handleCopy(slug) {
    const url = `${window.location.origin}${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg("Link copied to clipboard!");
      setToastVisible(true);
    }).catch(() => {
      setToastMsg("Failed to copy");
      setToastVisible(true);
    });
  }

  function handleDuplicate(id) {
    setEvents((prev) => {
      const source = prev.find((ev) => ev.id === id);
      if (!source) return prev;
      const copy = {
        ...source,
        id: Date.now(),
        name: `${source.name} (copy)`,
        slug: `${source.slug}-copy`,
      };
      const idx = prev.findIndex((ev) => ev.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function handleDelete(id) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  function handleEdit(id) {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const newName = prompt("Edit event name:", ev.name);
    if (newName && newName.trim()) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, name: newName.trim(), slug: `/kushagra-kataria-o6ramp/${newName.trim().toLowerCase().replace(/\s+/g, "-")}` }
            : e
        )
      );
    }
  }

  function handleSaveNew(ev) {
    setEvents((prev) => [...prev, ev]);
    setShowModal(false);
  }

  return (
    <div className="dash-layout">
      {/* ─── Sidebar ─── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__top">
          {/* Profile */}
          <div className="dash-sidebar__profile">
            <div className="dash-avatar">K</div>
            <span className="dash-sidebar__username">KUSHAGRA ...</span>
            <IconChevronDown size={14} />
          </div>

          {/* Search icon */}
          <button className="dash-sidebar__search-btn" aria-label="Search">
            <IconSearch size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="dash-sidebar__nav">
          <NavItem
            icon={<IconCalendar size={16} />}
            label="Event types"
            active={activeNav === "event-types"}
            onClick={() => setActiveNav("event-types")}
          />
          <NavItem
            icon={<IconBookOpen size={16} />}
            label="Bookings"
            active={activeNav === "bookings"}
            onClick={() => setActiveNav("bookings")}
          />
          <NavItem
            icon={<IconClock size={16} />}
            label="Availability"
            active={activeNav === "availability"}
            onClick={() => setActiveNav("availability")}
          />
          <NavItem
            icon={<IconUsers size={16} />}
            label="Teams"
            active={activeNav === "teams"}
            onClick={() => setActiveNav("teams")}
            badge="i"
          />
          <NavItem
            icon={<IconGrid size={16} />}
            label="Apps"
            active={activeNav === "apps"}
            expandable
            onClick={() => setActiveNav("apps")}
          />
          <NavItem
            icon={<IconGitBranch size={16} />}
            label="Routing"
            active={activeNav === "routing"}
            onClick={() => setActiveNav("routing")}
          />
          <NavItem
            icon={<IconZap size={16} />}
            label="Workflows"
            active={activeNav === "workflows"}
            onClick={() => setActiveNav("workflows")}
          />
          <NavItem
            icon={<IconBarChart size={16} />}
            label="Insights"
            active={activeNav === "insights"}
            expandable
            onClick={() => setActiveNav("insights")}
          />
        </nav>

        {/* Bottom links */}
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

      {/* ─── Main Content ─── */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="dash-topbar__left">
            <h1 className="dash-topbar__title">Event types</h1>
            <p className="dash-topbar__subtitle">
              Configure different events for people to book on your calendar.
            </p>
          </div>
          <div className="dash-topbar__right">
            <div className="dash-search-bar">
              <IconSearch size={14} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dash-search-bar__input"
                id="event-search"
              />
            </div>
            <button
              className="dash-btn dash-btn--primary"
              onClick={() => setShowModal(true)}
              id="new-event-btn"
            >
              <IconPlus size={14} />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="dash-event-list">
          {filteredEvents.length === 0 && (
            <div className="dash-event-list__empty">
              <p>No event types found.</p>
            </div>
          )}
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onToggle={handleToggle}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>

      {/* ─── Modal ─── */}
      {showModal && (
        <NewEventModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveNew}
        />
      )}

      {/* ─── Toast ─── */}
      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </div>
  );
}
