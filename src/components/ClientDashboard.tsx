
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
import { ArrowLeft, Building, Clock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DeleteClientDialog } from "./client/DeleteClientDialog";
import { ClientProjectsChart } from "./ClientProjectsChart";
import { Separator } from "./ui/separator";
import { DateRangeSelector } from "./charts/DateRangeSelector";
import { DateRange } from "@/types/chart";
import { getDateRange } from "@/utils/dateRangeUtils";
import { TimeTable } from "./TimeTable";

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
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });
  const navigate = useNavigate();
  const { start, end } = getDateRange(dateRange, customDateRange);

  useEffect(() => {
    fetchProjectsAndTotals();
  }, [client.id, dateRange, customDateRange]);

  const fetchProjectsAndTotals = async () => {
    try {
      console.log("Fetching projects with date range:", { start, end });
      
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          time_entries (
            hours,
            billable_hours,
            start_date
          )
        `)
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        throw projectsError;
      }

      console.log("Projects data received:", projectsData);

      const projects = projectsData || [];
      setProjects(projects);

      // Calcola i totali nel range di date selezionato
      const totals = projects.reduce(
        (acc, project: any) => {
          const filteredEntries = project.time_entries?.filter((entry: any) => {
            const entryDate = new Date(entry.start_date);
            return entryDate >= start && entryDate <= end;
          }) || [];

          const totalHours = filteredEntries.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0);
          const totalBillableHours = filteredEntries.reduce((sum: number, entry: any) => sum + (entry.billable_hours || 0), 0);

          return {
            totalHours: acc.totalHours + totalHours,
            totalBillableHours: acc.totalBillableHours + totalBillableHours,
            totalProjects: acc.totalProjects + 1,
          };
        },
        {
          totalHours: 0,
          totalBillableHours: 0,
          totalProjects: 0,
        }
      );

      console.log("Calculated totals:", totals);
      setTotals(totals);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in fetchProjectsAndTotals:", error);
      toast.error("Errore nel caricamento dei progetti: " + error.message);
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", client.id);

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
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Torna alla dashboard</h2>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="bg-red-500 hover:bg-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Elimina Cliente
        </Button>
      </div>

      <div className="flex justify-end">
        <DateRangeSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-red-400" />
            <CardTitle>{client.name}</CardTitle>
          </div>
          {client.description && <p className="text-sm text-gray-500 dark:text-gray-400">{client.description}</p>}
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

          <div className="h-[300px] overflow-auto border rounded-lg p-4">
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                      )}
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500">Nessun progetto associato a questo cliente.</div>
              )}
            </div>
          </div>

          <Separator />

          <ClientProjectsChart clientId={client.id} start={start} end={end} />

          <Separator />

          <TimeTable 
            entries={projects.flatMap((project: any) => 
              (project.time_entries || []).map((entry: any) => ({
                ...entry,
                project: project.name,
                id: entry.id
              }))
            )} 
            start={start} 
            end={end} 
          />

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
