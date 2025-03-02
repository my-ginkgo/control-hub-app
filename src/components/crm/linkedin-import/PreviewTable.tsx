
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreviewTableProps {
  headers: string[];
  previewData: Record<string, string>[];
  columnMappings: Array<{ csvColumn: string; leadField: string }>;
  getMappingForColumn: (header: string) => string;
  LEAD_FIELDS: Array<{ value: string; label: string }>;
}

export const PreviewTable = ({ 
  headers, 
  previewData, 
  columnMappings, 
  getMappingForColumn,
  LEAD_FIELDS
}: PreviewTableProps) => {
  if (!previewData.length) return null;
  
  return (
    <div className="mt-4 border rounded overflow-hidden">
      <div className="overflow-x-auto max-h-[300px] h-[300px]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50 sticky top-0 z-10">
              {headers.map(header => (
                <th key={header} className="p-2 text-left font-medium border-b whitespace-nowrap">
                  {header}
                  {columnMappings.some(m => m.csvColumn === header) && (
                    <div className="text-xs text-green-500 font-normal">
                      ↳ {LEAD_FIELDS.find(f => f.value === getMappingForColumn(header))?.label || ''}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, i) => (
              <tr key={i} className="border-t">
                {headers.map(header => (
                  <td key={`${i}-${header}`} className="p-2 border-b whitespace-nowrap max-w-[200px] truncate">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
