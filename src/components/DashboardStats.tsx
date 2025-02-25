
import { Card } from "@/components/ui/card";
import { TimeEntryData } from "./TimeEntry";

export function DashboardStats({ entries }: { entries: TimeEntryData[] }) {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = entries.reduce((sum, entry) => sum + entry.billableHours, 0);
  const uniqueProjects = [...new Set(entries.map(entry => entry.project))];

  return (
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
  );
}
