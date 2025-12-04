import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SeatStatus = "available" | "selected" | "booked" | "female";

export interface Seat {
  id: string;
  number: string;
  status: SeatStatus;
  price: number;
  deck: "lower" | "upper";
  type: "window" | "aisle" | "middle";
}

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect?: (seatIds: string[]) => void;
  maxSeats?: number;
}

export default function SeatMap({ seats, onSeatSelect, maxSeats = 6 }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeDeck, setActiveDeck] = useState<"lower" | "upper">("lower");

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "booked" || seat.status === "female") return;

    let newSelected: string[];
    if (selectedSeats.includes(seat.id)) {
      newSelected = selectedSeats.filter((id) => id !== seat.id);
    } else {
      if (selectedSeats.length >= maxSeats) {
        console.log(`Maximum ${maxSeats} seats can be selected`);
        return;
      }
      newSelected = [...selectedSeats, seat.id];
    }

    setSelectedSeats(newSelected);
    if (onSeatSelect) {
      onSeatSelect(newSelected);
    }
  };

  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);

    if (isSelected) {
      return "bg-primary text-primary-foreground border-primary";
    }

    switch (seat.status) {
      case "booked":
        return "bg-muted text-muted-foreground cursor-not-allowed opacity-50";
      case "female":
        return "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 cursor-not-allowed";
      default:
        return "bg-background border-border hover-elevate cursor-pointer";
    }
  };

  const lowerDeckSeats = seats.filter((s) => s.deck === "lower");
  const upperDeckSeats = seats.filter((s) => s.deck === "upper");
  const hasUpperDeck = upperDeckSeats.length > 0;

  const renderSeatGrid = (deckSeats: Seat[]) => {
    const rows: Seat[][] = [];
    for (let i = 0; i < deckSeats.length; i += 4) {
      rows.push(deckSeats.slice(i, i + 4));
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-md bg-muted">
          <div className="w-8 h-6 rounded-sm bg-muted-foreground/30" />
          <span className="text-xs text-muted-foreground">Driver</span>
        </div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.slice(0, 2).map((seat) => (
              <button
                key={seat.id}
                onClick={() => toggleSeat(seat)}
                disabled={seat.status === "booked"}
                className={cn(
                  "w-10 h-10 rounded-md border-2 text-xs font-medium transition-all flex items-center justify-center",
                  getSeatStyle(seat)
                )}
                title={`Seat ${seat.number} - $${seat.price} (${seat.type})`}
                data-testid={`seat-${seat.id}`}
              >
                {seat.number}
              </button>
            ))}
            <div className="w-6" />
            {row.slice(2, 4).map((seat) => (
              <button
                key={seat.id}
                onClick={() => toggleSeat(seat)}
                disabled={seat.status === "booked"}
                className={cn(
                  "w-10 h-10 rounded-md border-2 text-xs font-medium transition-all flex items-center justify-center",
                  getSeatStyle(seat)
                )}
                title={`Seat ${seat.number} - $${seat.price} (${seat.type})`}
                data-testid={`seat-${seat.id}`}
              >
                {seat.number}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const selectedSeatDetails = seats.filter((s) => selectedSeats.includes(s.id));
  const totalPrice = selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border-2 border-border bg-background" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border-2 border-primary bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border-2 border-muted bg-muted opacity-50" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border-2 border-pink-300 dark:border-pink-700 bg-pink-100 dark:bg-pink-900/30" />
            <span>Female Only</span>
          </div>
        </div>
      </Card>

      {hasUpperDeck ? (
        <Tabs value={activeDeck} onValueChange={(v) => setActiveDeck(v as "lower" | "upper")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lower" data-testid="tab-lower-deck">Lower Deck</TabsTrigger>
            <TabsTrigger value="upper" data-testid="tab-upper-deck">Upper Deck</TabsTrigger>
          </TabsList>
          <TabsContent value="lower" className="mt-4">
            <Card className="p-6">{renderSeatGrid(lowerDeckSeats)}</Card>
          </TabsContent>
          <TabsContent value="upper" className="mt-4">
            <Card className="p-6">{renderSeatGrid(upperDeckSeats)}</Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-6">{renderSeatGrid(lowerDeckSeats)}</Card>
      )}

      {selectedSeats.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Selected Seats</p>
              <p className="font-medium" data-testid="text-selected-seats">
                {selectedSeatDetails.map((s) => s.number).join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold" data-testid="text-total-price">${totalPrice}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
