import { useEffect, useState } from "react";
import { TimeEntry } from "@/types/Project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { ClientProjectsChart } from "./ClientProjectsChart";
import { useNavigate } from "react-router-dom";
import { DeleteProjectDialog } from "./project/DeleteProjectDialog";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "./AuthProvider";

interface ProjectDashboardProps {
  project: Project;
  onBack?: () => void;
}

interface UserInfo {
  id: string;
  email: string;
}

export function ProjectDashboard({ project, onBack }: ProjectDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [client, setClient] = useState<Client | null>(null);
  const { role } = useRole();
  const { session } = useAuth();
  const [totalHours, setTotalHours] = useState(0);
  const [totalBillableHours, setTotalBillableHours] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimeEntries();
    if (project.client_id) {
      fetchClient();
    }
  }, [project.id, project.client_id, role, session?.user?.id]);

  const handleDeleteProject = async () => {
    try {
      const { error: timeEntriesError } = await supabase
        .from('time_entries')
        .delete()
        .eq('project_id', project.id);

      if (timeEntriesError) throw timeEntriesError;

      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      toast.success("Progetto eliminato con successo");
      navigate("/");
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del progetto: " + error.message);
    }
  };

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
        .select("*, projects!time_entries_project_id_fkey(name)")
        .eq("project_id", project.id)
        .order("date", { ascending: false });

      if (error) throw error;

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
        project: entry.projects?.name || "",
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

  const isCurrentUserProject = (project: Project) => {
    return project.user_id === session?.user?.id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
        {isCurrentUserProject(project) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina Progetto
          </Button>
        )}
      </div>

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

      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteProject}
      />
    </div>
  );
}
