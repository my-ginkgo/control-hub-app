
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
        <DialogHeader>
          <DialogTitle className="text-white">Registra Ore</DialogTitle>
        </DialogHeader>
        <TimeEntry onSubmit={onSubmit} projects={projects} />
      </DialogContent>
    </Dialog>
  );
}
