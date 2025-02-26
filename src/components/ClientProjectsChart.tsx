
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DateRange } from '@/types/chart';
import { DateRangeSelector } from './charts/DateRangeSelector';
import { getDateRange } from '@/utils/dateRangeUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

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
          time_entries(
            hours,
            billable_hours,
            start_date,
            notes,
            assigned_user_id,
            user_roles!inner(email)
          )
        `)
        .eq('client_id', clientId);

      if (projectsError) throw projectsError;

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

  const toggleRow = (projectName: string) => {
    setExpandedRows((current) =>
      current.includes(projectName)
        ? current.filter((name) => name !== projectName)
        : [...current, projectName]
    );
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
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Progetto</TableHead>
                  <TableHead>Ore Totali</TableHead>
                  <TableHead>Ore Fatturabili</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((project) => (
                  <>
                    <TableRow
                      key={project.projectName}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(project.projectName)}
                    >
                      <TableCell>
                        {expandedRows.includes(project.projectName) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>{project.projectName}</TableCell>
                      <TableCell>{project.totalHours}</TableCell>
                      <TableCell>{project.billableHours}</TableCell>
                    </TableRow>
                    {expandedRows.includes(project.projectName) && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-12">Data</TableHead>
                                <TableHead>Utente</TableHead>
                                <TableHead>Ore</TableHead>
                                <TableHead>Ore Fatturabili</TableHead>
                                <TableHead>Note</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {project.timeEntries.map((entry, index) => (
                                <TableRow key={`${project.projectName}-${entry.date}-${index}`}>
                                  <TableCell className="pl-12">{entry.date}</TableCell>
                                  <TableCell>{entry.userEmail}</TableCell>
                                  <TableCell>{entry.hours}</TableCell>
                                  <TableCell>{entry.billableHours}</TableCell>
                                  <TableCell>{entry.notes || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

