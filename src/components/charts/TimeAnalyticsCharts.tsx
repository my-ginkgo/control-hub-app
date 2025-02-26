
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
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

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
  const chartOptions = getChartOptions(chartType === "billableEfficiency" ? {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  } : undefined);

  const getChartDescription = () => {
    switch (chartType) {
      case "line":
        return "Questo grafico mostra l'andamento delle ore registrate nel tempo per ogni progetto. Permette di visualizzare i trend di utilizzo e identificare i periodi di maggiore attività.";
      case "groupedBar":
        return "Il grafico a barre raggruppate confronta le ore spese sui diversi progetti nel periodo selezionato, facilitando il confronto diretto tra progetti.";
      case "stackedBar":
        return "Questo grafico mostra la proporzione tra ore fatturabili e non fatturabili nel tempo. Le barre impilate permettono di valutare facilmente l'efficienza di fatturazione.";
      case "userWorkload":
        return "Visualizza la distribuzione del carico di lavoro tra i membri del team nel periodo selezionato, permettendo di identificare eventuali squilibri nell'allocazione delle risorse.";
      case "billableEfficiency":
        return "Questo grafico mostra la percentuale di ore fatturabili rispetto alle ore totali per ciascun progetto, permettendo di valutare l'efficienza di fatturazione per progetto.";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Andamento Temporale</h2>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>{getChartDescription()}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
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
          {chartType === "billableEfficiency" ? (
            <Bar options={chartOptions} data={chartData as any} />
          ) : chartType === "userWorkload" || chartType === "line" ? (
            <Line options={chartOptions} data={chartData as any} />
          ) : (
            <Bar options={chartOptions} data={chartData as any} />
          )}
        </div>
      </div>
    </Card>
  );
}

