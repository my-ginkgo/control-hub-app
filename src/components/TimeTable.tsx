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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TimeEntryData } from "./TimeEntry";
import { Button } from "./ui/button";

interface TimeTableProps {
  entries: TimeEntryData[];
  onEntryDeleted?: () => void;
}

type TimeEntryToDelete = {
  id: string;
} | null;

// Funzione per recuperare i dati dell'utente
const fetchUserData = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).single();
  if (error) throw error;
  return data;
};

// Componente per mostrare il nome e il cognome dell'utente
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

export function TimeTable({ entries, onEntryDeleted }: TimeTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryToDelete>(null);

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

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creazione</TableHead>
            <TableHead>Esecuzione</TableHead>
            <TableHead>Progetto</TableHead>
            <TableHead>Esecutore</TableHead>
            <TableHead>Ore</TableHead>
            <TableHead>Ore Fatturabili</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={entry.id || `${entry.date}-${entry.project}-${index}`}>
              <TableCell>
                {formatDistanceToNow(new Date(entry.date), {
                  addSuffix: true,
                  locale: it,
                })}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(entry.startDate), {
                  addSuffix: true,
                  locale: it,
                })}
              </TableCell>
              <TableCell>{entry.project}</TableCell>
              <TableCell>
                <UserCell userId={entry.assignedUserId} />
              </TableCell>
              <TableCell>{entry.hours}</TableCell>
              <TableCell>{entry.billableHours}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(entry)}>
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
            <AlertDialogTitle>Sei sicuro di voler eliminare questo time entry?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione non può essere annullata</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
