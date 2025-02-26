
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { Project } from "@/types/Project";

interface TimeEntryDialogProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeEntryDialog({ onSubmit, projects, isOpen, onOpenChange }: TimeEntryDialogProps) {
  const handleSubmit = (data: TimeEntryData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Registra Ore</DialogTitle>
          <DialogDescription className="text-gray-400">
            Inserisci i dettagli del tuo time entry
          </DialogDescription>
        </DialogHeader>
        <TimeEntry onSubmit={handleSubmit} projects={projects} />
      </DialogContent>
    </Dialog>
  );
}
