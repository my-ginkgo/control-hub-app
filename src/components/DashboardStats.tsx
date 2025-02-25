
import { Card } from "@/components/ui/card";
import { TimeEntryData } from "./TimeEntry";
import { ProjectTimeChart } from "./ProjectTimeChart";

export function DashboardStats({ entries }: { entries: TimeEntryData[] }) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = entries.reduce((sum, entry) => sum + entry.billableHours, 0);
  const uniqueProjects = [...new Set(entries.map(entry => entry.project))];

  // Calcola le ore totali per progetto
  const projectHours = entries.reduce((acc, entry) => {
    if (!acc[entry.project]) {
      acc[entry.project] = {
        totalHours: 0,
        billableHours: 0
      };
    }
    acc[entry.project].totalHours += entry.hours;
    acc[entry.project].billableHours += entry.billableHours;
    return acc;
  }, {} as Record<string, { totalHours: number; billableHours: number }>);

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
          <h2 className="text-xl font-semibold mb-4">Distribuzione Ore per Progetto</h2>
          <div className="h-[400px]">
            <Bar
              data={{
                labels: Object.keys(projectHours),
                datasets: [
                  {
                    label: 'Ore Totali',
                    data: Object.values(projectHours).map(h => h.totalHours),
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1
                  },
                  {
                    label: 'Ore Fatturabili',
                    data: Object.values(projectHours).map(h => h.billableHours),
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
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
                }
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
