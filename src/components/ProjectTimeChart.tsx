
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TimeEntryData } from "./TimeEntry";
import { Line } from "react-chartjs-2";
import { format, startOfWeek, startOfMonth, startOfYear, isWithinInterval, subDays, subMonths, subYears } from "date-fns";
import { it } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Registra i componenti necessari di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

    // Converte i dati raggruppati nel formato richiesto da Chart.js
    const sortedData = Object.entries(groupedData)
      .map(([date, hours]) => ({
        date: format(
          timeRange === "weekly"
            ? startOfWeek(new Date(date.split("-W")[0] + "-01-01"), { weekStartsOn: 1 })
            : new Date(date),
          dateFormat,
          { locale: it }
        ),
        oreReali: Number(hours.totalHours.toFixed(2)),
        oreFatturabili: Number(hours.billableHours.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedData.map(d => d.date),
      datasets: [
        {
          label: 'Ore Reali',
          data: sortedData.map(d => d.oreReali),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Ore Fatturabili',
          data: sortedData.map(d => d.oreFatturabili),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [entries, timeRange]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodySpacing: 4,
        titleSpacing: 10
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 1
        }
      }
    }
  };

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
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}

