import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BookingCard, { type BookingData } from "@/components/BookingCard";
import TicketModal from "@/components/TicketModal";
import AuthModal from "@/components/AuthModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Search } from "lucide-react";

// todo: remove mock functionality
const mockBookings: BookingData[] = [
  {
    id: "booking-1",
    ticketNumber: "BUSGO-2024-ABC123",
    status: "confirmed",
    operator: "Express Travels",
    from: "New York",
    to: "Boston",
    date: "Dec 15, 2025",
    departureTime: "10:30 PM",
    arrivalTime: "06:45 AM",
    seats: ["1A", "2A"],
    totalAmount: 94.5,
  },
  {
    id: "booking-2",
    ticketNumber: "BUSGO-2024-DEF456",
    status: "completed",
    operator: "City Connect",
    from: "Los Angeles",
    to: "San Francisco",
    date: "Nov 20, 2025",
    departureTime: "09:00 AM",
    arrivalTime: "03:00 PM",
    seats: ["5B"],
    totalAmount: 42,
  },
  {
    id: "booking-3",
    ticketNumber: "BUSGO-2024-GHI789",
    status: "cancelled",
    operator: "Premium Bus Lines",
    from: "Chicago",
    to: "Detroit",
    date: "Oct 10, 2025",
    departureTime: "11:00 PM",
    arrivalTime: "04:00 AM",
    seats: ["3A", "3B", "4A"],
    totalAmount: 84,
  },
];

// todo: remove mock functionality
const getMockTicket = (booking: BookingData) => ({
  ticketNumber: booking.ticketNumber,
  status: booking.status as "confirmed" | "completed",
  operator: booking.operator,
  busType: "AC Sleeper (2+1)",
  from: booking.from,
  to: booking.to,
  date: booking.date,
  departureTime: booking.departureTime,
  arrivalTime: booking.arrivalTime,
  duration: "8h 15m",
  passengers: booking.seats.map((seat, i) => ({
    name: i === 0 ? "John Doe" : "Jane Doe",
    seat,
    age: 28 + i,
  })),
  totalAmount: booking.totalAmount,
  boardingPoint: "Main Terminal, Platform 5",
  dropPoint: "Central Station",
});

interface BookingsPageProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function BookingsPage({ isLoggedIn = false, userName, onLogin, onLogout }: BookingsPageProps) {
  const [, navigate] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const upcomingBookings = mockBookings.filter((b) => b.status === "confirmed");
  const pastBookings = mockBookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const handleViewTicket = (bookingId: string) => {
    const booking = mockBookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setTicketModalOpen(true);
    }
  };

  const handleDownloadTicket = (bookingId: string) => {
    console.log("Downloading ticket for:", bookingId);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isLoggedIn={false}
          onLogin={() => setAuthOpen(true)}
        />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your bookings</h1>
          <p className="text-muted-foreground mb-6">
            Access your tickets, manage bookings, and track your journeys
          </p>
          <Button onClick={() => setAuthOpen(true)} data-testid="button-signin-bookings">
            Sign In
          </Button>
        </main>
        <AuthModal
          open={authOpen}
          onOpenChange={setAuthOpen}
          onLogin={(email, password) => {
            console.log("Login:", email);
            setAuthOpen(false);
            if (onLogin) onLogin();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => setAuthOpen(true)}
        onLogout={onLogout}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-bookings-title">My Bookings</h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No upcoming trips</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Plan your next journey today
                </p>
                <Button onClick={() => navigate("/")} data-testid="button-search-buses">
                  <Search className="w-4 h-4 mr-2" />
                  Search Buses
                </Button>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewTicket={handleViewTicket}
                  onDownloadTicket={handleDownloadTicket}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No past bookings</h3>
                <p className="text-sm text-muted-foreground">
                  Your completed and cancelled trips will appear here
                </p>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewTicket={handleViewTicket}
                  onDownloadTicket={handleDownloadTicket}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <TicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        ticket={selectedBooking ? getMockTicket(selectedBooking) : null}
        onDownload={() => console.log("Download ticket")}
      />

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={(email, password) => {
          console.log("Login:", email);
          setAuthOpen(false);
          if (onLogin) onLogin();
        }}
      />
    </div>
  );
}
