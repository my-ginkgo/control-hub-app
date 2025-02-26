
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TimeEntryData } from "./TimeEntry";
import { Button } from "./ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const fetchUserData = async (userId: string) => {
  const { data: userData, error: userError } = await supabase
    .from("user_roles")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (userError || profileError) throw userError || profileError;

  return {
    email: userData?.email || userId,
    fullName: profileData?.first_name && profileData?.last_name
      ? `${profileData.first_name} ${profileData.last_name}`
      : userData?.email || userId
  };
};

interface GroupedTimeEntries {
  [userId: string]: {
    email: string;
    fullName: string;
    entries: TimeEntryData[];
    totalHours: number;
    totalBillableHours: number;
  };
}

export function TimeTable({ entries, onEntryDeleted, start, end }: TimeTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntryToDelete>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [groupedEntries, setGroupedEntries] = useState<GroupedTimeEntries>({});

  useEffect(() => {
    const groupEntries = async () => {
      const grouped: GroupedTimeEntries = {};
      
      for (const entry of entries) {
        if (!grouped[entry.assignedUserId]) {
          const userData = await fetchUserData(entry.assignedUserId);
          grouped[entry.assignedUserId] = {
            email: userData.email,
            fullName: userData.fullName,
            entries: [],
            totalHours: 0,
            totalBillableHours: 0,
          };
        }
        
        grouped[entry.assignedUserId].entries.push(entry);
        grouped[entry.assignedUserId].totalHours += Number(entry.hours);
        grouped[entry.assignedUserId].totalBillableHours += Number(entry.billableHours);
      }

      setGroupedEntries(grouped);
    };

    groupEntries();
  }, [entries]);

  // Reset pagination when date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [start, end]);

  const filteredEntries = Object.entries(groupedEntries).filter(([_, userGroup]) => 
    userGroup.entries.some(entry => {
      const entryDate = new Date(entry.startDate);
      return entryDate >= start && entryDate <= end;
    })
  );

  const sortedEntries = [...filteredEntries].sort(([userId1, group1], [userId2, group2]) => {
    if (!sortConfig.key) return 0;
    
    const comparison = group1.totalHours - group2.totalHours;
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

  const handleDeleteClick = async (entry: TimeEntryData) => {
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

  const toggleRow = (userId: string) => {
    setExpandedRows((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro Ore per Utente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Mostra {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedEntries.length)} di {sortedEntries.length} utenti
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('hours' as keyof TimeEntryData)}
                  >
                    Ore Totali
                    {sortConfig.key === 'hours' && (
                      sortConfig.direction === 'asc' 
                        ? <ArrowUpIcon className="inline h-4 w-4 ml-1" />
                        : <ArrowDownIcon className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead>Ore Fatturabili</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map(([userId, userGroup]) => (
                  <>
                    <TableRow
                      key={userId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(userId)}>
                      <TableCell>
                        {expandedRows.includes(userId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>{userGroup.fullName}</TableCell>
                      <TableCell>{userGroup.totalHours}</TableCell>
                      <TableCell>{userGroup.totalBillableHours}</TableCell>
                    </TableRow>
                    {expandedRows.includes(userId) && (
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-12">Data</TableHead>
                                <TableHead>Ore</TableHead>
                                <TableHead>Ore Fatturabili</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead>Azioni</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userGroup.entries
                                .filter(entry => {
                                  const entryDate = new Date(entry.startDate);
                                  return entryDate >= start && entryDate <= end;
                                })
                                .map((entry) => (
                                  <TableRow key={entry.id}>
                                    <TableCell className="pl-12">
                                      {formatDistanceToNow(new Date(entry.startDate), {
                                        addSuffix: true,
                                        locale: it,
                                      })}
                                    </TableCell>
                                    <TableCell>{entry.hours}</TableCell>
                                    <TableCell>{entry.billableHours}</TableCell>
                                    <TableCell>{entry.notes}</TableCell>
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
                                ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Pagina {currentPage} di {totalPages}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

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
      </CardContent>
    </Card>
  );
}
