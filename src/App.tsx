
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import User from "@/pages/User";
import AdminUsers from "@/pages/AdminUsers";
import NotFound from "@/pages/NotFound";
import { ProfileSetup } from "@/components/ProfileSetup";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/user" element={<User />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
