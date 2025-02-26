
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartType } from "@/types/chart";

interface ChartTypeSelectorProps {
  chartType: ChartType;
  setChartType: (value: ChartType) => void;
  isAdmin: boolean;
}

export function ChartTypeSelector({ chartType, setChartType, isAdmin }: ChartTypeSelectorProps) {
  return (
    <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="line">Analisi Temporale 📈</SelectItem>
        <SelectItem value="groupedBar">Confronto Progetti 📊</SelectItem>
        <SelectItem value="stackedBar">Efficienza 🏗️</SelectItem>
        {isAdmin && <SelectItem value="userWorkload">Carico per Utente 👥</SelectItem>}
      </SelectContent>
    </Select>
  );
}

