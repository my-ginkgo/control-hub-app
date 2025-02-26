
import { ChartType } from "@/types/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartTypeSelectorProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  isAdmin: boolean;
}

export function ChartTypeSelector({ chartType, setChartType, isAdmin }: ChartTypeSelectorProps) {
  return (
    <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleziona il tipo di grafico" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="line">Lineare</SelectItem>
        <SelectItem value="groupedBar">Barre Raggruppate</SelectItem>
        <SelectItem value="stackedBar">Barre Impilate</SelectItem>
        {isAdmin && <SelectItem value="userWorkload">Carico di Lavoro</SelectItem>}
        <SelectItem value="billableEfficiency">Efficienza Fatturabile</SelectItem>
      </SelectContent>
    </Select>
  );
}

