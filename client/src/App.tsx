import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/ThemeProvider";
import HomePage from "@/pages/home";
import SearchResultsPage from "@/pages/search-results";
import SeatSelectionPage from "@/pages/seat-selection";
import BookingsPage from "@/pages/bookings";
import BookingConfirmationPage from "@/pages/booking-confirmation";
import NotFound from "@/pages/not-found";

function Router() {
  // todo: remove mock functionality - replace with real auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserName("John Doe");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
  };

  return (
    <Switch>
      <Route path="/">
        <HomePage
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </Route>
      <Route path="/search">
        <SearchResultsPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </Route>
      <Route path="/select-seats/:busId">
        <SeatSelectionPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </Route>
      <Route path="/bookings">
        <BookingsPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </Route>
      <Route path="/booking-confirmation">
        <BookingConfirmationPage
          isLoggedIn={isLoggedIn}
          userName={userName}
          onLogout={handleLogout}
        />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
