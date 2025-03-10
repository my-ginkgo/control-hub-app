
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
import { ChartType } from "@/types/chart";
import { ChartTypeSelector } from "./ChartTypeSelector";
import { generateChartData } from "./ChartDataGenerator";
import { generateTimeLabels } from "@/utils/dateRangeUtils";
import { getChartOptions } from "@/utils/chartDataUtils";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export function TimeAnalyticsCharts({ entries, isAdmin }: { entries: TimeEntryData[]; isAdmin: boolean }) {
  const [chartType, setChartType] = useState<ChartType>("line");

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

  const timeLabels = entries.length > 0 
    ? generateTimeLabels(
        new Date(Math.min(...entries.map(e => new Date(e.startDate).getTime()))),
        new Date(Math.max(...entries.map(e => new Date(e.startDate).getTime()))),
        "month"
      )
    : [];

  const chartData = generateChartData({ timeLabels, chartType, filteredEntries: entries, getUserFullName });
  const chartOptions = getChartOptions(chartType);

  const getChartTitle = () => {
    switch (chartType) {
      case "line":
        return "Analisi Temporale";
      case "groupedBar":
        return "Confronto Progetti";
      case "stackedBar":
        return "Efficienza";
      case "userWorkload":
        return "Carico per Utente";
      default:
        return "";
    }
  };

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
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{getChartTitle()}</h2>
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
          <ChartTypeSelector chartType={chartType} setChartType={setChartType} isAdmin={isAdmin} />
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
