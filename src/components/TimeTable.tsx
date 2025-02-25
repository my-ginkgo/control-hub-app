
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimeEntryData } from "./TimeEntry";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface TimeTableProps {
  entries: TimeEntryData[];
  onEntryDeleted?: () => void;
}

type TimeEntryToDelete = {
  date: string;
  project: string;
} | null;

export function TimeTable({ entries, onEntryDeleted }: TimeTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryToDelete>(null);

  const handleDeleteClick = (entry: TimeEntryData) => {
    setEntryToDelete({
      date: entry.date,
      project: entry.project
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('date', entryToDelete.date)
        .eq('project', entryToDelete.project);

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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Progetto</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Ore</TableHead>
            <TableHead>Ore Fatturabili</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={`${entry.date}-${entry.project}-${index}`}>
              <TableCell>
                {formatDistanceToNow(new Date(entry.date), {
                  addSuffix: true,
                  locale: it,
                })}
              </TableCell>
              <TableCell>{entry.project}</TableCell>
              <TableCell>{entry.notes}</TableCell>
              <TableCell>{entry.hours}</TableCell>
              <TableCell>{entry.billableHours}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteClick(entry)}
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sei sicuro di voler eliminare questo time entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
