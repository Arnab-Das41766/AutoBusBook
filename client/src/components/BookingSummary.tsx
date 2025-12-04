import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, MapPin } from "lucide-react";

interface PassengerInfo {
  name: string;
  age: string;
  gender: string;
}

interface BookingSummaryProps {
  busOperator: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  selectedSeats: string[];
  pricePerSeat: number;
  onConfirm?: (passengers: PassengerInfo[], email: string, phone: string) => void;
}

export default function BookingSummary({
  busOperator,
  from,
  to,
  date,
  departureTime,
  arrivalTime,
  duration,
  selectedSeats,
  pricePerSeat,
  onConfirm,
}: BookingSummaryProps) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    selectedSeats.map(() => ({ name: "", age: "", gender: "" }))
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const subtotal = selectedSeats.length * pricePerSeat;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(passengers, email, phone);
    }
    console.log("Booking confirmed:", { passengers, email, phone });
  };

  const isFormValid = passengers.every((p) => p.name && p.age && p.gender) && email && phone;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Journey Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{busOperator}</Badge>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{from}</p>
                <p className="text-muted-foreground">{departureTime}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2 text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" />
                {duration}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="font-medium">{to}</p>
                <p className="text-muted-foreground">{arrivalTime}</p>
              </div>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">Travel Date</p>
            <p className="font-medium">{date}</p>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">Seat Numbers</p>
            <p className="font-medium" data-testid="text-summary-seats">{selectedSeats.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Passenger Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedSeats.map((seat, index) => (
            <div key={seat} className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Passenger {index + 1} (Seat {seat})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`name-${index}`} className="text-xs">Full Name</Label>
                  <Input
                    id={`name-${index}`}
                    placeholder="Enter name"
                    value={passengers[index]?.name || ""}
                    onChange={(e) => updatePassenger(index, "name", e.target.value)}
                    data-testid={`input-passenger-name-${index}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`age-${index}`} className="text-xs">Age</Label>
                  <Input
                    id={`age-${index}`}
                    type="number"
                    placeholder="Age"
                    value={passengers[index]?.age || ""}
                    onChange={(e) => updatePassenger(index, "age", e.target.value)}
                    data-testid={`input-passenger-age-${index}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`gender-${index}`} className="text-xs">Gender</Label>
                  <Select
                    value={passengers[index]?.gender || ""}
                    onValueChange={(v) => updatePassenger(index, "gender", v)}
                  >
                    <SelectTrigger id={`gender-${index}`} data-testid={`select-passenger-gender-${index}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-phone"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Base Fare ({selectedSeats.length} x ${pricePerSeat})
            </span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes & Fees</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span data-testid="text-summary-total">${total.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            disabled={!isFormValid}
            onClick={handleConfirm}
            data-testid="button-proceed-payment"
          >
            Proceed to Payment
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
