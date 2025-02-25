
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { Project } from "@/types/Project";

interface TimeEntryDialogProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
}

export function TimeEntryDialog({ onSubmit, projects }: TimeEntryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-6 bg-[#24253a] border-[#383a5c] hover:bg-[#2a2b3d] transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Registra Ore</h3>
            <Button
              variant="outline"
              size="icon"
              className="border-[#383a5c] text-white hover:bg-[#2a2b3d]"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="bg-[#24253a] border-[#383a5c]">
        <DialogHeader>
          <DialogTitle className="text-white">Registra Ore</DialogTitle>
        </DialogHeader>
        <TimeEntry onSubmit={(data) => {
          onSubmit(data);
        }} projects={projects} />
      </DialogContent>
    </Dialog>
  );
}
