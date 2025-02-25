
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TimeEntryData } from "./TimeEntry";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfWeek, startOfMonth, startOfYear, isWithinInterval, subDays, subMonths, subYears } from "date-fns";
import { it } from "date-fns/locale";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly" | "total";

interface ProjectTimeChartProps {
  entries: TimeEntryData[];
}

export function ProjectTimeChart({ entries }: ProjectTimeChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  const chartData = useMemo(() => {
    const now = new Date();
    let filteredEntries: TimeEntryData[] = [];
    let dateFormat: string;
    let groupingFormat: string;

    // Filtra e raggruppa i dati in base al periodo selezionato
    switch (timeRange) {
      case "daily":
        filteredEntries = entries.filter(entry => 
          isWithinInterval(new Date(entry.startDate), {
            start: subDays(now, 30),
            end: now
          })
        );
        dateFormat = "dd/MM";
        groupingFormat = "yyyy-MM-dd";
        break;
      case "weekly":
        filteredEntries = entries.filter(entry =>
          isWithinInterval(new Date(entry.startDate), {
            start: subMonths(now, 3),
            end: now
          })
        );
        dateFormat = "'Sett.' w";
        groupingFormat = "yyyy-'W'w";
        break;
      case "monthly":
        filteredEntries = entries.filter(entry =>
          isWithinInterval(new Date(entry.startDate), {
            start: subMonths(now, 12),
            end: now
          })
        );
        dateFormat = "MMM yyyy";
        groupingFormat = "yyyy-MM";
        break;
      case "yearly":
        filteredEntries = entries.filter(entry =>
          isWithinInterval(new Date(entry.startDate), {
            start: subYears(now, 5),
            end: now
          })
        );
        dateFormat = "yyyy";
        groupingFormat = "yyyy";
        break;
      case "total":
        filteredEntries = [...entries];
        dateFormat = "MMM yyyy";
        groupingFormat = "yyyy-MM";
        break;
    }

    // Raggruppa le ore per periodo
    const groupedData = filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.startDate);
      let groupKey: string;

      switch (timeRange) {
        case "weekly":
          groupKey = format(startOfWeek(date, { locale: it }), groupingFormat, { locale: it });
          break;
        case "monthly":
          groupKey = format(startOfMonth(date), groupingFormat);
          break;
        case "yearly":
          groupKey = format(startOfYear(date), groupingFormat);
          break;
        default:
          groupKey = format(date, groupingFormat);
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          totalHours: 0,
          billableHours: 0
        };
      }
      acc[groupKey].totalHours += Number(entry.hours);
      acc[groupKey].billableHours += Number(entry.billableHours);
      return acc;
    }, {} as Record<string, { totalHours: number; billableHours: number }>);

    // Converte i dati raggruppati in formato array per il grafico
    return Object.entries(groupedData)
      .map(([date, hours]) => {
        const displayDate = format(
          timeRange === "weekly"
            ? startOfWeek(new Date(date.split("-W")[0] + "-01-01"), { weekStartsOn: 1 })
            : new Date(date),
          dateFormat,
          { locale: it }
        );
        return {
          date: displayDate,
          oreReali: Number(hours.totalHours.toFixed(2)),
          oreFatturabili: Number(hours.billableHours.toFixed(2))
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [entries, timeRange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Andamento Temporale</CardTitle>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleziona periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Giornaliero</SelectItem>
              <SelectItem value="weekly">Settimanale</SelectItem>
              <SelectItem value="monthly">Mensile</SelectItem>
              <SelectItem value="yearly">Annuale</SelectItem>
              <SelectItem value="total">Totale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="oreReali"
              stroke="#8884d8"
              name="Ore Reali"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="oreFatturabili"
              stroke="#82ca9d"
              name="Ore Fatturabili"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
