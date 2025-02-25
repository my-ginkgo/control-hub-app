
import { useState } from "react";
import { TimeEntry, TimeEntryData } from "@/components/TimeEntry";
import { TimeTable } from "@/components/TimeTable";
import { DashboardStats } from "@/components/DashboardStats";

const Index = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryData[]>([]);

  const handleNewEntry = (entry: TimeEntryData) => {
    setTimeEntries([entry, ...timeEntries]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Time Tracker</h1>
        <DashboardStats entries={timeEntries} />
        <div className="grid grid-cols-1 gap-8">
          <TimeEntry onSubmit={handleNewEntry} />
          {timeEntries.length > 0 && <TimeTable entries={timeEntries} />}
        </div>
      </div>
    </div>
  );
};

export default Index;
