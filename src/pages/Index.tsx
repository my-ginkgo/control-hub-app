
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { useState } from "react";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { TimeEntryData } from "@/components/TimeEntry";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { ColorConfigurator } from "@/components/ColorConfigurator";

export default function Index() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [timeEntries] = useState<TimeEntryData[]>([]);

  const handleBack = () => {
    setSelectedProject(null);
    setSelectedClient(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-amber-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurazione Colori</DialogTitle>
            </DialogHeader>
            <ColorConfigurator />
          </DialogContent>
        </Dialog>
      </div>
      
      <DashboardContainer 
        selectedProject={selectedProject}
        selectedClient={selectedClient}
        timeEntries={timeEntries}
        onBack={handleBack}
      />
    </div>
  );
}
