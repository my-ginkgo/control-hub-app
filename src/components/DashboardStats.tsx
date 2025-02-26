
import { Card } from "@/components/ui/card";
import { TimeEntryData } from "./TimeEntry";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";
import { TimeAnalyticsCharts } from "./charts/TimeAnalyticsCharts";
import { useState } from "react";
import { DateRange } from "@/types/chart";
import { DateRangeSelector } from "./charts/DateRangeSelector";
import { getDateRange } from "@/utils/dateRangeUtils";

export function DashboardStats({ entries }: { entries: TimeEntryData[] }) {
  const { role } = useRole();
  const { session } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });

  const { start, end } = getDateRange(dateRange, customDateRange);

  const filteredEntries = (role === "ADMIN" 
    ? entries 
    : entries.filter(entry => entry.assignedUserId === session?.user?.id))
    .filter((entry) => {
      const entryDate = new Date(entry.startDate);
      return entryDate >= start && entryDate <= end;
    });

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalBillableHours = filteredEntries.reduce((sum, entry) => sum + entry.billableHours, 0);
  const uniqueProjects = [...new Set(filteredEntries.map(entry => entry.project))];

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <DateRangeSelector
          dateRange={dateRange}
          setDateRange={setDateRange}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
        />
      </div>
      
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
