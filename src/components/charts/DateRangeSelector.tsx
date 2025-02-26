
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "@/types/chart";
import { Input } from "@/components/ui/input";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
  customDateRange: { start: Date | undefined; end: Date | undefined };
  setCustomDateRange: (range: { start: Date | undefined; end: Date | undefined }) => void;
}

export function DateRangeSelector({
  dateRange,
  setDateRange,
  customDateRange,
  setCustomDateRange,
}: DateRangeSelectorProps) {
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setCustomDateRange({
        ...customDateRange,
        start: new Date(event.target.value),
      });
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setCustomDateRange({
        ...customDateRange,
        end: new Date(event.target.value),
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      {dateRange === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="datetime-local"
            onChange={handleStartDateChange}
            value={customDateRange.start ? format(customDateRange.start, "yyyy-MM-dd'T'HH:mm") : ""}
            className="w-44"
          />
          <span>-</span>
          <Input
            type="datetime-local"
            onChange={handleEndDateChange}
            value={customDateRange.end ? format(customDateRange.end, "yyyy-MM-dd'T'HH:mm") : ""}
            className="w-44"
          />
        </div>
      )}

      <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Giorno corrente</SelectItem>
          <SelectItem value="week">Settimana corrente</SelectItem>
          <SelectItem value="month">Mese corrente</SelectItem>
          <SelectItem value="year">Anno corrente</SelectItem>
          <SelectItem value="custom">Range personalizzato</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
