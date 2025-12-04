import BusCard, { type BusData } from "../BusCard";

// todo: remove mock functionality
const mockBus: BusData = {
  id: "bus-1",
  operator: "Express Travels",
  rating: 4.5,
  departureTime: "10:30 PM",
  arrivalTime: "06:45 AM",
  duration: "8h 15m",
  busType: "AC Sleeper",
  amenities: ["wifi", "charging", "water", "ac"],
  availableSeats: 12,
  price: 45,
  from: "New York",
  to: "Boston",
};

export default function BusCardExample() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <BusCard
        bus={mockBus}
        onViewSeats={(id) => console.log("View seats for:", id)}
      />
    </div>
  );
}
