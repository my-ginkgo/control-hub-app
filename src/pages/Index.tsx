
import { useAuth } from "@/components/AuthProvider";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { NewClientDialog } from "@/components/sidebar/NewClientDialog";
import { NewProjectDialog } from "@/components/sidebar/NewProjectDialog";
import { TimeEntryData } from "@/components/TimeEntry";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProjectContainer } from "@/components/project/ProjectContainer";
import { TimeEntryContainer } from "@/components/time-entry/TimeEntryContainer";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isTimeEntryDialogOpen, setIsTimeEntryDialogOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchTimeEntries();
    }
  }, [session?.user?.id]);

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

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setSelectedClient(null);
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
      setProjects([]);
      fetchTimeEntries();
      toast.success("Progetto aggiunto con successo!");
    } catch (error: any) {
      toast.error("Error adding project: " + error.message);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white dark:bg-[#1a1b26] dark:text-white">
        <ProjectSidebar
          projects={projects}
          onSelectProject={setSelectedProject}
          selectedProject={selectedProject}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          onProjectDeleted={() => {
            setProjects([]);
            fetchTimeEntries();
          }}
          onProjectUpdated={() => {
            setProjects([]);
            fetchTimeEntries();
          }}
          onAddProject={handleAddProject}
        />
        <div className="flex-1 relative">
          <MainLayout
            onNewClient={() => setIsNewClientDialogOpen(true)}
            onNewProject={() => setIsNewProjectDialogOpen(true)}
            onNewTimeEntry={() => setIsTimeEntryDialogOpen(true)}>
            <DashboardContainer
              selectedProject={selectedProject}
              selectedClient={selectedClient}
              timeEntries={timeEntries}
              onBack={handleBackToDashboard}
            />
            <div className="my-6 md:my-8 space-y-6 md:space-y-8">
              <TimeEntryContainer
                projects={projects}
                fetchTimeEntries={fetchTimeEntries}
                selectedProject={selectedProject}
                session={session}
                isOpen={isTimeEntryDialogOpen}
                onOpenChange={setIsTimeEntryDialogOpen}
              />
              <NewClientDialog
                isOpen={isNewClientDialogOpen}
                onOpenChange={setIsNewClientDialogOpen}
                onClientAdded={() => {
                  setProjects([]);
                }}
              />
              <NewProjectDialog
                isOpen={isNewProjectDialogOpen}
                onOpenChange={setIsNewProjectDialogOpen}
                clients={[]}
                onProjectAdded={() => {
                  setProjects([]);
                }}
              />
            </div>
          </MainLayout>
        </div>
      </div>
      <ProjectContainer
        session={session}
        onProjectsUpdate={setProjects}
      />
    </SidebarProvider>
  );
};

export default Index;
