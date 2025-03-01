
import { useEffect } from "react";
import { Project } from "@/types/Project";
import { ProjectSection } from "./form-sections/ProjectSection";
import { HoursSection } from "./form-sections/HoursSection";
import { DateSection } from "./form-sections/DateSection";
import { NotesSection } from "./form-sections/NotesSection";
import { AssignmentSection } from "./form-sections/AssignmentSection";
import { FormActions } from "./form-sections/FormActions";

interface TimeEntryFormProps {
  projects: Project[];
  selectedProject: Project | null;
  onSubmit: (e: React.FormEvent) => void;
  hours: string;
  setHours: (hours: string) => void;
  billableHours: string;
  setBillableHours: (hours: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  assignedUser: string;
  setAssignedUser: (userId: string) => void;
  selectedProject_: string;
  setSelectedProject: (project: string) => void;
  isBillable: boolean;
  setIsBillable: (billable: boolean) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function TimeEntryForm({
  projects,
  selectedProject,
  onSubmit,
  hours,
  setHours,
  billableHours,
  setBillableHours,
  notes,
  setNotes,
  assignedUser,
  setAssignedUser,
  selectedProject_,
  setSelectedProject,
  isBillable,
  setIsBillable,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isLoading,
  onCancel
}: TimeEntryFormProps) {
  useEffect(() => {
    if (selectedProject?.name) {
      setSelectedProject(selectedProject.name);
    }
  }, [selectedProject, setSelectedProject]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ProjectSection 
        projects={projects}
        selectedProject_={selectedProject_}
        setSelectedProject={setSelectedProject}
        selectedProject={selectedProject}
      />

      <HoursSection 
        hours={hours}
        setHours={setHours}
        billableHours={billableHours}
        setBillableHours={setBillableHours}
        isBillable={isBillable}
        setIsBillable={setIsBillable}
      />

      <DateSection 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <NotesSection 
        notes={notes}
        setNotes={setNotes}
      />

      <AssignmentSection 
        assignedUser={assignedUser}
        setAssignedUser={setAssignedUser}
      />

      <FormActions 
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </form>
  );
}
