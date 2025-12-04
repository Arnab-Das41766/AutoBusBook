import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string) => void;
}

export default function AuthModal({ open, onOpenChange, onLogin, onSignup }: AuthModalProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(loginEmail, loginPassword);
    }
    console.log("Login attempt:", loginEmail);
    onOpenChange(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirm) {
      console.log("Passwords do not match");
      return;
    }
    if (onSignup) {
      onSignup(signupName, signupEmail, signupPassword);
    }
    console.log("Signup attempt:", signupEmail);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary mb-2">
            <Bus className="w-7 h-7 text-primary-foreground" />
          </div>
          <DialogTitle>Welcome to BusGo</DialogTitle>
          <DialogDescription>
            Sign in to book tickets and manage your trips
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  data-testid="input-login-password"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-login-submit">
                Sign In
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service
              </p>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  data-testid="input-signup-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  data-testid="input-signup-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  data-testid="input-signup-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  required
                  data-testid="input-signup-confirm"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-signup-submit">
                Create Account
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our Terms of Service
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
