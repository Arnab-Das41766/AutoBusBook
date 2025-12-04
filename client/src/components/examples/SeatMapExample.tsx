import SeatMap, { type Seat } from "../SeatMap";

// todo: remove mock functionality
const mockSeats: Seat[] = [
  { id: "1", number: "1", status: "available", price: 45, deck: "lower", type: "window" },
  { id: "2", number: "2", status: "available", price: 45, deck: "lower", type: "aisle" },
  { id: "3", number: "3", status: "booked", price: 45, deck: "lower", type: "aisle" },
  { id: "4", number: "4", status: "available", price: 45, deck: "lower", type: "window" },
  { id: "5", number: "5", status: "female", price: 45, deck: "lower", type: "window" },
  { id: "6", number: "6", status: "available", price: 45, deck: "lower", type: "aisle" },
  { id: "7", number: "7", status: "available", price: 45, deck: "lower", type: "aisle" },
  { id: "8", number: "8", status: "booked", price: 45, deck: "lower", type: "window" },
  { id: "9", number: "9", status: "available", price: 50, deck: "upper", type: "window" },
  { id: "10", number: "10", status: "available", price: 50, deck: "upper", type: "aisle" },
  { id: "11", number: "11", status: "available", price: 50, deck: "upper", type: "aisle" },
  { id: "12", number: "12", status: "booked", price: 50, deck: "upper", type: "window" },
];

export default function SeatMapExample() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <SeatMap
        seats={mockSeats}
        onSeatSelect={(ids) => console.log("Selected seats:", ids)}
        maxSeats={4}
      />
    </div>
  );
}
