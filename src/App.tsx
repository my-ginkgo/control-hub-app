
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ClientPage } from "@/pages/Client";
import { NotFound } from "@/pages/NotFound";
import { AuthProvider } from "@/components/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/project/:id" element={<ProjectDashboard />} />
            <Route path="/client/:id" element={<ClientPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
