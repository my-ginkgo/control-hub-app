
import { format } from "date-fns";
import { Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntryData } from "@/components/TimeEntry";

interface RecentTimeEntriesProps {
  timeEntries: TimeEntryData[];
  onAddTimeEntry: () => void;
}

export function RecentTimeEntries({ timeEntries, onAddTimeEntry }: RecentTimeEntriesProps) {
  if (!timeEntries || timeEntries.length === 0) return null;

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Recent Entries</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTimeEntry}
          className="bg-red-600 hover:bg-red-700 text-white border-none h-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeEntries.map((entry) => (
          <Card key={entry.id} className="bg-[#1E1E1E] border-0 hover:bg-[#2a2a2a] transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{entry.project}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {format(new Date(entry.startDate), 'PPP')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-red-500 font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>{entry.hours}h</span>
                </div>
              </div>
              {entry.notes && (
                <p className="text-sm text-gray-300 mt-2 line-clamp-2">{entry.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
