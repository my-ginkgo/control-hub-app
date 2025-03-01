
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateSectionProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
}

export function DateSection({
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: DateSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-gray-200">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1a1b26] border-[#383a5c]">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
              className="bg-[#1a1b26] text-white"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label className="text-gray-200">End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-[#1a1b26] border-[#383a5c] text-white"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1a1b26] border-[#383a5c]">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              initialFocus
              className="bg-[#1a1b26] text-white"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
