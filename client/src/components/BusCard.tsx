import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Wifi, Zap, Droplets, Wind, Users } from "lucide-react";

export interface BusData {
  id: string;
  operator: string;
  rating: number;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busType: string;
  amenities: string[];
  availableSeats: number;
  price: number;
  from: string;
  to: string;
}

interface BusCardProps {
  bus: BusData;
  onViewSeats?: (busId: string) => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  charging: <Zap className="w-3.5 h-3.5" />,
  water: <Droplets className="w-3.5 h-3.5" />,
  ac: <Wind className="w-3.5 h-3.5" />,
};

export default function BusCard({ bus, onViewSeats }: BusCardProps) {
  const handleViewSeats = () => {
    if (onViewSeats) {
      onViewSeats(bus.id);
    }
    console.log("View seats for bus:", bus.id);
  };

  return (
    <Card className="p-4" data-testid={`card-bus-${bus.id}`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold" data-testid={`text-operator-${bus.id}`}>{bus.operator}</span>
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3 fill-current" />
              {bus.rating}
            </Badge>
            <Badge variant="outline">{bus.busType}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-lg font-semibold" data-testid={`text-departure-${bus.id}`}>{bus.departureTime}</p>
                <p className="text-muted-foreground text-xs">{bus.from}</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-8 bg-border" />
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{bus.duration}</span>
                </div>
                <div className="h-px w-8 bg-border" />
              </div>
              <div>
                <p className="text-lg font-semibold" data-testid={`text-arrival-${bus.id}`}>{bus.arrivalTime}</p>
                <p className="text-muted-foreground text-xs">{bus.to}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {bus.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1 text-xs text-muted-foreground"
                title={amenity}
              >
                {amenityIcons[amenity.toLowerCase()] || null}
                <span className="capitalize">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6">
          <div className="text-right">
            <p className="text-2xl font-bold" data-testid={`text-price-${bus.id}`}>${bus.price}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span data-testid={`text-seats-${bus.id}`}>{bus.availableSeats} seats left</span>
            </div>
          </div>
          <Button onClick={handleViewSeats} data-testid={`button-view-seats-${bus.id}`}>
            View Seats
          </Button>
        </div>
      </div>
    </Card>
  );
}
