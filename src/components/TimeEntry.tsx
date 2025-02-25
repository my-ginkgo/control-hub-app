
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function TimeEntry({ onSubmit }: { onSubmit: (data: TimeEntryData) => void }) {
  const [hours, setHours] = useState("");
  const [billableHours, setBillableHours] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !project) {
      toast.error("Per favore compila tutti i campi obbligatori");
      return;
    }

    onSubmit({
      hours: parseFloat(hours),
      billableHours: billableHours ? parseFloat(billableHours) : parseFloat(hours),
      project,
      notes,
      date: new Date().toISOString(),
    });

    setHours("");
    setBillableHours("");
    setProject("");
    setNotes("");
    toast.success("Tempo registrato con successo!");
  };

  return (
    <Card className="p-6 animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Ore Reali *
            </label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Es. 8"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="billableHours" className="text-sm font-medium">
              Ore Fatturabili
            </label>
            <Input
              id="billableHours"
              type="number"
              step="0.5"
              min="0"
              value={billableHours}
              onChange={(e) => setBillableHours(e.target.value)}
              placeholder="Es. 7.5"
              className="w-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="project" className="text-sm font-medium">
            Progetto *
          </label>
          <Input
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Nome del progetto"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Note
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descrizione delle attività svolte..."
            className="w-full min-h-[100px]"
          />
        </div>
        <Button type="submit" className="w-full">
          Registra Tempo
        </Button>
      </form>
    </Card>
  );
}

export interface TimeEntryData {
  hours: number;
  billableHours: number;
  project: string;
  notes: string;
  date: string;
}
