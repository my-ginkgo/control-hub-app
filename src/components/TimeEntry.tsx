
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Project } from "@/types/Project";
import { UserSelect } from "./time-entry/UserSelect";
import { ProjectSelect } from "./time-entry/ProjectSelect";

export interface TimeEntryData {
  hours: number;
  billableHours: number;
  project: string;
  notes?: string;
  date: string;
  assignedUserId: string;
  userId: string;
  startDate: string;
  endDate: string;
  assignedUserEmail?: string;
  userEmail?: string;
}

interface TimeEntryProps {
  onSubmit: (data: TimeEntryData) => void;
  projects: Project[];
}

export function TimeEntry({ onSubmit, projects }: TimeEntryProps) {
  const [hours, setHours] = useState("");
  const [billableHours, setBillableHours] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    onSubmit({
      hours: Number(hours),
      billableHours: Number(billableHours),
      project,
      notes,
      date: now,
      assignedUserId,
      userId: assignedUserId, // For now, setting userId same as assignedUserId
      startDate: startDate || now,
      endDate: endDate || now,
    });

    // Reset form
    setHours("");
    setBillableHours("");
    setProject("");
    setNotes("");
    setAssignedUserId("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProjectSelect
        projects={projects}
        value={project}
        onChange={setProject}
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="hours" className="text-sm text-white">
            Ore Reali
          </label>
          <Input
            id="hours"
            type="number"
            step="0.01"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            className="bg-[#2a2b3d] border-[#383a5c] text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="billableHours" className="text-sm text-white">
            Ore Fatturabili
          </label>
          <Input
            id="billableHours"
            type="number"
            step="0.01"
            value={billableHours}
            onChange={(e) => setBillableHours(e.target.value)}
            required
            className="bg-[#2a2b3d] border-[#383a5c] text-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm text-white">
            Data Inizio
          </label>
          <Input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="bg-[#2a2b3d] border-[#383a5c] text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm text-white">
            Data Fine
          </label>
          <Input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="bg-[#2a2b3d] border-[#383a5c] text-white"
          />
        </div>
      </div>

      <UserSelect
        value={assignedUserId}
        onChange={setAssignedUserId}
      />

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm text-white">
          Note
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-[#2a2b3d] border-[#383a5c] text-white min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        Registra Ore
      </Button>
    </form>
  );
}
