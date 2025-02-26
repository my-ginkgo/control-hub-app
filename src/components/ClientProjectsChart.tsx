
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from '@/types/Project';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClientProjectsChartProps {
  clientId: string;
}

interface ProjectStats {
  projectName: string;
  totalHours: number;
  billableHours: number;
}

export function ClientProjectsChart({ clientId }: ClientProjectsChartProps) {
  const [stats, setStats] = useState<ProjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectStats();
  }, [clientId]);

  const fetchProjectStats = async () => {
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          time_entries!time_entries_project_id_fkey (
            hours,
            billable_hours
          )
        `)
        .eq('client_id', clientId);

      if (projectsError) throw projectsError;

      // Calculate totals for each project
      const projectStats: ProjectStats[] = projects?.map((project: any) => ({
        projectName: project.name,
        totalHours: project.time_entries?.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0,
        billableHours: project.time_entries?.reduce((sum: number, entry: any) => sum + (entry.billable_hours || 0), 0) || 0,
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
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Ore per Progetto</CardTitle>
      </CardHeader>
      <CardContent>
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
  );
}
