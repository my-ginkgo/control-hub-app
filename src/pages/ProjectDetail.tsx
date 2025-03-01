
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { useAuth } from "@/components/AuthProvider";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session && id) {
      fetchProject(id);
    }
  }, [id, session]);

  const fetchProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error("Error fetching project:", error.message);
      toast.error("Errore nel caricamento del progetto");
      navigate("/administration/projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewClient = () => {
    toast.info("Create new client feature will be implemented soon");
  };

  const handleNewProject = () => {
    toast.info("Create new project feature will be implemented soon");
  };

  const handleNewTimeEntry = () => {
    toast.info("Usa la pagina di Time Tracking per registrare lavoro");
  };

  const handleBack = () => {
    navigate("/administration/projects");
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <MainLayout 
          onNewClient={handleNewClient}
          onNewProject={handleNewProject}
          onNewTimeEntry={handleNewTimeEntry}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </MainLayout>
      </SidebarProvider>
    );
  }

  if (!project) {
    return (
      <SidebarProvider>
        <MainLayout 
          onNewClient={handleNewClient}
          onNewProject={handleNewProject}
          onNewTimeEntry={handleNewTimeEntry}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-red-500">
              <h2 className="text-2xl font-bold">Progetto non trovato</h2>
              <p className="mt-2">Il progetto richiesto non esiste o non hai i permessi per visualizzarlo.</p>
            </div>
          </div>
        </MainLayout>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <MainLayout 
        onNewClient={handleNewClient}
        onNewProject={handleNewProject}
        onNewTimeEntry={handleNewTimeEntry}
      >
        <div className="container mx-auto px-4 py-6">
          <ProjectDashboard project={project} onBack={handleBack} />
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
