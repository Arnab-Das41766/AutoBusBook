import BookingCard, { type BookingData } from "../BookingCard";

// todo: remove mock functionality
const mockBooking: BookingData = {
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
};

export default function BookingCardExample() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <BookingCard
        booking={mockBooking}
        onViewTicket={(id) => console.log("View ticket:", id)}
        onDownloadTicket={(id) => console.log("Download ticket:", id)}
      />
    </div>
  );
}
