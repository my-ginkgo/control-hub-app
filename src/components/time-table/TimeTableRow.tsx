
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { TimeEntryData } from "../TimeEntry";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TimeTableRowProps {
  entry: TimeEntryData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function UserCell({ userId }: { userId: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
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

export function TimeTableRow({ entry, index, isExpanded, onToggle, onDelete }: TimeTableRowProps) {
  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
        onClick={onToggle}>
        <TableCell>
          {isExpanded ? (
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
              onDelete();
            }}>
            <Trash2 className="h-4 w-4 text-gray-400" />
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
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
  );
}
