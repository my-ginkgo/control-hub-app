
import { TimeEntryData } from "@/components/TimeEntry";
import { TimeEntryDialog } from "@/components/TimeEntryDialog";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { toast } from "sonner";

interface TimeEntryContainerProps {
  projects: Project[];
  fetchTimeEntries: () => void;
  selectedProject: Project | null;
  session: { user: { id: string } } | null;
}

export function TimeEntryContainer({
  projects,
  fetchTimeEntries,
  selectedProject,
  session,
}: TimeEntryContainerProps) {
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
      toast.success("Tempo registrato con successo!");
    } catch (error: any) {
      toast.error("Error adding time entry: " + error.message);
    }
  };

  return (
    <TimeEntryDialog
      onSubmit={handleNewEntry}
      projects={projects}
    />
  );
}
