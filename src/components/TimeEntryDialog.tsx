
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Project } from "@/types/Project";

interface TimeEntryDialogProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
  children?: React.ReactNode;
}

export function TimeEntryDialog({ onSubmit, projects, children }: TimeEntryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-[#24253a] border-[#383a5c]">
        <DialogHeader>
          <DialogTitle className="text-white">Registra Ore</DialogTitle>
        </DialogHeader>
        <TimeEntry
          onSubmit={(data) => {
            onSubmit(data);
          }}
          projects={projects}
        />
      </DialogContent>
    </Dialog>
  );
}

