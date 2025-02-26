
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TimeEntryData } from "./TimeEntry";
import { TimeTableHeader } from "./time-table/TimeTableHeader";
import { TimeTableRow } from "./time-table/TimeTableRow";
import { TimeTablePagination } from "./time-table/TimeTablePagination";
import { DeleteTimeEntryDialog } from "./time-table/DeleteTimeEntryDialog";

interface TimeTableProps {
  entries: TimeEntryData[];
  onEntryDeleted?: () => void;
  start: Date;
  end: Date;
}

type TimeEntryToDelete = {
  id: string;
} | null;

type SortConfig = {
  key: keyof TimeEntryData | null;
  direction: 'asc' | 'desc';
};

const ITEMS_PER_PAGE = 10;

export function TimeTable({ entries, onEntryDeleted, start, end }: TimeTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryToDelete>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [start, end]);

  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.startDate);
    return entryDate >= start && entryDate <= end;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (key: keyof TimeEntryData) => {
    setSortConfig((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleDeleteClick = (entry: TimeEntryData) => {
    setEntryToDelete({
      id: entry.id,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase.from("time_entries").delete().eq("id", entryToDelete.id);

      if (error) throw error;

      toast.success("Time entry eliminato con successo");
      if (onEntryDeleted) {
        onEntryDeleted();
      }
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error: any) {
      toast.error("Errore durante l'eliminazione del time entry: " + error.message);
    }
  };

  const toggleRow = (entryId: string) => {
    setExpandedRows((current) =>
      current.includes(entryId) ? current.filter((id) => id !== entryId) : [...current, entryId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro Ore</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Mostra {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedEntries.length)} di {sortedEntries.length} elementi
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TimeTableHeader sortConfig={sortConfig} onSort={handleSort} />
              <TableBody>
                {paginatedEntries.map((entry, index) => (
                  <TimeTableRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isExpanded={expandedRows.includes(entry.id)}
                    onToggle={() => toggleRow(entry.id)}
                    onDelete={() => handleDeleteClick(entry)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <TimeTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <DeleteTimeEntryDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      </CardContent>
    </Card>
  );
}
