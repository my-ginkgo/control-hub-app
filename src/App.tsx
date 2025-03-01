
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import User from "./pages/User";
import Auth from "./pages/Auth";
import CRM from "./pages/CRM";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import './App.css';
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import ProjectDetail from "./pages/ProjectDetail";
import ClientDetail from "./pages/ClientDetail";
import Administration from "./pages/Administration";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/profile-setup" element={<ProfileSetup />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/administration/projects" element={<Projects />} />
            <Route path="/administration/clients" element={<Clients />} />
            <Route path="/administration/project/:id" element={<ProjectDetail />} />
            <Route path="/administration/client/:id" element={<ClientDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
