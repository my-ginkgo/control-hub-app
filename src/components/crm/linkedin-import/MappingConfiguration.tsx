
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { ColumnMapping } from './types';

interface MappingConfigurationProps {
  headers: string[];
  getMappingForColumn: (header: string) => string;
  updateColumnMapping: (csvColumn: string, leadField: string) => void;
  LEAD_FIELDS: Array<{ value: string; label: string }>;
}

export const MappingConfiguration = ({ 
  headers, 
  getMappingForColumn, 
  updateColumnMapping,
  LEAD_FIELDS
}: MappingConfigurationProps) => {
  if (!headers.length) return null;
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Configura la mappatura tra le colonne del CSV e i campi dell'anagrafica lead
      </p>
      
      <div className="space-y-3 max-h-[300px] h-[300px] overflow-y-auto pr-2">
        {headers.map(header => (
          <div key={header} className="flex items-center gap-2">
            <div className="w-1/3 text-sm font-medium truncate" title={header}>
              {header}
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-400" />
            
            <div className="flex-1">
              <Select
                value={getMappingForColumn(header)}
                onValueChange={(value) => updateColumnMapping(header, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona campo lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non mappare</SelectItem>
                  {LEAD_FIELDS.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
