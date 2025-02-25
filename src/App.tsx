
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ClientPage } from "@/pages/Client";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { Project } from "@/types/Project";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function ProjectDashboardWrapper() {
  const [project, setProject] = useState<Project | null>(null);
  const id = window.location.pathname.split('/')[2];

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

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
              <Route path="/project/:id" element={<ProjectDashboardWrapper />} />
              <Route path="/client/:id" element={<ClientPage />} />
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

