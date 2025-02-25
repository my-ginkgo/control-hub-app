
import { useState } from "react";
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { TimeTable } from "@/components/TimeTable";
import { DashboardStats } from "@/components/DashboardStats";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Project } from "@/types/Project";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const handleNewEntry = (entry: TimeEntryData) => {
    setTimeEntries([entry, ...timeEntries]);
  };

  const handleAddProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: crypto.randomUUID(),
    };
    setProjects([...projects, newProject]);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ProjectSidebar projects={projects} onAddProject={handleAddProject} />
        <div className="flex-1 bg-background">
          <div className="container py-8">
            <h1 className="text-4xl font-bold mb-8 text-center">Time Tracker</h1>
            <DashboardStats entries={timeEntries} />
            <div className="grid grid-cols-1 gap-8">
              <TimeEntry onSubmit={handleNewEntry} />
              {timeEntries.length > 0 && <TimeTable entries={timeEntries} />}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
