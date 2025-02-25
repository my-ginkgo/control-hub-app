
import { useEffect, useState } from "react";
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { TimeTable } from "@/components/TimeTable";
import { DashboardStats } from "@/components/DashboardStats";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Project } from "@/types/Project";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { signOut, session } = useAuth();

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
        .eq('user_id', session?.user?.id)
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
        .select("*, projects(name)")
        .eq('user_id', session?.user?.id)
        .order("date", { ascending: false });

      if (error) throw error;
      
      const formattedEntries = data.map((entry) => ({
        hours: entry.hours,
        billableHours: entry.billable_hours,
        project: entry.projects.name,
        notes: entry.notes,
        date: entry.date,
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
      });

      if (error) throw error;
      
      fetchTimeEntries();
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
          ...project,
          user_id: session?.user?.id,
        });

      if (error) throw error;
      
      fetchProjects();
    } catch (error: any) {
      toast.error("Error adding project: " + error.message);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1a1b26] text-white">
        <ProjectSidebar projects={projects} onAddProject={handleAddProject} />
        <div className="flex-1">
          <div className="container py-4 md:py-8 px-4 md:px-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Time Tracker
              </h1>
              <Button
                variant="outline"
                onClick={signOut}
                className="border-[#383a5c] text-white hover:bg-[#2a2b3d]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
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
