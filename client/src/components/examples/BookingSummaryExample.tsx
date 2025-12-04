import BookingSummary from "../BookingSummary";

export default function BookingSummaryExample() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <BookingSummary
        busOperator="Express Travels"
        from="New York"
        to="Boston"
        date="Dec 15, 2025"
        departureTime="10:30 PM"
        arrivalTime="06:45 AM"
        duration="8h 15m"
        selectedSeats={["1A", "2A"]}
        pricePerSeat={45}
        onConfirm={(passengers, email, phone) =>
          console.log("Confirmed:", { passengers, email, phone })
        }
      />
    </div>
  );
}
