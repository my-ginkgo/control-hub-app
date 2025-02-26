
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from '@/types/Project';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DateRange } from '@/types/chart';
import { DateRangeSelector } from './charts/DateRangeSelector';
import { getDateRange } from '@/utils/dateRangeUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface ClientProjectsChartProps {
  clientId: string;
}

interface ProjectStats {
  projectName: string;
  totalHours: number;
  billableHours: number;
  timeEntries: Array<{
    date: string;
    hours: number;
    billableHours: number;
    notes?: string;
    userEmail?: string;
  }>;
}

export function ClientProjectsChart({ clientId }: ClientProjectsChartProps) {
  const [stats, setStats] = useState<ProjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });

  useEffect(() => {
    fetchProjectStats();
  }, [clientId, dateRange, customDateRange]);

  const fetchProjectStats = async () => {
    try {
      const { start, end } = getDateRange(dateRange, customDateRange);

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          time_entries!time_entries_project_id_fkey (
            hours,
            billable_hours,
            start_date,
            notes,
            user_roles!time_entries_user_id_fkey(email)
          )
        `)
        .eq('client_id', clientId);

      if (projectsError) throw projectsError;

      // Calculate totals for each project within the selected date range
      const projectStats: ProjectStats[] = projects?.map((project: any) => ({
        projectName: project.name,
        totalHours: project.time_entries?.reduce((sum: number, entry: any) => {
          const entryDate = new Date(entry.start_date);
          return entryDate >= start && entryDate <= end ? sum + (entry.hours || 0) : sum;
        }, 0) || 0,
        billableHours: project.time_entries?.reduce((sum: number, entry: any) => {
          const entryDate = new Date(entry.start_date);
          return entryDate >= start && entryDate <= end ? sum + (entry.billable_hours || 0) : sum;
        }, 0) || 0,
        timeEntries: project.time_entries
          ?.filter((entry: any) => {
            const entryDate = new Date(entry.start_date);
            return entryDate >= start && entryDate <= end;
          })
          .map((entry: any) => ({
            date: new Date(entry.start_date).toLocaleDateString('it-IT'),
            hours: entry.hours,
            billableHours: entry.billable_hours,
            notes: entry.notes,
            userEmail: entry.user_roles?.email,
          })) || [],
      })) || [];

      setStats(projectStats);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle statistiche: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Caricamento statistiche...</div>;
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Ore per Progetto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <DateRangeSelector
              dateRange={dateRange}
              setDateRange={setDateRange}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projectName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHours" name="Ore Totali" fill="#8884d8" />
                <Bar dataKey="billableHours" name="Ore Fatturabili" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log di Lavoro per Progetto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {stats.map((project) => (
              <div key={project.projectName} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{project.projectName}</h3>
                  <div className="flex gap-4">
                    <p className="text-sm text-muted-foreground">
                      Ore Totali: <span className="font-medium">{project.totalHours}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ore Fatturabili: <span className="font-medium">{project.billableHours}</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Utente</TableHead>
                        <TableHead className="text-right">Ore</TableHead>
                        <TableHead className="text-right">Ore Fatturabili</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.timeEntries.map((entry, index) => (
                        <TableRow key={`${project.projectName}-${entry.date}-${index}`}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.userEmail || "N/A"}</TableCell>
                          <TableCell className="text-right">{entry.hours}</TableCell>
                          <TableCell className="text-right">{entry.billableHours}</TableCell>
                          <TableCell>{entry.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

