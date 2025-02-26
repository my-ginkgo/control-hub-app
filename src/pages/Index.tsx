
import { MainLayout } from "@/components/layout/MainLayout";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TimeEntryData } from "@/components/TimeEntry";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { useState } from "react";
import { NewClientDialog } from "@/components/sidebar/NewClientDialog";
import { NewProjectDialog } from "@/components/sidebar/NewProjectDialog";
import { TimeEntryContainer } from "@/components/time-entry/TimeEntryContainer";
import { ProjectContainer } from "@/components/project/ProjectContainer";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isTimeEntryDialogOpen, setIsTimeEntryDialogOpen] = useState(false);
  const { session } = useAuth();

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setSelectedClient(null);
  };

  const handleAddProject = async (project: Omit<Project, "id">) => {
    setProjects([]);
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
          }}
          onProjectUpdated={() => {
            setProjects([]);
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
          </MainLayout>
        </div>
      </div>
      <TimeEntryContainer
        projects={projects}
        fetchTimeEntries={() => {}}
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
      <ProjectContainer session={session} onProjectsUpdate={setProjects} />
    </SidebarProvider>
  );
};

export default Index;
