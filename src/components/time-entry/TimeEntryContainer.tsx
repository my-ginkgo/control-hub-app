
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { TimeEntryData } from "@/components/TimeEntry";
import { RecentTimeEntries } from "./RecentTimeEntries";
import { TimeEntryForm } from "./TimeEntryForm";

interface TimeEntryContainerProps {
  projects: Project[];
  fetchTimeEntries: () => void;
  selectedProject: Project | null;
  session: Session | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntries?: TimeEntryData[];
}

export function TimeEntryContainer({
  projects,
  fetchTimeEntries,
  selectedProject,
  session,
  isOpen,
  onOpenChange,
  timeEntries = [],
}: TimeEntryContainerProps) {
  const [selectedProject_, setSelectedProject] = useState("");
  const [hours, setHours] = useState("1");
  const [billableHours, setBillableHours] = useState("1");
  const [notes, setNotes] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [isBillable, setIsBillable] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Set selectedProject when prop changes
  useEffect(() => {
    if (selectedProject?.name) {
      setSelectedProject(selectedProject.name);
    }
  }, [selectedProject]);

  // Reset form fields to initial state
  const resetForm = () => {
    if (selectedProject?.name) {
      setSelectedProject(selectedProject.name);
    } else {
      setSelectedProject("");
    }
    setHours("1");
    setBillableHours("1");
    setNotes("");
    setAssignedUser(session?.user?.id || "");
    setIsBillable(true);
    setStartDate(new Date());
    setEndDate(new Date());
  };

  // Initialize assignedUser with current user ID on component mount
  useEffect(() => {
    if (session?.user?.id && !assignedUser) {
      setAssignedUser(session.user.id);
    }
  }, [session, assignedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject_) {
      toast.error("Please select a project");
      return;
    }

    const project = projects.find((p) => p.name === selectedProject_);
    if (!project) {
      toast.error("Invalid project selected");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("time_entries").insert({
        hours: parseFloat(hours),
        billable_hours: isBillable ? parseFloat(billableHours) : 0,
        notes,
        project_id: project.id,
        user_id: session?.user?.id,
        assigned_user_id: assignedUser || session?.user?.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        date: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Time entry added successfully");
      resetForm();
      onOpenChange(false);
      fetchTimeEntries();
    } catch (error: any) {
      toast.error("Error adding time entry: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Recent Time Entries */}
      <RecentTimeEntries 
        timeEntries={timeEntries}
        onAddTimeEntry={() => onOpenChange(true)} 
      />

      {/* Time Entry Dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1a1b26] border-[#2a2b3d] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Time Entry</DialogTitle>
          </DialogHeader>
          <TimeEntryForm
            projects={projects}
            selectedProject={selectedProject}
            onSubmit={handleSubmit}
            hours={hours}
            setHours={setHours}
            billableHours={billableHours}
            setBillableHours={setBillableHours}
            notes={notes}
            setNotes={setNotes}
            assignedUser={assignedUser}
            setAssignedUser={setAssignedUser}
            selectedProject_={selectedProject_}
            setSelectedProject={setSelectedProject}
            isBillable={isBillable}
            setIsBillable={setIsBillable}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            isLoading={isLoading}
            onCancel={() => {
              resetForm();
              onOpenChange(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
