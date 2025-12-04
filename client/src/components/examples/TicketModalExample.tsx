import { useState } from "react";
import TicketModal from "../TicketModal";
import { Button } from "@/components/ui/button";

// todo: remove mock functionality
const mockTicket = {
  ticketNumber: "BUSGO-2024-ABC123",
  status: "confirmed" as const,
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
  boardingPoint: "Port Authority Bus Terminal",
  dropPoint: "South Station",
};

export default function TicketModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>View Ticket</Button>
      <TicketModal
        open={open}
        onOpenChange={setOpen}
        ticket={mockTicket}
        onDownload={() => console.log("Download ticket")}
      />
    </div>
  );
}
