
import { useAuth } from "@/components/AuthProvider";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { ClientDashboard } from "@/components/ClientDashboard";
import { DashboardStats } from "@/components/DashboardStats";
import { TimeEntryData } from "@/components/TimeEntry";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";

interface DashboardContainerProps {
  selectedProject: Project | null;
  selectedClient: Client | null;
  timeEntries: TimeEntryData[];
  onBack: () => void;
}

export function DashboardContainer({ selectedProject, selectedClient, timeEntries, onBack }: DashboardContainerProps) {
  if (selectedProject) {
    return <ProjectDashboard project={selectedProject} onBack={onBack} />;
  }

  if (selectedClient) {
    return <ClientDashboard client={selectedClient} onBack={onBack} />;
  }

  return (
    <>
      <DashboardStats entries={timeEntries} />
    </>
  );
}
