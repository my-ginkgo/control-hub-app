
import { useAuth } from "@/components/AuthProvider";
import { ClientDashboard } from "@/components/ClientDashboard";
import { DashboardStats } from "@/components/DashboardStats";
import { DocsDialog } from "@/components/docs/DocsDialog";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { useTheme } from "@/components/ThemeProvider";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { Moon, Plus, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchTimeEntries();
    }
  }, [session?.user?.id]);

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast.error("Error fetching time entries: " + error.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Error fetching projects: " + error.message);
    }
  };

  const handleAddProject = async (project: Omit<Project, "id">) => {
    try {
      const { error } = await supabase.from("projects").insert({
        name: project.name,
        description: project.description,
        color: project.color,
        is_public: project.is_public,
        user_id: session?.user?.id,
      });

      if (error) throw error;

      fetchProjects();
      toast.success("Progetto aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding project: " + error.message);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedClient(null);
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedProject(null);
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setSelectedClient(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white dark:bg-[#1a1b26] dark:text-white">
        <ProjectSidebar
          projects={projects}
          onAddProject={handleAddProject}
          onSelectProject={handleSelectProject}
          selectedProject={selectedProject}
          selectedClient={selectedClient}
          onSelectClient={handleSelectClient}
          onProjectDeleted={() => {
            fetchProjects();
          }}
          onProjectUpdated={() => {
            fetchProjects();
          }}
        />
        <div className="flex-1">
          <div className="container py-4 md:py-8 px-4 md:px-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-4">
                <img src="logo.png" alt=" Logo" className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-2">
                <TimeEntryDialog onSubmit={() => {}} projects={projects}>
                  <Button variant="outline" size="icon" className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
                    <Plus className="h-5 w-5" />
                  </Button>
                </TimeEntryDialog>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <DocsDialog />
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]">
                  <Link to="/user">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {selectedProject ? (
              <ProjectDashboard project={selectedProject} onBack={handleBackToDashboard} />
            ) : selectedClient ? (
              <ClientDashboard client={selectedClient} onBack={handleBackToDashboard} />
            ) : (
              <DashboardStats entries={entries} />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
