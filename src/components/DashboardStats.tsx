
import { Card } from "@/components/ui/card";
import { TimeEntryData } from "./TimeEntry";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";
import { TimeAnalyticsCharts } from "./charts/TimeAnalyticsCharts";

export function DashboardStats({ entries }: { entries: TimeEntryData[] }) {
  const { role } = useRole();
  const { session } = useAuth();

  const filteredEntries = role === "ADMIN" 
    ? entries 
    : entries.filter(entry => entry.assignedUserId === session?.user?.id);

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = filteredEntries.reduce((sum, entry) => sum + entry.billableHours, 0);
  const uniqueProjects = [...new Set(filteredEntries.map(entry => entry.project))];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fadeIn">
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

      <TimeAnalyticsCharts entries={filteredEntries} isAdmin={role === "ADMIN"} />
    </div>
  );
}
