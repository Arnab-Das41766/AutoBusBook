import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import Header from "@/components/Header";
import SeatMap, { type Seat } from "@/components/SeatMap";
import BookingSummary from "@/components/BookingSummary";
import AuthModal from "@/components/AuthModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Star, MapPin } from "lucide-react";

// todo: remove mock functionality
const mockBusDetails = {
  id: "bus-1",
  operator: "Express Travels",
  rating: 4.5,
  departureTime: "10:30 PM",
  arrivalTime: "06:45 AM",
  duration: "8h 15m",
  busType: "AC Sleeper",
  from: "New York",
  to: "Boston",
  date: "Dec 15, 2025",
  pricePerSeat: 45,
  boardingPoint: "Port Authority Bus Terminal",
  dropPoint: "South Station",
};

// todo: remove mock functionality
const generateMockSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const statuses: Seat["status"][] = ["available", "booked", "female", "available"];

  for (let i = 1; i <= 20; i++) {
    const deck = i <= 12 ? "lower" : "upper";
    const col = ((i - 1) % 4);
    const type: Seat["type"] = col === 0 || col === 3 ? "window" : "aisle";
    const status = Math.random() > 0.7 ? statuses[Math.floor(Math.random() * statuses.length)] : "available";

    seats.push({
      id: `seat-${i}`,
      number: `${i}`,
      status,
      price: deck === "upper" ? 50 : 45,
      deck,
      type,
    });
  }
  return seats;
};

interface SeatSelectionPageProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function SeatSelectionPage({ isLoggedIn = false, userName, onLogin, onLogout }: SeatSelectionPageProps) {
  const [, navigate] = useLocation();
  const params = useParams<{ busId: string }>();
  const [authOpen, setAuthOpen] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    setSeats(generateMockSeats());
  }, []);

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const avgPrice = selectedSeats.length > 0 ? totalPrice / selectedSeats.length : mockBusDetails.pricePerSeat;

  const handleSeatSelect = (seatIds: string[]) => {
    setSelectedSeatIds(seatIds);
    setShowBooking(seatIds.length > 0);
  };

  const handleConfirmBooking = (passengers: any[], email: string, phone: string) => {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    console.log("Booking confirmed:", { passengers, email, phone, seats: selectedSeatIds });
    navigate("/booking-confirmation");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => setAuthOpen(true)}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold" data-testid="text-operator-name">{mockBusDetails.operator}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {mockBusDetails.rating}
                </Badge>
                <Badge variant="outline">{mockBusDetails.busType}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{mockBusDetails.from}</span>
                  <span className="text-muted-foreground">{mockBusDetails.departureTime}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{mockBusDetails.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{mockBusDetails.to}</span>
                  <span className="text-muted-foreground">{mockBusDetails.arrivalTime}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">{mockBusDetails.date}</p>
              <p className="text-lg font-semibold">From ${mockBusDetails.pricePerSeat}/seat</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Select Your Seats</h2>
            <SeatMap
              seats={seats}
              onSeatSelect={handleSeatSelect}
              maxSeats={6}
            />
          </div>

          <div className="lg:col-span-1">
            {showBooking ? (
              <div className="sticky top-20">
                <h2 className="text-lg font-semibold mb-4">Complete Your Booking</h2>
                <BookingSummary
                  busOperator={mockBusDetails.operator}
                  from={mockBusDetails.from}
                  to={mockBusDetails.to}
                  date={mockBusDetails.date}
                  departureTime={mockBusDetails.departureTime}
                  arrivalTime={mockBusDetails.arrivalTime}
                  duration={mockBusDetails.duration}
                  selectedSeats={selectedSeats.map((s) => s.number)}
                  pricePerSeat={avgPrice}
                  onConfirm={handleConfirmBooking}
                />
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground mb-2">Select seats to continue</p>
                <p className="text-sm text-muted-foreground">
                  Click on available seats on the left to select them
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={(email, password) => {
          console.log("Login:", email);
          setAuthOpen(false);
          if (onLogin) onLogin();
        }}
        onSignup={(name, email, password) => {
          console.log("Signup:", name, email);
          setAuthOpen(false);
          if (onLogin) onLogin();
        }}
      />
    </div>
  );
}
