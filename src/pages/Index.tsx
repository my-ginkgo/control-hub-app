
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { TimeEntryContainer } from "@/components/time-entry/TimeEntryContainer";
import { Project } from "@/types/Project";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeTable } from "@/components/TimeTable";
import { TimeEntryData } from "@/components/TimeEntry";
import { format, endOfMonth, startOfMonth } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar/context";
import { toast } from "sonner";

export default function Index() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchTimeEntries();
    }
  }, [session]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data) {
        setProjects(data);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
      toast.error("Error fetching projects");
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select(`
          id,
          hours,
          billable_hours,
          notes,
          date,
          start_date,
          end_date,
          assigned_user_id,
          user_id,
          projects(name)
        `)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedEntries = data.map((entry) => ({
          id: entry.id,
          hours: Number(entry.hours),
          billableHours: Number(entry.billable_hours),
          notes: entry.notes,
          date: entry.date,
          project: entry.projects?.name || "Unknown Project",
          startDate: entry.start_date,
          endDate: entry.end_date,
          assignedUserId: entry.assigned_user_id,
          userId: entry.user_id,
        }));
        setTimeEntries(formattedEntries);
      }
    } catch (error: any) {
      console.error("Error fetching time entries:", error.message);
      toast.error("Error fetching time entries");
    }
  };

  return (
    <SidebarProvider>
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Time Tracking</h1>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Time Entry
            </Button>
          </div>

          <div className="space-y-6">
            <TimeEntryContainer 
              projects={projects}
              fetchTimeEntries={fetchTimeEntries}
              selectedProject={null}
              session={session}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              timeEntries={timeEntries}
            />

            <Card className="bg-[#1a1b26] border-[#2a2b3d] text-white">
              <CardHeader>
                <CardTitle>Time Entries Overview</CardTitle>
                <div className="text-sm text-gray-400">
                  {format(startDate, "PP")} - {format(endDate, "PP")}
                </div>
              </CardHeader>
              <CardContent>
                <TimeTable 
                  entries={timeEntries} 
                  onEntryDeleted={fetchTimeEntries}
                  start={startDate}
                  end={endDate}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </SidebarProvider>
  );
}
