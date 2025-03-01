
import React from 'react';
import { Lead } from '@/types/Lead';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, ChevronDown, ChevronUp, Mail, Star, TagIcon, Trash, UserRound } from 'lucide-react';

interface LeadListItemProps {
  lead: Lead;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadListItem = ({ 
  lead, 
  isExpanded, 
  onToggleDetails, 
  onEdit, 
  onDelete 
}: LeadListItemProps) => {
  
  const getLeadScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleDetails}
          title={isExpanded ? "Hide details" : "Show details"}
        >
          {isExpanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </Button>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {`${lead.first_name} ${lead.last_name}`}
        </div>
        {lead.job_title && (
          <div className="text-sm text-muted-foreground">
            {lead.job_title}
          </div>
        )}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {lead.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                <TagIcon className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {lead.email ? (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {lead.company_name ? (
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3 text-muted-foreground" />
            <span>{lead.company_name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Not assigned</span>
        )}
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          lead.status === 'closed-won' ? 'bg-green-100 text-green-800' :
          lead.status === 'closed-lost' ? 'bg-red-100 text-red-800' :
          lead.status === 'negotiation' ? 'bg-purple-100 text-purple-800' :
          lead.status === 'proposal' ? 'bg-blue-100 text-blue-800' :
          lead.status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
          lead.status === 'contacted' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {lead.status ? lead.status.replace('-', ' ') : 'new'}
        </span>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {lead.lead_score ? (
          <div className="flex items-center gap-1">
            <Star className={`h-3 w-3 ${getLeadScoreColor(lead.lead_score)}`} />
            <span className={getLeadScoreColor(lead.lead_score)}>{lead.lead_score}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Not scored</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(lead)} 
            title="Edit lead"
          >
            <UserRound className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(lead.id)} 
            title="Delete lead"
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
