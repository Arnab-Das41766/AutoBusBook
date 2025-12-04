import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/lib/ThemeProvider";
import { Bus, Menu, Moon, Sun, User, Ticket, LogOut, X } from "lucide-react";

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Header({ isLoggedIn = false, userName = "John Doe", onLogin, onLogout }: HeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Search Buses", icon: Bus },
    { href: "/bookings", label: "My Bookings", icon: Ticket },
  ];

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BusGo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">Manage account</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="flex items-center gap-2 cursor-pointer" data-testid="menu-my-bookings">
                      <Ticket className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer" data-testid="menu-profile">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer" data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onLogin} data-testid="button-login">
                  Sign In
                </Button>
                <Button size="sm" onClick={onLogin} data-testid="button-signup">
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={onLogin} data-testid="mobile-button-login">
                  Sign In
                </Button>
                <Button className="flex-1" onClick={onLogin} data-testid="mobile-button-signup">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
