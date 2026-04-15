"use client";

import { useState } from "react";
import { IconFilter, IconChevronDown, IconCalendar, IconSliders } from "../../components/Icons";

const TABS = ["Upcoming", "Unconfirmed", "Recurring", "Past", "Cancelled"];

/* ─── Sample bookings data (for Past/Cancelled to show some content) ─── */
const SAMPLE_BOOKINGS = [
  {
    id: 1,
    title: "30 min meeting",
    attendee: "John Doe",
    email: "john@example.com",
    date: "Apr 10, 2025",
    time: "10:00 AM – 10:30 AM",
    status: "completed",
    tab: "Past",
  },
  {
    id: 2,
    title: "15 min meeting",
    attendee: "Jane Smith",
    email: "jane@example.com",
    date: "Apr 8, 2025",
    time: "2:00 PM – 2:15 PM",
    status: "completed",
    tab: "Past",
  },
  {
    id: 3,
    title: "30 min meeting",
    attendee: "Bob Wilson",
    email: "bob@example.com",
    date: "Apr 5, 2025",
    time: "9:00 AM – 9:30 AM",
    status: "cancelled",
    tab: "Cancelled",
  },
];

/* ─── Empty State ─── */
function EmptyState({ tab }) {
  const messages = {
    Upcoming: { title: "No upcoming bookings", desc: "You have no upcoming bookings. As soon as someone books a time with you it will show up here." },
    Unconfirmed: { title: "No unconfirmed bookings", desc: "You have no bookings requiring confirmation." },
    Recurring: { title: "No recurring bookings", desc: "You don't have any recurring bookings yet." },
    Past: { title: "No past bookings", desc: "You don't have any past bookings." },
    Cancelled: { title: "No cancelled bookings", desc: "You don't have any cancelled bookings." },
  };

  const msg = messages[tab] || messages.Upcoming;

  return (
    <div className="bookings-empty">
      <div className="bookings-empty__icon">
        <IconCalendar size={40} />
      </div>
      <h3 className="bookings-empty__title">{msg.title}</h3>
      <p className="bookings-empty__desc">{msg.desc}</p>
    </div>
  );
}

/* ─── Booking Card ─── */
function BookingCard({ booking }) {
  return (
    <div className={`booking-card ${booking.status === "cancelled" ? "booking-card--cancelled" : ""}`}>
      <div className="booking-card__left">
        <div className="booking-card__color" />
        <div className="booking-card__info">
          <div className="booking-card__title-row">
            <span className="booking-card__title">{booking.title}</span>
            <span className={`booking-card__status booking-card__status--${booking.status}`}>
              {booking.status === "completed" ? "Completed" : "Cancelled"}
            </span>
          </div>
          <div className="booking-card__meta">
            <span className="booking-card__attendee">{booking.attendee}</span>
            <span className="booking-card__separator">·</span>
            <span className="booking-card__email">{booking.email}</span>
          </div>
          <div className="booking-card__time">
            <IconCalendar size={12} />
            <span>{booking.date}</span>
            <span className="booking-card__separator">·</span>
            <span>{booking.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bookings Page ─── */
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showFilters, setShowFilters] = useState(false);

  const bookingsForTab = SAMPLE_BOOKINGS.filter((b) => b.tab === activeTab);

  return (
    <>
      {/* ─── Top bar ─── */}
      <div className="dash-topbar">
        <div className="dash-topbar__left">
          <h1 className="dash-topbar__title">Bookings</h1>
          <p className="dash-topbar__subtitle">
            See upcoming and past events booked through your event type links.
          </p>
        </div>
      </div>

      {/* ─── Tabs + Filter Row ─── */}
      <div className="bookings-toolbar">
        <div className="bookings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`bookings-tab ${activeTab === tab ? "bookings-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}

          <button
            className={`bookings-filter-btn ${showFilters ? "bookings-filter-btn--active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <IconFilter size={14} />
            <span>Filter</span>
          </button>
        </div>

        <button className="bookings-saved-filters">
          <IconSliders size={14} />
          <span>Saved filters</span>
          <IconChevronDown size={12} />
        </button>
      </div>

      {/* ─── Content ─── */}
      <div className="bookings-content">
        {bookingsForTab.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="bookings-list">
            {bookingsForTab.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
