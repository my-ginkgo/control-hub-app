import { AuthProvider } from "@/components/AuthProvider";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import CRM from "@/pages/CRM";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ProfileSetup from "@/pages/ProfileSetup";
import User from "@/pages/User";
import { Project } from "@/types/Project";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import AdminUsers from "./pages/AdminUsers";

// Create a client
const queryClient = new QueryClient();

function ProjectDashboardWrapper() {
  const [project, setProject] = useState<Project | null>(null);
  const id = window.location.pathname.split("/")[2];

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      toast.error("Error fetching project: " + error.message);
    }
  };

  if (!project) return null;

  return <ProjectDashboard project={project} onBack={() => window.history.back()} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/user" element={<User />} />
              <Route path="/user/:id" element={<User />} />
              <Route path="/project/:id" element={<ProjectDashboardWrapper />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
