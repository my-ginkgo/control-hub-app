
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  options?: string[];
  min?: number;
  max?: number;
}

export interface Filters {
  [key: string]: any;
}

interface FilterPanelProps {
  filterOptions: FilterOption[];
  onFilterChange: (filters: Filters) => void;
  className?: string;
}

export const FilterPanel = ({ filterOptions, onFilterChange, className }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>({});
  const [tempFilters, setTempFilters] = useState<Filters>({});
  
  // Count active filters (excluding empty values)
  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;
  
  useEffect(() => {
    // Initialize temp filters with active filters when panel opens
    if (isOpen) {
      setTempFilters({...activeFilters});
    }
  }, [isOpen, activeFilters]);
  
  const applyFilters = () => {
    setActiveFilters(tempFilters);
    onFilterChange(tempFilters);
    setIsOpen(false);
  };
  
  const clearFilters = () => {
    setTempFilters({});
    setActiveFilters({});
    onFilterChange({});
    setIsOpen(false);
  };
  
  const updateTempFilter = (id: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const removeFilter = (id: string) => {
    const newFilters = {...activeFilters};
    delete newFilters[id];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 h-8"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            <span>Filtri</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Filtra per</SheetTitle>
          </SheetHeader>
          <Separator />
          
          <ScrollArea className="h-[calc(100vh-150px)] px-6">
            <div className="space-y-6 py-6">
              {filterOptions.map((option) => (
                <div key={option.id} className="space-y-2">
                  <Label htmlFor={option.id}>{option.label}</Label>
                  
                  {option.type === 'select' && (
                    <Select 
                      value={tempFilters[option.id] || ''} 
                      onValueChange={(value) => updateTempFilter(option.id, value)}
                    >
                      <SelectTrigger id={option.id}>
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Tutti</SelectItem>
                        {option.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {option.type === 'date' && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters[option.id] ? (
                            format(tempFilters[option.id], 'PPP')
                          ) : (
                            <span>Seleziona una data</span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="p-0">
                        <SheetHeader className="p-6 pb-2">
                          <SheetTitle>Seleziona data</SheetTitle>
                        </SheetHeader>
                        <Separator />
                        <div className="p-6">
                          <Calendar
                            mode="single"
                            selected={tempFilters[option.id]}
                            onSelect={(date) => updateTempFilter(option.id, date)}
                            initialFocus
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                  
                  {option.type === 'text' && (
                    <Input
                      id={option.id}
                      value={tempFilters[option.id] || ''}
                      onChange={(e) => updateTempFilter(option.id, e.target.value)}
                      placeholder={`Cerca per ${option.label.toLowerCase()}`}
                    />
                  )}
                  
                  {option.type === 'number' && (
                    <div className="flex items-center gap-2">
                      <Input
                        id={option.id}
                        type="number"
                        value={tempFilters[option.id] || ''}
                        onChange={(e) => updateTempFilter(option.id, e.target.value ? parseInt(e.target.value) : '')}
                        placeholder={`Min: ${option.min || 0}`}
                        min={option.min}
                        max={option.max}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t p-6">
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={clearFilters}>Cancella</Button>
              <Button onClick={applyFilters}>Applica</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Display active filters as badges */}
      {Object.keys(activeFilters).map(key => {
        if (!activeFilters[key]) return null;
        
        const option = filterOptions.find(o => o.id === key);
        if (!option) return null;
        
        let displayValue = activeFilters[key];
        if (displayValue === "_all") displayValue = "Tutti";
        if (option.type === 'date' && displayValue instanceof Date) {
          displayValue = format(displayValue, 'dd/MM/yyyy');
        }
        
        return (
          <Badge key={key} variant="outline" className="flex items-center gap-1 py-1">
            <span className="font-medium">{option.label}:</span> {displayValue}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1"
              onClick={() => removeFilter(key)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
};
