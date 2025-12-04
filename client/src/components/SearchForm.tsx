import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { MapPin, CalendarIcon, Users, ArrowRightLeft, Search } from "lucide-react";

interface SearchFormProps {
  onSearch?: (data: { from: string; to: string; date: Date; passengers: number }) => void;
  compact?: boolean;
}

export default function SearchForm({ onSearch, compact = false }: SearchFormProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ from, to, date, passengers });
    }
    console.log("Search triggered:", { from, to, date, passengers });
  };

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex gap-2 items-center">
            <div className="flex-1">
              <Input
                placeholder="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10"
                data-testid="input-from-compact"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={swapLocations} data-testid="button-swap-compact">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Input
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10"
                data-testid="input-to-compact"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] justify-start text-left font-normal" data-testid="button-date-compact">
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {format(date, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { if (d) { setDate(d); setCalendarOpen(false); }}}
                  disabled={(d) => d < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleSearch} data-testid="button-search-compact">
              <Search className="w-4 h-4 mr-2" />
              Modify
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 relative">
            <Label htmlFor="from" className="text-sm font-medium mb-2 block">From</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="from"
                placeholder="Enter departure city"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="pl-10"
                data-testid="input-from"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end justify-center pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapLocations}
              className="rounded-full"
              data-testid="button-swap"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="md:col-span-4">
            <Label htmlFor="to" className="text-sm font-medium mb-2 block">To</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="to"
                placeholder="Enter destination city"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="pl-10"
                data-testid="input-to"
              />
            </div>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-date"
                  >
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {format(date, "MMM dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { if (d) { setDate(d); setCalendarOpen(false); }}}
                    disabled={(d) => d < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="passengers" className="text-sm font-medium mb-2 block">Travelers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="passengers"
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                  className="pl-10"
                  data-testid="input-passengers"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button size="lg" className="px-12" onClick={handleSearch} data-testid="button-search">
            <Search className="w-4 h-4 mr-2" />
            Search Buses
          </Button>
        </div>
      </Card>
    </div>
  );
}
