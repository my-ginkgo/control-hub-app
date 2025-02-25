
import { useEffect, useState } from "react";
import { TimeTable } from "./TimeTable";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { TimeEntryData } from "./TimeEntry";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { ProjectTimeChart } from "./ProjectTimeChart";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface ProjectDashboardProps {
  project: Project;
  onBack?: () => void;
}

export function ProjectDashboard({ project, onBack }: ProjectDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useRole();
  const { session } = useAuth();
  const [totalHours, setTotalHours] = useState(0);
  const [totalBillableHours, setTotalBillableHours] = useState(0);

  useEffect(() => {
    fetchTimeEntries();
  }, [project.id, role, session?.user?.id]);

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("time_entries")
        .select("*, projects(name)")
        .eq("project_id", project.id);

      // Se l'utente è un dipendente, filtra solo le sue ore
      if (role === "DIPENDENTE" && session?.user?.id) {
        query = query.eq("user_id", session.user.id);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;

      const formattedEntries = data.map((entry) => ({
        hours: entry.hours,
        billableHours: entry.billable_hours,
        project: entry.projects.name,
        notes: entry.notes,
        date: entry.date,
        assignedUserId: entry.assigned_user_id,
        startDate: entry.start_date,
        endDate: entry.end_date,
      }));

      setTimeEntries(formattedEntries);

      // Calcola i totali
      const hours = formattedEntries.reduce((acc, entry) => acc + Number(entry.hours), 0);
      const billableHours = formattedEntries.reduce((acc, entry) => acc + Number(entry.billableHours), 0);
      
      setTotalHours(hours);
      setTotalBillableHours(billableHours);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle ore: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna alla Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {project.name}
          </CardTitle>
          {project.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ore Totali</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-2xl font-bold">{totalHours}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ore Fatturabili</p>
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-2xl font-bold">{totalBillableHours}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <ProjectTimeChart entries={timeEntries} />
          {timeEntries.length > 0 ? (
            <TimeTable entries={timeEntries} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <p className="text-gray-500 dark:text-gray-400">
                  Nessuna registrazione trovata per questo progetto
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
