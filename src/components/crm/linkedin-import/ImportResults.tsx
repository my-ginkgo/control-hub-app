
import { Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportResult } from './types';

interface ImportResultsProps {
  results: ImportResult[];
}

export const ImportResults = ({ results }: ImportResultsProps) => {
  if (!results.length) return null;

  return (
    <div className="mt-4 max-h-[300px] overflow-y-auto border border-[#333333] rounded-md p-2">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium text-white">Risultati dell'importazione:</h3>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> 
            {results.filter(r => r.status === 'success').length} inseriti
          </span>
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span> 
            {results.filter(r => r.status === 'warning').length} aggiornati
          </span>
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span> 
            {results.filter(r => r.status === 'error').length} errori
          </span>
        </div>
      </div>
      <ScrollArea className="h-[200px]">
        <ul className="space-y-2">
          {results.map((result, index) => (
            <li 
              key={index} 
              className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                result.status === 'success' ? 'bg-green-500/10' : 
                result.status === 'warning' ? 'bg-yellow-500/10' : 
                'bg-red-500/10'
              }`}
            >
              {result.status === 'success' ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : result.status === 'warning' ? (
                <Check className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className="flex-shrink-0">Riga {result.rowNumber}: </span>
              <span className="font-medium">{result.firstName} {result.lastName}</span>
              <span className="text-gray-400 truncate">{result.message}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};
