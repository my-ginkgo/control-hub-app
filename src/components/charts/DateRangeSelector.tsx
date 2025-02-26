
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "@/types/chart";

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
  return (
    <div className="flex items-center gap-4">
      {dateRange === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customDateRange.start ? (
                customDateRange.end ? (
                  <>
                    {format(customDateRange.start, "dd/MM/yyyy")} - {format(customDateRange.end, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(customDateRange.start, "dd/MM/yyyy")
                )
              ) : (
                <span>Seleziona un intervallo</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customDateRange.start}
              selected={{
                from: customDateRange.start,
                to: customDateRange.end,
              }}
              onSelect={(range) => {
                setCustomDateRange({
                  start: range?.from,
                  end: range?.to,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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

