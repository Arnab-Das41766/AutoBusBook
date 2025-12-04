import Header from "../Header";
import { ThemeProvider } from "@/lib/ThemeProvider";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header
        isLoggedIn={true}
        userName="John Doe"
        onLogin={() => console.log("Login clicked")}
        onLogout={() => console.log("Logout clicked")}
      />
    </ThemeProvider>
  );
}
