
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ProjectSelect } from "./ProjectSelect";
import { UserSelect } from "./UserSelect";
import { Project } from "@/types/Project";

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
      <ProjectSelect 
        projects={projects} 
        selectedProject={selectedProject_} 
        onProjectChange={setSelectedProject} 
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours" className="text-gray-200">Hours *</Label>
          <Input
            id="hours"
            type="number"
            min="0.1"
            step="0.1"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              if (isBillable) {
                setBillableHours(e.target.value);
              }
            }}
            required
            className="bg-[#1a1b26] border-[#383a5c] text-white"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="billableHours" className="text-gray-200">Billable Hours</Label>
            <div className="flex items-center">
              <Switch 
                id="isBillable" 
                checked={isBillable} 
                onCheckedChange={(checked) => {
                  setIsBillable(checked);
                  if (checked) {
                    setBillableHours(hours);
                  } else {
                    setBillableHours("0");
                  }
                }} 
              />
              <Label htmlFor="isBillable" className="text-gray-400 text-xs ml-2">Billable</Label>
            </div>
          </div>
          <Input
            id="billableHours"
            type="number"
            min="0"
            step="0.1"
            value={billableHours}
            onChange={(e) => setBillableHours(e.target.value)}
            required
            disabled={!isBillable}
            className="bg-[#1a1b26] border-[#383a5c] text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-200">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1b26] border-[#383a5c]">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
                className="bg-[#1a1b26] text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-200">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1b26] border-[#383a5c]">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
                className="bg-[#1a1b26] text-white"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-gray-200">Notes</Label>
        <Textarea 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          className="bg-[#1a1b26] border-[#383a5c] text-white h-20"
        />
      </div>

      <UserSelect
        selectedUserId={assignedUser}
        onUserChange={setAssignedUser}
        className="bg-[#1a1b26] border-[#383a5c] text-white"
        label="Assigned To"
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-[#2a2b3d] border-[#383a5c] text-white hover:bg-[#383a5c]"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
