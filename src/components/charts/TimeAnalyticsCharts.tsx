
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { TimeEntryData } from "../TimeEntry";
import { ChartType, DateRange } from "@/types/chart";
import { DateRangeSelector } from "./DateRangeSelector";
import { ChartTypeSelector } from "./ChartTypeSelector";
import { generateChartData } from "./ChartDataGenerator";
import { getDateRange, generateTimeLabels } from "@/utils/dateRangeUtils";
import { getChartOptions } from "@/utils/chartDataUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export function TimeAnalyticsCharts({ entries, isAdmin }: { entries: TimeEntryData[]; isAdmin: boolean }) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });

  const { data: userProfiles } = useQuery({
    queryKey: ["userProfiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, first_name, last_name");
      if (error) throw error;
      return data || [];
    },
  });

  const getUserFullName = (userId: string) => {
    const profile = userProfiles?.find((p) => p.id === userId);
    if (!profile) return userId;
    if (!profile.first_name && !profile.last_name) return userId;
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  };

  const { start, end } = getDateRange(dateRange, customDateRange);

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.startDate);
    return entryDate >= start && entryDate <= end;
  });

  const timeLabels = generateTimeLabels(start, end, dateRange);
  const chartData = generateChartData({ timeLabels, chartType, filteredEntries, getUserFullName });
  const chartOptions = getChartOptions(chartType);

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Andamento Temporale</h2>
          <div className="flex gap-4">
            <DateRangeSelector
              dateRange={dateRange}
              setDateRange={setDateRange}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
            <ChartTypeSelector chartType={chartType} setChartType={setChartType} isAdmin={isAdmin} />
          </div>
        </div>
        <div className="h-[400px]">
          {chartType === "userWorkload" ? (
            <Line data={chartData} options={chartOptions} />
          ) : chartType === "line" ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </Card>
  );
}

