
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TimeEntryData } from "./TimeEntry";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/components/AuthProvider";

export function TimeTable({ entries }: { entries: TimeEntryData[] }) {
  const { role } = useRole();
  const { session } = useAuth();

  const filteredEntries = role === "ADMIN" 
    ? entries 
    : entries.filter(entry => entry.assignedUserId === session?.user?.id);

  return (
    <Card className="w-full overflow-hidden mt-8 animate-fadeIn">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Inizio</TableHead>
            <TableHead>Data Fine</TableHead>
            <TableHead>Progetto</TableHead>
            <TableHead>Ore Reali</TableHead>
            <TableHead>Ore Fatturabili</TableHead>
            <TableHead>Utente Assegnato</TableHead>
            <TableHead>Utente Esecutore</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(entry.startDate), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell>{format(new Date(entry.endDate), "dd/MM/yyyy HH:mm")}</TableCell>
              <TableCell className="font-medium">{entry.project}</TableCell>
              <TableCell>{entry.hours}</TableCell>
              <TableCell>{entry.billableHours}</TableCell>
              <TableCell>{entry.assignedUserEmail}</TableCell>
              <TableCell>{entry.userEmail}</TableCell>
              <TableCell className="max-w-[300px] truncate">{entry.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
