import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Download, Eye, Calendar } from "lucide-react";

export interface BookingData {
  id: string;
  ticketNumber: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  operator: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  totalAmount: number;
}

interface BookingCardProps {
  booking: BookingData;
  onViewTicket?: (bookingId: string) => void;
  onDownloadTicket?: (bookingId: string) => void;
}

const statusStyles: Record<BookingData["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  confirmed: { variant: "default", label: "Confirmed" },
  pending: { variant: "secondary", label: "Pending" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  completed: { variant: "outline", label: "Completed" },
};

export default function BookingCard({ booking, onViewTicket, onDownloadTicket }: BookingCardProps) {
  const handleViewTicket = () => {
    if (onViewTicket) {
      onViewTicket(booking.id);
    }
    console.log("View ticket:", booking.id);
  };

  const handleDownloadTicket = () => {
    if (onDownloadTicket) {
      onDownloadTicket(booking.id);
    }
    console.log("Download ticket:", booking.id);
  };

  const statusConfig = statusStyles[booking.status];

  return (
    <Card className="p-4" data-testid={`card-booking-${booking.id}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{booking.operator}</span>
              <Badge variant={statusConfig.variant} data-testid={`badge-status-${booking.id}`}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground" data-testid={`text-ticket-number-${booking.id}`}>
              Ticket: {booking.ticketNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold" data-testid={`text-booking-amount-${booking.id}`}>
              ${booking.totalAmount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{booking.from}</p>
              <p className="text-xs text-muted-foreground">{booking.departureTime}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <Clock className="w-3 h-3 text-muted-foreground" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="font-medium text-sm">{booking.to}</p>
              <p className="text-xs text-muted-foreground">{booking.arrivalTime}</p>
            </div>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{booking.date}</span>
            </div>
            <div>
              Seats: <span className="font-medium text-foreground">{booking.seats.join(", ")}</span>
            </div>
          </div>

          {(booking.status === "confirmed" || booking.status === "completed") && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleViewTicket} data-testid={`button-view-ticket-${booking.id}`}>
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTicket} data-testid={`button-download-ticket-${booking.id}`}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
