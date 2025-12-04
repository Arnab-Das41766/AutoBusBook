import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, MapPin, Clock, Calendar, User, QrCode, Home } from "lucide-react";

// todo: remove mock functionality
const mockConfirmation = {
  ticketNumber: "BUSGO-2024-XYZ789",
  operator: "Express Travels",
  busType: "AC Sleeper (2+1)",
  from: "New York",
  to: "Boston",
  date: "December 15, 2025",
  departureTime: "10:30 PM",
  arrivalTime: "06:45 AM",
  duration: "8h 15m",
  passengers: [
    { name: "John Doe", seat: "1A", age: 28 },
    { name: "Jane Doe", seat: "2A", age: 25 },
  ],
  totalAmount: 94.5,
  boardingPoint: "Port Authority Bus Terminal, Gate 14",
  dropPoint: "South Station, Platform 3",
};

interface BookingConfirmationPageProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export default function BookingConfirmationPage({ isLoggedIn = true, userName = "John Doe", onLogout }: BookingConfirmationPageProps) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={onLogout}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2" data-testid="text-confirmation-title">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your e-ticket has been sent to your email
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Ticket Number</p>
              <p className="font-mono font-semibold text-lg" data-testid="text-confirmation-ticket">
                {mockConfirmation.ticketNumber}
              </p>
            </div>
            <Badge variant="default">Confirmed</Badge>
          </div>

          <Separator className="my-4" />

          <div className="text-center p-3 bg-muted rounded-md mb-4">
            <p className="font-semibold">{mockConfirmation.operator}</p>
            <p className="text-sm text-muted-foreground">{mockConfirmation.busType}</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">From</span>
              </div>
              <p className="font-semibold">{mockConfirmation.from}</p>
              <p className="text-sm text-muted-foreground">{mockConfirmation.departureTime}</p>
              <p className="text-xs text-muted-foreground mt-1">{mockConfirmation.boardingPoint}</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">{mockConfirmation.duration}</span>
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-muted-foreground">To</span>
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold">{mockConfirmation.to}</p>
              <p className="text-sm text-muted-foreground">{mockConfirmation.arrivalTime}</p>
              <p className="text-xs text-muted-foreground mt-1">{mockConfirmation.dropPoint}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{mockConfirmation.date}</span>
          </div>

          <Separator className="my-4" />

          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Passengers</p>
            <div className="space-y-2">
              {mockConfirmation.passengers.map((passenger, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{passenger.name}</span>
                    <span className="text-muted-foreground">({passenger.age} yrs)</span>
                  </div>
                  <Badge variant="outline">Seat {passenger.seat}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total Paid</span>
            <span data-testid="text-confirmation-total">${mockConfirmation.totalAmount}</span>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-32 h-32 mx-auto text-foreground" />
              <p className="text-xs text-muted-foreground mt-2">Scan for verification at boarding</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" data-testid="button-download-ticket">
            <Download className="w-4 h-4 mr-2" />
            Download Ticket
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate("/")} data-testid="button-back-home">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          A confirmation email has been sent to your registered email address.
          Please arrive at the boarding point at least 15 minutes before departure.
        </p>
      </main>
    </div>
  );
}
