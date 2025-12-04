import { useState } from "react";
import { useLocation } from "wouter";
import SearchForm from "@/components/SearchForm";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Headphones, CreditCard, Bus, MapPin } from "lucide-react";

// todo: remove mock functionality
const popularRoutes = [
  { from: "New York", to: "Boston", price: 35, duration: "4h 30m" },
  { from: "Los Angeles", to: "San Francisco", price: 42, duration: "6h" },
  { from: "Chicago", to: "Detroit", price: 28, duration: "5h" },
  { from: "Miami", to: "Orlando", price: 25, duration: "4h" },
];

const features = [
  { icon: Shield, title: "Safe Travel", description: "Verified operators and sanitized buses" },
  { icon: Clock, title: "On-Time Guarantee", description: "Track your bus in real-time" },
  { icon: Headphones, title: "24/7 Support", description: "Round the clock customer service" },
  { icon: CreditCard, title: "Secure Payments", description: "Multiple payment options available" },
];

interface HomePageProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function HomePage({ isLoggedIn = false, userName, onLogin, onLogout }: HomePageProps) {
  const [, navigate] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);

  const handleSearch = (data: { from: string; to: string; date: Date; passengers: number }) => {
    console.log("Search:", data);
    navigate(`/search?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}`);
  };

  const handleRouteClick = (from: string, to: string) => {
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => setAuthOpen(true)}
        onLogout={onLogout}
      />

      <main>
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-hero-title">
              Book Bus Tickets Online
            </h1>
            <p className="text-muted-foreground text-lg">
              Find and book bus tickets for your next journey. Fast, easy, and secure.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <SearchForm onSearch={handleSearch} />
          </div>
        </section>

        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Popular Routes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRoutes.map((route, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover-elevate"
                  onClick={() => handleRouteClick(route.from, route.to)}
                  data-testid={`card-route-${index}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{route.from}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{route.to}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{route.duration}</Badge>
                    <span className="font-semibold text-primary">From ${route.price}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Why Choose BusGo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <Bus className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Travel with Confidence</h2>
            <p className="text-primary-foreground/80 mb-4">
              Join millions of travelers who trust BusGo for their bus bookings
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div>
                <p className="text-2xl font-bold">10M+</p>
                <p className="text-primary-foreground/70">Happy Travelers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">2000+</p>
                <p className="text-primary-foreground/70">Bus Operators</p>
              </div>
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-primary-foreground/70">Routes</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5" />
            <span>BusGo</span>
          </div>
          <p>Fully automated bus booking platform</p>
        </div>
      </footer>

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
