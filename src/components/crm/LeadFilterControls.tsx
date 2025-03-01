
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterPanel, FilterOption } from './FilterPanel';
import { RefreshCw } from 'lucide-react';

interface LeadFilterControlsProps {
  filterOptions: FilterOption[];
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const LeadFilterControls = ({
  filterOptions,
  onFilterChange,
  onRefresh,
  isRefreshing
}: LeadFilterControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <FilterPanel 
        filterOptions={filterOptions} 
        onFilterChange={onFilterChange}
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-8"
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}
      </Button>
    </div>
  );
};
