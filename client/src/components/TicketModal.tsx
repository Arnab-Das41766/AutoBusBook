import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Calendar, Clock, User, Download, QrCode } from "lucide-react";

interface TicketData {
  ticketNumber: string;
  status: "confirmed" | "completed";
  operator: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  passengers: { name: string; seat: string; age: number }[];
  totalAmount: number;
  boardingPoint: string;
  dropPoint: string;
}

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketData | null;
  onDownload?: () => void;
}

export default function TicketModal({ open, onOpenChange, ticket, onDownload }: TicketModalProps) {
  if (!ticket) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
    console.log("Downloading ticket:", ticket.ticketNumber);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            E-Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ticket Number</p>
              <p className="font-mono font-semibold" data-testid="text-modal-ticket-number">{ticket.ticketNumber}</p>
            </div>
            <Badge variant="default">{ticket.status === "confirmed" ? "Confirmed" : "Completed"}</Badge>
          </div>

          <Separator />

          <div className="text-center p-4 bg-muted rounded-md">
            <p className="text-lg font-semibold">{ticket.operator}</p>
            <p className="text-sm text-muted-foreground">{ticket.busType}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">From</span>
              </div>
              <p className="font-semibold">{ticket.from}</p>
              <p className="text-sm text-muted-foreground">{ticket.departureTime}</p>
              <p className="text-xs text-muted-foreground mt-1">{ticket.boardingPoint}</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">{ticket.duration}</span>
            </div>
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-xs text-muted-foreground">To</span>
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold">{ticket.to}</p>
              <p className="text-sm text-muted-foreground">{ticket.arrivalTime}</p>
              <p className="text-xs text-muted-foreground mt-1">{ticket.dropPoint}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{ticket.date}</span>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Passenger Details</p>
            <div className="space-y-2">
              {ticket.passengers.map((passenger, index) => (
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

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-xl font-bold" data-testid="text-modal-total">${ticket.totalAmount}</span>
          </div>

          <div className="flex items-center justify-center p-4 bg-muted rounded-md">
            <div className="text-center">
              <QrCode className="w-24 h-24 mx-auto text-foreground" />
              <p className="text-xs text-muted-foreground mt-2">Scan for verification</p>
            </div>
          </div>

          <Button className="w-full" onClick={handleDownload} data-testid="button-modal-download">
            <Download className="w-4 h-4 mr-2" />
            Download Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
