
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TimeEntryData } from "./TimeEntry";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export function TimeTable({ entries }: { entries: TimeEntryData[] }) {
  return (
    <Card className="w-full overflow-hidden animate-fadeIn">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Progetto</TableHead>
            <TableHead>Ore Reali</TableHead>
            <TableHead>Ore Fatturabili</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{format(new Date(entry.date), "dd/MM/yyyy")}</TableCell>
              <TableCell className="font-medium">{entry.project}</TableCell>
              <TableCell>{entry.hours}</TableCell>
              <TableCell>{entry.billableHours}</TableCell>
              <TableCell className="max-w-[300px] truncate">{entry.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
