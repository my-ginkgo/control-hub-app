import { useAuth } from "@/components/AuthProvider";
import { ClientDashboard } from "@/components/ClientDashboard";
import { DashboardStats } from "@/components/DashboardStats";
import { DocsDialog } from "@/components/docs/DocsDialog";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { NewClientDialog } from "@/components/sidebar/NewClientDialog";
import { NewProjectDialog } from "@/components/sidebar/NewProjectDialog";
import { useTheme } from "@/components/ThemeProvider";
import { TimeEntryData } from "@/components/TimeEntry";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { Moon, Plus, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isTimeEntryDialogOpen, setIsTimeEntryDialogOpen] = useState(false);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchTimeEntries();
    }
  }, [session?.user?.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

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
        .eq("user_id", session?.user?.id)
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
        end_date: entry.endDate,
      });

      if (error) throw error;

      fetchTimeEntries();
      if (selectedProject?.id === project.id) {
        setSelectedProject(project);
      }
      toast.success("Tempo registrato con successo!");
    } catch (error: any) {
      toast.error("Error adding time entry: " + error.message);
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
                <img src="logo.png" alt=" Logo" className="w-12 h-12" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Crea
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-[#24253a] border-[#383a5c]">
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={() => setIsNewClientDialogOpen(true)}>
                      Crea Cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={() => setIsNewProjectDialogOpen(true)}>
                      Crea Progetto
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-white focus:bg-[#383a5c] focus:text-white cursor-pointer"
                      onClick={() => setIsTimeEntryDialogOpen(true)}>
                      Registra Lavoro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
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
              <>
                <DashboardStats entries={timeEntries} />
                <div className="my-6 md:my-8 space-y-6 md:space-y-8">
                  <TimeEntryDialog
                    onSubmit={handleNewEntry}
                    projects={projects}
                    isOpen={isTimeEntryDialogOpen}
                    onOpenChange={setIsTimeEntryDialogOpen}
                  />
                  <NewClientDialog
                    isOpen={isNewClientDialogOpen}
                    onOpenChange={setIsNewClientDialogOpen}
                    onClientAdded={() => {
                      fetchProjects();
                    }}
                  />
                  <NewProjectDialog
                    isOpen={isNewProjectDialogOpen}
                    onOpenChange={setIsNewProjectDialogOpen}
                    clients={[]}
                    onProjectAdded={() => {
                      fetchProjects();
                    }}
                  />
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
