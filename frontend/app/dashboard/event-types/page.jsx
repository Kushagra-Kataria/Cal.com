"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../../../lib/apiClient";
import {
  IconSearch, IconClock, IconExternalLink, IconLink, IconMoreHorizontal,
  IconPlus, IconX,
} from "../../components/Icons";

function normalizeEventType(eventType) {
  return {
    id: eventType.id,
    name: eventType.name,
    slug: eventType.slug,
    duration: eventType.duration,
    enabled: eventType.enabled,
  };
}

/* ─── Toggle ─── */
function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      className={`dash-toggle ${checked ? "dash-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="dash-toggle__thumb" />
    </button>
  );
}

/* ─── Toast ─── */
function Toast({ message, visible, onHide }) {
  useEffect(() => { if (visible) { const t = setTimeout(onHide, 2500); return () => clearTimeout(t); } }, [visible, onHide]);
  return (
    <div className={`dash-toast ${visible ? "dash-toast--visible" : ""}`}>
      <IconLink size={14} /><span>{message}</span>
    </div>
  );
}

/* ─── New Event Modal ─── */
function NewEventModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      duration: parseInt(duration, 10),
    });
  }

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dash-modal__header">
          <h3>Add a new event type</h3>
          <button className="dash-modal__close" onClick={onClose}><IconX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="dash-modal__form">
          <label className="dash-modal__label">
            <span>Title</span>
            <input ref={nameRef} type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Quick chat" className="dash-modal__input" required />
          </label>
          <label className="dash-modal__label">
            <span>Duration (minutes)</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="dash-modal__input">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <div className="dash-modal__actions">
            <button type="button" className="dash-btn dash-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="dash-btn dash-btn--primary">Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── More Menu ─── */
function MoreMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }
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
          <button className="dash-dropdown__item" onClick={() => { onEdit(); setOpen(false); }}>Edit</button>
          <button className="dash-dropdown__item" onClick={() => { onDuplicate(); setOpen(false); }}>Duplicate</button>
          <button className="dash-dropdown__item dash-dropdown__item--danger" onClick={() => { onDelete(); setOpen(false); }}>Delete</button>
        </div>
      )}
    </div>
  );
}

/* ─── Event Card ─── */
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
            <IconClock size={12} />{event.duration}m
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
        <MoreMenu onEdit={() => onEdit(event.id)} onDuplicate={() => onDuplicate(event.id)} onDelete={() => onDelete(event.id)} />
      </div>
    </div>
  );
}

/* ─── Event Types Page ─── */
export default function EventTypesPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEventTypes() {
      setLoading(true);
      try {
        const payload = await apiFetch("/api/event-types");
        if (cancelled) {
          return;
        }
        const incoming = Array.isArray(payload.eventTypes) ? payload.eventTypes : [];
        setEvents(incoming.map(normalizeEventType));
      } catch (err) {
        if (!cancelled) {
          setToastMsg(err.message || "Failed to load event types");
          setToastVisible(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEventTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggle(id, val) {
    const current = events.find((ev) => ev.id === id);
    if (!current) {
      return;
    }

    const previous = current.enabled;
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, enabled: val } : ev)));

    try {
      const payload = await apiFetch(`/api/event-types/${id}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: val }),
      });
      const updated = payload.eventType ? normalizeEventType(payload.eventType) : null;
      if (updated) {
        setEvents((prev) => prev.map((ev) => (ev.id === id ? updated : ev)));
      }
    } catch (err) {
      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, enabled: previous } : ev)));
      setToastMsg(err.message || "Failed to update event");
      setToastVisible(true);
    }
  }

  function handleCopy(slug) {
    const url = `${window.location.origin}${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setToastMsg("Link copied to clipboard!"); setToastVisible(true);
    }).catch(() => {
      setToastMsg("Failed to copy"); setToastVisible(true);
    });
  }

  async function handleDuplicate(id) {
    try {
      const payload = await apiFetch(`/api/event-types/${id}/duplicate`, {
        method: "POST",
      });
      const duplicate = payload.eventType ? normalizeEventType(payload.eventType) : null;
      if (!duplicate) {
        return;
      }
      setEvents((prev) => {
        const sourceIndex = prev.findIndex((ev) => ev.id === id);
        if (sourceIndex < 0) {
          return [...prev, duplicate];
        }
        const next = [...prev];
        next.splice(sourceIndex + 1, 0, duplicate);
        return next;
      });
    } catch (err) {
      setToastMsg(err.message || "Failed to duplicate event");
      setToastVisible(true);
    }
  }

  async function handleDelete(id) {
    const previous = events;
    setEvents((prev) => prev.filter((ev) => ev.id !== id));

    try {
      await apiFetch(`/api/event-types/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      setEvents(previous);
      setToastMsg(err.message || "Failed to delete event");
      setToastVisible(true);
    }
  }

  async function handleEdit(id) {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const newName = prompt("Edit event name:", ev.name);
    if (newName && newName.trim()) {
      const previous = { ...ev };
      setEvents((prev) => prev.map((e) =>
        e.id === id ? { ...e, name: newName.trim() } : e
      ));

      try {
        const payload = await apiFetch(`/api/event-types/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name: newName.trim() }),
        });
        const updated = payload.eventType ? normalizeEventType(payload.eventType) : null;
        if (updated) {
          setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
        }
      } catch (err) {
        setEvents((prev) => prev.map((e) => (e.id === id ? previous : e)));
        setToastMsg(err.message || "Failed to edit event");
        setToastVisible(true);
      }
    }
  }

  async function handleSaveNew(ev) {
    try {
      const payload = await apiFetch("/api/event-types", {
        method: "POST",
        body: JSON.stringify({
          name: ev.name,
          duration: ev.duration,
        }),
      });
      const created = payload.eventType ? normalizeEventType(payload.eventType) : null;
      if (created) {
        setEvents((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (err) {
      setToastMsg(err.message || "Failed to create event");
      setToastVisible(true);
    }
  }

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Event types</h1>
          <p className="dash-topbar__subtitle">Configure different events for people to book on your calendar.</p>
        </div>
        <div className="dash-topbar__right">
          <div className="dash-search-bar">
            <IconSearch size={14} />
            <input type="text" placeholder="Search" value={search}
              onChange={(e) => setSearch(e.target.value)} className="dash-search-bar__input" id="event-search" />
          </div>
          <button className="dash-btn dash-btn--primary" onClick={() => setShowModal(true)} id="new-event-btn">
            <IconPlus size={14} /><span>New</span>
          </button>
        </div>
      </div>

      <div className="dash-event-list">
        {loading && <div className="dash-event-list__empty"><p>Loading event types...</p></div>}
        {!loading && filteredEvents.length === 0 && (
          <div className="dash-event-list__empty"><p>No event types found.</p></div>
        )}
        {!loading && filteredEvents.map((ev) => (
          <EventCard key={ev.id} event={ev} onToggle={handleToggle} onCopy={handleCopy}
            onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete} />
        ))}
      </div>

      {showModal && <NewEventModal onClose={() => setShowModal(false)} onSave={handleSaveNew} />}
      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </>
  );
}
