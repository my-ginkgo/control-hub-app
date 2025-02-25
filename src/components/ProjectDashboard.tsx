
import { useEffect, useState } from "react";
import { TimeTable } from "./TimeTable";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/Project";
import { Client } from "@/types/Client";
import { TimeEntryData } from "./TimeEntry";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { ProjectTimeChart } from "./ProjectTimeChart";
import { Button } from "./ui/button";
import { ArrowLeft, Building } from "lucide-react";
import { Separator } from "./ui/separator";
import { Link } from "react-router-dom";

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
  const [client, setClient] = useState<Client | null>(null);
  const { role } = useRole();
  const { session } = useAuth();
  const [totalHours, setTotalHours] = useState(0);
  const [totalBillableHours, setTotalBillableHours] = useState(0);

  useEffect(() => {
    fetchTimeEntries();
    if (project.client_id) {
      fetchClient();
    }
  }, [project.id, project.client_id, role, session?.user?.id]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", project.client_id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      toast.error("Errore nel caricamento del cliente: " + error.message);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true);
      const { data: entries, error } = await supabase
        .from("time_entries")
        .select(`
          *,
          project:project_id (
            name
          )
        `)
        .eq("project_id", project.id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Fetch user information from auth users directly
      const userIds = new Set<string>();
      entries.forEach(entry => {
        if (entry.user_id) userIds.add(entry.user_id);
        if (entry.assigned_user_id) userIds.add(entry.assigned_user_id);
      });

      const { data: users, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id, email")
        .in("user_id", Array.from(userIds));

      if (usersError) throw usersError;

      // Create a map of user information
      const userMap: Record<string, UserInfo> = {};
      users?.forEach(user => {
        userMap[user.user_id] = {
          id: user.user_id,
          email: user.email || user.user_id
        };
      });

      setUserInfoMap(userMap);

      const formattedEntries = entries.map((entry) => ({
        hours: entry.hours,
        billableHours: entry.billable_hours,
        project: entry.project?.name || "",
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

      // Calculate totals
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
          {client && (
            <div className="mt-4">
              <Separator className="my-4" />
              <Link 
                to={`/client/${client.id}`}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Building className="mr-2 h-4 w-4" />
                Cliente: {client.name}
              </Link>
              {client.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {client.description}
                </p>
              )}
            </div>
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

