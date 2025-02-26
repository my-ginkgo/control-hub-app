
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TimeEntryData } from "./TimeEntry";
import { Button } from "./ui/button";

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

const fetchUserData = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).single();
  if (error) throw error;
  return data;
};

function UserCell({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserData(userId),
  });

  if (isLoading) return <TableCell className="text-amber-400">Caricamento...</TableCell>;
  if (error) return <TableCell className="text-red-400">Errore.</TableCell>;
  if (!userId) return <TableCell>Non assegnato</TableCell>;

  return (
    <TableCell>
      {data.first_name} {data.last_name}
    </TableCell>
  );
}

export function TimeTable({ entries, onEntryDeleted, start, end }: TimeTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryToDelete>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

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

  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode; sortKey: keyof TimeEntryData }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => handleSort(sortKey)}
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
    <Card>
      <CardHeader>
        <CardTitle>Registro Ore</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
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
            <TableBody>
              {sortedEntries.map((entry, index) => (
                <>
                  <TableRow
                    key={entry.id || `${entry.date}-${entry.project}-${index}`}
                    className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                    onClick={() => toggleRow(entry.id)}>
                    <TableCell>
                      {expandedRows.includes(entry.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(entry.startDate), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </TableCell>
                    <UserCell userId={entry.assignedUserId} />
                    <TableCell>{entry.project}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>{entry.billableHours}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(entry);
                        }}>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(entry.id) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7} className="px-6 py-4">
                        <div className="space-y-4 bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Dettagli Temporali</h4>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium text-muted-foreground">Data di creazione:</span>{" "}
                                  {new Date(entry.date).toLocaleString("it-IT")}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-muted-foreground">Inizio:</span>{" "}
                                  {new Date(entry.startDate).toLocaleString("it-IT")}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-muted-foreground">Fine:</span>{" "}
                                  {new Date(entry.endDate).toLocaleString("it-IT")}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Informazioni Aggiuntive</h4>
                              <div className="space-y-1">
                                {entry.notes && (
                                  <p className="text-sm">
                                    <span className="font-medium text-muted-foreground">Note:</span> {entry.notes}
                                  </p>
                                )}
                                <p className="text-sm">
                                  <span className="font-medium text-muted-foreground">ID Entry:</span> {entry.id}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-muted-foreground">ID Utente:</span> {entry.userId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro di voler eliminare questo time entry?</AlertDialogTitle>
              <AlertDialogDescription>Questa azione non può essere annullata</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Elimina</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

