import { useState } from "react";
import { TimeEntryData } from "@/components/TimeEntry";
import { TimeTable } from "@/components/TimeTable";
import { DashboardStats } from "@/components/DashboardStats";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { useEffect } from "react";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ClientDashboard } from "@/components/ClientDashboard";
import { DocsDialog } from "@/components/docs/DocsDialog";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchTimeEntries();
    }
  }, [session?.user?.id]);

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

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects!time_entries_project_id_fkey(name)")
        .eq('user_id', session?.user?.id)
        .order("date", { ascending: false });

      if (error) throw error;
      
      const formattedEntries = data.map((entry) => ({
        id: entry.id,
        hours: entry.hours,
        billableHours: entry.billable_hours,
        project: entry.projects?.name || "",
        notes: entry.notes,
        date: entry.date,
        assignedUserId: entry.assigned_user_id,
        userId: entry.user_id,
        startDate: entry.start_date,
        endDate: entry.end_date,
      }));
      
      setTimeEntries(formattedEntries);
    } catch (error: any) {
      toast.error("Error fetching time entries: " + error.message);
    }
  };

  const handleNewEntry = async (entry: TimeEntryData) => {
    try {
      const project = projects.find((p) => p.name === entry.project);
      if (!project) throw new Error("Project not found");

      const { error } = await supabase.from("time_entries").insert({
        hours: entry.hours,
        billable_hours: entry.billableHours,
        project_id: project.id,
        notes: entry.notes,
        date: entry.date,
        user_id: session?.user?.id,
        assigned_user_id: entry.assignedUserId,
        start_date: entry.startDate,
        end_date: entry.endDate
      });

      if (error) throw error;
      
      fetchTimeEntries();
      if (selectedProject?.id === project.id) {
        // Refresh project dashboard if the new entry is for the selected project
        setSelectedProject(project);
      }
      toast.success("Tempo registrato con successo!");
    } catch (error: any) {
      toast.error("Error adding time entry: " + error.message);
    }
  };

  const handleAddProject = async (project: Omit<Project, "id">) => {
    try {
      const { error } = await supabase
        .from("projects")
        .insert({
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
            fetchTimeEntries();
          }}
          onProjectUpdated={() => {
            fetchProjects();
            fetchTimeEntries();
          }}
        />
        <div className="flex-1">
          <div className="container py-4 md:py-8 px-4 md:px-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-4">
                <img
                  src="https://gruppo4d.com/favicon.svg"
                  alt="Gruppo4D Logo"
                  className="w-8 h-8"
                />
                <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Time Tracker
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <DocsDialog />
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-[#383a5c] text-white hover:bg-[#2a2b3d]"
                >
                  <Link to="/user">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {selectedProject ? (
              <ProjectDashboard 
                project={selectedProject} 
                onBack={handleBackToDashboard}
              />
            ) : selectedClient ? (
              <ClientDashboard 
                client={selectedClient} 
                onBack={handleBackToDashboard}
              />
            ) : (
              <>
                <DashboardStats entries={timeEntries} />
                <div className="space-y-6 md:space-y-8">
                  <TimeEntryDialog onSubmit={handleNewEntry} projects={projects} />
                  {timeEntries.length > 0 && (
                    <TimeTable entries={timeEntries} onEntryDeleted={fetchTimeEntries} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
