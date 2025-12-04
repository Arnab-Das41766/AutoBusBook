import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import BusCard, { type BusData } from "@/components/BusCard";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal } from "lucide-react";

// todo: remove mock functionality
const mockBuses: BusData[] = [
  {
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
  },
  {
    id: "bus-2",
    operator: "City Connect",
    rating: 4.2,
    departureTime: "11:00 PM",
    arrivalTime: "07:00 AM",
    duration: "8h",
    busType: "AC Seater",
    amenities: ["charging", "ac"],
    availableSeats: 8,
    price: 35,
    from: "New York",
    to: "Boston",
  },
  {
    id: "bus-3",
    operator: "Premium Bus Lines",
    rating: 4.8,
    departureTime: "09:00 PM",
    arrivalTime: "05:00 AM",
    duration: "8h",
    busType: "Volvo Multi-Axle",
    amenities: ["wifi", "charging", "water", "ac"],
    availableSeats: 5,
    price: 55,
    from: "New York",
    to: "Boston",
  },
  {
    id: "bus-4",
    operator: "Budget Travels",
    rating: 3.9,
    departureTime: "08:00 PM",
    arrivalTime: "04:30 AM",
    duration: "8h 30m",
    busType: "Non-AC Seater",
    amenities: [],
    availableSeats: 22,
    price: 25,
    from: "New York",
    to: "Boston",
  },
];

const busTypes = ["AC Sleeper", "AC Seater", "Non-AC Seater", "Volvo Multi-Axle"];
const departureSlots = ["Before 6 AM", "6 AM - 12 PM", "12 PM - 6 PM", "After 6 PM"];

interface SearchResultsPageProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function SearchResultsPage({ isLoggedIn = false, userName, onLogin, onLogout }: SearchResultsPageProps) {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const from = params.get("from") || "New York";
  const to = params.get("to") || "Boston";

  const [authOpen, setAuthOpen] = useState(false);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [selectedDepartures, setSelectedDepartures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "departure">("price");
  const [loading, setLoading] = useState(false);

  const handleViewSeats = (busId: string) => {
    navigate(`/select-seats/${busId}`);
  };

  const toggleFilter = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const filteredBuses = mockBuses
    .filter((bus) => {
      if (selectedBusTypes.length > 0 && !selectedBusTypes.includes(bus.busType)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Bus Type</h3>
        <div className="space-y-2">
          {busTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedBusTypes.includes(type)}
                onCheckedChange={() => toggleFilter(type, selectedBusTypes, setSelectedBusTypes)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Departure Time</h3>
        <div className="space-y-2">
          {departureSlots.map((slot) => (
            <div key={slot} className="flex items-center space-x-2">
              <Checkbox
                id={`dep-${slot}`}
                checked={selectedDepartures.includes(slot)}
                onCheckedChange={() => toggleFilter(slot, selectedDepartures, setSelectedDepartures)}
              />
              <Label htmlFor={`dep-${slot}`} className="text-sm cursor-pointer">{slot}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => setAuthOpen(true)}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchForm compact onSearch={(data) => {
            navigate(`/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}`);
          }} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {filteredBuses.length} buses found for {from} to {to}
          </p>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              <Button
                variant={sortBy === "price" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("price")}
                data-testid="button-sort-price"
              >
                Price
              </Button>
              <Button
                variant={sortBy === "rating" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("rating")}
                data-testid="button-sort-rating"
              >
                Rating
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <FilterContent />
            </Card>
          </aside>

          <div className="flex-1 space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : filteredBuses.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No buses found matching your criteria</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedBusTypes([]);
                    setSelectedDepartures([]);
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              filteredBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} onViewSeats={handleViewSeats} />
              ))
            )}
          </div>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onLogin={(email, password) => {
          console.log("Login:", email);
          setAuthOpen(false);
          if (onLogin) onLogin();
        }}
        onSignup={(name, email, password) => {
          console.log("Signup:", name, email);
          setAuthOpen(false);
          if (onLogin) onLogin();
        }}
      />
    </div>
  );
}
