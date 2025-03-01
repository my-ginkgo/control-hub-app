
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface HoursSectionProps {
  hours: string;
  setHours: (hours: string) => void;
  billableHours: string;
  setBillableHours: (hours: string) => void;
  isBillable: boolean;
  setIsBillable: (billable: boolean) => void;
}

export function HoursSection({
  hours,
  setHours,
  billableHours,
  setBillableHours,
  isBillable,
  setIsBillable
}: HoursSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hours" className="text-gray-200">Hours *</Label>
        <Input
          id="hours"
          type="number"
          min="0.1"
          step="0.1"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            if (isBillable) {
              setBillableHours(e.target.value);
            }
          }}
          required
          className="bg-[#1a1b26] border-[#383a5c] text-white"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="billableHours" className="text-gray-200">Billable Hours</Label>
          <div className="flex items-center">
            <Switch 
              id="isBillable" 
              checked={isBillable} 
              onCheckedChange={(checked) => {
                setIsBillable(checked);
                if (checked) {
                  setBillableHours(hours);
                } else {
                  setBillableHours("0");
                }
              }} 
            />
            <Label htmlFor="isBillable" className="text-gray-400 text-xs ml-2">Billable</Label>
          </div>
        </div>
        <Input
          id="billableHours"
          type="number"
          min="0"
          step="0.1"
          value={billableHours}
          onChange={(e) => setBillableHours(e.target.value)}
          required
          disabled={!isBillable}
          className="bg-[#1a1b26] border-[#383a5c] text-white"
        />
      </div>
    </div>
  );
}
