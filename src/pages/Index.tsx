
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
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white">
        <ProjectSidebar projects={projects} onAddProject={handleAddProject} />
        <div className="flex-1">
          <div className="container py-4 md:py-8 px-4 md:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Time Tracker
            </h1>
            <DashboardStats entries={timeEntries} />
            <div className="space-y-6 md:space-y-8">
              <TimeEntry onSubmit={handleNewEntry} projects={projects} />
              {timeEntries.length > 0 && <TimeTable entries={timeEntries} />}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
