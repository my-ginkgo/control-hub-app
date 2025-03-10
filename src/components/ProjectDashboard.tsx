import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { TimeEntry } from "@/types/TimeEntry";
import { ArrowLeft, Building, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { DeleteProjectDialog } from "./project/DeleteProjectDialog";
import { ProjectTimeChart } from "./ProjectTimeChart";
import { TimeTable } from "./TimeTable";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  useEffect(() => {
    fetchTimeEntries();
    if (project.client_id) {
      fetchClient();
    }
  }, [project.id, project.client_id, role, session?.user?.id]);

  const handleDeleteProject = async () => {
    try {
      const { error: timeEntriesError } = await supabase.from("time_entries").delete().eq("project_id", project.id);

      if (timeEntriesError) throw timeEntriesError;

      const { error: projectError } = await supabase.from("projects").delete().eq("id", project.id);

      if (projectError) throw projectError;

      toast.success("Progetto eliminato con successo");
      navigate("/");
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del progetto: " + error.message);
    }
  };

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase.from("clients").select("*").eq("id", project.client_id).single();

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
      entries.forEach((entry) => {
        if (entry.user_id) userIds.add(entry.user_id);
        if (entry.assigned_user_id) userIds.add(entry.assigned_user_id);
      });

      const { data: users, error: usersError } = await supabase
        .from("user_roles")
        .select("user_id, email")
        .in("user_id", Array.from(userIds));

      if (usersError) throw usersError;

      const userMap: Record<string, UserInfo> = {};
      users?.forEach((user) => {
        userMap[user.user_id] = {
          id: user.user_id,
          email: user.email || user.user_id,
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
          className="mb-4 -ml-2 text-gray-400 hover:text-white hover:bg-[#333333]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>
        {isCurrentUserProject(project) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina Progetto
          </Button>
        )}
      </div>

      <Card className="bg-[#1E1E1E] border-0 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600">
            {project.name}
          </CardTitle>
          {project.description && <p className="text-sm text-gray-400">{project.description}</p>}
          {client && (
            <div className="mt-4">
              <Separator className="my-4 bg-gray-800" />
              <Link
                to={`/client/${client.id}`}
                className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <Building className="mr-2 h-4 w-4" />
                Cliente: {client.name}
              </Link>
              {client.description && (
                <p className="mt-2 text-sm text-gray-500">{client.description}</p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Ore Totali</p>
            {isLoading ? 
              <Skeleton className="h-6 w-20 bg-gray-700" /> : 
              <p className="text-2xl font-bold text-red-600">{totalHours}</p>
            }
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Ore Fatturabili</p>
            {isLoading ? 
              <Skeleton className="h-6 w-20 bg-gray-700" /> : 
              <p className="text-2xl font-bold text-red-600">{totalBillableHours}</p>
            }
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[400px] w-full bg-gray-700" />
        </div>
      ) : (
        <>
          <ProjectTimeChart entries={timeEntries} />
          {timeEntries.length > 0 ? (
            <TimeTable entries={timeEntries} start={startOfMonth} end={endOfMonth} />
          ) : (
            <Card className="bg-[#1E1E1E] border-0 text-white">
              <CardContent className="flex items-center justify-center py-6">
                <p className="text-gray-400">Nessuna registrazione trovata per questo progetto</p>
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
