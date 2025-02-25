
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TimeEntryData } from "./TimeEntry";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Toggle } from "./ui/toggle";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardStats({ entries }: { entries: TimeEntryData[] }) {
  const [showBillableHours, setShowBillableHours] = useState(false);
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = entries.reduce((sum, entry) => sum + entry.billableHours, 0);
  const uniqueProjects = [...new Set(entries.map(entry => entry.project))];

  // Raggruppa le ore per progetto e data
  const groupedData = entries.reduce((acc, entry) => {
    if (!acc[entry.project]) {
      acc[entry.project] = {
        dates: [],
        hours: [],
        billableHours: []
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

  // Genera colori casuali ma consistenti per i progetti
  const projectColors = uniqueProjects.reduce((acc, project, index) => {
    const hue = (index * 137.5) % 360;  // Usa il numero aureo per distribuire i colori
    acc[project] = `hsla(${hue}, 70%, 50%, 1)`;
    return acc;
  }, {} as Record<string, string>);

  // Prepara i dati per il grafico
  const chartData = {
    labels: [...new Set(entries.map(e => new Date(e.date).toLocaleDateString()))].sort(),
    datasets: uniqueProjects.map(project => ({
      label: project,
      data: groupedData[project][showBillableHours ? 'billableHours' : 'hours'],
      borderColor: projectColors[project],
      backgroundColor: projectColors[project],
      tension: 0.3,
      fill: false
    }))
  };

  const chartOptions = {
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
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Ore Totali</h3>
          <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Ore Fatturabili</h3>
          <p className="text-2xl font-bold">{totalBillableHours.toFixed(1)}h</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Progetti Attivi</h3>
          <p className="text-2xl font-bold">{uniqueProjects.length}</p>
        </Card>
      </div>

      <Card className="w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Andamento Temporale</h2>
            <Toggle
              pressed={showBillableHours}
              onPressedChange={setShowBillableHours}
              className="text-sm"
            >
              {showBillableHours ? 'Ore Fatturabili' : 'Ore Reali'}
            </Toggle>
          </div>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </Card>
    </div>
  );
}
