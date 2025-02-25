import { Card, CardContent } from "@/components/ui/card";
import { TimeEntry } from "@/types/TimeEntry";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ProjectTimeChartProps {
  entries: TimeEntry[];
}

export function ProjectTimeChart({ entries }: ProjectTimeChartProps) {
  // Raggruppa i dati per giorno e somma le ore
  const aggregatedData = entries.reduce<Record<string, { date: string; hours: number; billableHours: number }>>(
    (acc, entry) => {
      const date = new Date(entry.startDate).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, hours: 0, billableHours: 0 };
      }
      acc[date].hours += entry.hours;
      acc[date].billableHours += entry.billableHours;
      return acc;
    },
    {}
  );

  // Converti l'oggetto in array per il grafico
  const data = Object.values(aggregatedData);

  return (
    <Card className="w-full p-4 shadow-lg">
      <CardContent>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Andamento Ore Registrate e Fatturabili</h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" name="Ore Registrate" />
              <Bar dataKey="billableHours" fill="#f97316" name="Ore Fatturabili" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
