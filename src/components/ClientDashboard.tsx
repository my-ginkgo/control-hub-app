
import { useEffect, useState } from "react";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { ClientProjectsChart } from "./ClientProjectsChart";
import { useNavigate } from "react-router-dom";
import { DeleteClientDialog } from "./client/DeleteClientDialog";

interface ClientDashboardProps {
  client: Client;
  onBack: () => void;
}

interface ClientTotals {
  totalHours: number;
  totalBillableHours: number;
  totalProjects: number;
}

export function ClientDashboard({ client, onBack }: ClientDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totals, setTotals] = useState<ClientTotals>({
    totalHours: 0,
    totalBillableHours: 0,
    totalProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjectsAndTotals();
  }, [client.id]);

  const fetchProjectsAndTotals = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          description,
          time_entries!time_entries_project_id_fkey (
            hours,
            billable_hours
          )
        `)
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      const projects = projectsData || [];
      setProjects(projects);

      // Calcola i totali
      const totals = projects.reduce((acc, project: any) => ({
        totalHours: acc.totalHours + (project.time_entries?.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0),
        totalBillableHours: acc.totalBillableHours + (project.time_entries?.reduce((sum: number, entry: any) => sum + (entry.billable_hours || 0), 0) || 0),
        totalProjects: acc.totalProjects + 1,
      }), {
        totalHours: 0,
        totalBillableHours: 0,
        totalProjects: 0,
      });

      setTotals(totals);
      setIsLoading(false);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei progetti: " + error.message);
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Cliente eliminato con successo");
      setIsDeleteDialogOpen(false);
      navigate("/");
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del cliente: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Torna alla dashboard</h2>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="bg-red-500 hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Elimina Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-400" />
            <CardTitle>{client.name}</CardTitle>
          </div>
          {client.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {client.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progetti Totali</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.totalProjects}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ore Totali</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.totalHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ore Fatturabili</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.totalBillableHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
          </div>

          <Separator />
          
          <ClientProjectsChart clientId={client.id} />

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Progetti</h3>
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-sm text-gray-500">Caricamento progetti...</div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {project.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  Nessun progetto associato a questo cliente.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteClientDialog
        client={client}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteClient}
      />
    </div>
  );
}
