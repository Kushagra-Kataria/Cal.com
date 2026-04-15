import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());

const users = [];
const sessions = new Map();
const bookings = [];

const eventTypes = [
  {
    id: "event-15",
    title: "Quick Intro",
    durationMinutes: 15,
    description: "A short intro meeting",
  },
  {
    id: "event-30",
    title: "30 Minute Call",
    durationMinutes: 30,
    description: "General discussion and planning",
  },
  {
    id: "event-60",
    title: "Deep Dive Session",
    durationMinutes: 60,
    description: "Long-form product and roadmap discussion",
  },
];

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function issueSession(user) {
  const token = id("token");
  sessions.set(token, user.id);

  return {
    token,
    user,
  };
}

function findOrCreateUser({ name, email }) {
  const normalizedEmail = String(email || "").trim().toLowerCase() || `${id("guest")}@demo.local`;
  const normalizedName = String(name || "").trim() || "Demo User";

  let user = users.find((candidate) => candidate.email === normalizedEmail);
  if (!user) {
    user = {
      id: id("user"),
      name: normalizedName,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
  } else if (normalizedName && user.name !== normalizedName) {
    user.name = normalizedName;
  }

  return user;
}

function getBaseSlotsByDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return [];
  }

  const weekday = date.getDay();

  if (weekday === 0 || weekday === 6) {
    return [];
  }

  if (weekday === 5) {
    return ["10:00", "11:00", "12:00", "14:00", "15:00"];
  }

  return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
}

function computeAvailability(eventTypeId, date) {
  const baseSlots = getBaseSlotsByDate(date);
  const blocked = new Set(
    bookings
      .filter((booking) => booking.eventTypeId === eventTypeId && booking.date === date)
      .map((booking) => booking.time),
  );

  return baseSlots.filter((slot) => !blocked.has(slot));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/signup", (req, res) => {
  const user = findOrCreateUser(req.body || {});
  const session = issueSession(user);

  res.status(201).json(session);
});

app.post("/api/auth/login", (req, res) => {
  const user = findOrCreateUser(req.body || {});
  const session = issueSession(user);

  res.json(session);
});

app.get("/api/event-types", (_req, res) => {
  res.json({ eventTypes });
});

app.get("/api/availability", (req, res) => {
  const eventTypeId = String(req.query.eventTypeId || "");
  const date = String(req.query.date || "");

  if (!eventTypeId || !date) {
    return res.status(400).json({ message: "eventTypeId and date are required" });
  }

  const eventType = eventTypes.find((item) => item.id === eventTypeId);
  if (!eventType) {
    return res.status(404).json({ message: "Event type not found" });
  }

  const slots = computeAvailability(eventType.id, date);

  return res.json({
    eventTypeId,
    date,
    slots,
  });
});

app.post("/api/bookings", (req, res) => {
  const payload = req.body || {};
  const eventTypeId = String(payload.eventTypeId || "");
  const date = String(payload.date || "");
  const time = String(payload.time || "");
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();

  if (!eventTypeId || !date || !time || !name || !email) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const eventType = eventTypes.find((item) => item.id === eventTypeId);
  if (!eventType) {
    return res.status(404).json({ message: "Event type not found" });
  }

  const allowedSlots = computeAvailability(eventType.id, date);
  if (!allowedSlots.includes(time)) {
    return res.status(409).json({ message: "Selected time is no longer available" });
  }

  const booking = {
    id: id("booking"),
    eventTypeId: eventType.id,
    eventTitle: eventType.title,
    durationMinutes: eventType.durationMinutes,
    date,
    time,
    name,
    email,
    joinUrl: `http://localhost:3000/meeting?booking=${id("join")}`,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);

  return res.status(201).json({ booking });
});

app.get("/api/bookings", (_req, res) => {
  res.json({ bookings });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
