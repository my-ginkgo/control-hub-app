
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { TimeEntryData } from "../TimeEntry";

interface SortConfig {
  key: keyof TimeEntryData | null;
  direction: 'asc' | 'desc';
}

interface TimeTableHeaderProps {
  sortConfig: SortConfig;
  onSort: (key: keyof TimeEntryData) => void;
}

export function TimeTableHeader({ sortConfig, onSort }: TimeTableHeaderProps) {
  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode; sortKey: keyof TimeEntryData }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => onSort(sortKey)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isActive && (
            sortConfig.direction === 'asc' 
              ? <ArrowUpIcon className="h-4 w-4" />
              : <ArrowDownIcon className="h-4 w-4" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8"></TableHead>
        <SortableHeader sortKey="startDate">Esecuzione</SortableHeader>
        <TableHead>Esecutore</TableHead>
        <SortableHeader sortKey="project">Progetto</SortableHeader>
        <SortableHeader sortKey="hours">Ore</SortableHeader>
        <SortableHeader sortKey="billableHours">Ore Fatturabili</SortableHeader>
        <TableHead>Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
}
