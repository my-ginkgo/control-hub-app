import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Project } from "@/types/Project";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface TimeEntryDialogProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
}

export function TimeEntryDialog({ onSubmit, projects }: TimeEntryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{
            background: "linear-gradient(135deg, #b91c1c, #f59e0b)",
            scale: 1.02,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-2xl transition-all">
          <Card className="p-6 bg-gradient-to-br from-red-600 to-amber-500 border border-transparent hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer rounded-2xl">
            <div className="flex items-center justify-between">
              <motion.h3
                className="text-lg font-semibold text-white tracking-wide"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3, ease: "easeOut" }}>
                Registra Ore
              </motion.h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </motion.div>
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
