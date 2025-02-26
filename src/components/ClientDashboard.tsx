
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/Client";
import { Project } from "@/types/Project";
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
import { ClientHeader } from "./client/ClientHeader";
import { ClientInfo } from "./client/ClientInfo";
import { ClientStats } from "./client/ClientStats";
import { ClientProjects } from "./client/ClientProjects";

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

      // Calculate totals within the selected date range
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
      <ClientHeader 
        client={client} 
        onBack={onBack} 
        onDelete={() => setIsDeleteDialogOpen(true)} 
      />

      <div className="flex justify-end">
        <DateRangeSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>

      <Card>
        <ClientInfo client={client} />
        <CardContent className="space-y-6">
          <ClientStats 
            totalProjects={totals.totalProjects}
            totalHours={totals.totalHours}
            totalBillableHours={totals.totalBillableHours}
          />

          <ClientProjects projects={projects} isLoading={isLoading} />

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
