import { pgTable, text, varchar, integer, decimal, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const busOperators = pgTable("bus_operators", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.0"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").default(true),
});

export const busOperatorsRelations = relations(busOperators, ({ many }) => ({
  buses: many(buses),
}));

export const buses = pgTable("buses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  operatorId: integer("operator_id").references(() => busOperators.id).notNull(),
  busNumber: text("bus_number").notNull(),
  busType: text("bus_type").notNull(),
  totalSeats: integer("total_seats").notNull(),
  amenities: text("amenities").array(),
  isActive: boolean("is_active").default(true),
});

export const busesRelations = relations(buses, ({ one, many }) => ({
  operator: one(busOperators, {
    fields: [buses.operatorId],
    references: [busOperators.id],
  }),
  schedules: many(schedules),
  seats: many(seats),
}));

export const routes = pgTable("routes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fromCity: text("from_city").notNull(),
  toCity: text("to_city").notNull(),
  distance: integer("distance"),
  estimatedDuration: text("estimated_duration").notNull(),
  isActive: boolean("is_active").default(true),
});

export const routesRelations = relations(routes, ({ many }) => ({
  schedules: many(schedules),
}));

export const schedules = pgTable("schedules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  busId: integer("bus_id").references(() => buses.id).notNull(),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  travelDate: text("travel_date").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  boardingPoint: text("boarding_point").notNull(),
  dropPoint: text("drop_point").notNull(),
  isActive: boolean("is_active").default(true),
});

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  bus: one(buses, {
    fields: [schedules.busId],
    references: [buses.id],
  }),
  route: one(routes, {
    fields: [schedules.routeId],
    references: [routes.id],
  }),
  seatAvailability: many(seatAvailability),
  bookings: many(bookings),
}));

export const seats = pgTable("seats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  busId: integer("bus_id").references(() => buses.id).notNull(),
  seatNumber: text("seat_number").notNull(),
  deck: text("deck").notNull(),
  seatType: text("seat_type").notNull(),
  position: text("position").notNull(),
});

export const seatsRelations = relations(seats, ({ one, many }) => ({
  bus: one(buses, {
    fields: [seats.busId],
    references: [buses.id],
  }),
  availability: many(seatAvailability),
}));

export const seatAvailability = pgTable("seat_availability", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  scheduleId: integer("schedule_id").references(() => schedules.id).notNull(),
  seatId: integer("seat_id").references(() => seats.id).notNull(),
  status: text("status").notNull().default("available"),
  lockedUntil: timestamp("locked_until"),
  lockedByUserId: integer("locked_by_user_id").references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const seatAvailabilityRelations = relations(seatAvailability, ({ one }) => ({
  schedule: one(schedules, {
    fields: [seatAvailability.scheduleId],
    references: [schedules.id],
  }),
  seat: one(seats, {
    fields: [seatAvailability.seatId],
    references: [seats.id],
  }),
  lockedByUser: one(users, {
    fields: [seatAvailability.lockedByUserId],
    references: [users.id],
  }),
}));

export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  scheduleId: integer("schedule_id").references(() => schedules.id).notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  schedule: one(schedules, {
    fields: [bookings.scheduleId],
    references: [schedules.id],
  }),
  passengers: many(passengers),
}));

export const passengers = pgTable("passengers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  seatId: integer("seat_id").references(() => seats.id).notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
});

export const passengersRelations = relations(passengers, ({ one }) => ({
  booking: one(bookings, {
    fields: [passengers.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [passengers.seatId],
    references: [seats.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
}).omit({ id: true, createdAt: true });

export const insertBusOperatorSchema = createInsertSchema(busOperators, {
  name: z.string().min(1),
}).omit({ id: true });

export const insertBusSchema = createInsertSchema(buses, {
  busNumber: z.string().min(1),
  busType: z.string().min(1),
}).omit({ id: true });

export const insertRouteSchema = createInsertSchema(routes, {
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
}).omit({ id: true });

export const insertScheduleSchema = createInsertSchema(schedules, {
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
}).omit({ id: true });

export const insertSeatSchema = createInsertSchema(seats, {
  seatNumber: z.string().min(1),
}).omit({ id: true });

export const insertSeatAvailabilitySchema = createInsertSchema(seatAvailability, {
  price: z.string(),
}).omit({ id: true });

export const insertBookingSchema = createInsertSchema(bookings, {
  ticketNumber: z.string().min(1),
  contactEmail: z.string().email(),
}).omit({ id: true, createdAt: true });

export const insertPassengerSchema = createInsertSchema(passengers, {
  name: z.string().min(1),
}).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusOperator = z.infer<typeof insertBusOperatorSchema>;
export type BusOperator = typeof busOperators.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;
export type Bus = typeof buses.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type Seat = typeof seats.$inferSelect;
export type InsertSeatAvailability = z.infer<typeof insertSeatAvailabilitySchema>;
export type SeatAvailability = typeof seatAvailability.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type Passenger = typeof passengers.$inferSelect;
