
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface EmptyLeadsStateProps {
  hasLeads: boolean;
}

export const EmptyLeadsState = ({ hasLeads }: EmptyLeadsStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
        {hasLeads 
          ? "No leads match your current filters."
          : "No leads found. Add your first lead to get started."}
      </TableCell>
    </TableRow>
  );
};
