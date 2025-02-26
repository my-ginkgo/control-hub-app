import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { TimeEntryData } from "../TimeEntry";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type ChartType = "line" | "groupedBar" | "stackedBar" | "dbLogs";
type DateRange = "day" | "week" | "month";

interface PostgresLog {
  start_date: string;
  error_severity: string;
  event_message: string;
}

export function TimeAnalyticsCharts({ entries, isAdmin }: { entries: TimeEntryData[]; isAdmin: boolean }) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [chartType, setChartType] = useState<ChartType>("line");

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "day":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "week":
        return {
          start: startOfWeek(now, { locale: it }),
          end: endOfWeek(now, { locale: it }),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  };

  const { start, end } = getDateRange();

  // Fetch DB logs if user is admin
  const { data: dbLogs } = useQuery({
    queryKey: ["dbLogs", start.getTime(), end.getTime()],
    queryFn: async () => {
      if (!isAdmin) return [];

      const response = await fetch(
        `${process.env.VITE_SUPABASE_URL}/rest/v1/postgres_logs?select=*&start_date=gte.${start.toISOString()}&start_date=lte.${end.toISOString()}&order=start_date.asc`,
        {
          headers: {
            apikey: process.env.VITE_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      return data as PostgresLog[];
    },
    enabled: isAdmin && chartType === "dbLogs",
  });

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });

  // Raggruppa le ore per progetto e data
  const groupedData = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.project]) {
      acc[entry.project] = {
        dates: [],
        hours: [],
        billableHours: [],
      };
    }

    const dateStr = new Date(entry.date).toLocaleDateString();
    const existingIndex = acc[entry.project].dates.indexOf(dateStr);

    if (existingIndex === -1) {
      acc[entry.project].dates.push(dateStr);
      acc[entry.project].hours.push(entry.hours);
      acc[entry.project].billableHours.push(entry.billableHours);
    } else {
      acc[entry.project].hours[existingIndex] += entry.hours;
      acc[entry.project].billableHours[existingIndex] += entry.billableHours;
    }

    return acc;
  }, {} as Record<string, { dates: string[]; hours: number[]; billableHours: number[] }>);

  const uniqueProjects = Object.keys(groupedData);
  const allDates = [...new Set(filteredEntries.map((e) => new Date(e.date).toLocaleDateString()))].sort();

  const projectColors = uniqueProjects.reduce((acc, project, index) => {
    const hue = (index * 137.5) % 360;
    acc[project] = `hsla(${hue}, 70%, 50%, 1)`;
    return acc;
  }, {} as Record<string, string>);

  const getChartData = () => {
    if (chartType === "dbLogs" && dbLogs) {
      const groupedLogs = dbLogs.reduce((acc, log) => {
        const date = format(new Date(log.start_date), "dd/MM/yyyy");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dates = Object.keys(groupedLogs).sort();

      return {
        labels: dates,
        datasets: [
          {
            label: "Log Events",
            data: dates.map((date) => groupedLogs[date]),
            backgroundColor: "hsla(200, 70%, 50%, 0.7)",
            borderColor: "hsla(200, 70%, 50%, 1)",
            tension: 0.3,
          },
        ],
      };
    }

    switch (chartType) {
      case "line":
        return {
          labels: allDates,
          datasets: uniqueProjects.map((project) => ({
            label: project,
            data: groupedData[project].hours,
            borderColor: projectColors[project],
            backgroundColor: projectColors[project],
            tension: 0.3,
            fill: false,
          })),
        };

      case "groupedBar":
        return {
          labels: allDates,
          datasets: uniqueProjects.map((project) => ({
            label: project,
            data: groupedData[project].hours,
            backgroundColor: projectColors[project],
          })),
        };

      case "stackedBar":
        return {
          labels: allDates,
          datasets: [
            {
              label: "Ore Billabili",
              data: allDates.map((date) =>
                uniqueProjects.reduce((sum, project) => {
                  const dateIndex = groupedData[project].dates.indexOf(date);
                  return sum + (dateIndex !== -1 ? groupedData[project].billableHours[dateIndex] : 0);
                }, 0)
              ),
              backgroundColor: "hsla(145, 70%, 50%, 0.7)",
            },
            {
              label: "Ore Non Billabili",
              data: allDates.map((date) =>
                uniqueProjects.reduce((sum, project) => {
                  const dateIndex = groupedData[project].dates.indexOf(date);
                  const totalHours = dateIndex !== -1 ? groupedData[project].hours[dateIndex] : 0;
                  const billableHours = dateIndex !== -1 ? groupedData[project].billableHours[dateIndex] : 0;
                  return sum + (totalHours - billableHours);
                }, 0)
              ),
              backgroundColor: "hsla(0, 70%, 50%, 0.7)",
            },
          ],
        };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks:
          chartType === "dbLogs"
            ? {
                label: (context: any) => {
                  return `${context.dataset.label}: ${context.parsed.y} eventi`;
                },
              }
            : undefined,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        stacked: chartType === "stackedBar",
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        stacked: chartType === "stackedBar",
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Andamento Temporale</h2>
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Giorno corrente</SelectItem>
                <SelectItem value="week">Settimana corrente</SelectItem>
                <SelectItem value="month">Mese corrente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Analisi Temporale 📈</SelectItem>
                <SelectItem value="groupedBar">Confronto Progetti 📊</SelectItem>
                <SelectItem value="stackedBar">Efficienza 🏗️</SelectItem>
                {isAdmin && <SelectItem value="dbLogs">Log Database 📑</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-[400px]">
          {chartType === "dbLogs" ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : chartType === "line" ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : (
            <Bar data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>
    </Card>
  );
}
