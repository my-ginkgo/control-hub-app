
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { Session } from "@supabase/supabase-js";
import { Plus, Pencil, Clock, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { UserSelect } from "./UserSelect";
import { ProjectSelect } from "./ProjectSelect";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TimeEntryData } from "@/components/TimeEntry";

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

  useEffect(() => {
    if (selectedProject?.name) {
      setSelectedProject(selectedProject.name);
    }
  }, [selectedProject]);

  const resetForm = () => {
    if (selectedProject?.name) {
      setSelectedProject(selectedProject.name);
    } else {
      setSelectedProject("");
    }
    setHours("1");
    setBillableHours("1");
    setNotes("");
    setAssignedUser("");
    setIsBillable(true);
    setStartDate(new Date());
    setEndDate(new Date());
  };

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
    <div>
      {/* Recent Time Entries Display */}
      {timeEntries && timeEntries.length > 0 && (
        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Recent Entries</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(true)}
              className="bg-red-600 hover:bg-red-700 text-white border-none h-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeEntries.map((entry) => (
              <Card key={entry.id} className="bg-[#1E1E1E] border-0 hover:bg-[#2a2a2a] transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{entry.project}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {format(new Date(entry.startDate), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-red-500 font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>{entry.hours}h</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{entry.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Time Entry Dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1a1b26] border-[#2a2b3d]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Time Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Assigned To"
              value={assignedUser}
              onChange={setAssignedUser}
              className="bg-[#1a1b26] border-[#383a5c] text-white"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
