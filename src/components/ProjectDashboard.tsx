
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

interface UserInfo {
  id: string;
  email: string;
}

export function ProjectDashboard({ project, onBack }: ProjectDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
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

      const { data: entries, error } = await query.order("date", { ascending: false });

      if (error) throw error;

      // Raccogli tutti gli ID utente unici
      const userIds = new Set<string>();
      entries.forEach(entry => {
        if (entry.user_id) userIds.add(entry.user_id);
        if (entry.assigned_user_id) userIds.add(entry.assigned_user_id);
      });

      // Fetch delle informazioni degli utenti
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', Array.from(userIds));

      if (usersError) throw usersError;

      // Crea una mappa degli utenti
      const userMap = (users || []).reduce((acc, user) => ({
        ...acc,
        [user.id]: { id: user.id, email: user.email }
      }), {} as Record<string, UserInfo>);

      setUserInfoMap(userMap);

      const formattedEntries = entries.map((entry) => ({
        hours: entry.hours,
        billableHours: entry.billable_hours,
        project: entry.projects.name,
        notes: entry.notes,
        date: entry.date,
        assignedUserId: entry.assigned_user_id,
        userId: entry.user_id,
        startDate: entry.start_date,
        endDate: entry.end_date,
        assignedUserEmail: userMap[entry.assigned_user_id]?.email || entry.assigned_user_id,
        userEmail: userMap[entry.user_id]?.email || entry.user_id,
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
