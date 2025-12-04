import {
  users, busOperators, buses, routes, schedules, seats, seatAvailability, bookings, passengers,
  type User, type InsertUser,
  type BusOperator, type InsertBusOperator,
  type Bus, type InsertBus,
  type Route, type InsertRoute,
  type Schedule, type InsertSchedule,
  type Seat, type InsertSeat,
  type SeatAvailability, type InsertSeatAvailability,
  type Booking, type InsertBooking,
  type Passenger, type InsertPassenger,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, lte } from "drizzle-orm";

type NewUser = typeof users.$inferInsert;
type NewBusOperator = typeof busOperators.$inferInsert;
type NewBus = typeof buses.$inferInsert;
type NewRoute = typeof routes.$inferInsert;
type NewSchedule = typeof schedules.$inferInsert;
type NewSeat = typeof seats.$inferInsert;
type NewSeatAvailability = typeof seatAvailability.$inferInsert;
type NewBooking = typeof bookings.$inferInsert;
type NewPassenger = typeof passengers.$inferInsert;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBusOperators(): Promise<BusOperator[]>;
  getBusOperator(id: number): Promise<BusOperator | undefined>;
  createBusOperator(operator: InsertBusOperator): Promise<BusOperator>;

  getBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
  getBusesByOperator(operatorId: number): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;

  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  searchRoutes(from: string, to: string): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;

  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  searchSchedules(routeId: number, date: string): Promise<Schedule[]>;
  searchSchedulesByCity(from: string, to: string, date: string): Promise<any[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateScheduleSeats(id: number, availableSeats: number): Promise<void>;

  getSeats(busId: number): Promise<Seat[]>;
  getSeat(id: number): Promise<Seat | undefined>;
  createSeat(seat: InsertSeat): Promise<Seat>;
  createSeats(seats: InsertSeat[]): Promise<Seat[]>;

  getSeatAvailability(scheduleId: number): Promise<any[]>;
  getSeatAvailabilityById(id: number): Promise<SeatAvailability | undefined>;
  createSeatAvailability(availability: InsertSeatAvailability): Promise<SeatAvailability>;
  createSeatAvailabilities(availabilities: InsertSeatAvailability[]): Promise<SeatAvailability[]>;
  lockSeats(seatAvailabilityIds: number[], userId: number, lockMinutes: number): Promise<void>;
  unlockExpiredSeats(): Promise<number>;
  updateSeatStatus(seatAvailabilityId: number, status: string): Promise<void>;

  getBookings(userId: number): Promise<any[]>;
  getBooking(id: number): Promise<any | undefined>;
  getBookingByTicket(ticketNumber: string): Promise<any | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string, paymentStatus: string): Promise<void>;

  getPassengers(bookingId: number): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  createPassengers(passengers: InsertPassenger[]): Promise<Passenger[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser as NewUser).returning();
    return user;
  }

  async getBusOperators(): Promise<BusOperator[]> {
    return db.select().from(busOperators).where(eq(busOperators.isActive, true));
  }

  async getBusOperator(id: number): Promise<BusOperator | undefined> {
    const [operator] = await db.select().from(busOperators).where(eq(busOperators.id, id));
    return operator || undefined;
  }

  async createBusOperator(operator: InsertBusOperator): Promise<BusOperator> {
    const [created] = await db.insert(busOperators).values(operator as NewBusOperator).returning();
    return created;
  }

  async getBuses(): Promise<Bus[]> {
    return db.select().from(buses).where(eq(buses.isActive, true));
  }

  async getBus(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus || undefined;
  }

  async getBusesByOperator(operatorId: number): Promise<Bus[]> {
    return db.select().from(buses).where(and(eq(buses.operatorId, operatorId), eq(buses.isActive, true)));
  }

  async createBus(bus: InsertBus): Promise<Bus> {
    const [created] = await db.insert(buses).values(bus as NewBus).returning();
    return created;
  }

  async getRoutes(): Promise<Route[]> {
    return db.select().from(routes).where(eq(routes.isActive, true));
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async searchRoutes(from: string, to: string): Promise<Route[]> {
    return db.select().from(routes).where(
      and(
        ilike(routes.fromCity, `%${from}%`),
        ilike(routes.toCity, `%${to}%`),
        eq(routes.isActive, true)
      )
    );
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [created] = await db.insert(routes).values(route as NewRoute).returning();
    return created;
  }

  async getSchedules(): Promise<Schedule[]> {
    return db.select().from(schedules).where(eq(schedules.isActive, true));
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule || undefined;
  }

  async searchSchedules(routeId: number, date: string): Promise<Schedule[]> {
    return db.select().from(schedules).where(
      and(
        eq(schedules.routeId, routeId),
        eq(schedules.travelDate, date),
        eq(schedules.isActive, true)
      )
    );
  }

  async searchSchedulesByCity(from: string, to: string, date: string): Promise<any[]> {
    const results = await db
      .select({
        schedule: schedules,
        route: routes,
        bus: buses,
        operator: busOperators,
      })
      .from(schedules)
      .innerJoin(routes, eq(schedules.routeId, routes.id))
      .innerJoin(buses, eq(schedules.busId, buses.id))
      .innerJoin(busOperators, eq(buses.operatorId, busOperators.id))
      .where(
        and(
          ilike(routes.fromCity, `%${from}%`),
          ilike(routes.toCity, `%${to}%`),
          eq(schedules.travelDate, date),
          eq(schedules.isActive, true)
        )
      );

    return results.map(r => ({
      id: r.schedule.id,
      operator: r.operator.name,
      rating: parseFloat(r.operator.rating || "4.0"),
      departureTime: r.schedule.departureTime,
      arrivalTime: r.schedule.arrivalTime,
      duration: r.route.estimatedDuration,
      busType: r.bus.busType,
      amenities: r.bus.amenities || [],
      availableSeats: r.schedule.availableSeats,
      price: parseFloat(r.schedule.basePrice),
      from: r.route.fromCity,
      to: r.route.toCity,
      busId: r.bus.id,
      boardingPoint: r.schedule.boardingPoint,
      dropPoint: r.schedule.dropPoint,
    }));
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [created] = await db.insert(schedules).values(schedule as NewSchedule).returning();
    return created;
  }

  async updateScheduleSeats(id: number, availableSeats: number): Promise<void> {
    await db.update(schedules).set({ availableSeats }).where(eq(schedules.id, id));
  }

  async getSeats(busId: number): Promise<Seat[]> {
    return db.select().from(seats).where(eq(seats.busId, busId));
  }

  async getSeat(id: number): Promise<Seat | undefined> {
    const [seat] = await db.select().from(seats).where(eq(seats.id, id));
    return seat || undefined;
  }

  async createSeat(seat: InsertSeat): Promise<Seat> {
    const [created] = await db.insert(seats).values(seat as NewSeat).returning();
    return created;
  }

  async createSeats(seatList: InsertSeat[]): Promise<Seat[]> {
    if (seatList.length === 0) return [];
    return db.insert(seats).values(seatList as NewSeat[]).returning();
  }

  async getSeatAvailability(scheduleId: number): Promise<any[]> {
    const results = await db
      .select({
        availability: seatAvailability,
        seat: seats,
      })
      .from(seatAvailability)
      .innerJoin(seats, eq(seatAvailability.seatId, seats.id))
      .where(eq(seatAvailability.scheduleId, scheduleId));

    return results.map(r => ({
      id: r.availability.id,
      seatId: r.seat.id,
      number: r.seat.seatNumber,
      status: r.availability.status,
      price: parseFloat(r.availability.price),
      deck: r.seat.deck,
      type: r.seat.position,
      lockedUntil: r.availability.lockedUntil,
    }));
  }

  async getSeatAvailabilityById(id: number): Promise<SeatAvailability | undefined> {
    const [availability] = await db.select().from(seatAvailability).where(eq(seatAvailability.id, id));
    return availability || undefined;
  }

  async createSeatAvailability(availability: InsertSeatAvailability): Promise<SeatAvailability> {
    const [created] = await db.insert(seatAvailability).values(availability as NewSeatAvailability).returning();
    return created;
  }

  async createSeatAvailabilities(availabilities: InsertSeatAvailability[]): Promise<SeatAvailability[]> {
    if (availabilities.length === 0) return [];
    return db.insert(seatAvailability).values(availabilities as NewSeatAvailability[]).returning();
  }

  async lockSeats(seatAvailabilityIds: number[], userId: number, lockMinutes: number): Promise<void> {
    const lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    for (const id of seatAvailabilityIds) {
      await db.update(seatAvailability)
        .set({
          status: "locked",
          lockedUntil: lockUntil,
          lockedByUserId: userId,
        })
        .where(eq(seatAvailability.id, id));
    }
  }

  async unlockExpiredSeats(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(seatAvailability)
      .set({
        status: "available",
        lockedUntil: null,
        lockedByUserId: null,
      })
      .where(
        and(
          eq(seatAvailability.status, "locked"),
          lte(seatAvailability.lockedUntil, now)
        )
      )
      .returning();
    return result.length;
  }

  async updateSeatStatus(seatAvailabilityId: number, status: string): Promise<void> {
    await db.update(seatAvailability)
      .set({
        status,
        lockedUntil: null,
        lockedByUserId: null,
      })
      .where(eq(seatAvailability.id, seatAvailabilityId));
  }

  async getBookings(userId: number): Promise<any[]> {
    const results = await db
      .select({
        booking: bookings,
        schedule: schedules,
        route: routes,
        bus: buses,
        operator: busOperators,
      })
      .from(bookings)
      .innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
      .innerJoin(routes, eq(schedules.routeId, routes.id))
      .innerJoin(buses, eq(schedules.busId, buses.id))
      .innerJoin(busOperators, eq(buses.operatorId, busOperators.id))
      .where(eq(bookings.userId, userId));

    const bookingsWithPassengers = await Promise.all(
      results.map(async (r) => {
        const passengerList = await this.getPassengers(r.booking.id);
        const seatNumbers = await Promise.all(
          passengerList.map(async (p) => {
            const seat = await this.getSeat(p.seatId);
            return seat?.seatNumber || "";
          })
        );
        return {
          id: r.booking.id,
          ticketNumber: r.booking.ticketNumber,
          status: r.booking.status,
          operator: r.operator.name,
          from: r.route.fromCity,
          to: r.route.toCity,
          date: r.schedule.travelDate,
          departureTime: r.schedule.departureTime,
          arrivalTime: r.schedule.arrivalTime,
          duration: r.route.estimatedDuration,
          seats: seatNumbers,
          totalAmount: parseFloat(r.booking.totalAmount),
          boardingPoint: r.schedule.boardingPoint,
          dropPoint: r.schedule.dropPoint,
          busType: r.bus.busType,
          passengers: passengerList,
        };
      })
    );

    return bookingsWithPassengers;
  }

  async getBooking(id: number): Promise<any | undefined> {
    const [result] = await db
      .select({
        booking: bookings,
        schedule: schedules,
        route: routes,
        bus: buses,
        operator: busOperators,
      })
      .from(bookings)
      .innerJoin(schedules, eq(bookings.scheduleId, schedules.id))
      .innerJoin(routes, eq(schedules.routeId, routes.id))
      .innerJoin(buses, eq(schedules.busId, buses.id))
      .innerJoin(busOperators, eq(buses.operatorId, busOperators.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    const passengerList = await this.getPassengers(result.booking.id);
    const seatNumbers = await Promise.all(
      passengerList.map(async (p) => {
        const seat = await this.getSeat(p.seatId);
        return seat?.seatNumber || "";
      })
    );

    return {
      id: result.booking.id,
      ticketNumber: result.booking.ticketNumber,
      status: result.booking.status,
      operator: result.operator.name,
      from: result.route.fromCity,
      to: result.route.toCity,
      date: result.schedule.travelDate,
      departureTime: result.schedule.departureTime,
      arrivalTime: result.schedule.arrivalTime,
      duration: result.route.estimatedDuration,
      seats: seatNumbers,
      totalAmount: parseFloat(result.booking.totalAmount),
      boardingPoint: result.schedule.boardingPoint,
      dropPoint: result.schedule.dropPoint,
      busType: result.bus.busType,
      passengers: passengerList,
    };
  }

  async getBookingByTicket(ticketNumber: string): Promise<any | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.ticketNumber, ticketNumber));
    if (!result) return undefined;
    return this.getBooking(result.id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking as NewBooking).returning();
    return created;
  }

  async updateBookingStatus(id: number, status: string, paymentStatus: string): Promise<void> {
    await db.update(bookings).set({ status, paymentStatus }).where(eq(bookings.id, id));
  }

  async getPassengers(bookingId: number): Promise<Passenger[]> {
    return db.select().from(passengers).where(eq(passengers.bookingId, bookingId));
  }

  async createPassenger(passenger: InsertPassenger): Promise<Passenger> {
    const [created] = await db.insert(passengers).values(passenger as NewPassenger).returning();
    return created;
  }

  async createPassengers(passengerList: InsertPassenger[]): Promise<Passenger[]> {
    if (passengerList.length === 0) return [];
    return db.insert(passengers).values(passengerList as NewPassenger[]).returning();
  }
}

export const storage = new DatabaseStorage();
