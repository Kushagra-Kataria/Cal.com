"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, clearSession, readSession } from "../../lib/apiClient";

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const defaultDate = toInputDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

export default function MeetingPage() {
  const [session, setSession] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const currentSession = readSession();
    setSession(currentSession);

    if (currentSession?.user?.name) {
      setName(currentSession.user.name);
    }

    if (currentSession?.user?.email) {
      setEmail(currentSession.user.email);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoadingEvents(true);
      setError("");

      try {
        const payload = await apiFetch("/api/event-types");
        if (cancelled) {
          return;
        }

        const incoming = Array.isArray(payload.eventTypes) ? payload.eventTypes : [];
        setEventTypes(incoming);
        setSelectedEventTypeId(incoming[0]?.id || "");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load event types");
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedEventTypeId || !date) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setError("");

      try {
        const payload = await apiFetch(
          `/api/availability?eventTypeId=${encodeURIComponent(selectedEventTypeId)}&date=${encodeURIComponent(date)}`,
        );

        if (cancelled) {
          return;
        }

        const nextSlots = Array.isArray(payload.slots) ? payload.slots : [];
        setSlots(nextSlots);
        setSelectedSlot(nextSlots[0] || "");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load slots");
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedEventTypeId, date]);

  const selectedEventType = useMemo(
    () => eventTypes.find((item) => item.id === selectedEventTypeId) || null,
    [eventTypes, selectedEventTypeId],
  );

  async function handleBook(event) {
    event.preventDefault();
    setBookingLoading(true);
    setError("");

    try {
      const payload = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          eventTypeId: selectedEventTypeId,
          date,
          time: selectedSlot,
          name,
          email,
        }),
      });

      setBooking(payload.booking || null);
    } catch (err) {
      setError(err.message || "Could not create booking");
    } finally {
      setBookingLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  return (
    <main className="portal-shell meeting-shell">
      <header className="portal-nav">
        <Link href="/" className="logo-link">
          Cal.com Demo
        </Link>

        <nav className="portal-nav-links">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
          {session ? (
            <button type="button" onClick={handleLogout} className="linkish-button">
              Logout
            </button>
          ) : null}
        </nav>
      </header>

      <section className="portal-card meeting-card">
        <div className="meeting-header">
          <p className="brand-chip">Meeting Scheduler</p>
          <h1>Book your Cal-style meeting</h1>
          <p>
            Pick event type, date and slot. This flow is backend connected with hardcoded demo logic for
            assessment.
          </p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {booking ? (
          <div className="booking-success">
            <h2>Meeting Confirmed</h2>
            <p>
              {booking.name} booked <strong>{booking.eventTitle}</strong> on {booking.date} at {booking.time}.
            </p>
            <p>Join URL: <a href={booking.joinUrl}>{booking.joinUrl}</a></p>
            <button type="button" className="portal-button" onClick={() => setBooking(null)}>
              Book another
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="meeting-grid">
            <label>
              Event Type
              <select
                value={selectedEventTypeId}
                onChange={(e) => setSelectedEventTypeId(e.target.value)}
                disabled={loadingEvents || eventTypes.length === 0}
              >
                {eventTypes.map((eventType) => (
                  <option key={eventType.id} value={eventType.id}>
                    {eventType.title} ({eventType.durationMinutes} min)
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <div className="slot-section">
              <p>Available times</p>
              {loadingSlots ? <span>Loading slots...</span> : null}
              {!loadingSlots && slots.length === 0 ? <span>No slots available.</span> : null}

              <div className="slot-grid">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={slot === selectedSlot ? "slot-button active" : "slot-button"}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <div className="meeting-summary">
              <p>
                <strong>Selected:</strong>{" "}
                {selectedEventType ? `${selectedEventType.title} on ${date} at ${selectedSlot || "-"}` : "-"}
              </p>
            </div>

            <button type="submit" className="portal-button" disabled={bookingLoading || !selectedSlot}>
              {bookingLoading ? "Booking..." : "Confirm meeting"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
